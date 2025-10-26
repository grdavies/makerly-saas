import { z } from 'zod'

// Login schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

// Signup schema
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
})

// Password reset schema
const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address')
})

// Password update schema
const passwordUpdateSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// 2FA enrollment schema
const mfaEnrollSchema = z.object({
  factorType: z.enum(['totp']),
  friendlyName: z.string().min(1, 'Friendly name is required')
})

// 2FA verification schema
const mfaVerifySchema = z.object({
  factorId: z.string().uuid('Invalid factor ID'),
  code: z.string().min(6, 'Code must be at least 6 characters')
})

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const path = getRouterParam(event, 'path') || ''

  // CORS headers
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (method === 'OPTIONS') {
    return new Response(null, { status: 200 })
  }

  const supabase = serverSupabaseServiceRole(event)

  try {
    switch (path) {
      case 'login':
        if (method !== 'POST') {
          throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
          })
        }

        const loginData = await readBody(event)
        const validatedLogin = loginSchema.parse(loginData)

        const { data, error } = await supabase.auth.signInWithPassword({
          email: validatedLogin.email,
          password: validatedLogin.password
        })

        if (error) {
          throw createError({
            statusCode: 401,
            statusMessage: error.message
          })
        }

        return {
          success: true,
          data: {
            user: data.user,
            session: data.session
          }
        }

      case 'signup':
        if (method !== 'POST') {
          throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
          })
        }

        const signupData = await readBody(event)
        const validatedSignup = signupSchema.parse(signupData)

        const { data: signupResult, error: signupError } = await supabase.auth.signUp({
          email: validatedSignup.email,
          password: validatedSignup.password,
          options: {
            data: {
              first_name: validatedSignup.firstName,
              last_name: validatedSignup.lastName
            }
          }
        })

        if (signupError) {
          throw createError({
            statusCode: 400,
            statusMessage: signupError.message
          })
        }

        return {
          success: true,
          data: {
            user: signupResult.user,
            session: signupResult.session
          },
          message: 'Account created successfully. Please check your email to confirm your account.'
        }

      case 'logout':
        if (method !== 'POST') {
          throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
          })
        }

        const { error: logoutError } = await supabase.auth.signOut()

        if (logoutError) {
          throw createError({
            statusCode: 400,
            statusMessage: logoutError.message
          })
        }

        return {
          success: true,
          message: 'Logged out successfully'
        }

      case 'reset-password':
        if (method !== 'POST') {
          throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
          })
        }

        const resetData = await readBody(event)
        const validatedReset = passwordResetSchema.parse(resetData)

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          validatedReset.email,
          {
            redirectTo: `${getHeader(event, 'origin')}/auth/reset-password`
          }
        )

        if (resetError) {
          throw createError({
            statusCode: 400,
            statusMessage: resetError.message
          })
        }

        return {
          success: true,
          message: 'Password reset email sent successfully'
        }

      case 'update-password':
        if (method !== 'POST') {
          throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
          })
        }

        const updateData = await readBody(event)
        const validatedUpdate = passwordUpdateSchema.parse(updateData)

        const { error: updateError } = await supabase.auth.updateUser({
          password: validatedUpdate.password
        })

        if (updateError) {
          throw createError({
            statusCode: 400,
            statusMessage: updateError.message
          })
        }

        return {
          success: true,
          message: 'Password updated successfully'
        }

      case 'mfa/enroll':
        if (method !== 'POST') {
          throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
          })
        }

        const mfaData = await readBody(event)
        const validatedMfa = mfaEnrollSchema.parse(mfaData)

        const { data: mfaResult, error: mfaError } = await supabase.auth.mfa.enroll({
          factorType: validatedMfa.factorType,
          friendlyName: validatedMfa.friendlyName
        })

        if (mfaError) {
          throw createError({
            statusCode: 400,
            statusMessage: mfaError.message
          })
        }

        return {
          success: true,
          data: mfaResult
        }

      case 'mfa/verify':
        if (method !== 'POST') {
          throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
          })
        }

        const verifyData = await readBody(event)
        const validatedVerify = mfaVerifySchema.parse(verifyData)

        const { data: verifyResult, error: verifyError } = await supabase.auth.mfa.verify({
          factorId: validatedVerify.factorId,
          code: validatedVerify.code
        })

        if (verifyError) {
          throw createError({
            statusCode: 400,
            statusMessage: verifyError.message
          })
        }

        return {
          success: true,
          data: verifyResult
        }

      case 'mfa/unenroll':
        if (method !== 'DELETE') {
          throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
          })
        }

        const factorId = getQuery(event).factorId as string
        if (!factorId) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Factor ID is required'
          })
        }

        const { error: unenrollError } = await supabase.auth.mfa.unenroll({
          factorId
        })

        if (unenrollError) {
          throw createError({
            statusCode: 400,
            statusMessage: unenrollError.message
          })
        }

        return {
          success: true,
          message: 'MFA factor removed successfully'
        }

      case 'mfa/factors':
        if (method !== 'GET') {
          throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
          })
        }

        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()

        if (factorsError) {
          throw createError({
            statusCode: 400,
            statusMessage: factorsError.message
          })
        }

        return {
          success: true,
          data: factors
        }

      default:
        throw createError({
          statusCode: 404,
          statusMessage: 'Endpoint not found'
        })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation error',
        data: error.errors
      })
    }

    if (error.statusCode) {
      throw error
    }

    console.error('Auth API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
