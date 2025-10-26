import type { Database } from '@shared/types/supabase';

// Types
export type Permission = Database['public']['Tables']['permissions']['Row'];
export type RolePermission =
  Database['public']['Tables']['role_permissions']['Row'];

// Permission checking composable
export const useRBAC = () => {
  const supabase = useSupabaseClient<Database>();
  const { currentRole, currentTeamMember, isSuperAdmin, isTeamAdmin } =
    useAuth();

  // Check if user has a specific permission
  const hasPermission = async (
    action: string,
    resource: string,
    location: string = 'team'
  ): Promise<boolean> => {
    // Super admins have all permissions
    if (isSuperAdmin.value) return true;

    // Team admins have most team-level permissions
    if (isTeamAdmin.value && location === 'team') {
      // Team admins can't manage system-level resources
      if (resource === 'permission' || resource === 'system_role') {
        return false;
      }
      return true;
    }

    // Check specific permissions for other roles
    if (!currentRole.value) return false;

    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select(
          `
          permissions (*)
        `
        )
        .eq('role_id', currentRole.value.id);

      if (error) throw error;

      return (
        data?.some(
          rp =>
            rp.permissions?.action === action &&
            rp.permissions?.resource === resource &&
            rp.permissions?.location === location
        ) || false
      );
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  // Check if user can perform action on resource
  const can = async (
    action: string,
    resource: string,
    location?: string
  ): Promise<boolean> => {
    return hasPermission(action, resource, location);
  };

  // Check if user can create something
  const canCreate = async (
    resource: string,
    location?: string
  ): Promise<boolean> => {
    return hasPermission('create', resource, location);
  };

  // Check if user can read something
  const canRead = async (
    resource: string,
    location?: string
  ): Promise<boolean> => {
    return hasPermission('read', resource, location);
  };

  // Check if user can update something
  const canUpdate = async (
    resource: string,
    location?: string
  ): Promise<boolean> => {
    return hasPermission('update', resource, location);
  };

  // Check if user can delete something
  const canDelete = async (
    resource: string,
    location?: string
  ): Promise<boolean> => {
    return hasPermission('delete', resource, location);
  };

  // Check if user can manage team members
  const canManageTeamMembers = async (): Promise<boolean> => {
    return canCreate('team_member', 'team') && canUpdate('team_member', 'team');
  };

  // Check if user can manage roles
  const canManageRoles = async (): Promise<boolean> => {
    return canCreate('role', 'team') && canUpdate('role', 'team');
  };

  // Check if user can manage permissions
  const canManagePermissions = async (): Promise<boolean> => {
    return (
      canCreate('permission', 'system') && canUpdate('permission', 'system')
    );
  };

  // Check if user can manage teams
  const canManageTeams = async (): Promise<boolean> => {
    return canCreate('team', 'system') && canUpdate('team', 'system');
  };

  // Check if user can manage users
  const canManageUsers = async (): Promise<boolean> => {
    return canCreate('user', 'team') && canUpdate('user', 'team');
  };

  // Get user's permissions for a specific resource
  const getResourcePermissions = async (
    resource: string,
    location?: string
  ) => {
    if (!currentRole.value) return [];

    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select(
          `
          permissions (*)
        `
        )
        .eq('role_id', currentRole.value.id);

      if (error) throw error;

      return (
        (data
          ?.filter(
            rp =>
              rp.permissions?.resource === resource &&
              (location ? rp.permissions?.location === location : true)
          )
          .map(rp => rp.permissions)
          .filter(Boolean) as Permission[]) || []
      );
    } catch (error) {
      console.error('Error getting resource permissions:', error);
      return [];
    }
  };

  // Get all user permissions
  const getAllPermissions = async (): Promise<Permission[]> => {
    if (!currentRole.value) return [];

    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select(
          `
          permissions (*)
        `
        )
        .eq('role_id', currentRole.value.id);

      if (error) throw error;

      return (
        (data?.map(rp => rp.permissions).filter(Boolean) as Permission[]) || []
      );
    } catch (error) {
      console.error('Error getting all permissions:', error);
      return [];
    }
  };

  // Check if user belongs to team
  const belongsToTeam = (teamId: string): boolean => {
    return currentTeamMember.value?.team_id === teamId;
  };

  // Check if user is admin of team
  const isAdminOfTeam = (teamId: string): boolean => {
    return belongsToTeam(teamId) && isTeamAdmin.value;
  };

  // Computed properties for common permission checks
  const permissions = computed(() => ({
    canManageTeamMembers: canManageTeamMembers(),
    canManageRoles: canManageRoles(),
    canManagePermissions: canManagePermissions(),
    canManageTeams: canManageTeams(),
    canManageUsers: canManageUsers(),
    isSuperAdmin: isSuperAdmin.value,
    isTeamAdmin: isTeamAdmin.value,
  }));

  return {
    // Permission checking methods
    hasPermission,
    can,
    canCreate,
    canRead,
    canUpdate,
    canDelete,

    // Specific permission checks
    canManageTeamMembers,
    canManageRoles,
    canManagePermissions,
    canManageTeams,
    canManageUsers,

    // Data retrieval methods
    getResourcePermissions,
    getAllPermissions,

    // Team-related checks
    belongsToTeam,
    isAdminOfTeam,

    // Computed properties
    permissions,
  };
};
