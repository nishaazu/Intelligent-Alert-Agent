import React, { useState } from 'react';
import { AlertInput, Severity, AlertDetails, UserRole, User, GeneratedAlert, EmailLogEntry } from '../types';
import { OUTLETS, USERS } from '../services/mockData';
import { generateAlertContent } from '../services/geminiService';
import { simulateSmtpSend, SMTP_CONFIG } from '../services/emailService';
import { Loader2, Send, ShieldAlert, Server, Mail, CheckCircle, AlertTriangle } from 'lucide-react';

const INITIAL_DETAILS: AlertDetails = {
  material_name: 'Chicken Breast',
  supplier_name: 'Ahmad Food Supplies Sdn Bhd',
  days_until_expiry: 7,
  affected_menus: ['Nasi Ayam', 'Mee Goreng Mamak'],
  category: 'Meat'
};

const AlertGenerator: React.FC = () => {
  // State
  const [outletId, setOutletId] = useState<number>(3);
  const [severity, setSeverity] = useState<Severity>(Severity.HIGH);
  const [details, setDetails] = useState<AlertDetails>(INITIAL_DETAILS);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAlert, setGeneratedAlert] = useState<GeneratedAlert | null>(null);
  const [emailLogs, setEmailLogs] = useState<EmailLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'alert' | 'logs'>('alert');

  // Handlers
  const handleDetailChange = (field: keyof AlertDetails, value: any) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleMenuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const menus = e.target.value.split(',').map(s => s.trim());
    setDetails(prev => ({ ...prev, affected_menus: menus }));
  };

  const determineTargetUsers = (oId: number, sev: Severity): User[] => {
    let targets: User[] = [];
    
    // Always get the Halal Exec for the outlet
    const exec = USERS.find(u => u.role === UserRole.HALAL_EXECUTIVE && u.outlet_id === oId);
    if (exec) targets.push(exec);

    // If Medium or High, include Top Management
    if (sev === Severity.MEDIUM || sev === Severity.HIGH) {
      const management = USERS.filter(u => u.role === UserRole.TOP_MANAGEMENT);
      targets = [...targets, ...management];
    }
    
    return targets;
  };

  const handleGenerate = async () => {
    if (!process.env.API_KEY) {
      alert("Please ensure process.env.API_KEY is set to use the Gemini API.");
      return;
    }

    setIsGenerating(true);
    setGeneratedAlert(null);
    setEmailLogs([]);
    setActiveTab('logs');

    try {
      // 1. Determine Users
      const targets = determineTargetUsers(outletId, severity);

      // 2. Generate Content via Gemini
      const input: AlertInput = {
        trigger_type: 'EXPIRY',
        outlet_id: outletId,
        severity: severity,
        details: details
      };
      
      const aiMessage = await generateAlertContent(input);

      const newAlert: GeneratedAlert = {
        alert_id: Math.floor(Math.random() * 10000),
        severity: severity,
        message: aiMessage,
        target_users: targets,
        created_at: new Date().toISOString()
      };

      setGeneratedAlert(newAlert);

      // 3. Simulate Emails
      for (const user of targets) {
        await simulateSmtpSend(user.email, `[URGENT] Halal Compliance Alert - ${details.material_name}`, (log) => {
          setEmailLogs(prev => [...prev, log]);
        });
      }

      setActiveTab('alert');

    } catch (error) {
      console.error(error);
      alert("Failed to generate alert sequence.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT COLUMN: Controls */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary-600" />
              Incident Details
            </h2>
            <div className="text-xs font-mono text-gray-400">ID: #NEW</div>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Outlet</label>
              <select 
                className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                value={outletId}
                onChange={(e) => setOutletId(Number(e.target.value))}
              >
                {OUTLETS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <div className="grid grid-cols-3 gap-2">
                {[Severity.LOW, Severity.MEDIUM, Severity.HIGH].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeverity(s)}
                    className={`py-2 text-sm rounded-lg font-medium border transition ${
                      severity === s 
                        ? s === Severity.HIGH 
                          ? 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-500'
                          : s === Severity.MEDIUM
                            ? 'bg-yellow-50 border-yellow-200 text-yellow-700 ring-2 ring-yellow-500'
                            : 'bg-green-50 border-green-200 text-green-700 ring-2 ring-green-500'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material Name</label>
                <input 
                  type="text" 
                  value={details.material_name}
                  onChange={(e) => handleDetailChange('material_name', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                <input 
                  type="text" 
                  value={details.supplier_name}
                  onChange={(e) => handleDetailChange('supplier_name', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    value={details.category}
                    onChange={(e) => handleDetailChange('category', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                  >
                    <option value="Meat">Meat/Poultry</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Processed">Processed</option>
                    <option value="Dry">Dry Goods</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Days to Expiry</label>
                  <input 
                    type="number" 
                    value={details.days_until_expiry}
                    onChange={(e) => handleDetailChange('days_until_expiry', Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Affected Menus (comma separated)</label>
                <input 
                  type="text" 
                  value={details.affected_menus.join(', ')}
                  onChange={handleMenuChange}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold text-white shadow-lg transition-all ${
                isGenerating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 hover:shadow-xl active:scale-[0.98]'
              }`}
            >
              {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
              {isGenerating ? 'Processing Agent...' : 'Generate & Broadcast Alert'}
            </button>
            
            <div className="text-[10px] text-center text-gray-400">
              Powered by Google Gemini 2.5 Flash
            </div>
          </div>
        </div>

        {/* SMTP Config Visual */}
        <div className="bg-slate-900 text-slate-300 rounded-xl p-4 font-mono text-xs shadow-inner">
          <div className="flex items-center gap-2 mb-3 text-slate-100 border-b border-slate-700 pb-2">
            <Server className="w-4 h-4" />
            SMTP Configuration (env)
          </div>
          <div className="grid grid-cols-2 gap-y-2">
            <span className="text-slate-500">SMTP_HOST:</span> <span>{SMTP_CONFIG.HOST}</span>
            <span className="text-slate-500">SMTP_PORT:</span> <span>{SMTP_CONFIG.PORT}</span>
            <span className="text-slate-500">SMTP_USER:</span> <span>{SMTP_CONFIG.USER}</span>
            <span className="text-slate-500">SMTP_SECURE:</span> <span className="text-green-400">{SMTP_CONFIG.SECURE}</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Results */}
      <div className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
        <div className="bg-white flex-1 rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
             <button 
               onClick={() => setActiveTab('alert')}
               className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition ${
                 activeTab === 'alert' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' : 'text-gray-500 hover:bg-gray-50'
               }`}
             >
               <AlertTriangle className="w-4 h-4" />
               Generated Alert
             </button>
             <button 
               onClick={() => setActiveTab('logs')}
               className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition ${
                 activeTab === 'logs' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'
               }`}
             >
               <Mail className="w-4 h-4" />
               SMTP Logs & Delivery
               {emailLogs.length > 0 && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{emailLogs.length}</span>}
             </button>
          </div>

          <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
            
            {/* ALERT TAB */}
            {activeTab === 'alert' && (
              generatedAlert ? (
                <div className="space-y-6">
                  {/* Target Audience Card */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Target Recipients</h3>
                    <div className="flex flex-wrap gap-2">
                      {generatedAlert.target_users.map(u => (
                        <div key={u.user_id} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm border border-indigo-100">
                          <div className={`w-2 h-2 rounded-full ${u.role === UserRole.TOP_MANAGEMENT ? 'bg-purple-500' : 'bg-indigo-500'}`}></div>
                          <span className="font-medium">{u.name}</span>
                          <span className="text-xs opacity-75">({u.role === UserRole.TOP_MANAGEMENT ? 'Mgmt' : 'Exec'})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-800 text-white px-4 py-2 text-sm flex justify-between items-center">
                      <span>Preview</span>
                      <span className="text-gray-400 text-xs">Generated by Agent</span>
                    </div>
                    <div className="p-6 font-mono text-sm whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {generatedAlert.message}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-gray-300" />
                  </div>
                  <p>Configure details and click "Generate" to view the alert.</p>
                </div>
              )
            )}

            {/* LOGS TAB */}
            {activeTab === 'logs' && (
               <div className="space-y-2 font-mono text-xs">
                 {emailLogs.length === 0 ? (
                   <div className="text-center text-gray-400 mt-10">No transmission logs available yet.</div>
                 ) : (
                   emailLogs.map((log) => (
                     <div key={log.id} className="bg-black text-green-400 p-3 rounded border border-gray-800 shadow-sm flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <span className="text-gray-500 shrink-0">{log.timestamp.split('T')[1].split('.')[0]}</span>
                       <div className="flex-1">
                          <span className={`font-bold mr-2 ${
                            log.status === 'SENT' ? 'text-green-400' : 
                            log.status === 'FAILED' ? 'text-red-400' : 
                            'text-yellow-400'
                          }`}>[{log.status}]</span>
                          <span className="text-gray-300">{log.details}</span>
                       </div>
                     </div>
                   ))
                 )}
                 {emailLogs.length > 0 && emailLogs[emailLogs.length - 1].status === 'SENT' && (
                    <div className="mt-8 flex justify-center">
                        <div className="bg-green-100 text-green-800 px-6 py-2 rounded-full flex items-center gap-2 font-semibold animate-bounce">
                            <CheckCircle className="w-5 h-5" />
                            All Emails Dispatched Successfully
                        </div>
                    </div>
                 )}
               </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertGenerator;