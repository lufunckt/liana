import { useStore } from '../store';

// Available permission types
export type PermissionType = 'view_only' | 'edit_leads' | 'manage_all';

export interface UserProfile {
  id: string; // usually a slug or unique ID (e.g. email slug or raw format)
  nome: string;
  cargo: string;
  email: string;
  role: string; // user-friendly role label, e.g., 'Administrador', 'Operador de Vendas', 'Suporte'
  permissions: PermissionType[];
  foto?: string;
  linkedin?: string;
  instagram?: string;
  telefone?: string;
  perfil?: string;
}

export function usePermissions() {
  const { data } = useStore();
  const selectedProfileId = localStorage.getItem('ilg_selected_profile') || 'ana';
  
  const perfis = data.perfis || [];
  const activeProfile = perfis.find((p: any) => p.id === selectedProfileId);

  // Retrieve permissions for the active profile with intelligent defaults
  const getPermissions = (): PermissionType[] => {
    if (activeProfile && Array.isArray(activeProfile.permissions)) {
      return activeProfile.permissions;
    }
    
    // Default safe fallbacks for the original profiles
    if (selectedProfileId === 'luiza' || selectedProfileId === 'liana') {
      return ['view_only', 'edit_leads', 'manage_all'];
    }
    if (selectedProfileId === 'ana') {
      return ['edit_leads'];
    }
    return ['view_only'];
  };

  const permissions = getPermissions();

  const hasPermission = (perm: PermissionType) => {
    if (permissions.includes('manage_all')) return true;
    if (perm === 'view_only') return true; // View is universal
    return permissions.includes(perm);
  };

  // Check if current user is restricted to read-only views
  const isReadOnly = () => {
    return !hasPermission('edit_leads') && !hasPermission('manage_all');
  };

  return {
    activeProfile,
    role: activeProfile?.role || activeProfile?.cargo || (
      selectedProfileId === 'luiza' || selectedProfileId === 'liana' ? 'Administrador' : 'Colaborador'
    ),
    permissions,
    hasPermission,
    isReadOnly,
    isAdmin: hasPermission('manage_all')
  };
}
