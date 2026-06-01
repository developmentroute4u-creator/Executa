"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Download, ArrowUpRight, CheckCircle2, X } from "lucide-react";

export default function ClientBilling() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);

  const toggleProject = (id: string) => {
    setExpandedProjects(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  };

  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("");
  const [newCardCvc, setNewCardCvc] = useState("");

  const handleAddPaymentMethod = () => {
    if (newCardNumber.length >= 15) {
      setPaymentMethods([...paymentMethods, {
        id: Date.now(),
        brand: newCardNumber.startsWith("4") ? "VISA" : "MC",
        last4: newCardNumber.slice(-4),
        expiry: newCardExpiry || "12/28"
      }]);
      setIsAddPaymentModalOpen(false);
      setNewCardNumber("");
      setNewCardExpiry("");
      setNewCardCvc("");
    }
  };

  useEffect(() => {
    fetch("/api/projects")
      .then(res => res.json())
      .then(data => {
        setProjects(data.projects || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const activeEscrowProjects = projects.filter(p => ["execution", "active"].includes(p.status) && p.pricing?.total);
  const completedProjects = projects.filter(p => p.status === "completed" && p.pricing?.total);
  
  const totalYtdSpend = completedProjects.reduce((sum, p) => sum + (p.pricing?.total || 0), 0);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-16"
      >
        <h1 className="text-[40px] font-black tracking-tight text-stone-900 leading-[1.1] mb-4">
          Billing & Finances
        </h1>
        <p className="text-[18px] font-medium text-stone-500 max-w-2xl leading-relaxed">
          Transparent financial ledgers, active escrow payments, and verifiable invoicing.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEDGERS & ESCROW */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm">
            <h2 className="text-[14px] font-bold tracking-wide text-stone-400 uppercase mb-6">Active Escrow Holdings</h2>
            
            <div className="flex flex-col gap-4">
              {loading ? (
                <div className="py-8 text-stone-400 font-bold text-[13px]">Loading escrow ledgers...</div>
              ) : activeEscrowProjects.length === 0 ? (
                <div className="py-8 text-stone-500 text-[13px]">No active projects holding escrow funds.</div>
              ) : (
                activeEscrowProjects.map(project => {
                  const total = project.pricing.total;
                  const freelancerPay = total * 0.90;
                  const supportFee = total * 0.05;
                  const continuityFee = total * 0.03;
                  const executionFee = total * 0.02;

                  const isExpanded = expandedProjects.includes(project._id);

                  return (
                    <div key={project._id} className="flex flex-col p-6 border border-stone-100 rounded-2xl hover:border-stone-200 transition-colors bg-stone-50/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-stone-100 flex items-center justify-center">
                            <CreditCard size={20} className="text-[#E85239]" />
                          </div>
                          <div>
                            <h3 className="text-[18px] font-black text-stone-900">{project.title}</h3>
                            <p className="text-[13px] font-bold text-stone-500 capitalize">{project.status.replace("_", " ")} Phase</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[24px] font-black text-stone-900 leading-none">₹{total.toLocaleString()}</p>
                          <p className="text-[12px] font-bold text-emerald-600 uppercase tracking-wider mt-1">Funded in Escrow</p>
                        </div>
                      </div>

                      {!isExpanded ? (
                        <div className="mt-5 flex justify-center">
                          <button 
                            onClick={() => toggleProject(project._id)}
                            className="text-[11px] font-bold uppercase tracking-wider text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1 bg-white px-4 py-1.5 rounded-full border border-stone-200 shadow-sm"
                          >
                            See full breakdown ↓
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="mt-6 pt-6 border-t border-stone-100">
                            <div className="bg-white p-6 rounded-xl border border-stone-100 space-y-4">
                              <div className="flex items-center justify-between pb-3 border-b border-stone-50">
                                <span className="text-[13px] font-medium text-stone-500">Freelancer Price (Project Execution)</span>
                                <span className="text-[14px] font-bold text-stone-900">₹{project.pricing.freelancerPrice.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[13px] font-medium text-stone-500">Scope Fee</span>
                                <span className="text-[13px] font-bold text-stone-900">₹{project.pricing.scopeFee.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[13px] font-medium text-stone-500">Accountability Fee</span>
                                <span className="text-[13px] font-bold text-stone-900">₹{project.pricing.accountabilityFee.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[13px] font-medium text-stone-500">Execution Fee (5%)</span>
                                <span className="text-[13px] font-bold text-stone-900">₹{project.pricing.executionFee.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-center">
                            <button 
                              onClick={() => toggleProject(project._id)}
                              className="text-[11px] font-bold uppercase tracking-wider text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1"
                            >
                              Hide full breakdown ↑
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm">
            <h2 className="text-[14px] font-bold tracking-wide text-stone-400 uppercase mb-6">Payment History & Invoices</h2>
            
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-100 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Description</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="text-[13px] font-medium text-stone-700">
                {loading ? (
                  <tr><td colSpan={4} className="py-8 text-stone-400 font-bold">Loading...</td></tr>
                ) : completedProjects.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-stone-500">No payment history available yet.</td></tr>
                ) : (
                  completedProjects.map(project => (
                    <tr key={project._id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                      <td className="py-4">{new Date(project.createdAt).toLocaleDateString()}</td>
                      <td className="py-4">{project.title} — Final Delivery</td>
                      <td className="py-4 font-bold text-stone-900">₹{project.pricing.total.toLocaleString()}</td>
                      <td className="py-4 text-right">
                        <button className="inline-flex items-center gap-2 text-[#E85239] hover:text-[#d44127] font-bold">
                          <Download size={14} /> PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* FINANCIAL SUMMARY */}
        <div className="flex flex-col gap-6">
          <div className="bg-stone-900 text-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-[13px] font-bold tracking-wide text-stone-400 uppercase mb-2">Total YTD Spend</h2>
            <p className="text-[48px] font-black tracking-tighter leading-none mb-8">
              ₹{totalYtdSpend.toLocaleString()}
            </p>
            
            <div className="flex flex-col gap-4 border-t border-stone-700 pt-6">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-stone-400 font-medium">Projects Completed</span>
                <span className="font-bold">{completedProjects.length}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#FFF7F6] border border-orange-100 rounded-3xl p-8">
            <h3 className="text-[16px] font-bold text-stone-900 mb-2">Payment Methods</h3>
            <p className="text-[13px] font-medium text-stone-600 mb-6">Manage your linked accounts for escrow funding.</p>
            
            {paymentMethods.length === 0 ? (
              <p className="text-[13px] text-stone-500 italic mb-4">No payment methods added yet.</p>
            ) : (
              paymentMethods.map((method, idx) => (
                <div key={method.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-stone-100 rounded border border-stone-200 flex items-center justify-center text-[10px] font-black">{method.brand}</div>
                    <div>
                      <p className="text-[13px] font-bold text-stone-900">•••• {method.last4}</p>
                      <p className="text-[11px] font-medium text-stone-400">Expires {method.expiry}</p>
                    </div>
                  </div>
                  {idx === 0 && <CheckCircle2 size={16} className="text-emerald-500" />}
                </div>
              ))
            )}
            
            <button 
              onClick={() => setIsAddPaymentModalOpen(true)}
              className="w-full py-3 text-[13px] font-bold text-[#E85239] hover:bg-orange-50 rounded-xl transition-colors"
            >
              + Add Payment Method
            </button>
          </div>
        </div>

      </div>

      {/* ADD PAYMENT MODAL */}
      <AnimatePresence>
        {isAddPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddPaymentModalOpen(false)}
              className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-100 p-8 m-4"
            >
              <button 
                onClick={() => setIsAddPaymentModalOpen(false)}
                className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-[24px] font-black text-stone-900 mb-6">Add Payment Method</h2>
              
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[12px] font-bold uppercase tracking-wider text-stone-500 mb-2 block">Card Number</label>
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000"
                    maxLength={16}
                    value={newCardNumber}
                    onChange={(e) => setNewCardNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-[14px] font-medium text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-bold uppercase tracking-wider text-stone-500 mb-2 block">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      maxLength={5}
                      value={newCardExpiry}
                      onChange={(e) => setNewCardExpiry(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-[14px] font-medium text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold uppercase tracking-wider text-stone-500 mb-2 block">CVC</label>
                    <input 
                      type="text" 
                      placeholder="123"
                      maxLength={4}
                      value={newCardCvc}
                      onChange={(e) => setNewCardCvc(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-[14px] font-medium text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleAddPaymentMethod}
                disabled={newCardNumber.length < 15}
                className="w-full mt-8 py-3 bg-[#E85239] disabled:bg-stone-200 disabled:text-stone-400 text-white text-[14px] font-bold rounded-xl hover:bg-[#d44127] disabled:hover:bg-stone-200 transition-colors"
              >
                Save Payment Method
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
