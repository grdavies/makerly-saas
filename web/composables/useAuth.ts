import type { User, Session, AuthError } from '@supabase/supabase-js'
import type { Database } from '@shared/types/supabase'

// Types for our custom user data
export type UserProfile = Database['public']['Tables']['users']['Row']
export type Team = Database['public']['Tables']['teams']['Row']
export type TeamMember = Database['public']['Tables']['team_members']['Row']
export type Role = Database['public']['Tables']['roles']['Row']

// Authentication state interface
export interface AuthState {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  teams: Team[]
  currentTeam: Team | null
  currentTeamMember: TeamMember | null
  currentRole: Role | null
  loading: boolean
  error: AuthError | null
}

// Authentication composable
export const useAuth = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const session = useSupabaseSession()
  
  // Reactive state
  const state = reactive<AuthState>({
    user: user.value,
    session: session.value,
    profile: null,
    teams: [],
    currentTeam: null,
    currentTeamMember: null,
    currentRole: null,
    loading: true,
    error: null
  })

  // Watch for user changes
  watch(user, async (newUser) => {
    state.user = newUser
    state.loading = true
    
    if (newUser) {
      await loadUserProfile()
      await loadUserTeams()
    } else {
      // Clear state when user logs out
      state.profile = null
      state.teams = []
      state.currentTeam = null
      state.currentTeamMember = null
      state.currentRole = null
    }
    
    state.loading = false
  }, { immediate: true })

  // Load user profile from our custom users table
  const loadUserProfile = async () => {
    if (!state.user) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', state.user.id)
        .single()

      if (error) throw error
      state.profile = data
    } catch (error) {
      console.error('Error loading user profile:', error)
      state.error = error as AuthError
    }
  }

  // Load user's teams
  const loadUserTeams = async () => {
    if (!state.user) return

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          team_id,
          teams (*),
          roles (*)
        `)
        .eq('user_id', state.user.id)
        .eq('status', 'active')

      if (error) throw error

      state.teams = data?.map(item => item.teams).filter(Boolean) as Team[]
      
      // Set current team (first team for now, can be enhanced with team switching)
      if (state.teams.length > 0) {
        state.currentTeam = state.teams[0]
        
        // Find current team member info
        const currentMemberData = data?.find(item => item.team_id === state.currentTeam?.id)
        if (currentMemberData) {
          state.currentTeamMember = {
            id: currentMemberData.team_id,
            team_id: currentMemberData.team_id,
            user_id: state.user.id,
            role_id: currentMemberData.roles?.id || '',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            version: 1
          }
          state.currentRole = currentMemberData.roles as Role
        }
      }
    } catch (error) {
      console.error('Error loading user teams:', error)
      state.error = error as AuthError
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    state.loading = true
    state.error = null

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return data
    } catch (error) {
      state.error = error as AuthError
      throw error
    } finally {
      state.loading = false
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    state.loading = true
    state.error = null

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      state.error = error as AuthError
      throw error
    } finally {
      state.loading = false
    }
  }

  // Sign out
  const signOut = async () => {
    state.loading = true
    state.error = null

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      state.error = error as AuthError
      throw error
    } finally {
      state.loading = false
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    state.loading = true
    state.error = null

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error
    } catch (error) {
      state.error = error as AuthError
      throw error
    } finally {
      state.loading = false
    }
  }

  // Update password
  const updatePassword = async (password: string) => {
    state.loading = true
    state.error = null

    try {
      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) throw error
    } catch (error) {
      state.error = error as AuthError
      throw error
    } finally {
      state.loading = false
    }
  }

  // Switch team
  const switchTeam = async (teamId: string) => {
    const team = state.teams.find(t => t.id === teamId)
    if (!team) {
      throw new Error('Team not found')
    }

    state.currentTeam = team
    
    // Reload team member info for the new team
    if (state.user) {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select(`
            *,
            roles (*)
          `)
          .eq('user_id', state.user.id)
          .eq('team_id', teamId)
          .eq('status', 'active')
          .single()

        if (error) throw error

        state.currentTeamMember = data
        state.currentRole = data.roles as Role
      } catch (error) {
        console.error('Error loading team member info:', error)
        state.error = error as AuthError
      }
    }
  }

  // Computed properties
  const isAuthenticated = computed(() => !!state.user)
  const isSuperAdmin = computed(() => state.currentRole?.name === 'super_admin')
  const isTeamAdmin = computed(() => state.currentRole?.name === 'admin')
  const isMember = computed(() => state.currentRole?.name === 'member')
  const isViewer = computed(() => state.currentRole?.name === 'viewer')

  return {
    // State
    ...toRefs(state),
    
    // Computed
    isAuthenticated,
    isSuperAdmin,
    isTeamAdmin,
    isMember,
    isViewer,
    
    // Methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    switchTeam,
    loadUserProfile,
    loadUserTeams
  }
}
