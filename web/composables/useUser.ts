import type { Database } from '@shared/types/supabase';

// Types
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

// User management composable
export const useUser = () => {
  const supabase = useSupabaseClient<Database>();
  const { user, currentTeam, isSuperAdmin, isTeamAdmin } = useAuth();
  const { canCreate, canUpdate, canDelete } = useRBAC();

  // Get all users in current team
  const getTeamUsers = async (): Promise<User[]> => {
    if (!currentTeam.value) {
      throw new Error('No team selected');
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select(
          `
          *,
          team_members!inner (
            team_id,
            status,
            roles (*)
          )
        `
        )
        .eq('team_members.team_id', currentTeam.value.id)
        .eq('team_members.status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching team users:', error);
      throw error;
    }
  };

  // Get all users (super admin only)
  const getAllUsers = async (): Promise<User[]> => {
    if (!isSuperAdmin.value) {
      throw new Error('Only super admins can view all users');
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  };

  // Get user by ID
  const getUser = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  };

  // Create user profile (called after Supabase auth signup)
  const createUserProfile = async (userData: UserInsert): Promise<User> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (
    userId: string,
    updates: UserUpdate
  ): Promise<User> => {
    // Users can update their own profile, team admins can update team users, super admins can update anyone
    const canUpdateUser =
      userId === user.value?.id || isTeamAdmin.value || isSuperAdmin.value;

    if (!canUpdateUser) {
      throw new Error('You do not have permission to update this user');
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          version: supabase.raw('version + 1'),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Update own profile
  const updateOwnProfile = async (updates: UserUpdate): Promise<User> => {
    if (!user.value) {
      throw new Error('User not authenticated');
    }

    return updateUserProfile(user.value.id, updates);
  };

  // Delete user (super admin only)
  const deleteUser = async (userId: string): Promise<void> => {
    if (!isSuperAdmin.value) {
      throw new Error('Only super admins can delete users');
    }

    try {
      const { error } = await supabase.from('users').delete().eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  // Search users
  const searchUsers = async (
    query: string,
    teamId?: string
  ): Promise<User[]> => {
    const targetTeamId = teamId || currentTeam.value?.id;
    if (!targetTeamId) {
      throw new Error('No team specified');
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select(
          `
          *,
          team_members!inner (
            team_id,
            status,
            roles (*)
          )
        `
        )
        .eq('team_members.team_id', targetTeamId)
        .eq('team_members.status', 'active')
        .or(
          `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  };

  // Get user statistics
  const getUserStats = async (teamId?: string) => {
    const targetTeamId = teamId || currentTeam.value?.id;
    if (!targetTeamId) {
      throw new Error('No team specified');
    }

    try {
      // Get total user count
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('team_members.team_id', targetTeamId)
        .eq('team_members.status', 'active');

      // Get active users (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('team_members.team_id', targetTeamId)
        .eq('team_members.status', 'active')
        .gte('last_sign_in_at', thirtyDaysAgo.toISOString());

      // Get new users (last 30 days)
      const { count: newUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('team_members.team_id', targetTeamId)
        .eq('team_members.status', 'active')
        .gte('created_at', thirtyDaysAgo.toISOString());

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        newUsers: newUsers || 0,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  };

  // Invite user to team
  const inviteUser = async (email: string, roleId: string): Promise<void> => {
    if (!(await canCreate('user', 'team'))) {
      throw new Error('You do not have permission to invite users');
    }

    if (!currentTeam.value) {
      throw new Error('No team selected');
    }

    try {
      // First, sign up the user with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password: Math.random().toString(36).slice(-12), // Random password
          email_confirm: false,
        });

      if (authError) throw authError;

      // Create user profile
      await createUserProfile({
        id: authData.user.id,
        email: authData.user.email!,
        first_name: '',
        last_name: '',
        avatar_url: null,
        timezone: 'UTC',
        locale: 'en-US',
        currency: 'USD',
        date_format: 'MM/DD/YYYY',
        time_format: '12h',
        unit_system: 'imperial',
      });

      // Add user to team
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: currentTeam.value.id,
          user_id: authData.user.id,
          role_id: roleId,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1,
        });

      if (memberError) throw memberError;

      // Send invitation email (this would be implemented with your email service)
      // await sendInvitationEmail(email, currentTeam.value.name)
    } catch (error) {
      console.error('Error inviting user:', error);
      throw error;
    }
  };

  return {
    // User CRUD operations
    getTeamUsers,
    getAllUsers,
    getUser,
    createUserProfile,
    updateUserProfile,
    updateOwnProfile,
    deleteUser,

    // User search and stats
    searchUsers,
    getUserStats,

    // User invitation
    inviteUser,
  };
};
