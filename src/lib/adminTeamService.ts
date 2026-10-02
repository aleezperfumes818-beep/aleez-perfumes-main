import { AdminTeamMember } from '../types';

const ADMIN_TEAM_STORAGE_KEY = 'aleez_admin_team_members';

const DEFAULT_ADMINS: AdminTeamMember[] = [
  {
    id: 'admin-primary-001',
    email: 'aleez.perfumes818@gmail.com',
    full_name: 'Aleez Perfumes Owner',
    title: 'Super Admin',
    phone: '+91 9345526905',
    is_primary: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'admin-store-002',
    email: 'admin@aleezperfumes.com',
    full_name: 'Store Manager',
    title: 'Store Manager',
    phone: '+91 9345526905',
    is_primary: false,
    created_at: '2026-01-15T00:00:00.000Z',
  },
];

export const adminTeamService = {
  getAdminTeam(): AdminTeamMember[] {
    try {
      const saved = localStorage.getItem(ADMIN_TEAM_STORAGE_KEY);
      if (!saved) {
        localStorage.setItem(ADMIN_TEAM_STORAGE_KEY, JSON.stringify(DEFAULT_ADMINS));
        return DEFAULT_ADMINS;
      }
      const parsed: AdminTeamMember[] = JSON.parse(saved);
      // Ensure the primary owner is always present
      if (!parsed.some((a) => a.email.toLowerCase() === 'aleez.perfumes818@gmail.com')) {
        parsed.unshift(DEFAULT_ADMINS[0]);
        localStorage.setItem(ADMIN_TEAM_STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return DEFAULT_ADMINS;
    }
  },

  addAdminMember(data: {
    email: string;
    full_name: string;
    title: AdminTeamMember['title'];
    phone?: string;
  }): { success: boolean; error?: string; member?: AdminTeamMember } {
    try {
      const cleanEmail = data.email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (!data.full_name.trim()) {
        return { success: false, error: 'Full name is required.' };
      }

      const team = this.getAdminTeam();
      const existing = team.find((m) => m.email.toLowerCase() === cleanEmail);
      if (existing) {
        return { success: false, error: `An administrator with email "${cleanEmail}" already exists.` };
      }

      const newMember: AdminTeamMember = {
        id: `admin-${Date.now()}`,
        email: cleanEmail,
        full_name: data.full_name.trim(),
        title: data.title,
        phone: data.phone?.trim() || '',
        is_primary: false,
        created_at: new Date().toISOString(),
      };

      const updatedTeam = [...team, newMember];
      localStorage.setItem(ADMIN_TEAM_STORAGE_KEY, JSON.stringify(updatedTeam));
      return { success: true, member: newMember };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to add administrator.' };
    }
  },

  removeAdminMember(id: string): { success: boolean; error?: string } {
    try {
      const team = this.getAdminTeam();
      const target = team.find((m) => m.id === id);
      if (!target) {
        return { success: false, error: 'Administrator not found.' };
      }
      if (target.is_primary || target.email.toLowerCase() === 'aleez.perfumes818@gmail.com') {
        return { success: false, error: 'The primary owner account cannot be removed.' };
      }

      const updatedTeam = team.filter((m) => m.id !== id);
      localStorage.setItem(ADMIN_TEAM_STORAGE_KEY, JSON.stringify(updatedTeam));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to remove administrator.' };
    }
  },

  isAuthorizedAdmin(email: string): { authorized: boolean; member?: AdminTeamMember } {
    const cleanEmail = email.trim().toLowerCase();
    const team = this.getAdminTeam();
    const member = team.find((m) => m.email.toLowerCase() === cleanEmail);
    if (member) {
      return { authorized: true, member };
    }
    // Also accept any admin email containing "admin" or master owner email
    if (cleanEmail === 'aleez.perfumes818@gmail.com' || cleanEmail.includes('admin@')) {
      return {
        authorized: true,
        member: {
          id: 'admin-fallback',
          email: cleanEmail,
          full_name: cleanEmail.split('@')[0],
          title: 'Store Manager',
          created_at: new Date().toISOString(),
        },
      };
    }
    return { authorized: false };
  },
};
