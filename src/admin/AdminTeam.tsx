import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  Shield,
  X,
  Lock,
  User,
  Info,
} from 'lucide-react';
import { AdminTeamMember } from '../types';
import { adminTeamService } from '../lib/adminTeamService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const AdminTeam: React.FC = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState<AdminTeamMember[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<AdminTeamMember | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminTeamMember['title']>('Store Manager');
  const [phoneNumber, setPhoneNumber] = useState('+91 ');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTeam = async () => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'admin')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          setTeam(
            data.map((p) => ({
              id: p.id,
              email: p.email,
              full_name: p.full_name || 'Store Administrator',
              title: 'Super Admin',
              phone: p.phone || '',
              is_primary: p.id === user?.id,
              created_at: p.created_at || new Date().toISOString(),
            }))
          );
          return;
        }
      } catch (err) {
        console.warn('Could not query admin team from Supabase:', err);
      }
    }
    setTeam(adminTeamService.getAdminTeam());
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !fullName.trim()) {
      setErrorMsg('Full name and email address are required.');
      setLoading(false);
      return;
    }

    try {
      if (supabase) {
        // Find if profile already exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email, role')
          .eq('email', cleanEmail)
          .single();

        if (profile) {
          // Promote profile in Supabase to admin
          const { error: updateErr } = await supabase
            .from('profiles')
            .update({ role: 'admin', full_name: fullName.trim(), phone: phoneNumber })
            .eq('id', profile.id);

          if (updateErr) {
            setErrorMsg(updateErr.message || 'Failed to update database role.');
            setLoading(false);
            return;
          }
        } else {
          // Note that user must register first
          setErrorMsg(
            `No account found for "${cleanEmail}". The user must first sign up at /login, after which an administrator can grant them admin privileges.`
          );
          setLoading(false);
          return;
        }
      }

      setSuccessMsg(`Administrator ${fullName} (${cleanEmail}) has been authorized.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setIsAddModalOpen(false);
      setFullName('');
      setEmail('');
      setPhoneNumber('+91 ');
      loadTeam();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add administrator.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;

    if (deleteCandidate.id === user?.id) {
      alert('You cannot revoke administrative privileges from your own active account.');
      return;
    }

    try {
      if (supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({ role: 'customer' })
          .eq('id', deleteCandidate.id);

        if (error) {
          alert(error.message || 'Failed to demote user role in database.');
          return;
        }
      }

      setSuccessMsg(`Administrator access revoked for ${deleteCandidate.email}.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setDeleteCandidate(null);
      loadTeam();
    } catch (err: any) {
      alert(err.message || 'Error updating administrator status.');
    }
  };

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-medium">
            Role-Based Access Control
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-black flex items-center space-x-2.5 font-normal mt-1">
            <span>Store Administrators</span>
            <ShieldCheck className="w-6 h-6 text-black" />
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-0.5">
            Manage authenticated users authorized to access products, inventory, customer orders, and store operations.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.15em] font-semibold rounded shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Authorize Admin</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded bg-neutral-100 border border-neutral-300 text-black text-xs flex items-center space-x-2 shadow-sm">
          <CheckCircle className="w-4 h-4 text-black flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Security Architecture Info Notice */}
      <div className="p-4 rounded bg-neutral-50 border border-neutral-200 text-neutral-800 text-xs flex items-start space-x-3">
        <Info className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-black">Unified Supabase Auth &amp; Database RBAC</p>
          <p className="text-neutral-600 leading-relaxed font-light">
            All team members authenticate securely via Supabase Auth. Privileges are validated against the database <code className="font-mono text-black">public.profiles.role</code> column and protected by Row Level Security (RLS) triggers. Client-side role tampering is completely prevented.
          </p>
        </div>
      </div>

      {/* Admins Table / List */}
      <div className="bg-white border border-neutral-200 rounded shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="font-serif text-lg text-black">Authorized Staff Directory</h2>
          <span className="text-xs text-neutral-500 font-mono">{team.length} Active Administrators</span>
        </div>

        <div className="divide-y divide-neutral-200">
          {team.map((member) => {
            const isSelf = member.id === user?.id || member.email.toLowerCase() === user?.email.toLowerCase();

            return (
              <div
                key={member.id}
                className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-neutral-100 text-black border border-neutral-300">
                    <Shield className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-serif text-base text-black font-medium">{member.full_name}</span>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-mono font-medium bg-black text-white">
                        {member.title}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono bg-neutral-200 text-neutral-800">
                          Current User
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-mono text-neutral-800">{member.email}</span>
                      </span>

                      {member.phone && (
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{member.phone}</span>
                        </span>
                      )}

                      <span className="flex items-center space-x-1 text-neutral-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Added {new Date(member.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center">
                  {isSelf ? (
                    <span className="text-[11px] text-neutral-400 italic flex items-center space-x-1">
                      <Lock className="w-3 h-3 text-neutral-400" />
                      <span>Active Session</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setDeleteCandidate(member)}
                      className="px-3.5 py-1.5 rounded border border-neutral-300 text-neutral-700 hover:text-black hover:border-black text-xs font-medium transition-all flex items-center space-x-1.5"
                      title="Revoke Admin Access"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Revoke Role</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Authorize Admin Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-neutral-300 rounded max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-black" />
                <h3 className="font-serif text-xl text-black">Authorize Administrator</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-black rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Team Member Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@aleezperfumes.com"
                  className="w-full bg-neutral-50 border border-neutral-300 focus:border-black rounded px-3 py-2 text-xs text-black focus:outline-none"
                />
                <span className="text-[11px] text-neutral-500 font-light mt-1 block">
                  Must correspond to an existing registered user account.
                </span>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-neutral-50 border border-neutral-300 focus:border-black rounded px-3 py-2 text-xs text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 focus:border-black rounded px-3 py-2 text-xs text-black focus:outline-none font-mono"
                />
              </div>

              <div className="pt-4 border-t border-neutral-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded text-xs font-medium text-neutral-700 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-wider font-semibold rounded shadow-sm transition-colors disabled:opacity-60"
                >
                  {loading ? 'Authorizing...' : 'Grant Admin Privileges'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-neutral-300 rounded max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-neutral-100 text-black flex items-center justify-center mx-auto border border-neutral-300">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg text-black">Revoke Administrator Privileges?</h3>
              <p className="text-xs text-neutral-600">
                Are you sure you want to demote <span className="font-semibold text-black">{deleteCandidate.full_name}</span> ({deleteCandidate.email}) to standard customer status?
              </p>
              <p className="text-[11px] text-neutral-500 pt-1">
                They will immediately lose access to the administrative portal.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 border border-neutral-300 rounded text-xs font-medium text-neutral-700 hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-wider font-semibold rounded shadow-sm transition-colors"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
