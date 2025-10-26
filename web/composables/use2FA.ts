import type { Factor, AuthMfaEnrollResponse, AuthMfaVerifyResponse } from '@supabase/supabase-js'

// 2FA composable for managing multi-factor authentication
export const use2FA = () => {
  const supabase = useSupabaseClient()
  const { user, isSuperAdmin } = useAuth()

  // State
  const loading = ref(false)
  const error = ref<string | null>(null)
  const factors = ref<Factor[]>([])
  const enrollmentData = ref<AuthMfaEnrollResponse | null>(null)

  // Load user's MFA factors
  const loadFactors = async () => {
    if (!user.value) return

    loading.value = true
    error.value = null

    try {
      const { data, error: factorsError } = await supabase.auth.mfa.listFactors()
      
      if (factorsError) throw factorsError
      
      factors.value = data.totp || []
    } catch (err) {
      console.error('Error loading MFA factors:', err)
      error.value = err instanceof Error ? err.message : 'Failed to load MFA factors'
    } finally {
      loading.value = false
    }
  }

  // Enroll in TOTP (Time-based One-Time Password)
  const enrollTOTP = async (friendlyName: string = 'Authenticator App') => {
    if (!user.value) {
      throw new Error('User not authenticated')
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName
      })

      if (enrollError) throw enrollError

      enrollmentData.value = data
      return data
    } catch (err) {
      console.error('Error enrolling TOTP:', err)
      error.value = err instanceof Error ? err.message : 'Failed to enroll TOTP'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Verify TOTP enrollment
  const verifyTOTP = async (factorId: string, code: string) => {
    if (!user.value) {
      throw new Error('User not authenticated')
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        code
      })

      if (verifyError) throw verifyError

      // Reload factors after successful verification
      await loadFactors()
      
      return data
    } catch (err) {
      console.error('Error verifying TOTP:', err)
      error.value = err instanceof Error ? err.message : 'Failed to verify TOTP'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Unenroll MFA factor
  const unenrollFactor = async (factorId: string) => {
    if (!user.value) {
      throw new Error('User not authenticated')
    }

    loading.value = true
    error.value = null

    try {
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId
      })

      if (unenrollError) throw unenrollError

      // Reload factors after successful unenrollment
      await loadFactors()
    } catch (err) {
      console.error('Error unenrolling factor:', err)
      error.value = err instanceof Error ? err.message : 'Failed to unenroll factor'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Check if user has verified MFA factors
  const hasVerifiedMFA = computed(() => {
    return factors.value.some(factor => factor.status === 'verified')
  })

  // Check if user has TOTP enabled
  const hasTOTP = computed(() => {
    return factors.value.some(factor => 
      factor.factor_type === 'totp' && factor.status === 'verified'
    )
  })

  // Get QR code data for TOTP setup
  const getQRCodeData = computed(() => {
    if (!enrollmentData.value?.totp?.qr_code) return null
    
    return {
      qrCode: enrollmentData.value.totp.qr_code,
      secret: enrollmentData.value.totp.secret,
      uri: enrollmentData.value.totp.uri
    }
  })

  // Check if 2FA is required for super admins
  const is2FARequired = computed(() => {
    return isSuperAdmin.value && !hasVerifiedMFA.value
  })

  // Generate TOTP code (for testing purposes)
  const generateTOTPCode = async (secret: string): Promise<string> => {
    // This would typically use a TOTP library like 'otplib'
    // For now, we'll return a placeholder
    return '123456'
  }

  // Validate TOTP code format
  const isValidTOTPCode = (code: string): boolean => {
    return /^\d{6}$/.test(code)
  }

  // Get enrollment status
  const getEnrollmentStatus = () => {
    if (!user.value) return 'not_authenticated'
    if (isSuperAdmin.value && !hasVerifiedMFA.value) return 'required'
    if (hasVerifiedMFA.value) return 'enrolled'
    return 'optional'
  }

  // Watch for user changes and load factors
  watch(user, (newUser) => {
    if (newUser) {
      loadFactors()
    } else {
      factors.value = []
      enrollmentData.value = null
    }
  }, { immediate: true })

  return {
    // State
    loading: readonly(loading),
    error: readonly(error),
    factors: readonly(factors),
    enrollmentData: readonly(enrollmentData),
    
    // Computed
    hasVerifiedMFA,
    hasTOTP,
    getQRCodeData,
    is2FARequired,
    
    // Methods
    loadFactors,
    enrollTOTP,
    verifyTOTP,
    unenrollFactor,
    generateTOTPCode,
    isValidTOTPCode,
    getEnrollmentStatus
  }
}
