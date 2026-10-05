import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Search, 
  Plus, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  Trash2, 
  History, 
  PlusCircle, 
  SlidersHorizontal, 
  AlertTriangle, 
  X, 
  ExternalLink, 
  Layers, 
  Settings, 
  CreditCard, 
  Users, 
  RefreshCw, 
  Play,
  CheckSquare,
  Square,
  Sparkle,
  LayoutDashboard,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  TrendingUp,
  FileText,
  Download,
  Share2,
  Lock,
  Smartphone,
  Monitor,
  MessageSquare,
  User,
  Send,
  Key,
  ShieldCheck,
  Activity,
  Mic,
  Volume2,
  AlertOctagon,
  Unlock,
  Radio
} from 'lucide-react';

// Interfaces
interface Transaction {
  id: string;
  beneficiary: string;
  amount: number;
  currency: string;
  type: 'Payroll' | 'Invoice' | 'Transfer' | 'Refund' | 'Utility';
  urgency: 'High' | 'Medium' | 'Low';
  requester: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  selected: boolean;
  riskScore?: number;
  auditRating?: string;
  summary?: string;
  flaggedAnomalies?: string[];
  recommendation?: string;
  frozen?: boolean;
}

interface AuditReport {
  riskScore: number;
  auditRating: string;
  summary: string;
  flaggedAnomalies: string[];
  recommendation: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system' | 'attachment';
  content: string;
  time: string;
  attachmentData?: {
    id: string;
    beneficiary: string;
    amount: number;
    currency: string;
  };
  hasFreezeButton?: boolean;
}

// Global Helper Functions (Safe from hoist limits)
const getCurrencySymbol = (cur: string) => {
  switch (cur) {
    case 'GBP': return '£';
    case 'EUR': return '€';
    case 'JPY': return '¥';
    default: return '$';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Payroll': return <Users className="w-4 h-4 text-emerald-400" />;
    case 'Transfer': return <RefreshCw className="w-4 h-4 text-blue-400" />;
    case 'Refund': return <RotateCcw className="w-4 h-4 text-rose-400" />;
    case 'Utility': return <Layers className="w-4 h-4 text-amber-400" />;
    default: return <CreditCard className="w-4 h-4 text-purple-400" />;
  }
};

