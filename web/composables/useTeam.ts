import type { Database } from '@shared/types/supabase'

// Types
export type Team = Database['public']['Tables']['teams']['Row']
export type TeamInsert = Database['public']['Tables']['teams']['Insert']
export type TeamUpdate = Database['public']['Tables']['teams']['Update']
export type TeamMember = Database['public']['Tables']['team_members']['Row']
export type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert']
export type TeamMemberUpdate = Database['public']['Tables']['team_members']['Update']

// Team management composable
export const useTeam = () => {
  const supabase = useSupabaseClient<Database>()
  const { user, currentTeam, isSuperAdmin } = useAuth()
  const { canCreate, canUpdate, canDelete } = useRBAC()

  // Get all teams (super admin only)
  const getTeams = async (): Promise<Team[]> => {
    if (!isSuperAdmin.value) {
      throw new Error('Only super admins can view all teams')
    }

    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching teams:', error)
      throw error
    }
  }

  // Get team by ID
  const getTeam = async (teamId: string): Promise<Team | null> => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching team:', error)
      throw error
    }
  }

  // Create new team (super admin only)
  const createTeam = async (teamData: TeamInsert): Promise<Team> => {
    if (!isSuperAdmin.value) {
      throw new Error('Only super admins can create teams')
    }

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert(teamData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating team:', error)
      throw error
    }
  }

  // Update team
  const updateTeam = async (teamId: string, updates: TeamUpdate): Promise<Team> => {
    if (!isSuperAdmin.value) {
      throw new Error('Only super admins can update teams')
    }

    try {
      const { data, error } = await supabase
        .from('teams')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          version: supabase.raw('version + 1')
        })
        .eq('id', teamId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating team:', error)
      throw error
    }
  }

  // Delete team (super admin only)
  const deleteTeam = async (teamId: string): Promise<void> => {
    if (!isSuperAdmin.value) {
      throw new Error('Only super admins can delete teams')
    }

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting team:', error)
      throw error
    }
  }

  // Get team members
  const getTeamMembers = async (teamId?: string): Promise<TeamMember[]> => {
    const targetTeamId = teamId || currentTeam.value?.id
    if (!targetTeamId) {
      throw new Error('No team specified')
    }

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          users (*),
          roles (*)
        `)
        .eq('team_id', targetTeamId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching team members:', error)
      throw error
    }
  }

  // Add member to team
  const addTeamMember = async (memberData: TeamMemberInsert): Promise<TeamMember> => {
    if (!(await canCreate('team_member', 'team'))) {
      throw new Error('You do not have permission to add team members')
    }

    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          ...memberData,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding team member:', error)
      throw error
    }
  }

  // Update team member
  const updateTeamMember = async (
    memberId: string, 
    updates: TeamMemberUpdate
  ): Promise<TeamMember> => {
    if (!(await canUpdate('team_member', 'team'))) {
      throw new Error('You do not have permission to update team members')
    }

    try {
      const { data, error } = await supabase
        .from('team_members')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          version: supabase.raw('version + 1')
        })
        .eq('id', memberId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating team member:', error)
      throw error
    }
  }

  // Remove team member
  const removeTeamMember = async (memberId: string): Promise<void> => {
    if (!(await canDelete('team_member', 'team'))) {
      throw new Error('You do not have permission to remove team members')
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString(),
          version: supabase.raw('version + 1')
        })
        .eq('id', memberId)

      if (error) throw error
    } catch (error) {
      console.error('Error removing team member:', error)
      throw error
    }
  }

  // Get team settings
  const getTeamSettings = async (teamId?: string): Promise<Team | null> => {
    const targetTeamId = teamId || currentTeam.value?.id
    if (!targetTeamId) {
      throw new Error('No team specified')
    }

    return getTeam(targetTeamId)
  }

  // Update team settings
  const updateTeamSettings = async (
    teamId: string, 
    settings: Partial<Team>
  ): Promise<Team> => {
    if (!isSuperAdmin.value) {
      throw new Error('Only super admins can update team settings')
    }

    return updateTeam(teamId, settings)
  }

  // Get team statistics
  const getTeamStats = async (teamId?: string) => {
    const targetTeamId = teamId || currentTeam.value?.id
    if (!targetTeamId) {
      throw new Error('No team specified')
    }

    try {
      // Get member count
      const { count: memberCount } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', targetTeamId)
        .eq('status', 'active')

      // Get role distribution
      const { data: roleData } = await supabase
        .from('team_members')
        .select(`
          roles (name)
        `)
        .eq('team_id', targetTeamId)
        .eq('status', 'active')

      const roleDistribution = roleData?.reduce((acc, item) => {
        const roleName = item.roles?.name || 'unknown'
        acc[roleName] = (acc[roleName] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      return {
        memberCount: memberCount || 0,
        roleDistribution
      }
    } catch (error) {
      console.error('Error fetching team stats:', error)
      throw error
    }
  }

  return {
    // Team CRUD operations
    getTeams,
    getTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    
    // Team member operations
    getTeamMembers,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    
    // Team settings
    getTeamSettings,
    updateTeamSettings,
    
    // Team statistics
    getTeamStats
  }
}
