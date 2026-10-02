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

export const AdminTeam: React.FC = () => {
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

  const loadTeam = () => {
    setTeam(adminTeamService.getAdminTeam());
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = adminTeamService.addAdminMember({
      email,
      full_name: fullName,
      title: role,
      phone: phoneNumber,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to add administrator.');
      return;
    }

    setSuccessMsg(`Administrator ${fullName} (${email}) has been successfully authorized!`);
    setTimeout(() => setSuccessMsg(null), 4000);
    setIsAddModalOpen(false);
    setFullName('');
    setEmail('');
    setRole('Store Manager');
    setPhoneNumber('+91 ');
    loadTeam();
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;

    const res = adminTeamService.removeAdminMember(deleteCandidate.id);
    if (!res.success) {
      alert(res.error || 'Failed to remove administrator.');
      return;
    }

    setSuccessMsg(`Administrator access revoked for ${deleteCandidate.email}.`);
    setTimeout(() => setSuccessMsg(null), 4000);
    setDeleteCandidate(null);
    loadTeam();
  };

  const superAdminsCount = team.filter((m) => m.title === 'Super Admin').length;
  const storeManagersCount = team.filter((m) => m.title === 'Store Manager').length;

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-luxury-border gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-luxury-gold font-medium">
            Access Control
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-luxury-dark mt-1 flex items-center gap-2">
            <span>Admins & Store Staff</span>
            <ShieldCheck className="w-6 h-6 text-luxury-gold" />
          </h1>
          <p className="text-xs text-stone-500 font-light mt-0.5">
            Manage authorized staff members permitted to access products, inventory, customer orders, and store settings.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-luxury-gold hover:bg-luxury-goldHover text-white text-xs uppercase tracking-[0.15em] font-semibold rounded-lg shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Admin</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-slide-up shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-luxury-border rounded-xl p-5 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">Total Administrators</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-serif text-3xl text-luxury-dark">{team.length}</span>
            <span className="text-xs text-emerald-600 font-medium">Active</span>
          </div>
        </div>

        <div className="bg-white border border-luxury-border rounded-xl p-5 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">Super Admins</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-serif text-3xl text-luxury-gold">{superAdminsCount}</span>
            <span className="text-xs text-stone-500">Full Access</span>
          </div>
        </div>

        <div className="bg-white border border-luxury-border rounded-xl p-5 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">Store Managers</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-serif text-3xl text-stone-700">{storeManagersCount}</span>
            <span className="text-xs text-stone-500">Catalog & Orders</span>
          </div>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-amber-900 text-xs flex items-start space-x-3">
        <Info className="w-5 h-5 text-luxury-gold flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-stone-900">How Administrator Authorization Operates:</p>
          <p className="text-stone-600 leading-relaxed">
            Staff members added here can sign in directly at <span className="font-mono text-stone-800">/admin</span> using their email and default security passcode <span className="font-mono font-semibold text-luxury-gold">AleezAdmin2026!</span> (or custom assigned credentials). The primary store owner (<span className="font-mono text-stone-800">aleez.perfumes818@gmail.com</span>) is permanently safeguarded against deletion.
          </p>
        </div>
      </div>

      {/* Admins Table / List */}
      <div className="bg-white border border-luxury-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-luxury-border flex items-center justify-between">
          <h2 className="font-serif text-lg text-luxury-dark">Authorized Staff Directory</h2>
          <span className="text-xs text-stone-400">{team.length} Team Members</span>
        </div>

        <div className="divide-y divide-luxury-border">
          {team.map((member) => {
            const isOwner = member.is_primary || member.email.toLowerCase() === 'aleez.perfumes818@gmail.com';

            return (
              <div
                key={member.id}
                className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isOwner ? 'bg-amber-100 text-luxury-gold border border-amber-300' : 'bg-stone-100 text-stone-600 border border-stone-200'
                  }`}>
                    {isOwner ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm text-luxury-dark">{member.full_name}</span>
                      {isOwner && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                          Primary Owner
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium ${
                        member.title === 'Super Admin'
                          ? 'bg-stone-900 text-amber-300'
                          : member.title === 'Store Manager'
                          ? 'bg-stone-100 text-stone-700 border border-stone-300'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {member.title}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                        <span className="font-mono text-stone-700">{member.email}</span>
                      </span>

                      {member.phone && (
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span>{member.phone}</span>
                        </span>
                      )}

                      <span className="flex items-center space-x-1 text-stone-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Added {new Date(member.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center">
                  {isOwner ? (
                    <span className="text-[11px] text-stone-400 italic flex items-center space-x-1">
                      <Lock className="w-3 h-3 text-stone-400" />
                      <span>Protected Account</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setDeleteCandidate(member)}
                      className="px-3.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-xs font-medium transition-all flex items-center space-x-1.5"
                      title="Revoke Admin Access"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Revoke Access</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Admin Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-luxury-border rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-luxury-border">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-full bg-luxury-gold/10 text-luxury-gold flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-luxury-dark">Add New Administrator</h3>
                  <p className="text-[11px] text-stone-500">Grant portal access to a manager or partner</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Ahmed"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded-lg px-3.5 py-2.5 text-xs text-luxury-dark focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. tariq@aleezperfumes.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded-lg px-3.5 py-2.5 text-xs text-luxury-dark focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                    Assigned Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as AdminTeamMember['title'])}
                    className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded-lg px-3 py-2.5 text-xs text-luxury-dark focus:outline-none"
                  >
                    <option value="Super Admin">Super Admin (Full Access)</option>
                    <option value="Store Manager">Store Manager (Catalog & Orders)</option>
                    <option value="Order Dispatcher">Order Dispatcher (Orders & Shipping)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded-lg px-3 py-2.5 text-xs text-luxury-dark focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-[11px] text-stone-600 space-y-1">
                <span className="font-semibold text-stone-800">Initial Access Passcode:</span>
                <p>New administrators can authenticate at <span className="font-mono text-stone-800">/admin</span> using their email and passcode <span className="font-mono font-bold text-luxury-gold">AleezAdmin2026!</span>.</p>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-luxury-border rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-luxury-gold hover:bg-luxury-goldHover text-white text-xs uppercase tracking-wider font-semibold rounded-lg shadow-sm transition-all"
                >
                  Authorize Administrator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-luxury-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg text-luxury-dark">Revoke Administrator Access?</h3>
              <p className="text-xs text-stone-600">
                Are you sure you want to remove <span className="font-semibold text-stone-800">{deleteCandidate.full_name}</span> ({deleteCandidate.email})?
              </p>
              <p className="text-[11px] text-red-500 pt-1">
                They will immediately be locked out of the administration portal.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 border border-luxury-border rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider font-semibold rounded-lg shadow-sm transition-colors"
              >
                Yes, Revoke Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