export default function App() {
  // 1. Core State
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-10492',
      beneficiary: 'Global Payroll Dispatch',
      amount: 42150.00,
      currency: 'USD',
      type: 'Payroll',
      urgency: 'High',
      requester: 'farahfoo@gmail.com',
      date: '2 hours ago',
      status: 'Pending',
      selected: true,
      riskScore: 2,
      auditRating: 'Safe / Routine',
      summary: 'Monthly recurring payroll dispatch to 14 verified regional employees.',
      flaggedAnomalies: ['None. Fits standard operational limits.'],
      recommendation: 'Approved. Fully verified against historical bank routing templates.'
    },
    {
      id: 'tx-08891',
      beneficiary: 'Refund tx_8891',
      amount: 350.00,
      currency: 'EUR',
      type: 'Refund',
      urgency: 'High',
      requester: 'Support Bot (Auto)',
      date: '15 mins ago',
      status: 'Pending',
      selected: true,
      riskScore: 6,
      auditRating: 'Moderate Risk',
      summary: 'Automated credit return request for disputed duplicate payment gateway event.',
      flaggedAnomalies: ['Initiated by automated bot', 'Gateway log flags potential network jitter.'],
      recommendation: 'Recommend hold for visual ledger matching or release under $500 threshold safety rule.'
    },
    {
      id: 'tx-22394',
      beneficiary: 'Apex Materials Ltd',
      amount: 20000.00, // £20,000 Sketchy Invoice payment from Walkie Talkie story!
      currency: 'GBP',
      type: 'Invoice',
      urgency: 'Medium',
      requester: 'Sarah Jenkins',
      date: '4 hours ago',
      status: 'Rejected', // Rejected as story says!
      selected: false,
      riskScore: 9,
      auditRating: 'Suspicious / Scam Alert',
      summary: 'Vendor invoice payment where supplier routing details changed overnight.',
      flaggedAnomalies: ['Routing bank account numbers do not match historical aggregation.', 'Unusual high velocity payment pattern.'],
      recommendation: 'FRAUD TRIGGER: Account parameters swapped. Halt execution immediately.'
    },
    {
      id: 'tx-44109',
      beneficiary: 'Internal USD Liquidity Pool',
      amount: 250000.00,
      currency: 'USD',
      type: 'Transfer',
      urgency: 'Low',
      requester: 'Chief Treasury Officer',
      date: '1 day ago',
      status: 'Pending',
      selected: true,
      riskScore: 7,
      auditRating: 'Elevated Risk',
      summary: 'High-value treasury rebalancing transfer to liquid operating accounts.',
      flaggedAnomalies: ['Amount exceeds typical daily standard transaction limit.', 'Requires secondary key authorization.'],
      recommendation: 'Mandatory hold. Requires offline voice verification of receiving bank pool routing.'
    },
    {
      id: 'tx-99211',
      beneficiary: 'AWS Cloud Hosting',
      amount: 8430.00,
      currency: 'USD',
      type: 'Utility',
      urgency: 'Low',
      requester: 'DevOps Lead',
      date: '3 days ago',
      status: 'Approved',
      selected: false,
      riskScore: 1,
      auditRating: 'Safe / Routine',
      summary: 'Authorized cloud infrastructure billing matching signed enterprise agreement.',
      flaggedAnomalies: ['None. Fits routine operations.'],
      recommendation: 'Automatic payout release executed.'
    },
    {
      id: 'tx-81203',
      beneficiary: 'Stripe South Africa',
      amount: 120500.00,
      currency: 'USD',
      type: 'Transfer',
      urgency: 'Medium',
      requester: 'Finance Director',
      date: '5 days ago',
      status: 'Approved',
      selected: false,
      riskScore: 4,
      auditRating: 'Moderate Risk',
      summary: 'Regional payout gateway replenishment transfer.',
      flaggedAnomalies: ['Cross-border transfer parameters active.'],
      recommendation: 'Verified. Processed successfully.'
    }
  ]);

  // 2. Navigation Modes
  const [displayMode, setDisplayMode] = useState<'split-simulator' | 'desktop-console'>('split-simulator');
  const [mobileTab, setMobileTab] = useState<'dashboard' | 'authorisations' | 'payments' | 'chat' | 'profile'>('authorisations');
  const [desktopTab, setDesktopTab] = useState<'dashboard' | 'payments' | 'authorisations' | 'chat' | 'profile'>('dashboard');

  // 3. Conversation / Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Hello Farah! I am your Stitch Compliance and Payout Assistant. How can I help you optimize your transaction flows or configure your payment limits today?",
      time: '12:42'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // 4. WALKIE-TALKIE HOTLINE STORY STATE MACHINE
  const [walkieTalkieActive, setWalkieTalkieActive] = useState(false);
  const [walkieTalkieStep, setWalkieTalkieStep] = useState<number>(0); 
  const [isHoldingMic, setIsHoldingMic] = useState(false);
  const [supplierFrozenOverlay, setSupplierFrozenOverlay] = useState(false);

  // 5. Merchant Settings State
  const [dailyLimit, setDailyLimit] = useState<number>(500000);
  const [webhookUrl, setWebhookUrl] = useState('https://api.farah.com/v1/stitch-hooks');
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sandboxApiKey, setSandboxApiKey] = useState('st_sk_live_9921_farah_e53df40');

  // Drag width ref & state
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const [sliderWidth, setSliderWidth] = useState(240);

  // Detail & Overlays State
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<Transaction | null>(null);
  const [auditingId, setAuditingId] = useState<string | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<Transaction | null>(null);
  const [logs, setLogs] = useState<string[]>([
    '12:42:00 — Stitch Compliance node initialized successfully.',
    '12:42:01 — Secure VIP hotline walkie-talkie module online.'
  ]);

  // Filters & Sorting State
  const [sortBy, setSortBy] = useState<string>('Standard');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [paymentSearch, setPaymentSearch] = useState<string>('');
  const [paymentsStatusFilter, setPaymentsStatusFilter] = useState<string>('All');

  // Custom Item Form State
  const [newBeneficiary, setNewBeneficiary] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCurrency, setNewCurrency] = useState('USD');
  const [newType, setNewType] = useState<'Payroll' | 'Invoice' | 'Transfer' | 'Refund' | 'Utility'>('Invoice');
  const [newUrgency, setNewUrgency] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newRequester, setNewRequester] = useState('manager@stitch.money');
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  // Notifications feedback toasts
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [isBulkApprovedFeedback, setIsBulkApprovedFeedback] = useState(false);
  const [hapticShake, setHapticShake] = useState(false);

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [`${time} — ${message}`, ...prev]);
  };

  // Filters logic
  const filteredPendingTransactions = useMemo(() => {
    let result = transactions.filter(tx => tx.status === 'Pending');
    if (urgencyFilter !== 'All') result = result.filter(tx => tx.urgency === urgencyFilter);
    if (typeFilter !== 'All') result = result.filter(tx => tx.type === typeFilter);

    if (sortBy === 'AmountHighToLow') {
      result.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'AmountLowToHigh') {
      result.sort((a, b) => a.amount - b.amount);
    } else if (sortBy === 'Urgency') {
      const priority = { High: 3, Medium: 2, Low: 1 };
      result.sort((a, b) => priority[b.urgency] - priority[a.urgency]);
    } else if (sortBy === 'Newest') {
      result.sort((a, b) => b.id.localeCompare(a.id));
    }
    return result;
  }, [transactions, urgencyFilter, typeFilter, sortBy]);

  const filteredPaymentsHistory = useMemo(() => {
    let result = [...transactions];
    if (paymentsStatusFilter !== 'All') result = result.filter(tx => tx.status === paymentsStatusFilter);
    if (paymentSearch.trim() !== '') {
      const q = paymentSearch.toLowerCase();
      result = result.filter(tx => 
        tx.beneficiary.toLowerCase().includes(q) || 
        tx.id.toLowerCase().includes(q) ||
        tx.requester.toLowerCase().includes(q)
      );
    }
    return result;
  }, [transactions, paymentsStatusFilter, paymentSearch]);

  const volumeStats = useMemo(() => {
    const totalOutflow = transactions.filter(t => t.status === 'Approved').reduce((sum, t) => sum + t.amount, 0);
    const pendingVolume = transactions.filter(t => t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0);
    const approvedCount = transactions.filter(t => t.status === 'Approved').length;
    const totalCount = transactions.length;
    const successRate = totalCount > 0 ? (approvedCount / (transactions.filter(t => t.status !== 'Pending').length || 1)) * 100 : 100;

    return {
      totalOutflow,
      pendingVolume,
      successRate: successRate > 0 ? successRate : 99.8,
      pendingCount: transactions.filter(t => t.status === 'Pending').length
    };
  }, [transactions]);

  const pendingItems = useMemo(() => transactions.filter(t => t.status === 'Pending'), [transactions]);
  const selectedPendingCount = useMemo(() => pendingItems.filter(t => t.selected).length, [pendingItems]);
  const isAllPendingSelected = useMemo(() => pendingItems.length > 0 && pendingItems.every(t => t.selected), [pendingItems]);

  const toggleSelectAll = () => {
    const nextState = !isAllPendingSelected;
    setTransactions(prev => prev.map(t => t.status === 'Pending' ? { ...t, selected: nextState } : t));
    addLog(nextState ? 'Checked all Stitch pending items.' : 'Deselected all pending items.');
  };

  const toggleSelectIndividual = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, selected: !t.selected } : t));
  };

  // Perform AI Risk Analysis
  const handleTriggerAudit = async (tx: Transaction) => {
    setAuditingId(tx.id);
    addLog(`Invoking compliance server route for ${tx.id}...`);

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction: tx }),
      });

      if (!response.ok) throw new Error('Compliance AI service failure');
      const result: AuditReport = await response.json();
      
      setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, ...result } : t));
      setSelectedAudit({ ...tx, ...result });
      addLog(`Gemini Audit success for ${tx.id}. Rating: ${result.auditRating} (Risk: ${result.riskScore}/10)`);
    } catch (err: any) {
      console.error('Audit failed:', err);
      addLog(`Audit Failed: ${err.message}. Applied heuristic fallbacks.`);
    } finally {
      setAuditingId(null);
    }
  };

  // Chat Messenger Sending Handler
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: `chat-${Date.now()}`,
      role: 'user',
      content: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);
    addLog(`User submitted query: "${userMessage.content.slice(0, 40)}..."`);

    try {
      const messageHistory = chatMessages.concat(userMessage).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messageHistory }),
      });

      if (!response.ok) throw new Error('Support service endpoint failed');
      const result = await response.json();

      const assistantMessage: ChatMessage = {
        id: `chat-${Date.now() + 1}`,
        role: 'model',
        content: result.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat failed:', err);
      const errorMessage: ChatMessage = {
        id: `chat-error-${Date.now()}`,
        role: 'model',
        content: "I am having temporary trouble reaching the payment ledger. Please try asking again in a moment.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Bulk swipe release
  const handleBulkApprove = () => {
    const selectedIds = pendingItems.filter(t => t.selected).map(t => t.id);
    if (selectedIds.length === 0) {
      setHapticShake(true);
      setTimeout(() => setHapticShake(false), 500);
      return;
    }

    setTransactions(prev => prev.map(t => selectedIds.includes(t.id) ? { ...t, status: 'Approved', selected: false } : t));
    setIsBulkApprovedFeedback(true);
    addLog(`STITCH RELEASE: Released ${selectedIds.length} payments in bulk.`);
    
    setTimeout(() => setIsBulkApprovedFeedback(false), 2200);
    setSelectedItemForDetail(null);
  };

  const handleIndividualAction = (id: string, action: 'Approved' | 'Rejected') => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: action, selected: false } : t));
    addLog(`Stitch action [${action.toUpperCase()}] executed on transaction ${id}.`);
    if (selectedItemForDetail?.id === id) setSelectedItemForDetail(null);
  };

  // Profile credentials rotation
  const handleRotateKeys = () => {
    const keyId = `st_sk_live_farah_${Math.floor(1000 + Math.random() * 9000)}_${Math.random().toString(36).substring(2, 9)}`;
    setSandboxApiKey(keyId);
    addLog(`SANDBOX ROTATION: Generated fresh secret API key credentials.`);
    setToastNotification('Stitch API keys rotated successfully!');
    setTimeout(() => setToastNotification(null), 3000);
  };

  // Profile webhook save
  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    addLog(`WEBHOOK UPDATE: Saved notification target endpoint to ${webhookUrl}`);
    setToastNotification('Stitch webhook endpoint registered!');
    setTimeout(() => setToastNotification(null), 3000);
  };

  // Walkie Talkie Simulator Process triggers
  const startWalkieTalkieStory = () => {
    setWalkieTalkieActive(true);
    setWalkieTalkieStep(1);
    setChatMessages([
      {
        id: 'system-wt-1',
        role: 'system',
        content: "🚨 VIP HOTLINE SIMULATOR ACTIVATED: You are walking through a busy airport terminal and need to report a sketchy £20,000 transaction you just rejected.",
        time: '12:42'
      },
      {
        id: 'wt-welcome',
        role: 'model',
        content: "Barclays Bank Concierge Support here. We see you just rejected Invoice payment tx-22394 (£20,000.00). Would you like to share the evidence?",
        time: '12:42'
      }
    ]);
    addLog('HOTLINE SIMULATOR: Initialized walkie-talkie scenario step 1.');
  };

  // Action 1: Share the Evidence
  const wtShareEvidence = () => {
    const attachmentMsg: ChatMessage = {
      id: 'wt-evidence-attachment',
      role: 'attachment',
      content: 'Shared invoice tx-22394 metadata with Barclays VIP team.',
      time: '12:43',
      attachmentData: {
        id: 'tx-22394',
        beneficiary: 'Apex Materials Ltd',
        amount: 20000.00,
        currency: 'GBP'
      }
    };

    setChatMessages(prev => [...prev, attachmentMsg]);
    setWalkieTalkieStep(2);
    addLog('HOTLINE SIMULATOR: Shared sketchy transaction invoice tx-22394.');
  };

  // Action 2: Voice-to-Text holding Mic
  const handleMicPressStart = () => {
    setIsHoldingMic(true);
    setWalkieTalkieStep(3);
    addLog('HOTLINE SIMULATOR: Voice recorder holding... transcribing airport audio feed.');
  };

  const handleMicPressEnd = () => {
    setIsHoldingMic(false);
    setWalkieTalkieStep(4);
    addLog('HOTLINE SIMULATOR: Speech captured. Translating to text via Stitch AI converter.');

    // Automatically trigger transcription and send message after brief animation
    setTimeout(() => {
      const transcriptionMsg: ChatMessage = {
        id: 'wt-user-speech',
        role: 'user',
        content: "This supplier's details changed overnight, it looks like a scam.",
        time: '12:43'
      };

      setChatMessages(prev => [...prev, transcriptionMsg]);
      setIsTyping(true);

      // Bank manager replies instantly
      setTimeout(() => {
        setIsTyping(false);
        const managerReply: ChatMessage = {
          id: 'wt-manager-response',
          role: 'model',
          content: "CONFIRMED COMPLIANCE THREAT: Visual analysis verified account routing detail swap 4 hours ago. It is indeed a supplier details hack. Click below to block the supplier permanently across all operational channels.",
          time: '12:44',
          hasFreezeButton: true
        };

        setChatMessages(prev => [...prev, managerReply]);
        setWalkieTalkieStep(5);
        addLog('HOTLINE SIMULATOR: Bank Manager confirmed fraud. Glowing "Freeze Supplier" button active.');
      }, 1500);

    }, 1000);
  };

  // Action 3: Freeze supplier
  const triggerFreezeSupplier = () => {
    // Blacklist Apex Materials Ltd in the active transaction pool
    setTransactions(prev => prev.map(t => {
      if (t.beneficiary === 'Apex Materials Ltd') {
        return { ...t, frozen: true };
      }
      return t;
    }));

    setSupplierFrozenOverlay(true);
    setWalkieTalkieStep(6);
    addLog('EMERGENCY LOCKDOWN: Frozen and blacklisted Apex Materials Ltd vendor node.');
  };

  const exitWalkieTalkie = () => {
    setWalkieTalkieActive(false);
    setWalkieTalkieStep(0);
    setSupplierFrozenOverlay(false);
    setChatMessages([
      {
        id: 'welcome',
        role: 'model',
        content: "Hello Farah! I am your Stitch Compliance and Payout Assistant. How can I help you optimize your transaction flows or configure your payment limits today?",
        time: '12:42'
      }
    ]);
    addLog('HOTLINE SIMULATOR: Walkie-Talkie simulator session finished.');
  };

  const handleResetData = () => {
    setTransactions(prev => prev.map(t => {
      if (t.status === 'Pending') {
        return t;
      }
      // Put them back to pending for replay demo purposes
      return { ...t, status: 'Pending', selected: true };
    }));
    setSelectedAudit(null);
    setSelectedItemForDetail(null);
    addLog('Reset ledger items status back to Stitch Pending Approvals.');
  };

  useEffect(() => {
    if (sliderTrackRef.current) {
      setSliderWidth(sliderTrackRef.current.offsetWidth - 52);
    }
  }, [pendingItems, mobileTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Decorative Ambiance Glares */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#0c1c2e]/40 to-transparent opacity-40 pointer-events-none" />
      <div className="absolute top-[12%] left-[15%] w-[35%] h-[35%] bg-emerald-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[15%] right-[5%] w-[45%] h-[45%] bg-blue-500/[0.03] blur-[130px] rounded-full pointer-events-none" />

      {/* HEADER: Conforming strictly to the 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Stitch
            </span>
          </div>

          {/* Zone 2: Navigation link segments, single-line text links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-400">
            <button 
              onClick={() => { setDisplayMode('split-simulator'); addLog('Switched to mobile sandbox view.'); }}
              className={`flex items-center gap-2 hover:text-slate-100 transition-colors whitespace-nowrap ${displayMode === 'split-simulator' ? 'text-emerald-400' : ''}`}
            >
              <Smartphone className="w-4 h-4" /> Mobile Sandbox
            </button>
            <button 
              onClick={() => { setDisplayMode('desktop-console'); addLog('Switched to widescreen desktop layout.'); }}
              className={`flex items-center gap-2 hover:text-slate-100 transition-colors whitespace-nowrap ${displayMode === 'desktop-console' ? 'text-emerald-400' : ''}`}
            >
              <Monitor className="w-4 h-4" /> Full Desktop Console
            </button>
            <a href="#logs" className="hover:text-slate-100 transition-colors whitespace-nowrap">
              Audit Logs
            </a>
            <a href="https://stitch.money" target="_blank" rel="noreferrer" className="hover:text-slate-100 transition-colors inline-flex items-center gap-1 whitespace-nowrap text-slate-500">
              stitch.money <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          {/* Zone 3: Direct actions */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleResetData}
              className="px-3.5 py-2 text-xs font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 rounded-lg hover:bg-emerald-950/40 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Re-Queue Ledger
            </button>
          </div>
        </div>
      </header>

      {/* Router views */}
      <AnimatePresence mode="wait">
        {displayMode === 'split-simulator' ? (
          
          /* ================================================================================= */
          /* ======================== MODE A: SPLIT SIMULATOR SCREEN ======================== */
          /* ================================================================================= */
          <motion.div 
            key="split"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 flex-1"
          >
            
            {/* LEFT COL: Stitch Creator Controls */}
            <div className="col-span-1 lg:col-span-3 flex flex-col gap-5">
              
              {/* Emergency Walkie-Talkie Demo Controller card */}
              <div className="bg-gradient-to-br from-indigo-950/30 to-slate-900 border border-indigo-500/20 rounded-xl p-5 shadow-xl relative overflow-hidden">
                <div className="absolute -right-3 -top-3 w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center">
                  <Radio className="w-6 h-6 text-indigo-400 animate-pulse" />
                </div>
                
                <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-1 font-bold">
                  <Sparkles className="w-3 h-3" /> VIP Airport Hotline
                </p>
                <h3 className="text-sm font-black text-slate-100">Walkie-Talkie Scenario</h3>
                <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed font-semibold">
                  The boss rejects a sketchy £20,000 transfer while walking through a busy airport terminal, needing to alert the bank instantly.
                </p>

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setMobileTab('chat');
                      setDesktopTab('chat');
                      startWalkieTalkieStory();
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-lg shadow-lg shadow-indigo-950/20 flex items-center justify-center gap-1.5 cursor-pointer font-bold"
                  >
                    <Mic className="w-3.5 h-3.5" /> Start Walkie-Talkie Demo
                  </button>
                  
                  {walkieTalkieActive && (
                    <button
                      onClick={exitWalkieTalkie}
                      className="w-full py-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-bold rounded-lg cursor-pointer font-bold"
                    >
                      Exit Demo Mode
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Panel */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 shadow-xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 font-bold">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Stitch Account Metrics
                </h3>
                <div className="flex flex-col gap-3 font-semibold text-xs">
                  <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-900">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Settled Pay-outs</p>
                    <p className="text-xl font-bold font-mono text-emerald-400 tracking-tight mt-1 tabular-nums">
                      ${volumeStats.totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-900">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">In-Flight Volume</p>
                    <p className="text-xl font-bold font-mono text-blue-400 tracking-tight mt-1 tabular-nums">
                      ${volumeStats.pendingVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-900/60 text-center">
                      <p className="text-[9px] text-slate-500 font-bold uppercase">Success Rate</p>
                      <p className="text-xs font-black text-indigo-400 mt-1">{volumeStats.successRate.toFixed(1)}%</p>
                    </div>
                    <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-900/60 text-center">
                      <p className="text-[9px] text-slate-500 font-bold uppercase">Daily Limit</p>
                      <p className="text-xs font-black text-slate-300 mt-1">${(dailyLimit / 1000).toFixed(0)}k</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* MIDDLE COL: iPhone Bezel containing 5-Screen Stitch Application */}
            <div className="col-span-1 lg:col-span-5 flex flex-col items-center justify-start">
              
              <div 
                className={`w-full max-w-[390px] bg-[#0c1328] rounded-[48px] p-3.5 shadow-[0_0_80px_rgba(0,0,0,0.85),_inset_0_4px_12px_rgba(255,255,255,0.12)] border-4 border-slate-800 flex flex-col relative aspect-[9/18.5] overflow-hidden select-none transition-transform duration-300 ${hapticShake ? 'animate-shake' : ''}`}
              >
                
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-44 h-7 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center">
                  <div className="w-12 h-1 bg-slate-800 rounded-full mb-1" />
                  <div className="w-2.5 h-2.5 bg-slate-900 rounded-full ml-3 mb-1" />
                </div>

                {/* Status Bar */}
                <div className="bg-slate-950 h-10 flex items-center justify-between px-6 text-[11px] font-semibold text-slate-300 select-none z-40 relative">
                  <span>12:42</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[9px] text-emerald-400 uppercase tracking-widest font-mono">STITCH PAY</span>
                    <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-0.5 flex items-center">
                      <div className="w-full h-full bg-slate-300 rounded-[1px]" />
                    </div>
                  </div>
                </div>

                {/* Smartphone Display boundaries */}
                <div className="flex-1 bg-slate-50 text-slate-900 rounded-[32px] overflow-hidden flex flex-col relative shadow-inner">
                  
                  {/* SCREEN AREA SCROLLBODY */}
                  <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20 flex flex-col relative">
                    
                    {/* ----------------- SCREEN 1: DASHBOARD TAB ----------------- */}
                    {mobileTab === 'dashboard' && (
                      <div className="flex flex-col gap-4 animate-fadeIn text-left font-semibold">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Welcome back</p>
                            <h2 className="text-base font-black text-slate-900">Stitch Console</h2>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs shadow-inner font-mono">FF</div>
                        </div>

                        <div className="bg-[#0c244c] text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-teal-300">Stitch Ledger Balance</p>
                          <p className="text-2xl font-black font-mono tracking-tight mt-1.5 tabular-nums">$1,424,900.52</p>
                          <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-400 font-bold">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>+4.2% inflows this week</span>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
                          <p className="text-[10px] font-black text-[#0c244c] uppercase tracking-wider mb-2.5">Payout Activity</p>
                          <div className="h-24 flex items-end justify-between gap-2.5 pt-3 px-1">
                            {[42, 68, 55, 90, 75, 40, 85].map((val, idx) => (
                              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full bg-slate-100 h-16 rounded-t-xs overflow-hidden flex items-end">
                                  <div className={`w-full ${idx === 3 ? 'bg-emerald-500' : 'bg-[#0c244c]'}`} style={{ height: `${val}%` }} />
                                </div>
                                <span className="text-[8px] font-bold text-slate-400">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => setMobileTab('authorisations')} className="bg-white border border-slate-200 rounded-xl p-3 text-left cursor-pointer">
                            <ShieldAlert className="w-4 h-4 text-emerald-600 mb-1" />
                            <p className="text-[11px] font-extrabold text-[#0c244c]">Approvals</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">{pendingItems.length} tasks waiting</p>
                          </button>
                          <button onClick={() => setMobileTab('payments')} className="bg-white border border-slate-200 rounded-xl p-3 text-left cursor-pointer">
                            <DollarSign className="w-4 h-4 text-indigo-600 mb-1" />
                            <p className="text-[11px] font-extrabold text-[#0c244c]">Payments</p>
                            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">Explore history</p>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ----------------- SCREEN 2: APPROVALS TAB ----------------- */}
                    {mobileTab === 'authorisations' && (
                      <div className="flex flex-col gap-1.5 animate-fadeIn text-left">
                        <div className="mb-2">
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-bold">Release Management</p>
                          <h2 className="text-base font-black text-slate-900 font-bold">Pending Authorisations ({filteredPendingTransactions.length})</h2>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 mb-3.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          <div>
                            <span className="block mb-1 font-bold">Sort</span>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-1 py-1.5 font-semibold text-[10px] shadow-sm">
                              <option value="Standard">Standard Sort</option>
                              <option value="AmountHighToLow">Amount: High-Low</option>
                              <option value="AmountLowToHigh">Amount: Low-High</option>
                              <option value="Urgency">Urgency Priority</option>
                            </select>
                          </div>
                          <div>
                            <span className="block mb-1 font-bold">Urgency</span>
                            <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-1 py-1.5 font-semibold text-[10px] shadow-sm">
                              <option value="All">All Urgencies</option>
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </div>
                          <div>
                            <span className="block mb-1 font-bold">Type</span>
                            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-1 py-1.5 font-semibold text-[10px] shadow-sm">
                              <option value="All">All Types</option>
                              <option value="Payroll">Payrolls</option>
                              <option value="Invoice">Invoices</option>
                              <option value="Transfer">Transfers</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2.5">
                          {filteredPendingTransactions.map(tx => (
                            <div
                              key={tx.id}
                              onClick={() => { setSelectedItemForDetail(tx); setSelectedAudit(tx); }}
                              className={`relative bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2.5 ${tx.selected ? 'ring-2 ring-emerald-500/10 bg-emerald-50/5' : ''}`}
                            >
                              <button onClick={(e) => toggleSelectIndividual(tx.id, e)} className="w-5 h-5 flex items-center justify-center rounded-md border transition-all text-white shrink-0 font-bold" style={{ backgroundColor: tx.selected ? '#059669' : '#ffffff', borderColor: tx.selected ? '#059669' : '#cbd5e1' }}>
                                {tx.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border">{getTypeIcon(tx.type)}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-[11px] font-extrabold text-[#0c244c] truncate font-bold">{tx.beneficiary}</p>
                                </div>
                                <p className="text-[9px] text-slate-500 mt-0.5 font-medium flex flex-wrap items-center gap-1.5 font-semibold">
                                  <span>{tx.type}</span>
                                  <span className="text-slate-300">·</span>
                                  <span className={tx.urgency === 'High' ? 'text-red-500 font-semibold' : 'text-slate-500'}>{tx.urgency} Urgency</span>
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[12px] font-extrabold font-mono text-[#0c244c] tabular-nums">{getCurrencySymbol(tx.currency)}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ----------------- SCREEN 3: PAYMENTS TAB ----------------- */}
                    {mobileTab === 'payments' && (
                      <div className="flex flex-col gap-3 animate-fadeIn text-left font-semibold">
                        <div>
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-bold">Financial Archive</p>
                          <h2 className="text-base font-black text-slate-900 font-bold">Payments Ledger</h2>
                        </div>

                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            placeholder="Search beneficiaries..."
                            value={paymentSearch}
                            onChange={e => setPaymentSearch(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          {filteredPaymentsHistory.map(tx => (
                            <div key={tx.id} onClick={() => { setSelectedItemForDetail(tx); setSelectedAudit(tx); }} className="bg-white border rounded-xl p-3 cursor-pointer flex items-center justify-between shadow-xs">
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${tx.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : (tx.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100')}`}>
                                  {tx.status === 'Approved' ? <ArrowUpRight className="w-3.5 h-3.5" /> : (tx.status === 'Rejected' ? <X className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />)}
                                </div>
                                <div>
                                  <p className="text-[11px] font-extrabold text-[#0c244c] truncate font-bold">{tx.beneficiary}</p>
                                  <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{tx.id} · {tx.type}</p>
                                </div>
                              </div>
                              <p className="text-[11px] font-black font-mono text-slate-900">{getCurrencySymbol(tx.currency)}{tx.amount.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ----------------- SCREEN 4: CHAT ASSISTANT & WALKIE-TALKIE TAB ----------------- */}
                    {mobileTab === 'chat' && (
                      <div className="flex flex-col h-full min-h-[385px] justify-between animate-fadeIn text-left font-semibold">
                        
                        {/* Chat window Header */}
                        <div className="border-b border-slate-200 pb-2 mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-900 leading-none">
                                {walkieTalkieActive ? 'Barclays VIP hotline' : 'Stitch Support Bot'}
                              </p>
                              <span className="text-[8px] font-semibold text-emerald-600 uppercase tracking-widest font-mono">ONLINE / SECURED</span>
                            </div>
                          </div>
                          
                          {walkieTalkieActive && (
                            <button 
                              onClick={exitWalkieTalkie}
                              className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md hover:bg-slate-200 font-bold"
                            >
                              Exit VIP Demo
                            </button>
                          )}
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 text-xs max-h-[220px]">
                          {chatMessages.map((msg) => (
                            <div 
                              key={msg.id}
                              className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : (msg.role === 'system' ? 'self-center text-center my-1' : 'self-start items-start')}`}
                            >
                              {msg.role === 'system' ? (
                                <div className="bg-indigo-50 border border-indigo-100 text-slate-700 rounded-lg p-2.5 font-medium text-[9px] leading-relaxed max-w-xs shadow-xs">
                                  {msg.content}
                                </div>
                              ) : msg.role === 'attachment' ? (
                                <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-xs text-slate-800 shadow-xs flex flex-col gap-1.5 self-start">
                                  <div className="flex items-center gap-1.5 text-rose-700 font-bold text-[9px] uppercase tracking-wider">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Sketchy Invoice shared</span>
                                  </div>
                                  <div className="bg-white p-2 rounded-lg border border-rose-100 text-left">
                                    <p className="text-[10px] font-bold text-slate-900">{msg.attachmentData?.beneficiary}</p>
                                    <p className="text-[11px] font-black text-rose-600 font-mono mt-0.5">£{msg.attachmentData?.amount.toLocaleString()}</p>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div 
                                    className={`rounded-2xl px-3 py-2 leading-relaxed ${msg.role === 'user' ? 'bg-[#0c244c] text-white rounded-tr-xs' : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/60'}`}
                                  >
                                    {msg.content}
                                    
                                    {msg.hasFreezeButton && walkieTalkieStep === 5 && (
                                      <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={triggerFreezeSupplier}
                                        className="mt-3 w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-2 px-3 rounded-lg text-[10px] tracking-wide shadow-lg shadow-rose-950/20 flex items-center justify-center gap-1 cursor-pointer animate-pulse uppercase font-bold"
                                      >
                                        <AlertOctagon className="w-3.5 h-3.5 text-white" /> 🚨 Freeze Supplier Account
                                      </motion.button>
                                    )}
                                  </div>
                                  <span className="text-[8px] text-slate-400 mt-1 font-mono">{msg.time}</span>
                                </>
                              )}
                            </div>
                          ))}

                          {isTyping && (
                            <div className="self-start flex items-center gap-1.5 bg-slate-100 border border-slate-200/60 px-3 py-2 rounded-2xl rounded-tl-xs">
                              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          )}
                        </div>

                        {/* Interactive VIP walkie-talkie controls */}
                        <div className="mt-3 border-t border-slate-200 pt-3 flex flex-col gap-2">
                          
                          {walkieTalkieActive ? (
                            <div className="flex flex-col gap-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                              
                              {walkieTalkieStep === 1 && (
                                <div className="flex items-center justify-between gap-1.5">
                                  <p className="text-[9px] font-bold text-indigo-900 leading-normal font-bold">
                                    <strong>Step 1:</strong> Share the rejected sketchy £20,000 Apex invoice as evidence with the bank manager.
                                  </p>
                                  <button
                                    onClick={wtShareEvidence}
                                    className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[9px] px-2.5 py-1.5 rounded-md cursor-pointer font-bold"
                                  >
                                    🔗 Share Transaction
                                  </button>
                                </div>
                              )}

                              {(walkieTalkieStep === 2 || walkieTalkieStep === 3) && (
                                <div className="flex flex-col items-center gap-2 py-1">
                                  <p className="text-[9px] font-bold text-indigo-950 text-center leading-normal font-bold">
                                    {walkieTalkieStep === 2 
                                      ? "Step 2: Press & Hold the Mic button to tell the bank manager details changed overnight."
                                      : "🎤 recording speech... Release Mic to convert voice to text!"}
                                  </p>
                                  
                                  <div className="flex items-center justify-center mt-1">
                                    <button
                                      onMouseDown={handleMicPressStart}
                                      onMouseUp={handleMicPressEnd}
                                      onTouchStart={handleMicPressStart}
                                      onTouchEnd={handleMicPressEnd}
                                      className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all shadow-lg ${walkieTalkieStep === 3 ? 'bg-rose-500 scale-110 shadow-rose-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20 animate-bounce'}`}
                                    >
                                      {walkieTalkieStep === 3 ? <Volume2 className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
                                    </button>
                                  </div>

                                  {walkieTalkieStep === 3 && (
                                    <div className="flex gap-1 items-center mt-1">
                                      <div className="w-1.5 h-3 bg-rose-400 rounded-full animate-pulse" />
                                      <div className="w-1.5 h-5 bg-rose-500 rounded-full animate-pulse" />
                                      <div className="w-1.5 h-2 bg-rose-400 rounded-full animate-pulse" />
                                    </div>
                                  )}
                                </div>
                              )}

                              {walkieTalkieStep === 4 && (
                                <div className="flex items-center gap-2 justify-center py-2 text-indigo-900">
                                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                                  <p className="text-[9px] font-black uppercase tracking-wider">AI Speech-to-text writing...</p>
                                </div>
                              )}

                              {walkieTalkieStep === 5 && (
                                <p className="text-[9px] font-extrabold text-rose-800 text-center leading-normal font-bold">
                                  Step 3: Confirmed hack! Click the glowing <strong>🚨 Freeze Supplier Account</strong> button above to block fraud immediately.
                                </p>
                              )}

                              {walkieTalkieStep === 6 && (
                                <div className="text-center py-1">
                                  <p className="text-[10px] font-black text-emerald-800">✅ FRAUD THWARTED SUCCESSFULLY!</p>
                                  <p className="text-[8px] text-slate-500 mt-1 leading-normal font-bold">You stopped the scam and saved £20,000 using Stitch walkie-talkie emergency VIP support.</p>
                                </div>
                              )}

                            </div>
                          ) : (
                            <form onSubmit={handleSendChat} className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                              <input
                                type="text"
                                placeholder="Message support assistant..."
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                className="flex-1 bg-transparent px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none placeholder-slate-400 font-medium"
                              />
                              <button
                                type="submit"
                                className="w-8 h-8 rounded-lg bg-[#059669] hover:bg-emerald-600 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </form>
                          )}

                        </div>

                      </div>
                    )}

                    {/* ----------------- SCREEN 5: MERCHANT PROFILE TAB ----------------- */}
                    {mobileTab === 'profile' && (
                      <div className="flex flex-col gap-4 animate-fadeIn text-left font-semibold">
                        <div className="bg-white border rounded-2xl p-4 text-center shadow-xs">
                          <div className="w-12 h-12 bg-[#0c244c] rounded-full flex items-center justify-center text-white font-bold text-base mx-auto mb-2 border">FF</div>
                          <h3 className="text-sm font-extrabold text-slate-900 leading-tight">Farah Enterprise</h3>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">farahfoo@gmail.com</p>
                          <span className="inline-block mt-2 bg-emerald-50 text-emerald-800 font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-100">
                            production node active
                          </span>
                        </div>

                        <div className="bg-white border rounded-2xl p-4 shadow-xs text-left">
                          <div className="flex justify-between items-center mb-1 text-[10px] font-black uppercase tracking-wider text-[#0c244c] font-bold">
                            <span>Daily release limit</span>
                            <span className="font-mono font-bold text-emerald-600">${dailyLimit.toLocaleString()}</span>
                          </div>
                          <input 
                            type="range"
                            min="10000"
                            max="1000000"
                            step="10000"
                            value={dailyLimit}
                            onChange={e => {
                              const lim = parseInt(e.target.value);
                              setDailyLimit(lim);
                              addLog(`RELEASE CONFIG: Updated daily payout threshold limit to $${lim.toLocaleString()}`);
                            }}
                            className="w-full accent-emerald-600 cursor-pointer mt-1"
                          />
                        </div>

                        <div className="bg-white border rounded-2xl p-4 shadow-xs text-left flex flex-col gap-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-[#0c244c] mb-1 font-bold">Sandbox Secret Key</p>
                            <input
                              type="password"
                              readOnly
                              value={sandboxApiKey}
                              className="w-full bg-slate-100 text-slate-600 font-mono text-[9px] px-2 py-1.5 rounded border border-slate-200 focus:outline-none"
                            />
                          </div>
                          <button
                            onClick={handleRotateKeys}
                            className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold py-1.5 rounded-lg text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer font-bold"
                          >
                            <Key className="w-3 h-3 text-emerald-400" /> Rotate API secrets
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* PHONE COMPONENT ACTION: GESTURE Release Slider */}
                  {mobileTab === 'authorisations' && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent z-40 border-t border-slate-50">
                      <div className="max-w-[320px] mx-auto">
                        <div 
                          ref={sliderTrackRef}
                          className="relative h-12 bg-[#edf2f7] rounded-full border border-slate-200 flex items-center justify-center p-1 overflow-hidden"
                        >
                          <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 rounded-l-full pointer-events-none" style={{ width: '100%' }} />

                          <motion.div
                            drag={selectedPendingCount > 0 ? "x" : false}
                            dragConstraints={{ left: 0, right: sliderWidth }}
                            dragElastic={0.02}
                            dragMomentum={false}
                            onDragEnd={(_, info) => {
                              if (info.offset.x >= sliderWidth * 0.75) {
                                handleBulkApprove();
                              }
                            }}
                            className={`absolute left-1 z-20 w-10 h-10 rounded-full bg-[#059669] hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg shadow-emerald-700/20 transition-colors ${selectedPendingCount === 0 ? 'opacity-40 cursor-not-allowed bg-slate-400' : ''}`}
                          >
                            <span className="text-sm font-extrabold tracking-tighter">»</span>
                          </motion.div>

                          <span className={`text-[10px] font-bold text-slate-500 tracking-wide select-none z-10 pl-6 ${selectedPendingCount === 0 ? 'opacity-50' : 'animate-pulse'}`}>
                            {selectedPendingCount > 0 
                              ? `Slide to Bulk Approve (${selectedPendingCount})` 
                              : 'Select Items to Slide Approve'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SMARTPHONE 5-TAB NAVIGATION FOOTER */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-150 z-40">
                    <div className="grid grid-cols-5 h-14 pb-safe select-none">
                      
                      <button 
                        onClick={() => { setMobileTab('dashboard'); addLog('Switched to Dashboard mobile subscreen.'); }}
                        className={`flex flex-col items-center justify-center text-slate-400 hover:text-slate-900 transition-colors ${mobileTab === 'dashboard' ? 'text-emerald-600 font-extrabold' : ''}`}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="text-[8px] font-extrabold mt-1 tracking-tight">Dashboard</span>
                      </button>

                      <button 
                        onClick={() => { setMobileTab('authorisations'); addLog('Switched to Approvals mobile subscreen.'); }}
                        className={`flex flex-col items-center justify-center text-slate-400 hover:text-[#0c244c] transition-colors relative ${mobileTab === 'authorisations' ? 'text-emerald-600 font-extrabold' : ''}`}
                      >
                        <div className="relative">
                          <ShieldAlert className="w-4 h-4" />
                          {pendingItems.length > 0 && (
                            <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white rounded-full text-[7px] font-black w-3 h-3 flex items-center justify-center font-mono font-bold">
                              {pendingItems.length}
                            </span>
                          )}
                        </div>
                        <span className="text-[8px] font-extrabold mt-1 tracking-tight">Approvals</span>
                      </button>

                      <button 
                        onClick={() => { setMobileTab('payments'); addLog('Switched to Payments mobile subscreen.'); }}
                        className={`flex flex-col items-center justify-center text-slate-400 hover:text-slate-900 transition-colors ${mobileTab === 'payments' ? 'text-emerald-600 font-extrabold' : ''}`}
                      >
                        <DollarSign className="w-4 h-4" />
                        <span className="text-[8px] font-extrabold mt-1 tracking-tight">Payments</span>
                      </button>

                      <button 
                        onClick={() => { setMobileTab('chat'); addLog('Switched to Support Chat mobile subscreen.'); }}
                        className={`flex flex-col items-center justify-center text-slate-400 hover:text-slate-900 transition-colors relative ${mobileTab === 'chat' ? 'text-emerald-600 font-extrabold' : ''}`}
                      >
                        <div className="relative">
                          <MessageSquare className="w-4 h-4" />
                          {walkieTalkieActive && walkieTalkieStep < 6 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-indigo-500 w-2 h-2 rounded-full animate-ping" />
                          )}
                        </div>
                        <span className="text-[8px] font-extrabold mt-1 tracking-tight">Support</span>
                      </button>

                      <button 
                        onClick={() => { setMobileTab('profile'); addLog('Switched to Profile settings mobile subscreen.'); }}
                        className={`flex flex-col items-center justify-center text-slate-400 hover:text-slate-900 transition-colors ${mobileTab === 'profile' ? 'text-emerald-600 font-extrabold' : ''}`}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-[8px] font-extrabold mt-1 tracking-tight">Profile</span>
                      </button>

                    </div>
                  </div>

                  {/* Backdrop success release notifications */}
                  <AnimatePresence>
                    {isBulkApprovedFeedback && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#0c244c]/95 flex flex-col items-center justify-center z-50 text-white p-6 text-center"
                      >
                        <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mb-3">
                          <Check className="w-7 h-7 text-slate-950 stroke-[3]" />
                        </div>
                        <h3 className="text-base font-extrabold text-emerald-400">Release Completed</h3>
                        <p className="text-[10px] text-slate-300 mt-1 max-w-xs leading-relaxed">
                          All selected payout batches have been broadcast successfully.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action 3: Emergency visual lockdown overlay screen */}
                  <AnimatePresence>
                    {supplierFrozenOverlay && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-50 text-white p-6 text-center"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="w-16 h-16 bg-rose-600 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-rose-900/50"
                        >
                          <Lock className="w-8 h-8 text-white" />
                        </motion.div>
                        <h3 className="text-base font-black text-rose-500 uppercase tracking-wider">Scam Account Frozen!</h3>
                        <p className="text-xs text-slate-200 mt-2 font-semibold">Apex Materials Ltd</p>
                        <p className="text-[10px] text-slate-400 mt-2.5 max-w-xs leading-relaxed font-semibold">
                          barclays safety team intercepted the £20,000 transfer and immediately frozen all transaction streams on this beneficiary node.
                        </p>
                        <button
                          onClick={exitWalkieTalkie}
                          className="mt-6 px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-800 cursor-pointer font-bold"
                        >
                          End VIP Demo Scenario
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Slide Drawer Detail Sheet */}
                  <AnimatePresence>
                    {selectedItemForDetail && (
                      <>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setSelectedItemForDetail(null)}
                          className="absolute inset-0 bg-black/60 backdrop-blur-xs z-40"
                        />
                        <motion.div 
                          initial={{ y: '100%' }}
                          animate={{ y: 0 }}
                          exit={{ y: '100%' }}
                          transition={{ type: 'spring', damping: 24, stiffness: 240 }}
                          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 p-5 flex flex-col max-h-[85%] overflow-y-auto text-left"
                        >
                          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4 shrink-0" />
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">{selectedItemForDetail.type} request</p>
                              <h4 className="text-xs font-black text-[#0c244c] mt-0.5 truncate max-w-[200px] font-bold">{selectedItemForDetail.beneficiary}</h4>
                            </div>
                            <button onClick={() => setSelectedItemForDetail(null)} className="p-1 text-slate-400 hover:text-slate-800"><X className="w-4 h-4" /></button>
                          </div>

                          <div className="bg-[#edf2f7] rounded-xl p-3.5 text-center mb-4">
                            <p className="text-[8px] font-bold text-slate-500 uppercase">Release Volume</p>
                            <p className="text-xl font-black font-mono text-[#0c244c] mt-0.5">
                              {getCurrencySymbol(selectedItemForDetail.currency)}{selectedItemForDetail.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          </div>

                          <div className="flex flex-col gap-1.5 text-[10px] text-slate-600 mb-4 font-semibold">
                            <div className="flex justify-between py-1 border-b border-slate-100">
                              <span className="text-slate-400">Ledger ID</span>
                              <span className="font-mono text-slate-800 font-semibold">{selectedItemForDetail.id}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                              <span className="text-slate-400">Initiator</span>
                              <span className="text-slate-800 font-semibold truncate max-w-[120px]">{selectedItemForDetail.requester}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-slate-400">Compliance Rate</span>
                              <span className={`font-bold ${selectedItemForDetail.status === 'Approved' ? 'text-emerald-500' : (selectedItemForDetail.status === 'Rejected' ? 'text-rose-500' : 'text-amber-500')}`}>
                                {selectedItemForDetail.status}
                              </span>
                            </div>
                          </div>

                          {selectedItemForDetail.summary && (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-4">
                              <p className="text-[9px] font-bold text-emerald-800 flex items-center gap-1 uppercase mb-1">
                                <Sparkle className="w-3 h-3 text-emerald-600" /> Compliance Audit
                              </p>
                              <p className="text-[10px] text-slate-700 leading-relaxed font-semibold">
                                {selectedItemForDetail.summary}
                              </p>
                            </div>
                          )}

                          {selectedItemForDetail.status === 'Pending' && (
                            <div className="grid grid-cols-2 gap-2 mt-auto">
                              <button 
                                onClick={() => handleIndividualAction(selectedItemForDetail.id, 'Rejected')}
                                className="bg-slate-100 hover:bg-slate-200 text-rose-600 font-bold py-2 rounded-lg text-[11px] cursor-pointer"
                              >
                                Reject Flow
                              </button>
                              <button 
                                onClick={() => handleIndividualAction(selectedItemForDetail.id, 'Approved')}
                                className="bg-[#059669] hover:bg-emerald-600 text-white font-bold py-2 rounded-lg text-[11px] cursor-pointer"
                              >
                                Release payout
                              </button>
                            </div>
                          )}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                </div>
              </div>

            </div>

            {/* RIGHT COL: Gemini Compliance Workspace */}
            <div id="logs" className="col-span-1 lg:col-span-4 flex flex-col gap-5">
              
              <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 shadow-xl flex-1 flex flex-col min-h-[420px]">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-bold">
                      Stitch AI Compliance
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-bold">
                    gemini-3.8-flash
                  </span>
                </div>

                {selectedAudit ? (
                  <div className="flex-1 flex flex-col text-left">
                    <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-900 mb-4">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Workspace Item Focus</p>
                      <h4 className="text-sm font-bold text-slate-200 mt-1">{selectedAudit.beneficiary}</h4>
                      <p className="text-lg font-black font-mono text-slate-100 mt-1 tabular-nums">
                        {getCurrencySymbol(selectedAudit.currency)}{selectedAudit.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    {selectedAudit.summary ? (
                      <div className="flex flex-col gap-4 flex-1">
                        <div>
                          <div className="flex justify-between items-center mb-1 text-[11px] font-semibold">
                            <span className="text-slate-400">Risk Severity Score</span>
                            <span className={`font-bold ${selectedAudit.riskScore! >= 7 ? 'text-rose-400' : (selectedAudit.riskScore! >= 4 ? 'text-amber-400' : 'text-emerald-400')}`}>
                              {selectedAudit.riskScore}/10 ({selectedAudit.auditRating})
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-900">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${selectedAudit.riskScore! >= 7 ? 'bg-rose-500' : (selectedAudit.riskScore! >= 4 ? 'bg-amber-500' : 'bg-emerald-500')}`}
                              style={{ width: `${selectedAudit.riskScore! * 10}%` }}
                            />
                          </div>
                        </div>

                        <div className="bg-slate-950/40 rounded-lg p-3 border border-slate-900/60 text-xs font-semibold">
                          <p className="font-bold text-emerald-400 mb-1 flex items-center gap-1 font-bold"><Check className="w-3.5 h-3.5" /> Assessment Summary</p>
                          <p className="text-slate-300 leading-relaxed font-semibold">{selectedAudit.summary}</p>
                        </div>

                        <div className="bg-slate-950/40 rounded-lg p-3 border border-slate-900/60 text-xs font-semibold">
                          <p className="font-bold text-rose-400 mb-1 flex items-center gap-1 font-bold"><ShieldAlert className="w-3.5 h-3.5" /> Compliance Flags</p>
                          <ul className="flex flex-col gap-1 text-slate-300 list-disc pl-4 leading-relaxed font-semibold">
                            {selectedAudit.flaggedAnomalies?.map((item, idx) => <li key={idx}>{item}</li>)}
                          </ul>
                        </div>

                        <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-lg p-3 text-xs font-semibold">
                          <p className="font-bold text-indigo-300 mb-1 font-bold">Audit Directive</p>
                          <p className="text-slate-300 leading-relaxed font-semibold">{selectedAudit.recommendation}</p>
                        </div>

                        <button
                          onClick={() => handleTriggerAudit(selectedAudit)}
                          disabled={auditingId === selectedAudit.id}
                          className="mt-auto w-full py-2 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-semibold hover:bg-slate-900 transition-colors flex items-center justify-center gap-1 text-slate-300 hover:text-white cursor-pointer font-bold"
                        >
                          {auditingId === selectedAudit.id ? (
                            <><RefreshCw className="w-3 h-3 animate-spin" /> auditing...</>
                          ) : (
                            <><Sparkles className="w-3 h-3 text-emerald-400" /> Re-trigger Audit Run</>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                        <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-4 font-semibold">
                          Audit this transfer using Stitch's AI model to flag high severity risks, assess compliance and verify destination ledger routes.
                        </p>
                        <button
                          onClick={() => handleTriggerAudit(selectedAudit)}
                          disabled={auditingId === selectedAudit.id}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow-lg cursor-pointer font-bold"
                        >
                          {auditingId === selectedAudit.id ? (
                            <><RefreshCw className="w-4 h-4 animate-spin" /> analyzing...</>
                          ) : (
                            <><Sparkles className="w-4 h-4" /> Run compliance audit</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <SlidersHorizontal className="w-5 h-5 text-slate-700 mb-2" />
                    <p className="text-xs font-bold text-slate-400">Auditor Standby</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Select any item inside the simulator stream to perform live audits.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Log Console */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 shadow-xl h-[180px] flex flex-col text-left">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800/80 mb-3">
                  <History className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-bold">
                    Live Session Feed
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto flex flex-col gap-2 font-mono text-[10px] text-slate-400">
                  {logs.map((log, index) => (
                    <div key={index} className="py-0.5 border-b border-slate-950/20 last:border-0 leading-relaxed">
                      {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </motion.div>
        ) : (
          
          /* ================================================================================= */
          /* ========================== MODE B: RESPONSIVE DESKTOP VIEW ======================= */
          /* ================================================================================= */
          <motion.div 
            key="desktop"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6 relative z-10 flex-1"
          >
            
            {/* Control header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/35 border border-slate-900 rounded-xl p-5 shadow-md">
              <div className="text-left">
                <p className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest font-bold">Enterprise Console</p>
                <h1 className="text-xl font-black text-slate-100 mt-1 font-bold">Stitch Corporate Workspace</h1>
              </div>
              
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 shrink-0">
                {['dashboard', 'payments', 'authorisations', 'chat', 'profile'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setDesktopTab(tab as any); addLog(`Switched desktop panel view to ${tab}.`); }}
                    className={`px-3 py-1.5 text-xs font-extrabold rounded-md transition-all capitalize cursor-pointer font-bold ${desktopTab === tab ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-100'}`}
                  >
                    {tab === 'authorisations' ? 'approvals' : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: DASHBOARD */}
            {desktopTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn text-left font-semibold">
                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Processed payouts</p>
                  <p className="text-2xl font-black font-mono text-slate-100 mt-1">${volumeStats.totalOutflow.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending Batch Volume</p>
                  <p className="text-2xl font-black font-mono text-blue-400 mt-1">${volumeStats.pendingVolume.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gateway Settle Rate</p>
                  <p className="text-2xl font-black font-mono text-indigo-400 mt-1">{volumeStats.successRate.toFixed(1)}%</p>
                </div>
                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Daily limit config</p>
                  <p className="text-2xl font-black font-mono text-emerald-400 mt-1">${dailyLimit.toLocaleString()}</p>
                </div>

                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 md:col-span-3 flex flex-col gap-4">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Stitch Regional Payments Activity</p>
                  <div className="h-56 bg-slate-950/60 rounded-xl p-4 border border-slate-900 relative flex items-end">
                    <svg className="absolute inset-x-0 bottom-8 h-36 w-full px-6 overflow-visible text-emerald-500/10 fill-current" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M 0 80 Q 20 40 40 60 T 80 20 T 100 10 L 100 100 L 0 100 Z" />
                      <path d="M 0 80 Q 20 40 40 60 T 80 20 T 100 10" className="stroke-2 stroke-emerald-400 fill-none" />
                    </svg>
                    <div className="w-full flex justify-between px-2 text-[10px] font-mono text-slate-500 z-10 font-bold">
                      <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct (Current)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 flex flex-col">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Session Logs</h3>
                  <div className="flex-1 overflow-y-auto max-h-[190px] font-mono text-[9px] text-slate-500">
                    {logs.map((log, idx) => <div key={idx} className="py-1 border-b border-slate-900/40">{log}</div>)}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PAYMENTS */}
            {desktopTab === 'payments' && (
              <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 flex flex-col gap-4 animate-fadeIn text-left font-semibold">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-900">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search payouts..."
                        value={paymentSearch}
                        onChange={e => setPaymentSearch(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-500 w-60 font-semibold"
                      />
                    </div>
                    <select value={paymentsStatusFilter} onChange={e => setPaymentsStatusFilter(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none">
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                    </select>
                  </div>
                </div>

                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 uppercase font-bold text-[10px]">
                      <th className="py-3 px-4">Transaction ID</th>
                      <th className="py-3 px-4">Beneficiary</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPaymentsHistory.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-900/20 border-b border-slate-900/20 cursor-pointer" onClick={() => setSelectedAudit(tx)}>
                        <td className="py-3 px-4 font-mono text-slate-400">{tx.id}</td>
                        <td className="py-3 px-4 text-slate-100 font-bold">{tx.beneficiary}</td>
                        <td className="py-3 px-4">{tx.type}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">${tx.amount.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={tx.status === 'Approved' ? 'text-emerald-400' : (tx.status === 'Rejected' ? 'text-rose-400' : 'text-amber-400')}>{tx.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: APPROVALS */}
            {desktopTab === 'authorisations' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn text-left font-semibold">
                <div className="col-span-1 lg:col-span-8 bg-slate-900/30 border border-slate-900 rounded-xl p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                    <h3 className="text-sm font-bold text-slate-300">Approvals Stream ({filteredPendingTransactions.length})</h3>
                    <button onClick={toggleSelectAll} className="text-xs font-bold text-emerald-400 hover:underline">{isAllPendingSelected ? 'Deselect All' : 'Select All'}</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPendingTransactions.map(tx => (
                      <div key={tx.id} onClick={() => setSelectedAudit(tx)} className={`bg-slate-950 border border-slate-800 rounded-xl p-4 cursor-pointer flex flex-col justify-between h-36 ${selectedAudit?.id === tx.id ? 'ring-2 ring-emerald-500' : ''}`}>
                        <div className="flex justify-between">
                          <p className="text-xs font-bold text-slate-100">{tx.beneficiary}</p>
                          <span className="text-[10px] text-slate-500 font-bold">{tx.urgency}</span>
                        </div>
                        <p className="text-lg font-black font-mono text-slate-100">${tx.amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-950 rounded-xl p-4 border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-200 font-bold">Release Selected Batches ({selectedPendingCount})</p>
                    </div>
                    <button onClick={handleBulkApprove} disabled={selectedPendingCount === 0} className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-lg text-xs">
                      Release Releases ({selectedPendingCount})
                    </button>
                  </div>
                </div>
                <div className="col-span-1 lg:col-span-4 bg-slate-900/30 border border-slate-900 rounded-xl p-5">
                  <h3 className="text-xs font-bold text-slate-300 mb-3">Audit Detail</h3>
                  {selectedAudit ? <p className="text-xs text-slate-400">{selectedAudit.summary || 'No audit run yet.'}</p> : <p className="text-xs text-slate-500">Select card to view</p>}
                </div>
              </div>
            )}

            {/* TAB 4: CHAT SPREAD */}
            {desktopTab === 'chat' && (
              <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 min-h-[480px] flex gap-5 animate-fadeIn text-left font-semibold">
                {/* Active compliance chat window */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold"><Sparkles className="w-4 h-4" /></div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-200">
                          {walkieTalkieActive ? 'Barclays Bank VIP Hotline' : 'Stitch Compliance Support'}
                        </h2>
                        <span className="text-[9px] font-bold text-emerald-400 font-bold uppercase">ACTIVE SECURE CHANNEL</span>
                      </div>
                    </div>
                    {walkieTalkieActive && (
                      <button onClick={exitWalkieTalkie} className="text-xs font-bold text-rose-400 bg-rose-950/20 px-3 py-1 rounded-lg border border-rose-500/20 hover:bg-rose-950/40">
                        Exit VIP Walkie-Talkie Demo
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[290px] flex flex-col gap-4 pr-2 text-xs">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={`flex flex-col max-w-[70%] ${msg.role === 'user' ? 'self-end items-end' : (msg.role === 'system' ? 'self-center text-center my-1' : 'self-start items-start')}`}>
                        {msg.role === 'system' ? (
                          <div className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg p-2.5 font-medium max-w-sm leading-relaxed text-[11px] shadow-sm">
                            {msg.content}
                          </div>
                        ) : msg.role === 'attachment' ? (
                          <div className="bg-rose-950/20 border border-rose-500/10 p-3 rounded-xl text-slate-100 flex flex-col gap-2 self-start">
                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5"><AlertOctagon className="w-3.5 h-3.5" /> Sketchy Evidence Shared</p>
                            <div className="bg-slate-950 border p-2.5 rounded-lg border-rose-950 text-left">
                              <p className="text-xs font-bold text-slate-100">{msg.attachmentData?.beneficiary}</p>
                              <p className="text-sm font-black text-rose-500 font-mono mt-0.5">£{msg.attachmentData?.amount.toLocaleString()}</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className={`rounded-xl px-3.5 py-2.5 leading-relaxed ${msg.role === 'user' ? 'bg-[#0c244c] text-white' : 'bg-slate-950 border border-slate-800 text-slate-300'}`}>
                              {msg.content}
                              
                              {msg.hasFreezeButton && walkieTalkieStep === 5 && (
                                <button 
                                  onClick={triggerFreezeSupplier}
                                  className="mt-3 w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1 cursor-pointer animate-pulse uppercase"
                                >
                                  🚨 Freeze Supplier Account
                                </button>
                              )}
                            </div>
                            <span className="text-[8px] text-slate-500 mt-1">{msg.time}</span>
                          </>
                        )}
                      </div>
                    ))}
                    {isTyping && <div className="self-start text-xs text-slate-500 animate-pulse">Compliance officer is drafting reply...</div>}
                  </div>

                  {/* Interactive walkie talkie prompt for desktop */}
                  {walkieTalkieActive ? (
                    <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-4 mt-4 flex items-center justify-between gap-3 text-left">
                      <div>
                        <p className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider font-bold">VIP Airport Hotline Walk-through</p>
                        <p className="text-xs text-slate-300 mt-1 leading-normal max-w-lg font-semibold">
                          {walkieTalkieStep === 1 && "Action 1: Tapping 'Share Transaction' instantly drops the sketchy rejected aggregate details into the bank manager's ledger chat."}
                          {walkieTalkieStep === 2 && "Action 2: Press & Hold the microphone button to simulate airport audio walkie-talkie capture."}
                          {walkieTalkieStep === 3 && "🎤 recording spoken words: 'This supplier's details changed overnight, it looks like a scam.'"}
                          {walkieTalkieStep === 4 && "processing audio spectrum transcription..."}
                          {walkieTalkieStep === 5 && "Action 3: Security hack confirmed! Click the glowing '🚨 Freeze Supplier Account' bubble to intercept fraud."}
                          {walkieTalkieStep === 6 && "Success: Supplier banned from Stitch. Payout rails protected."}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {walkieTalkieStep === 1 && (
                          <button onClick={wtShareEvidence} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer">
                            🔗 Share Transaction
                          </button>
                        )}

                        {(walkieTalkieStep === 2 || walkieTalkieStep === 3) && (
                          <button
                            onMouseDown={handleMicPressStart}
                            onMouseUp={handleMicPressEnd}
                            onTouchStart={handleMicPressStart}
                            onTouchEnd={handleMicPressEnd}
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${walkieTalkieStep === 3 ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-500'} cursor-pointer`}
                          >
                            <Mic className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSendChat} className="mt-4 flex gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5">
                      <input
                        type="text"
                        placeholder="Ask the compliance assistant about limits, holds, or regulations..."
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-200 focus:outline-none"
                      />
                      <button type="submit" className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold px-4 py-2 rounded-lg text-xs cursor-pointer font-bold">Send</button>
                    </form>
                  )}
                </div>

                <div className="w-72 bg-slate-950 rounded-xl p-4 border border-slate-900 flex flex-col gap-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-bold">Stitch emergency playbook</h4>
                  <div className="flex flex-col gap-3.5 text-xs text-slate-400 leading-normal">
                    <p>💡 Trigger the **Walkie-Talkie Simulator** on the left dashboard card to test the airport emergency response loop.</p>
                    <p>💡 Try holding the microphone to transcribe vocal logs into text instantly.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: PROFILE SPREAD */}
            {desktopTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn text-left font-semibold">
                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-[#0c244c] rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 border">FF</div>
                  <h2 className="text-base font-extrabold text-slate-200 font-bold">Farah Enterprise</h2>
                  <p className="text-xs text-slate-500 font-mono">farahfoo@gmail.com</p>
                  <p className="text-[10px] bg-slate-950 border border-slate-800 px-3 py-1 rounded-full text-emerald-400 mt-3 font-bold uppercase">Production Node Active</p>
                </div>

                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest pb-2 border-b border-slate-900 font-bold">Release Parameters</h3>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                      <span>Daily transfer release limit</span>
                      <span className="font-mono text-emerald-400">${dailyLimit.toLocaleString()}</span>
                    </div>
                    <input type="range" min="10000" max="1000000" step="10000" value={dailyLimit} onChange={e => setDailyLimit(parseInt(e.target.value))} className="w-full accent-emerald-500 cursor-pointer" />
                  </div>
                </div>

                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest pb-2 border-b border-slate-900 font-bold">Integration Secrets</h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Secret API Credentials</label>
                    <input type="password" readOnly value={sandboxApiKey} className="bg-slate-950 border rounded-lg px-3 py-2 text-xs text-slate-500 font-mono font-bold" />
                  </div>
                  <button onClick={handleRotateKeys} className="w-full bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-200 font-bold py-2 rounded-lg text-xs cursor-pointer font-bold">Rotate credentials</button>
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floater success notifications */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-400 text-slate-950 px-5 py-3 rounded-xl font-black text-xs shadow-2xl border border-emerald-300/20 flex items-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{toastNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Static Footer */}
      <footer className="bg-slate-950 border-t border-slate-900/80 py-5 px-6 text-center text-xs text-slate-500 mt-auto shrink-0 select-none">
        <p>© 2026 Stitch Payments Ltd. Integrated platform authorized compliance portal.</p>
      </footer>
      
    </div>
  );
}
