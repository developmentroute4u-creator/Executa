"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Building, Settings, Plus, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function ClientOrganization() {
  const { data: session } = useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("My Workspace");
  const [industry, setIndustry] = useState("Unspecified");

  const [activeModal, setActiveModal] = useState<'settings' | 'invite' | null>(null);

  // Settings State
  const [userNameState, setUserNameState] = useState((session?.user as any)?.name || "Client");
  const [userEmailState, setUserEmailState] = useState((session?.user as any)?.email || "client@company.com");
  const [editName, setEditName] = useState(userNameState);
  const [editEmail, setEditEmail] = useState(userEmailState);

  const userInitial = userNameState.charAt(0).toUpperCase();

  // Invite State
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const closeModal = () => {
    setActiveModal(null);
    setInviteEmail("");
    setEditName(userNameState);
    setEditEmail(userEmailState);
    setIsRoleDropdownOpen(false);
  };

  const handleSaveSettings = () => {
    setUserNameState(editName);
    setUserEmailState(editEmail);
    closeModal();
  };

  const handleSendInvite = () => {
    if (!inviteEmail) return;
    alert(`Invite sent to ${inviteEmail} as ${inviteRole}`);
    closeModal();
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-12 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-16"
      >
        <h1 className="text-[40px] font-black tracking-tight text-stone-900 leading-[1.1] mb-4">
          Organization
        </h1>
        <p className="text-[18px] font-medium text-stone-500 max-w-2xl leading-relaxed">
          Manage your company profile, team permissions, and operational preferences.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* TEAM & ACCESS */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="flex items-center justify-between border-b border-stone-200/60 pb-4">
            <h2 className="text-[14px] font-bold tracking-wide text-stone-900 uppercase">Team Members</h2>
            <button
              onClick={() => setActiveModal('invite')}
              className="flex items-center gap-2 text-[13px] font-bold text-[#E85239] hover:text-[#d44127] transition-colors"
            >
              <Plus size={16} /> Invite Member
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-stone-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center text-[16px] font-black">
                  {userInitial}
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-stone-900">{userNameState}</h3>
                  <p className="text-[13px] font-medium text-stone-500">{userEmailState}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="px-3 py-1 bg-stone-100 text-stone-900 text-[11px] font-bold uppercase tracking-wider rounded-lg">
                  Owner
                </span>
                <button
                  onClick={() => setActiveModal('settings')}
                  className="text-stone-400 hover:text-stone-900 transition-colors"
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* COMPANY PROFILE */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-[#FFF7F6] border border-orange-100 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-stone-100 flex items-center justify-center shrink-0">
                <Building size={24} className="text-stone-900" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="text-[20px] font-black text-stone-900 leading-tight w-full bg-transparent border-b border-stone-300 focus:outline-none focus:border-stone-900 mb-1"
                  />
                ) : (
                  <h2 className="text-[20px] font-black text-stone-900 leading-tight">{workspaceName}</h2>
                )}
                <p className="text-[13px] font-medium text-stone-500">Standard Plan</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1 block">Industry</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="text-[14px] font-bold text-stone-900 w-full bg-transparent border-b border-stone-300 focus:outline-none focus:border-stone-900"
                  />
                ) : (
                  <p className="text-[14px] font-bold text-stone-900">{industry}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-full mt-8 py-3 text-[13px] font-bold bg-white text-stone-900 border border-stone-200 hover:border-stone-300 rounded-xl transition-colors shadow-sm"
            >
              {isEditing ? "Save Profile" : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-100 p-8 m-4"
            >
              <button
                onClick={closeModal}
                className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Settings Modal */}
              {activeModal === 'settings' && (
                <div>
                  <h2 className="text-[24px] font-black text-stone-900 mb-6">Owner Settings</h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[12px] font-bold uppercase tracking-wider text-stone-500 mb-2 block">Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-[14px] font-medium text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-bold uppercase tracking-wider text-stone-500 mb-2 block">Email Address</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-[14px] font-medium text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    className="w-full mt-8 py-3 bg-[#E85239] text-white text-[14px] font-bold rounded-xl hover:bg-[#d44127] transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}

              {/* Invite Modal */}
              {activeModal === 'invite' && (
                <div>
                  <h2 className="text-[24px] font-black text-stone-900 mb-6">Invite Member</h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[12px] font-bold uppercase tracking-wider text-stone-500 mb-2 block">Email Address</label>
                      <input
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-[14px] font-medium text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-bold uppercase tracking-wider text-stone-500 mb-2 block">Role</label>
                      <div className="relative">
                        <div
                          onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                          className={`w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pr-10 text-[14px] font-medium text-stone-900 cursor-pointer transition-colors ${isRoleDropdownOpen ? 'bg-white border-stone-900' : ''}`}
                        >
                          {inviteRole}
                        </div>
                        <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`}>
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>

                        <AnimatePresence>
                          {isRoleDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden z-50 flex flex-col"
                            >
                              {["Admin", "Member", "Viewer"].map((role) => (
                                <button
                                  key={role}
                                  onClick={() => { setInviteRole(role); setIsRoleDropdownOpen(false); }}
                                  className={`w-full text-left px-4 py-3 text-[14px] font-medium transition-colors rounded-none ${inviteRole === role
                                    ? "bg-[#E85239] text-white"
                                    : "text-stone-900 hover:bg-[#E85239]/10 hover:text-[#E85239]"
                                    }`}
                                >
                                  {role}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <p className="text-[12px] font-medium text-stone-500 mt-3 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-100">
                        <span className="font-bold text-stone-700">{inviteRole} permissions: </span>
                        {inviteRole === 'Admin' && "Full access to manage projects, billing, organization settings, and invite members."}
                        {inviteRole === 'Member' && "Can view, edit, and collaborate on active projects. Cannot manage billing or organization settings."}
                        {inviteRole === 'Viewer' && "Read-only access to projects. Cannot make changes, invite members, or view billing."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSendInvite}
                    disabled={!inviteEmail}
                    className="w-full mt-8 py-3 bg-[#E85239] disabled:bg-stone-200 disabled:text-stone-400 text-white text-[14px] font-bold rounded-xl hover:bg-[#d44127] disabled:hover:bg-stone-200 transition-colors"
                  >
                    Send Invite
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
