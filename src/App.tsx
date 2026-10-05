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
  ChevronLeft,
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
  Radio,
  Eye,
  EyeOff,
  MapPin,
  Map,
  Compass,
  HelpCircle,
  Copy,
  Briefcase
} from 'lucide-react';

// =================================================================================
// TypeScript interfaces and global helper functions
// =================================================================================
export interface Transaction {
  id: string;
  beneficiary: string;
  amount: number;
  currency: string;
  type: string;
  urgency: string;
  requester: string;
  date: string;
  status: string;
  selected: boolean;
  riskScore?: number;
  auditRating?: string;
  summary?: string;
  flaggedAnomalies?: string[];
  recommendation?: string;
  frozen?: boolean;
}

export interface ChatMessage {
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

export interface AuditReport {
  riskScore: number;
  auditRating: string;
  summary: string;
  flaggedAnomalies: string[];
  recommendation: string;
}

const getCurrencySymbol = (cur: string) => {
  const map: Record<string, string> = {
    USD: '$',
    GBP: '£',
    EUR: '€',
    ZAR: 'R',
    VND: '₫'
  };
  return map[cur] || '$';
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Payroll':
      return <Users className="w-4 h-4 text-indigo-500" />;
    case 'Supplier':
    case 'Invoice':
      return <Briefcase className="w-4 h-4 text-amber-500" />;
    case 'Loan':
      return <CreditCard className="w-4 h-4 text-blue-500" />;
    case 'Transfer':
      return <RefreshCw className="w-4 h-4 text-emerald-500" />;
    default:
      return <FileText className="w-4 h-4 text-slate-500" />;
  }
};

// =================================================================================
// 1. RAW MOCKDATA BINDINGS & SCHEMAS (Supports 50+ items for Infinite Scroll)
// =================================================================================
const mockData = {
  balanceGBP: 1111422.00,
  balanceVND: 35622500000,
  currencies: {
    USD: { symbol: '$', rate: 1.0 },
    GBP: { symbol: '£', rate: 0.78 },
    EUR: { symbol: '€', rate: 0.92 },
    ZAR: { symbol: 'R', rate: 18.5 },
    VND: { symbol: '₫', rate: 25000.0 }
  },
  accounts: [
    { id: 'acc-01', bank: 'Stitch Treasury Hub', balance: 1424900.52, type: 'Operating', currency: 'USD' },
    { id: 'acc-02', bank: 'Barclays VIP Reserve', balance: 850300.11, type: 'Collateral', currency: 'GBP' },
    { id: 'acc-03', bank: 'Standard Bank Escrow', balance: 350000.00, type: 'Liquidity', currency: 'ZAR' }
  ],
  transactions: [
    // 4 Initial Core Items (High Urgencies)
    { id: 'tx-10492', beneficiary: 'Global Payroll Dispatch', amount: 42150.00, currency: 'USD', type: 'Payroll', urgency: 'High', requester: 'farahfoo@gmail.com', date: '2 hours ago', status: 'Pending', selected: true, riskScore: 2, auditRating: 'Safe / Routine', summary: 'Monthly payroll flow dispatched to 14 verified regional employees.', flaggedAnomalies: ['None. Parameters match standard schedules.'], recommendation: 'Approved. Proceed with release.' },
    { id: 'tx-08891', beneficiary: 'Refund tx_8891', amount: 350.00, currency: 'EUR', type: 'Misc', urgency: 'High', requester: 'Support Bot (Auto)', date: '15 mins ago', status: 'Pending', selected: true, riskScore: 6, auditRating: 'Moderate Risk', summary: 'Automated credit return dispute generated from network gateway duplicate log.', flaggedAnomalies: ['Triggered by automated support bot.', 'Gateway logs suggest socket timeout.'], recommendation: 'Recommend hold or visual check against card charge logs.' },
    { id: 'tx-22394', beneficiary: 'Apex Materials Ltd', amount: 20000.00, currency: 'GBP', type: 'Supplier', urgency: 'Medium', requester: 'Sarah Jenkins', date: '4 hours ago', status: 'Rejected', selected: false, riskScore: 9, auditRating: 'Suspicious / Scam Alert', summary: 'Scam Alert: Destination banking routing details modified overnight.', flaggedAnomalies: ['Beneficiary routing fields do not match historical ledger.', 'Cross-reference mismatch on aggregate aggregation.'], recommendation: 'HALT EXECUTION: Verify with Barclays VIP concierge support.' },
    { id: 'tx-44109', beneficiary: 'Internal USD Liquidity Pool', amount: 250000.00, currency: 'USD', type: 'Transfer', urgency: 'Low', requester: 'Chief Treasury Officer', date: '1 day ago', status: 'Pending', selected: true, riskScore: 7, auditRating: 'Elevated Risk', summary: 'High-volume liquid pool transfer to buffer cross-border gateway pipelines.', flaggedAnomalies: ['Amount exceeds typical standard limit parameter of $50,000.', 'Dual-key signature requested.'], recommendation: 'Hold payout and complete phone credential callback.' },
    
    // 50+ Additional Items to enable premium infinite/momentum scroll
    { id: 'tx-01', beneficiary: 'Nvidia GPU Supplier', amount: 154000.00, currency: 'USD', type: 'Supplier', urgency: 'High', requester: 'Sarah Jenkins', date: '3 hours ago', status: 'Pending', selected: false },
    { id: 'tx-02', beneficiary: 'AWS Server Infrastructure', amount: 48300.00, currency: 'USD', type: 'Misc', urgency: 'Medium', requester: 'DevOps Lead', date: '4 hours ago', status: 'Pending', selected: false },
    { id: 'tx-03', beneficiary: 'Cape Town Office Rent', amount: 12500.00, currency: 'GBP', type: 'Supplier', urgency: 'Low', requester: 'Admin Operations', date: '1 day ago', status: 'Pending', selected: false },
    { id: 'tx-04', beneficiary: 'EFT Loan Repayment', amount: 35000.00, currency: 'EUR', type: 'Loan', urgency: 'High', requester: 'CFO Office', date: '1 day ago', status: 'Pending', selected: false },
    { id: 'tx-05', beneficiary: 'Sarah Payout Refund', amount: 1200.00, currency: 'USD', type: 'Misc', urgency: 'Low', requester: 'farahfoo@gmail.com', date: '2 days ago', status: 'Approved', selected: false },
    { id: 'tx-06', beneficiary: 'Johannesburg Fiber Line', amount: 8900.00, currency: 'USD', type: 'Misc', urgency: 'Medium', requester: 'farahfoo@gmail.com', date: '2 days ago', status: 'Approved', selected: false },
    { id: 'tx-07', beneficiary: 'Stripe Escrow Replenish', amount: 180000.00, currency: 'USD', type: 'Transfer', urgency: 'High', requester: 'Treasury Bot', date: '3 days ago', status: 'Approved', selected: false },
    { id: 'tx-08', beneficiary: 'GCP Server Compute billing', amount: 24500.00, currency: 'USD', type: 'Misc', urgency: 'Low', requester: 'Admin Operations', date: '3 days ago', status: 'Approved', selected: false },
    { id: 'tx-09', beneficiary: 'Contractor Dev Team Oct', amount: 28900.00, currency: 'EUR', type: 'Payroll', urgency: 'Medium', requester: 'Sarah Jenkins', date: '4 days ago', status: 'Approved', selected: false },
    { id: 'tx-10', beneficiary: 'Marketing Ad Campaigns', amount: 16000.00, currency: 'USD', type: 'Supplier', urgency: 'Low', requester: 'Marketing Lead', date: '4 days ago', status: 'Approved', selected: false },
    { id: 'tx-11', beneficiary: 'Stitch card replenishment', amount: 95000.00, currency: 'USD', type: 'Transfer', urgency: 'High', requester: 'Treasury Bot', date: '5 days ago', status: 'Approved', selected: false },
    { id: 'tx-12', beneficiary: 'Slack Enterprise Slack billing', amount: 4500.00, currency: 'GBP', type: 'Misc', urgency: 'Low', requester: 'IT Procurement', date: '5 days ago', status: 'Approved', selected: false },
    { id: 'tx-13', beneficiary: 'Silicon Valley Bank Loan Payout', amount: 50000.00, currency: 'USD', type: 'Loan', urgency: 'High', requester: 'CFO Office', date: '6 days ago', status: 'Approved', selected: false },
    { id: 'tx-14', beneficiary: 'Figma Design seats renew', amount: 1850.00, currency: 'EUR', type: 'Misc', urgency: 'Low', requester: 'Design Director', date: '6 days ago', status: 'Approved', selected: false },
    { id: 'tx-15', beneficiary: 'Vercel Analytics hosting', amount: 2400.00, currency: 'USD', type: 'Misc', urgency: 'Medium', requester: 'farahfoo@gmail.com', date: '1 week ago', status: 'Approved', selected: false },
    { id: 'tx-16', beneficiary: 'Stitch Cape Town Office aggregator', amount: 120000.00, currency: 'USD', type: 'Transfer', urgency: 'High', requester: 'Chief Treasury Officer', date: '1 week ago', status: 'Approved', selected: false },
    { id: 'tx-17', beneficiary: 'Office Coffee supply stock', amount: 800.00, currency: 'GBP', type: 'Supplier', urgency: 'Low', requester: 'Admin Operations', date: '1 week ago', status: 'Approved', selected: false },
    { id: 'tx-18', beneficiary: 'Intercom support chatbot integration', amount: 9200.00, currency: 'EUR', type: 'Misc', urgency: 'Medium', requester: 'Customer Success', date: '1 week ago', status: 'Approved', selected: false },
    { id: 'tx-19', beneficiary: 'GitHub Copilot Enterprise licenses', amount: 11000.00, currency: 'USD', type: 'Misc', urgency: 'Low', requester: 'IT Procurement', date: '2 weeks ago', status: 'Approved', selected: false },
    { id: 'tx-20', beneficiary: 'HackerOne bug bounty rewards', amount: 15000.00, currency: 'USD', type: 'Misc', urgency: 'High', requester: 'Security Lead', date: '2 weeks ago', status: 'Approved', selected: false },
    { id: 'tx-21', beneficiary: 'Vanta Compliance ISO audit', amount: 18000.00, currency: 'GBP', type: 'Supplier', urgency: 'Medium', requester: 'Security Lead', date: '2 weeks ago', status: 'Approved', selected: false },
    { id: 'tx-22', beneficiary: 'Deel Contractor settlement', amount: 85200.00, currency: 'USD', type: 'Payroll', urgency: 'High', requester: 'Sarah Jenkins', date: '2 weeks ago', status: 'Approved', selected: false },
    { id: 'tx-23', beneficiary: 'Salesforce CRM Annual billing', amount: 62000.00, currency: 'USD', type: 'Supplier', urgency: 'Low', requester: 'Sales Operations', date: '3 weeks ago', status: 'Approved', selected: false },
    { id: 'tx-24', beneficiary: 'Zoom pro licensing renewals', amount: 3200.00, currency: 'EUR', type: 'Misc', urgency: 'Low', requester: 'IT Procurement', date: '3 weeks ago', status: 'Approved', selected: false },
    { id: 'tx-25', beneficiary: 'Plaid API pipeline fees', amount: 9400.00, currency: 'USD', type: 'Misc', urgency: 'Medium', requester: 'farahfoo@gmail.com', date: '3 weeks ago', status: 'Approved', selected: false },
    { id: 'tx-26', beneficiary: 'Google Workspace licenses', amount: 5500.00, currency: 'USD', type: 'Misc', urgency: 'Low', requester: 'IT Procurement', date: '4 weeks ago', status: 'Approved', selected: false },
    { id: 'tx-27', beneficiary: 'HubSpot marketing pipeline', amount: 14000.00, currency: 'USD', type: 'Supplier', urgency: 'Medium', requester: 'Marketing Lead', date: '4 weeks ago', status: 'Approved', selected: false },
    { id: 'tx-28', beneficiary: 'Twilio SMS API services', amount: 8200.00, currency: 'GBP', type: 'Misc', urgency: 'Low', requester: 'DevOps Lead', date: '1 month ago', status: 'Approved', selected: false },
    { id: 'tx-29', beneficiary: 'Sentry Crash Analytics renew', amount: 4800.00, currency: 'EUR', type: 'Misc', urgency: 'Low', requester: 'farahfoo@gmail.com', date: '1 month ago', status: 'Approved', selected: false },
    { id: 'tx-30', beneficiary: 'SendGrid email transactional pipeline', amount: 6500.00, currency: 'USD', type: 'Misc', urgency: 'Low', requester: 'DevOps Lead', date: '1 month ago', status: 'Approved', selected: false },
    { id: 'tx-31', beneficiary: 'SaaS legal compliance consulting', amount: 12000.00, currency: 'USD', type: 'Supplier', urgency: 'Medium', requester: 'CFO Office', date: '1 month ago', status: 'Approved', selected: false },
    { id: 'tx-32', beneficiary: 'Snowflake analytics database platform', amount: 44000.00, currency: 'USD', type: 'Misc', urgency: 'High', requester: 'farahfoo@gmail.com', date: '1 month ago', status: 'Approved', selected: false },
    { id: 'tx-33', beneficiary: 'Datadog logging aggregation', amount: 19500.00, currency: 'GBP', type: 'Misc', urgency: 'Medium', requester: 'DevOps Lead', date: '1 month ago', status: 'Approved', selected: false },
    { id: 'tx-34', beneficiary: 'Employee Medical benefits payout', amount: 55000.00, currency: 'USD', type: 'Payroll', urgency: 'High', requester: 'HR Benefits', date: '1 month ago', status: 'Approved', selected: false },
    { id: 'tx-35', beneficiary: 'PostgreSQL instance scale upgrade', amount: 7200.00, currency: 'EUR', type: 'Misc', urgency: 'Low', requester: 'DevOps Lead', date: '1 month ago', status: 'Approved', selected: false },
    { id: 'tx-36', beneficiary: 'Global travel accommodation flight', amount: 14000.00, currency: 'USD', type: 'Misc', urgency: 'Medium', requester: 'Admin Operations', date: '2 months ago', status: 'Approved', selected: false },
    { id: 'tx-37', beneficiary: 'Superbase database storage fees', amount: 3500.00, currency: 'USD', type: 'Misc', urgency: 'Low', requester: 'farahfoo@gmail.com', date: '2 months ago', status: 'Approved', selected: false },
    { id: 'tx-38', beneficiary: 'ElasticSearch instance hosting', amount: 9100.00, currency: 'GBP', type: 'Misc', urgency: 'Low', requester: 'DevOps Lead', date: '2 months ago', status: 'Approved', selected: false },
    { id: 'tx-39', beneficiary: 'Employee Stock option filing', amount: 15000.00, currency: 'USD', type: 'Misc', urgency: 'High', requester: 'CFO Office', date: '2 months ago', status: 'Approved', selected: false },
    { id: 'tx-40', beneficiary: 'Security Auditing pen test fees', amount: 25000.00, currency: 'USD', type: 'Supplier', urgency: 'High', requester: 'Security Lead', date: '2 months ago', status: 'Approved', selected: false },
    { id: 'tx-41', beneficiary: 'Microsoft licensing enterprise renew', amount: 33000.00, currency: 'EUR', type: 'Misc', urgency: 'Medium', requester: 'IT Procurement', date: '2 months ago', status: 'Approved', selected: false },
    { id: 'tx-42', beneficiary: 'WeWork office lease aggregate', amount: 48000.00, currency: 'USD', type: 'Supplier', urgency: 'Medium', requester: 'Admin Operations', date: '2 months ago', status: 'Approved', selected: false },
    { id: 'tx-43', beneficiary: 'Stitch gateway settlement node', amount: 300000.00, currency: 'USD', type: 'Transfer', urgency: 'High', requester: 'Chief Treasury Officer', date: '3 months ago', status: 'Approved', selected: false },
    { id: 'tx-44', beneficiary: 'Mailchimp subscriber campaigns', amount: 4100.00, currency: 'GBP', type: 'Misc', urgency: 'Low', requester: 'Marketing Lead', date: '3 months ago', status: 'Approved', selected: false },
    { id: 'tx-45', beneficiary: 'CircleCI CI pipelines aggregate', amount: 8200.00, currency: 'EUR', type: 'Misc', urgency: 'Low', requester: 'DevOps Lead', date: '3 months ago', status: 'Approved', selected: false },
    { id: 'tx-46', beneficiary: 'DigitalOcean sandbox nodes', amount: 1900.00, currency: 'USD', type: 'Misc', urgency: 'Low', requester: 'DevOps Lead', date: '3 months ago', status: 'Approved', selected: false },
    { id: 'tx-47', beneficiary: 'Notion corporate workspace license', amount: 2800.00, currency: 'USD', type: 'Misc', urgency: 'Low', requester: 'IT Procurement', date: '3 months ago', status: 'Approved', selected: false },
    { id: 'tx-48', beneficiary: 'Cloudflare DNS Enterprise protection', amount: 15000.00, currency: 'USD', type: 'Misc', urgency: 'High', requester: 'DevOps Lead', date: '4 months ago', status: 'Approved', selected: false },
    { id: 'tx-49', beneficiary: 'South Africa Office aggregator', amount: 110000.00, currency: 'USD', type: 'Transfer', urgency: 'High', requester: 'Chief Treasury Officer', date: '4 months ago', status: 'Approved', selected: false },
    { id: 'tx-50', beneficiary: 'Bank Concierge VIP retainer', amount: 5000.00, currency: 'GBP', type: 'Supplier', urgency: 'Medium', requester: 'CFO Office', date: '4 months ago', status: 'Approved', selected: false }
  ]
};

export default function App() {
  // =================================================================================
  // 2. STATE MANAGER DECLARATIONS
  // =================================================================================
  const [transactions, setTransactions] = useState<Transaction[]>(mockData.transactions);
  
  // Navigation & Workspace Tabs
  const [displayMode, setDisplayMode] = useState<'split-simulator' | 'desktop-console'>('split-simulator');
  const [mobileTab, setMobileTab] = useState<'dashboard' | 'payments' | 'authorisations' | 'chat' | 'profile'>('dashboard');
  const [desktopTab, setDesktopTab] = useState<'dashboard' | 'payments' | 'authorisations' | 'chat' | 'profile'>('dashboard');

  // 11-Screen Interactive Story Player State
  const [currentStoryScreen, setCurrentStoryScreen] = useState<number>(1);
  const [crystalBallFilter, setCrystalBallFilter] = useState<'All' | 'Bills' | 'Income'>('All');
  const [isOverdraftRescueApplied, setIsOverdraftRescueApplied] = useState(false);
  const [isCameraFocused, setIsCameraFocused] = useState(false);
  const [isCameraCaptured, setIsCameraCaptured] = useState(false);
  const [isContractSummarized, setIsContractSummarized] = useState(false);
  const [whatsappUnread, setWhatsappUnread] = useState(true);
  const [whatsappActive, setWhatsappActive] = useState(false);
  const [isMapTrackerOpen, setIsMapTrackerOpen] = useState(false);

  // Conversational Support State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Hello Farah! I am your Stitch Compliance and Payout Assistant. Ask me anything about payment setups, SARB rules, or resolving holds. You can also trigger the Walkie-Talkie simulator on the left!",
      time: '12:42'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // VIP Walkie-Talkie Hotline Story State Machine
  const [walkieTalkieActive, setWalkieTalkieActive] = useState(false);
  const [walkieTalkieStep, setWalkieTalkieStep] = useState<number>(0); 
  const [isHoldingMic, setIsHoldingMic] = useState(false);
  const [supplierFrozenOverlay, setSupplierFrozenOverlay] = useState(false);

  // Settings & Parameters
  const [selectedCurrency, setSelectedCurrency] = useState<string>('GBP');
  const [blurBalances, setBlurBalances] = useState(false);
  const [projectionDays, setProjectionDays] = useState(30);
  const [aiPaymentOpen, setAiPaymentOpen] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const [vacationMode, setVacationMode] = useState(false);
  const [delegateLimit, setDelegateLimit] = useState(25000);
  const [dailyLimit, setDailyLimit] = useState<number>(500000);
  const [webhookUrl, setWebhookUrl] = useState('https://api.farah.com/v1/stitch-hooks');
  const [visibleCount, setVisibleCount] = useState<number>(15);
  const [bankAccounts, setBankAccounts] = useState(mockData.accounts);
  const [selectedAccountId, setSelectedAccountId] = useState('acc-01');
  const [activityAccountFilter, setActivityAccountFilter] = useState<string>('All');
  const [eftPayInOpen, setEftPayInOpen] = useState(false);
  // Create Payment State
  const [isCreatePaymentModalOpen, setIsCreatePaymentModalOpen] = useState(false);
  const [isPathwayMapOpen, setIsPathwayMapOpen] = useState(false);
  const [isManageTreasuryOpen, setIsManageTreasuryOpen] = useState(false);
  const [newPayee, setNewPayee] = useState('');
  const [newPayoutAmount, setNewPayoutAmount] = useState('');
  const [newCurrency, setNewCurrency] = useState('GBP');
  const [newPayoutType, setNewPayoutType] = useState('Supplier');
  const [newPayoutUrgency, setNewPayoutUrgency] = useState('Medium');
  const [newIban, setNewIban] = useState('');
  const [newMemo, setNewMemo] = useState('');
  const [eftAmount, setEftAmount] = useState('25000');
  const [eftOriginBank, setEftOriginBank] = useState('First National Bank (FNB)');
  const [sandboxApiKey, setSandboxApiKey] = useState('st_sk_live_9921_farah_e53df40');

  const [selectedItemForDetail, setSelectedItemForDetail] = useState<Transaction | null>(null);
  const [auditingId, setAuditingId] = useState<string | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<Transaction | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  // Long press contextual menu settings
  const [contextMenuPay, setContextMenuPay] = useState<Transaction | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number, y: number } | null>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Drag width ref & state
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const [sliderWidth, setSliderWidth] = useState(240);

  // Logs
  const [logs, setLogs] = useState<string[]>([
    '12:42:00 — Stitch Compliance node initialized successfully.',
    '12:42:01 — Connected VIP walkie-talkie support module.'
  ]);

  // Filters state inside Workspace
  const [sortBy, setSortBy] = useState<string>('Standard');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [paymentSearch, setPaymentSearch] = useState<string>('');
  const [paymentsStatusFilter, setPaymentsStatusFilter] = useState<string>('All');

  // Custom Item Form State
  const [newBeneficiary, setNewBeneficiary] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'Payroll' | 'Invoice' | 'Transfer' | 'Refund' | 'Utility'>('Invoice');
  const [newUrgency, setNewUrgency] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newRequester, setNewRequester] = useState('manager@stitch.money');
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  // Notifications feedback toasts
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [isBulkApprovedFeedback, setIsBulkApprovedFeedback] = useState(false);
  const [hapticShake, setHapticShake] = useState(false);

  // Trace and log releases
  const [animateTransferRoute, setAnimateTransferRoute] = useState(false);

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [`${time} — ${message}`, ...prev]);
  };

  // Convert given balance dynamically based on currency rates
  const convertBalance = (baseAmount: number, sourceCur: string = 'USD') => {
    // Convert source to USD first
    const usdAmount = baseAmount / (mockData.currencies[sourceCur as keyof typeof mockData.currencies]?.rate || 1.0);
    // Convert USD to selected target currency
    const targetRate = mockData.currencies[selectedCurrency as keyof typeof mockData.currencies]?.rate || 1.0;
    return usdAmount * targetRate;
  };

  // Dynamically assign accountIds to transactions if they don't have one, to make sure filter by account works flawlessly
  const transactionsWithAccount = useMemo(() => {
    return transactions.map((tx, idx) => {
      let accountId = 'acc-01'; // Default to Stitch Hub
      if (tx.currency === 'GBP' || idx % 3 === 1) {
        accountId = 'acc-02'; // Barclays
      } else if (tx.currency === 'ZAR' || idx % 3 === 2) {
        accountId = 'acc-03'; // Standard Bank
      }
      return { ...tx, accountId };
    });
  }, [transactions]);

  // Filter & Sort Logic for pending lists (Workspace tab)
  const filteredPendingTransactions = useMemo(() => {
    let result = transactionsWithAccount.filter(tx => tx.status === 'Pending');

    // Filter by urgency
    if (urgencyFilter !== 'All') {
      result = result.filter(tx => tx.urgency === urgencyFilter);
    }

    // Filter by Type (Supplier, Payroll, Loan, Misc)
    if (typeFilter !== 'All') {
      const typeMap: Record<string, string> = {
        Supplier: 'Supplier',
        Payroll: 'Payroll',
        Loan: 'Loan',
        Misc: 'Misc'
      };
      result = result.filter(tx => tx.type === typeMap[typeFilter]);
    }

    // Apply Sorting
    if (sortBy === 'AmountHighToLow') {
      result.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'AmountLowToHigh') {
      result.sort((a, b) => a.amount - b.amount);
    } else if (sortBy === 'Urgency') {
      const priority: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
      result.sort((a, b) => priority[b.urgency] - priority[a.urgency]);
    } else if (sortBy === 'Newest') {
      result.sort((a, b) => b.id.localeCompare(a.id));
    }

    return result;
  }, [transactions, urgencyFilter, typeFilter, sortBy]);

  // History list for Payments tab
  const filteredPaymentsHistory = useMemo(() => {
    let result = [...transactionsWithAccount];
    if (paymentsStatusFilter !== 'All') {
      result = result.filter(tx => tx.status === paymentsStatusFilter);
    }
    if (paymentSearch.trim() !== '') {
      const q = paymentSearch.toLowerCase();
      result = result.filter(tx => 
        tx.beneficiary.toLowerCase().includes(q) || 
        tx.id.toLowerCase().includes(q) ||
        tx.requester.toLowerCase().includes(q)
      );
    }
    return result;
  }, [transactionsWithAccount, paymentsStatusFilter, paymentSearch]);

  const slicedPendingTransactions = useMemo(() => {
    return filteredPendingTransactions.slice(0, visibleCount);
  }, [filteredPendingTransactions, visibleCount]);

  const slicedPaymentsHistory = useMemo(() => {
    return filteredPaymentsHistory.slice(0, visibleCount);
  }, [filteredPaymentsHistory, visibleCount]);

  const dashboardTransactions = useMemo(() => {
    let result = slicedPaymentsHistory;
    if (activityAccountFilter !== 'All') {
      result = result.filter(tx => tx.accountId === activityAccountFilter);
    }
    return result;
  }, [slicedPaymentsHistory, activityAccountFilter]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight * 0.8) {
      const maxPending = filteredPendingTransactions.length;
      const maxPayments = filteredPaymentsHistory.length;
      const totalAvailable = Math.max(maxPending, maxPayments);
      if (visibleCount < totalAvailable) {
        setVisibleCount(prev => {
          const nextVal = prev + 12;
          addLog(`INFINITE SCROLL: Loaded next batch of payments. Showing ${Math.min(nextVal, totalAvailable)} of ${totalAvailable} records.`);
          return nextVal;
        });
      }
    }
  };

  // Account balance metrics calculations
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

  const activeBankAccount = useMemo(() => {
    return bankAccounts.find(acc => acc.id === selectedAccountId) || bankAccounts[0];
  }, [bankAccounts, selectedAccountId]);

  const totalBalanceDisplay = useMemo(() => {
    if (selectedCurrency === 'VND') return mockData.balanceVND;
    if (selectedCurrency === 'GBP') return mockData.balanceGBP;
    
    // Fallback conversion from GBP base
    const baseAmountInUSD = mockData.balanceGBP / 0.78;
    const rate = mockData.currencies[selectedCurrency as keyof typeof mockData.currencies]?.rate || 1.0;
    return baseAmountInUSD * rate;
  }, [selectedCurrency]);

  // Projected Balance based on day sliders
  const projectedBalance = useMemo(() => {
    const baseVal = activeBankAccount?.balance || 1424900.52; // operating account base
    // Calculate prospective returns: e.g. +$8250/day and -$1500/day payouts
    return baseVal + (projectionDays * 8250.00) - volumeStats.pendingVolume;
  }, [projectionDays, volumeStats, activeBankAccount]);

  // Selection hooks
  const pendingItems = useMemo(() => transactions.filter(t => t.status === 'Pending'), [transactions]);
  const selectedPendingCount = useMemo(() => pendingItems.filter(t => t.selected).length, [pendingItems]);
  const isAllPendingSelected = useMemo(() => pendingItems.length > 0 && pendingItems.every(t => t.selected), [pendingItems]);

  const toggleSelectAll = () => {
    const nextState = !isAllPendingSelected;
    setTransactions(prev => prev.map(t => t.status === 'Pending' ? { ...t, selected: nextState } : t));
    addLog(nextState ? 'Checked all Stitch pending items.' : 'Deselected all pending items.');
  };

  const handleInitiateNewPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayee || !newPayoutAmount) {
      setToastNotification("Please fill in payee name and amount!");
      setTimeout(() => setToastNotification(null), 3000);
      return;
    }

    const amtNum = parseFloat(newPayoutAmount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setToastNotification("Please enter a valid positive number for amount!");
      setTimeout(() => setToastNotification(null), 3000);
      return;
    }

    const newTxId = `tx-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTx: Transaction = {
      id: newTxId,
      beneficiary: newPayee,
      amount: amtNum,
      currency: newCurrency,
      type: newPayoutType,
      urgency: newPayoutUrgency,
      requester: "farahfoo@gmail.com (CEO)",
      date: "Just now",
      status: "Pending",
      selected: false,
      riskScore: Math.floor(Math.random() * 3) + 1,
      auditRating: "Routine / Verified",
      summary: newMemo || `Manually created Swift dispatch wire to ${newPayee}.`,
      flaggedAnomalies: ["None. Created by CEO mobile console."],
      recommendation: "Approved by creator. Direct release permitted."
    };

    setTransactions(prev => [newTx, ...prev]);
    setIsCreatePaymentModalOpen(false);
    
    // Reset form
    setNewPayee('');
    setNewPayoutAmount('');
    setNewCurrency('GBP');
    setNewPayoutType('Supplier');
    setNewPayoutUrgency('Medium');
    setNewIban('');
    setNewMemo('');

    addLog(`PAYMENTS ENGINE: Initiated new payment wire ${newTxId} of ${getCurrencySymbol(newCurrency)}${amtNum} to ${newPayee}. Queued in approvals Workspace.`);
    setToastNotification(`Success: Payout ${newTxId} queued for approval!`);
    setTimeout(() => setToastNotification(null), 3000);
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

  // Conversational Support Chat sending handler
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

  // AI Pay prompt dispatch
  const handleSendAiPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPromptInput.trim()) return;

    setIsAiProcessing(true);
    addLog(`DISPATCH AI PAY: Processing semantic payment command: "${aiPromptInput}"`);

    // Parse mock parameters
    setTimeout(() => {
      let mockAmt = 1500;
      let mockBen = 'Sarah aggregates';

      if (aiPromptInput.toLowerCase().includes('pay')) {
        const matches = aiPromptInput.match(/\d+/g);
        if (matches && matches[0]) mockAmt = parseInt(matches[0]);
      }

      const newTx: Transaction = {
        id: `tx-ai-${Math.floor(1000 + Math.random() * 9000)}`,
        beneficiary: mockBen,
        amount: mockAmt,
        currency: 'USD',
        type: 'Supplier',
        urgency: 'Medium',
        requester: 'farahfoo@gmail.com',
        date: 'Just now',
        status: 'Pending',
        selected: true
      };

      setTransactions(prev => [newTx, ...prev]);
      addLog(`AI PAY DISPATCHED: Created and pre-authorized pending payout ${newTx.id} of $${mockAmt.toLocaleString()} to ${mockBen}.`);
      setAiPromptInput('');
      setAiPaymentOpen(false);
      setIsAiProcessing(false);
      setToastNotification(`AI Payment ${newTx.id} queued successfully!`);
      setTimeout(() => setToastNotification(null), 3000);
    }, 1500);
  };

  // Bulk swipe release
  const handleBulkApprove = () => {
    const selectedTxs = pendingItems.filter(t => t.selected);
    const selectedIds = selectedTxs.map(t => t.id);
    if (selectedIds.length === 0) {
      setHapticShake(true);
      setTimeout(() => setHapticShake(false), 500);
      return;
    }

    // Check if any selected item exceeds dailyLimit
    const overLimitItem = selectedTxs.find(tx => convertBalance(tx.amount, tx.currency) > dailyLimit);
    if (overLimitItem) {
      const convertedVal = convertBalance(overLimitItem.amount, overLimitItem.currency);
      addLog(`LIMIT VIOLATION: Bulk approval halted. Payout ${overLimitItem.id} of $${convertedVal.toLocaleString()} exceeds Daily Threshold Limit of $${dailyLimit.toLocaleString()}.`);
      setToastNotification(`Error: ${overLimitItem.id} exceeds Daily Threshold!`);
      setTimeout(() => setToastNotification(null), 3000);
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
    if (action === 'Approved') {
      const tx = transactions.find(t => t.id === id);
      if (tx) {
        const convertedVal = convertBalance(tx.amount, tx.currency);
        if (convertedVal > dailyLimit) {
          addLog(`LIMIT VIOLATION: Payout ${tx.id} ($${convertedVal.toLocaleString()}) exceeds Daily Threshold Limit of $${dailyLimit.toLocaleString()}. Authorization held.`);
          setToastNotification(`Error: Amount exceeds Daily Threshold!`);
          setTimeout(() => setToastNotification(null), 3000);
          setHapticShake(true);
          setTimeout(() => setHapticShake(false), 500);
          return;
        }
      }
    }
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

  // Simulate Instant EFT Replenish
  const handleEftPayIn = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(eftAmount);
    if (isNaN(amt) || amt <= 0) return;

    setBankAccounts(prev => prev.map(acc => {
      if (acc.id === selectedAccountId) {
        return { ...acc, balance: acc.balance + amt };
      }
      return acc;
    }));

    const newTx: Transaction = {
      id: `tx-eft-${Math.floor(10000 + Math.random() * 90000)}`,
      beneficiary: 'Stitch EFT Replenishment',
      amount: amt,
      currency: 'USD',
      type: 'Transfer',
      urgency: 'Low',
      requester: 'farahfoo@gmail.com',
      date: 'Just now',
      status: 'Approved',
      selected: false
    };

    setTransactions(prev => [newTx, ...prev]);
    addLog(`INSTANT EFT: Completed EFT pay-in of $${amt.toLocaleString()} from ${eftOriginBank} to ${activeBankAccount.bank}.`);
    setEftPayInOpen(false);
    setToastNotification(`EFT: +$${amt.toLocaleString()} received successfully!`);
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

  const handleMicPressStart = () => {
    setIsHoldingMic(true);
    setWalkieTalkieStep(3);
    addLog('HOTLINE SIMULATOR: Voice recorder holding... transcribing airport audio feed.');
  };

  const handleMicPressEnd = () => {
    setIsHoldingMic(false);
    setWalkieTalkieStep(4);
    addLog('HOTLINE SIMULATOR: Speech captured. Translating to text via Stitch AI converter.');

    setTimeout(() => {
      const transcriptionMsg: ChatMessage = {
        id: 'wt-user-speech',
        role: 'user',
        content: "This supplier's details changed overnight, it looks like a scam.",
        time: '12:43'
      };

      setChatMessages(prev => [...prev, transcriptionMsg]);
      setIsTyping(true);

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

  const triggerFreezeSupplier = () => {
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
      return { ...t, status: 'Pending', selected: true };
    }));
    setSelectedAudit(null);
    setSelectedItemForDetail(null);
    addLog('Reset ledger items status back to Stitch Pending Approvals.');
  };

  // Long press contextual menu triggers
  const handleTouchStart = (tx: Transaction, e: React.TouchEvent | React.MouseEvent) => {
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    pressTimerRef.current = setTimeout(() => {
      setContextMenuPay(tx);
      setContextMenuPos({ x: clientX, y: clientY - 80 });
      addLog(`GESTURE: Triggered long press contextual menu for payout ${tx.id}`);
    }, 700);
  };

  const handleTouchEnd = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
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

          {/* Zone 2: Navigation links */}
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
            <button 
              onClick={() => setHelpOpen(true)}
              className="flex items-center gap-1.5 hover:text-slate-100 transition-colors text-slate-400"
            >
              <HelpCircle className="w-4 h-4" /> Help Guide
            </button>
          </nav>

          {/* Zone 3: Direct actions */}
          <div className="flex items-center gap-3 animate-fadeIn">
            
            {/* Global Currency Selection dropdown */}
            <select
              value={selectedCurrency}
              onChange={e => {
                setSelectedCurrency(e.target.value as any);
                addLog(`CURRENCY DROPDOWN: Recalculated operating ledgers to ${e.target.value}.`);
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
              <option value="ZAR">ZAR (R)</option>
            </select>

            <button 
              onClick={handleResetData}
              className="px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 rounded-lg hover:bg-emerald-950/40 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Re-Queue
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
              
              {/* Interactive 11-Screen Prototype Story Player */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl text-left flex flex-col gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider font-bold">Stitch Story Player</h3>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-semibold">
                    Tap any story screen to instantly route the mobile simulation to that planned curriculum checkpoint.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {[
                    { id: 1, label: '1. Money Thermometer', desc: 'Recalculate & lock wealth (Home)', action: () => { setCurrentStoryScreen(1); setMobileTab('dashboard'); } },
                    { id: 2, label: '2. The Crystal Ball', desc: 'Predict future with timeline sliders', action: () => { setCurrentStoryScreen(2); } },
                    { id: 3, label: '3. The X-Ray View', desc: 'Audit factory coffee invoice bags', action: () => { setCurrentStoryScreen(3); } },
                    { id: 4, label: '4. The Smart Rescue', desc: 'Resolve Friday overdraft lifelines', action: () => { setCurrentStoryScreen(4); } },
                    { id: 5, label: '5. The Chat Shortcut', desc: 'Magic £200 floating AI pay chip', action: () => { setCurrentStoryScreen(5); setWhatsappActive(false); setWhatsappUnread(true); } },
                    { id: 6, label: '6. The Magic Camera', desc: 'Zero-typo OCR receipt shutter focus', action: () => { setCurrentStoryScreen(6); setIsCameraCaptured(false); setIsCameraFocused(false); } },
                    { id: 7, label: '7. The AI Reader', desc: 'Summarize 10-pg legal PDF contract', action: () => { setCurrentStoryScreen(7); setIsContractSummarized(false); } },
                    { id: 8, label: '8. Boss\'s Workspace', desc: 'Triage due diligence & bulk swipe', action: () => { setCurrentStoryScreen(8); setMobileTab('authorisations'); } },
                    { id: 9, label: '9. VIP Hotline Chat', desc: 'Walkie-talkie voice freeze audit', action: () => { setCurrentStoryScreen(9); setMobileTab('chat'); startWalkieTalkieStory(); } },
                    { id: 10, label: '10. Delivery Tracker', desc: 'Visual SVG UK-to-Vietnam map route', action: () => { setCurrentStoryScreen(10); setIsMapTrackerOpen(true); } },
                    { id: 11, label: '11. Vacation Mode', desc: 'Sunset setting delegation threshold', action: () => { setCurrentStoryScreen(11); setMobileTab('profile'); setVacationMode(true); } },
                  ].map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => {
                        sc.action();
                        addLog(`STORY DECK: Directed mobile viewport to Screen ${sc.id} — ${sc.label}.`);
                      }}
                      className={`w-full text-left p-2 rounded-lg border text-xs transition-all cursor-pointer ${currentStoryScreen === sc.id ? 'bg-[#0c244c] border-emerald-500 text-white font-bold ring-1 ring-emerald-500/20' : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-950/80 hover:text-white'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-[10.5px] truncate">{sc.label}</span>
                        {currentStoryScreen === sc.id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                      </div>
                      <p className="text-[8.5px] text-slate-400 mt-0.5 font-semibold leading-tight">{sc.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Active Screen Story Card Info text */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mt-1">
                  <p className="text-[8px] font-black uppercase text-teal-400 tracking-wider">Active Story State</p>
                  <p className="text-[10px] text-slate-300 font-semibold leading-relaxed mt-1">
                    {currentStoryScreen === 1 && "Screen 1 (Home): Wealth health. Tapping the currency dropdown converts ZAR, VND & GBP balances dynamically. Toggle lock blurs values."}
                    {currentStoryScreen === 2 && "Screen 2 (Timeline): Forecaster. Drag range slider to Next Friday; watch balance deplete. Tap red coffee bill to audit."}
                    {currentStoryScreen === 3 && "Screen 3 (X-Ray): Cargo receipt details. Tap 'Change Date' to see friday restrictions, or tap flashing overdraft warning banner."}
                    {currentStoryScreen === 4 && "Screen 4 (Lifelines): Rescue. Smash savings, inject working capital, or transfer foreign funds from Cape Town pools to avoid penalties."}
                    {currentStoryScreen === 5 && "Screen 5 (WhatsApp): Simulated chat from courier. Tap the glowing '✨ AI Pay £200' floating button."}
                    {currentStoryScreen === 6 && "Screen 6 (Camera): Camera lens. Click capture to extract parameters with zero typos."}
                    {currentStoryScreen === 7 && "Screen 7 (AI Reader): Legal document. Scroll dense text and tap '✨ AI Summarize' to get executive cliff notes."}
                    {currentStoryScreen === 8 && "Screen 8 (Workspace): CEO triage hub. Filter due today, read routing mismatch warnings, reject suspect wiring, and select-all swipe to approve safe list."}
                    {currentStoryScreen === 9 && "Screen 9 (Hotline): Walkie-talkie. Hold record mic to transmit airport audio. Hit Freeze Supplier."}
                    {currentStoryScreen === 10 && "Screen 10 (Map): Visual tracking. Toggle Map View to animate payment routing from London to Vietnam."}
                    {currentStoryScreen === 11 && "Screen 11 (Sunset): Handing keys. Select finance manager limits. Home fades to a relaxing sunset."}
                  </p>
                </div>
              </div>

              {/* Stats Panel */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 shadow-xl text-left font-semibold">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Stitch Account Metrics
                </h3>
                <div className="flex flex-col gap-3 font-semibold text-xs">
                  <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-900">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Settled Pay-outs</p>
                    <p className={`text-xl font-bold font-mono tracking-tight mt-1 tabular-nums ${blurBalances ? 'filter blur-md select-none' : ''}`}>
                      {getCurrencySymbol(selectedCurrency)}{convertBalance(volumeStats.totalOutflow).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-900">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">In-Flight Volume</p>
                    <p className={`text-xl font-bold font-mono tracking-tight mt-1 tabular-nums ${blurBalances ? 'filter blur-md select-none' : ''}`}>
                      {getCurrencySymbol(selectedCurrency)}{convertBalance(volumeStats.pendingVolume).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
            <div className="col-span-1 lg:col-span-5 flex flex-col items-center justify-start relative">
              
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
                <div className={`flex-1 rounded-[32px] overflow-hidden flex flex-col relative shadow-inner transition-all duration-1000 ${currentStoryScreen === 11 && vacationMode ? 'bg-gradient-to-b from-amber-600/35 via-rose-500/25 to-[#0b1528] text-white' : 'bg-slate-50 text-slate-900'}`}>
                  
                  {/* INTERACTIVE STORY PATHWAY STICKY RIBBON */}
                  <div className="bg-[#0c244c]/95 backdrop-blur-md border-b border-slate-800/20 text-white px-3.5 py-1.5 flex items-center justify-between text-[10px] font-bold z-30 shrink-0 select-none">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-slate-300">Stitch Pathway:</span>
                      <span className="text-emerald-400 font-extrabold">Step {currentStoryScreen} of 11</span>
                    </div>
                    <button
                      onClick={() => setIsPathwayMapOpen(!isPathwayMapOpen)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-1 cursor-pointer transition-colors animate-pulse"
                    >
                      <span>Jump Step</span>
                      <span className={`text-[8px] transition-transform duration-200 inline-block ${isPathwayMapOpen ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                  </div>

                  {/* PATHWAY STEP JUMPER MAP DROPDOWN */}
                  <AnimatePresence>
                    {isPathwayMapOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-8 left-0 right-0 bg-[#0c142c] border-b border-slate-800 shadow-2xl z-40 p-4 max-h-[75%] overflow-y-auto scrollbar-none flex flex-col gap-2.5 text-left text-white"
                      >
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <span className="text-[9px] font-black uppercase text-teal-400 tracking-wider">Select Story Milestone</span>
                          <button onClick={() => setIsPathwayMapOpen(false)} className="text-slate-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-1.5 mt-1">
                          {[
                            { id: 1, label: '1. Money Thermometer', desc: 'Home Dashboard & Multi-Entity Balance', tab: 'dashboard' },
                            { id: 2, label: '2. The Crystal Ball', desc: 'Interactive Future Cash Flow timeline', tab: 'dashboard' },
                            { id: 3, label: '3. The X-Ray View', desc: 'Deep dive into cargo coffee invoices', tab: 'dashboard' },
                            { id: 4, label: '4. The Smart Rescue', desc: 'Unlock instant penalty-free lifelines', tab: 'dashboard' },
                            { id: 5, label: '5. The Chat Shortcut', desc: 'Magic £200 floating AI pay chip in chat', tab: 'payments' },
                            { id: 6, label: '6. The Magic Camera', desc: 'OCR automated camera scanner', tab: 'payments' },
                            { id: 7, label: '7. The AI Reader', desc: 'Summarize 10-page contract cliff notes', tab: 'payments' },
                            { id: 8, label: '8. Boss\'s Workspace', desc: 'Triage authorizations & bulk swipe', tab: 'authorisations' },
                            { id: 9, label: '9. VIP Hotline Chat', desc: 'Walkie-talkie compliance voice freeze', tab: 'chat' },
                            { id: 10, label: '10. Delivery Tracker', desc: 'Payments Ledger & live cargo map tracking', tab: 'payments' },
                            { id: 11, label: '11. Vacation Mode', desc: 'Sunset delegated approval caps', tab: 'profile' },
                          ].map((sc) => (
                            <button
                              key={sc.id}
                              onClick={() => {
                                setCurrentStoryScreen(sc.id);
                                setMobileTab(sc.tab as any);
                                if (sc.id === 11) setVacationMode(true);
                                if (sc.id === 9) startWalkieTalkieStory();
                                if (sc.id === 5) { setWhatsappActive(false); setWhatsappUnread(true); }
                                if (sc.id === 6) { setIsCameraCaptured(false); setIsCameraFocused(false); }
                                if (sc.id === 7) { setIsContractSummarized(false); }
                                if (sc.id === 10) { setIsMapTrackerOpen(true); }
                                setIsPathwayMapOpen(false);
                                addLog(`PATHWAY: Selected Screen ${sc.id} — ${sc.label} directly inside phone console.`);
                              }}
                              className={`w-full text-left p-2 rounded-xl border text-[11px] transition-all cursor-pointer flex flex-col ${currentStoryScreen === sc.id ? 'bg-[#1e293b] border-emerald-500 text-white font-extrabold ring-1 ring-emerald-500/20' : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900/80 hover:text-white'}`}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="font-extrabold">{sc.label}</span>
                                <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono uppercase font-bold tracking-wider">{sc.tab}</span>
                              </div>
                              <p className="text-[9px] text-slate-400 font-semibold leading-tight mt-0.5">{sc.desc}</p>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* FULL-SCREEN SUB-PAGE: MANAGE TREASURY CONTROLLER */}
                  <AnimatePresence>
                    {isManageTreasuryOpen && (
                      <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                        className="absolute inset-0 bg-slate-50 z-45 flex flex-col text-slate-900 font-semibold"
                      >
                        {/* Subpage Header */}
                        <div className="bg-[#0c244c] text-white px-4 py-4 flex items-center justify-between shadow-md shrink-0">
                          <button 
                            onClick={() => setIsManageTreasuryOpen(false)}
                            className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white cursor-pointer font-bold"
                          >
                            <span>◀ Back</span>
                          </button>
                          <h3 className="text-xs font-black uppercase tracking-widest text-center">Treasury Hub</h3>
                          <div className="w-8" />
                        </div>

                        {/* Subpage Content Scrollbody */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-left">
                          <div>
                            <span className="text-[8px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">Stitch liquidity management</span>
                            <h2 className="text-base font-black text-slate-900 mt-1 font-bold">Treasury Optimizer</h2>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-bold">Perform instant cross-border yield sweeps and pool rebalancing.</p>
                          </div>

                          {/* Multi-Entity Cash Pools List */}
                          <div className="bg-white border rounded-2xl p-4 shadow-xs">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 font-bold">Active Liquidity Pools</p>
                            <div className="flex flex-col gap-3">
                              {[
                                { name: "Barclays London Pool", balance: "£145,000", cap: "98% target", status: "Optimal", color: "bg-emerald-500" },
                                { name: "Standard Bank Escrow", balance: "R4,200,000", cap: "76% target", status: "Sufficient", color: "bg-blue-500" },
                                { name: "Techcombank Cargo Vietnam", balance: "₫14,000,000", cap: "Short pool for Friday", status: "Critical Hold", color: "bg-rose-500 animate-pulse" }
                              ].map((pool, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                  <div>
                                    <p className="text-[11px] font-extrabold text-[#0c244c]">{pool.name}</p>
                                    <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 font-bold">{pool.cap}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[11px] font-black font-mono text-slate-900">{pool.balance}</p>
                                    <span className={`inline-block text-[7.5px] font-black uppercase text-white px-1.5 py-0.2 rounded mt-1 font-bold ${pool.color}`}>{pool.status}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Smart Rebalance Sweeper Box */}
                          <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                              <TrendingUp className="w-16 h-16 text-emerald-400" />
                            </div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400 font-bold">Intelligent Liquidity Sweep</p>
                            <p className="text-[10px] text-slate-300 mt-1 leading-normal font-semibold">
                              Stitch AI detected critical Friday cargo settlement queues in Vietnam. Rebalance Ho Chi Minh techcombank buffer with Cape Town Standard Bank escrow reserves?
                            </p>
                            
                            <button
                              onClick={() => {
                                addLog("TREASURY ENGINE: Initiated multi-entity liquidity sweep. Auto-converted ZAR 220,000 standard bank pool to Techcombank VND 280,000,000 pool.");
                                setToastNotification("Success: Swept & Rebalanced techcombank cargo pool!");
                                setTimeout(() => setToastNotification(null), 3000);
                              }}
                              className="mt-3 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] py-2.5 rounded-xl text-center uppercase tracking-wider cursor-pointer font-bold transition-colors"
                            >
                              ⚡ Execute AI Rebalance Sweep
                            </button>
                          </div>

                          {/* Instant Forex FX Conversion widget */}
                          <div className="bg-white border rounded-2xl p-4 shadow-xs">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 font-bold">Instant Forex Conversion (FX)</p>
                            
                            <div className="flex flex-col gap-2.5 text-xs">
                              <div>
                                <label className="block text-[8.5px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Source Currency Pool</label>
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none font-bold text-[#0c244c]">
                                  <option value="ZAR">Standard Bank ZAR Pool (Escrow)</option>
                                  <option value="GBP">Barclays London GBP Pool (Treasury)</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[8.5px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Target Settlement Pool</label>
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none font-bold text-[#0c244c]">
                                  <option value="VND">Techcombank VND Pool (Cargo releases)</option>
                                  <option value="EUR">Euros VIP Reserve Pool</option>
                                </select>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[8.5px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Amount to Swap</label>
                                  <input 
                                    type="number" 
                                    placeholder="50,000" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none font-mono font-semibold" 
                                  />
                                </div>
                                <div className="flex flex-col justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      addLog("FX CORE: Swap execution successful. Settled GBP 50,000 to Techcombank VND pool at spot rate 1.054.");
                                      setToastNotification("FX Conversion Wire Successful!");
                                      setTimeout(() => setToastNotification(null), 3000);
                                    }}
                                    className="w-full bg-[#0c244c] hover:bg-slate-900 text-white font-black text-[10px] py-2 rounded-lg text-center uppercase tracking-wider cursor-pointer font-bold"
                                  >
                                    Execute Swap
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Historical yield chart */}
                          <div className="bg-white border rounded-2xl p-4 shadow-xs flex flex-col">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 font-bold">Historical Treasury Yield</p>
                            <p className="text-[9px] text-slate-500 font-bold">Consolidated daily returns optimization rates</p>
                            <div className="h-20 w-full mt-2.5 flex items-end gap-1.5 justify-between pb-1">
                              {[34, 45, 60, 52, 70, 85, 90, 75, 80, 95, 100, 110].map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                  <div className="w-full bg-indigo-100 rounded-t-sm hover:bg-indigo-600 transition-colors cursor-pointer" style={{ height: `${val * 0.5}px` }} />
                                  <span className="text-[6.5px] font-mono text-slate-400">{i+1}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Sticky Notification Toast inside phone */}
                  <AnimatePresence>
                    {isAllPendingSelected && mobileTab === 'authorisations' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -45 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -45 }}
                        className="bg-[#0b1528] text-white px-4 py-2.5 flex items-center justify-between text-[11px] font-bold tracking-tight z-30 shadow-md relative"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                          <span>All pending items selected for bulk swipe</span>
                        </div>
                        <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* SCREEN AREA SCROLLBODY WITH MOMENTUM SCROLL */}
                  <div 
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto px-4 pt-4 pb-24 flex flex-col relative scroll-smooth overscroll-contain"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    
                    {/* ----------------- SCREEN 2: THE CRYSTAL BALL ----------------- */}
                    {currentStoryScreen === 2 && (
                      <div className="flex flex-col gap-4 animate-fadeIn text-left font-semibold">
                        <div>
                          <span className="text-[8px] font-black uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-mono font-bold">Screen 2: Forecasting</span>
                          <h2 className="text-base font-black text-slate-900 mt-1 font-bold">The Crystal Ball</h2>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-bold">Predict and visualize your upcoming week's liquidity pool.</p>
                        </div>

                        {/* Total Forecast Pool */}
                        <div className="bg-[#0c244c] text-white rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-300">Projected Cash Balance</p>
                            <h1 className="text-2xl font-black font-mono tracking-tight mt-1.5 tabular-nums">
                              {getCurrencySymbol(selectedCurrency)}{(totalBalanceDisplay - (projectionDays * 12500)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </h1>
                            <p className="text-[8px] text-indigo-300 font-mono mt-1 font-bold">Forecast limit: {projectionDays} days out (Next Friday)</p>
                          </div>
                        </div>

                        {/* Filters Row */}
                        <div className="flex gap-1.5 p-0.5 bg-slate-100 rounded-lg">
                          {['All Flows', 'Bills Only', 'Income Only'].map((f) => (
                            <button
                              key={f}
                              onClick={() => {
                                setCrystalBallFilter(f === 'All Flows' ? 'All' : (f === 'Bills Only' ? 'Bills' : 'Income'));
                                addLog(`FORECAST FILTER: Excluded standard listings to show ${f}.`);
                              }}
                              className={`flex-1 py-1.5 text-[8.5px] font-black rounded-md transition-all cursor-pointer text-center font-bold ${
                                (f === 'All Flows' && crystalBallFilter === 'All') ||
                                (f === 'Bills Only' && crystalBallFilter === 'Bills') ||
                                (f === 'Income Only' && crystalBallFilter === 'Income')
                                  ? 'bg-[#0c244c] text-white shadow-xs'
                                  : 'text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>

                        {/* Interactive Timeline range slider */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 text-left shadow-xs">
                          <div className="flex justify-between items-center text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2 font-bold">
                            <span>Adjust Cash Timeline</span>
                            <span className="text-[#0c244c] font-mono">+{projectionDays} Days</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="30"
                            step="1"
                            value={projectionDays}
                            onChange={(e) => {
                              setProjectionDays(parseInt(e.target.value));
                              addLog(`FORECAST SLIDER: Projected balance out to day +${e.target.value}.`);
                            }}
                            className="w-full accent-[#0c244c] cursor-pointer"
                          />
                          <div className="flex justify-between items-center text-[8px] text-slate-400 font-black mt-1 font-bold">
                            <span>TODAY</span>
                            <span className={projectionDays >= 7 ? "text-rose-500 font-bold font-black" : ""}>NEXT FRIDAY (DAY 7)</span>
                            <span>30 DAYS OUT</span>
                          </div>
                        </div>

                        {/* Dynamic Flows ledger */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-left shadow-xs flex flex-col gap-2.5">
                          <p className="text-[9px] font-black uppercase text-[#0c244c] tracking-wider border-b pb-1.5 border-slate-100">Scheduled Obligations</p>
                          
                          {/* Item 1: Payroll */}
                          {crystalBallFilter !== 'Income' && (
                            <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-xl border border-transparent">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border"><Users className="w-3.5 h-3.5 text-slate-600" /></div>
                                <div>
                                  <p className="text-[10px] font-extrabold text-[#0c244c] font-bold">Automated Payroll Settlement</p>
                                  <p className="text-[8px] text-slate-400 font-bold font-mono">TODAY · PENDING</p>
                                </div>
                              </div>
                              <p className="text-[10px] font-black font-mono text-slate-900">-£42,150.00</p>
                            </div>
                          )}

                          {/* Item 2: Massive red Coffee Bean Cargo Bill */}
                          {crystalBallFilter !== 'Income' && projectionDays >= 7 && (
                            <div 
                              onClick={() => {
                                setCurrentStoryScreen(3);
                                addLog(`STORY DECK: Flowed to Screen 3 (X-Ray View) to audit Vietnam factory cargo.`);
                              }}
                              className="flex justify-between items-center p-3.5 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 cursor-pointer animate-pulse"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 border border-rose-400"><Briefcase className="w-3.5 h-3.5" /></div>
                                <div>
                                  <p className="text-[10.5px] font-black text-rose-950 font-bold">Vietnam Factory Coffee Cargo</p>
                                  <p className="text-[7.5px] text-rose-600 font-black font-mono">👉 TAP TO AUDIT RECEIPT (SCREEN 3)</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[10.5px] font-black font-mono text-rose-700">-£5,000.00</p>
                                <span className="text-[7px] font-extrabold text-rose-500 uppercase tracking-widest block font-mono font-bold">DUE FRIDAY</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ----------------- SCREEN 3: THE X-RAY VIEW ----------------- */}
                    {currentStoryScreen === 3 && (
                      <div className="flex flex-col gap-4 animate-fadeIn text-left font-semibold">
                        <div>
                          <span className="text-[8px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-mono font-bold">Screen 3: X-Ray View</span>
                          <h2 className="text-base font-black text-slate-900 mt-1 font-bold">Vietnam Cargo Audit</h2>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-bold">Drill deep into the digital invoice bags scheduled for Friday release.</p>
                        </div>

                        {/* Attached Image Bags of Coffee Beans */}
                        <div className="bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-xs relative">
                          <div className="h-32 bg-slate-950 flex items-center justify-center relative">
                            <div className="text-center text-slate-400 p-4">
                              <Briefcase className="w-8 h-8 text-emerald-400 mx-auto mb-2 animate-bounce" />
                              <span className="text-[9px] font-mono block text-slate-300 font-bold">VIETNAM FACTORY CARGO INVOICE IMG</span>
                              <span className="text-[7.5px] text-slate-500 font-black block mt-0.5 font-bold">Verified load: 24,000kg premium coffee bean sacs</span>
                            </div>
                          </div>
                        </div>

                        {/* Warning Overdraft Banner */}
                        <div 
                          onClick={() => {
                            setCurrentStoryScreen(4);
                            addLog("STORY DECK: Overdraft detected. Redirecting to Screen 4 (The Smart Rescue).");
                          }}
                          className="bg-rose-600 text-white rounded-xl p-3 shadow-md border border-rose-700 cursor-pointer animate-pulse"
                        >
                          <p className="text-[8px] font-black uppercase tracking-widest text-rose-200">🚨 compliance threat triggered</p>
                          <p className="text-[10px] font-black mt-1 leading-normal text-rose-100 font-bold">
                            Warning: Releasing this £5,000 bill on Friday will trigger an OVERDRAFT. Tapping this banner activates rescue lifelines!
                          </p>
                        </div>

                        {/* Change Date Alert */}
                        <div className="bg-white border rounded-xl p-4 shadow-xs">
                          <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 font-bold">Rescheduling Control</p>
                          <button
                            onClick={() => {
                              addLog("COMPLIANCE VERDICT: Rescheduling failed. Policy: 'Deadline is strictly Friday.'");
                              setToastNotification("Blocked: Deadline is strictly Friday!");
                              setTimeout(() => setToastNotification(null), 3000);
                            }}
                            className="w-full bg-[#0c244c] hover:bg-slate-900 text-white font-extrabold text-xs py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 uppercase font-bold"
                          >
                            <Clock className="w-3.5 h-3.5 text-emerald-400" /> Change Release Date
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ----------------- SCREEN 4: THE SMART RESCUE ----------------- */}
                    {currentStoryScreen === 4 && (
                      <div className="flex flex-col gap-4 animate-fadeIn text-left font-semibold">
                        <div>
                          <span className="text-[8px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">Screen 4: Smart Rescue</span>
                          <h2 className="text-base font-black text-slate-900 mt-1 font-bold">Avoid Payout Bounce</h2>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-bold">Stitch detected a short pool for Friday. Choose an instant penalty-free lifeline:</p>
                        </div>

                        {isOverdraftRescueApplied ? (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center flex flex-col items-center">
                            <div className="w-10 h-10 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mb-2 shadow-md"><Check className="w-6 h-6 stroke-[3]" /></div>
                            <h3 className="text-sm font-black text-emerald-950 uppercase">Overdraft Rescued!</h3>
                            <p className="text-[10.5px] text-slate-600 mt-1 max-w-xs font-semibold leading-relaxed">
                              Your cash shortfall has been fully resolved. Your Friday Coffee Bean Cargo payment is guaranteed to clear.
                            </p>
                            <button
                              onClick={() => {
                                setIsOverdraftRescueApplied(false);
                                setCurrentStoryScreen(1);
                                setMobileTab('dashboard');
                                addLog("STORY DECK: Smashed lifelines resolved. Returning to Global Dashboard.");
                              }}
                              className="mt-4 px-4 py-2 bg-[#0c244c] hover:bg-slate-900 text-white font-black text-[10px] rounded-lg cursor-pointer uppercase font-bold"
                            >
                              Return to Home
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2.5">
                            <button
                              onClick={() => {
                                setIsOverdraftRescueApplied(true);
                                addLog("LIFELINE: Smashed Fixed Savings Deposit to unlock £5,000.");
                              }}
                              className="w-full text-left p-3.5 bg-white border hover:bg-slate-50 border-slate-200 rounded-xl cursor-pointer flex items-center gap-3"
                            >
                              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 font-bold">🔨</div>
                              <div>
                                <p className="text-[11px] font-black text-slate-900 font-bold">Smashed Savings Glass</p>
                                <p className="text-[8px] text-slate-400 uppercase mt-0.5 font-bold">Break fixed deposit early · penalty waived</p>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                setIsOverdraftRescueApplied(true);
                                addLog("LIFELINE: Authorized Working Capital Loan of £5,000.");
                              }}
                              className="w-full text-left p-3.5 bg-white border hover:bg-slate-50 border-slate-200 rounded-xl cursor-pointer flex items-center gap-3"
                            >
                              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 font-bold">💵</div>
                              <div>
                                <p className="text-[11px] font-black text-slate-900 font-bold">Working Capital Loan</p>
                                <p className="text-[8px] text-slate-400 uppercase mt-0.5 font-bold">Instant low-interest credit line of £5,000</p>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                setIsOverdraftRescueApplied(true);
                                addLog("LIFELINE: Swapped liquidity pools from Standard Bank Escrow to clear deficit.");
                              }}
                              className="w-full text-left p-3.5 bg-white border hover:bg-slate-50 border-slate-200 rounded-xl cursor-pointer flex items-center gap-3"
                            >
                              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 font-bold font-bold">🌍</div>
                              <div>
                                <p className="text-[11px] font-black text-slate-900 font-bold">Transfer from Vietnam ZAR Pools</p>
                                <p className="text-[8px] text-slate-400 uppercase mt-0.5 font-bold font-bold">Re-route internal foreign reserves instantly</p>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ----------------- SCREEN 5: THE CHAT SHORTCUT ----------------- */}
                    {currentStoryScreen === 5 && (
                      <div className="flex flex-col h-full justify-between animate-fadeIn text-left font-semibold">
                        <div>
                          <span className="text-[8px] font-black uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-mono font-bold">Screen 5: Chat Shortcut</span>
                          <h2 className="text-base font-black text-slate-900 mt-1 font-bold">WhatsApp Push</h2>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-bold">Simulating an external courier notification request fee.</p>
                        </div>

                        {whatsappActive ? (
                          <div className="bg-emerald-50/20 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3 h-[250px] justify-between">
                            <div className="flex items-center gap-2 border-b pb-2">
                              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">👨‍✈️</div>
                              <div>
                                <h4 className="text-xs font-black text-slate-900 leading-none font-bold">Courier Driver</h4>
                                <span className="text-[7.5px] text-slate-400 font-bold font-mono">Active 2 mins ago</span>
                              </div>
                            </div>

                            <div className="flex-1 flex flex-col justify-end gap-2.5 pb-2 text-xs">
                              <div className="bg-slate-100 p-2.5 rounded-xl rounded-tl-none self-start max-w-[85%] text-slate-800 font-bold">
                                I dropped off the boxes, please send the £200 fee! Here is my slip.
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setCurrentStoryScreen(6);
                                addLog("STORY DECK: Tap AI chip in chat. Automatically opening Camera (Screen 6) to verify receipt.");
                              }}
                              className="w-full bg-[#059669] hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-lg cursor-pointer animate-pulse uppercase font-bold"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-white animate-spin" /> ✨ Pay £200 AI Chip
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 py-6 items-center">
                            {whatsappUnread && (
                              <button
                                onClick={() => {
                                  setWhatsappActive(true);
                                  setWhatsappUnread(false);
                                  addLog("STORY DECK: WhatsApp push notification opened driver message thread.");
                                }}
                                className="w-full text-left bg-white border border-slate-200 rounded-2xl p-3.5 hover:shadow-md cursor-pointer flex items-start gap-3 relative overflow-hidden"
                              >
                                <span className="absolute right-0 top-0 bg-emerald-500 text-white text-[7px] font-black px-2 py-0.5 rounded-bl">WhatsApp</span>
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-xl flex items-center justify-center shrink-0">💬</div>
                                <div className="min-w-0">
                                  <h4 className="text-[11px] font-black text-slate-900 font-bold">DHL Delivery Driver</h4>
                                  <p className="text-[10px] text-slate-500 truncate font-semibold mt-0.5 font-bold">I dropped off the boxes, please send the £200 fee...</p>
                                </div>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ----------------- SCREEN 6: THE MAGIC CAMERA ----------------- */}
                    {currentStoryScreen === 6 && (
                      <div className="flex flex-col gap-4 animate-fadeIn text-left font-semibold">
                        <div>
                          <span className="text-[8px] font-black uppercase bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full font-mono font-bold">Screen 6: Magic Camera</span>
                          <h2 className="text-base font-black text-slate-900 mt-1 font-bold">Magic Camera Scanner</h2>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-bold">Point lens at paper slip to extract zero-typo fields.</p>
                        </div>

                        {isCameraCaptured ? (
                          <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col gap-3 text-left">
                            <div className="bg-[#0c244c] text-white p-3 rounded-xl">
                              <p className="text-[8px] font-black uppercase tracking-wider text-teal-300">extracted parameters</p>
                              <p className="text-sm font-black font-mono mt-1 font-bold">DHL LOGISTICS CORP</p>
                              <div className="flex justify-between items-center text-[10px] font-mono mt-2 pt-1.5 border-t border-white/10 font-bold">
                                <span>AMOUNT: £200.00</span>
                                <span>TAX: £18.00</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setCurrentStoryScreen(7);
                                addLog("STORY DECK: OCR fields locked. Advancing to Screen 7 (AI Reader) to read terms.");
                              }}
                              className="w-full bg-[#0c244c] hover:bg-slate-900 text-white font-black py-2 rounded-xl text-xs cursor-pointer uppercase font-bold"
                            >
                              Read Terms & Conditions (Screen 7)
                            </button>
                          </div>
                        ) : (
                          <div className="bg-slate-950 rounded-3xl overflow-hidden aspect-[4/3] relative flex items-center justify-center border border-slate-800">
                            <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center p-4">
                              <div className="bg-white text-slate-900 p-2.5 rounded shadow-lg text-[7px] font-mono w-32 border-2 border-slate-300">
                                <p className="font-black text-center border-b pb-1 mb-1 font-bold">DHL INVOICE</p>
                                <p>ITEM: CARGO EXPRESS</p>
                                <p>AMT: £200.00</p>
                                <p>TAX: £18.00</p>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setIsCameraFocused(true);
                                addLog("CAMERA: Captured focal coordinate parameters on paper invoice.");
                              }}
                              className={`absolute w-16 h-16 border-2 transition-all duration-300 flex items-center justify-center ${isCameraFocused ? 'border-emerald-400 scale-95' : 'border-white animate-pulse'}`}
                            >
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                            </button>

                            <div className="absolute bottom-2 inset-x-0 flex justify-center">
                              <button
                                onClick={() => {
                                  setIsCameraCaptured(true);
                                  addLog("CAMERA: Paper receipt captured. Commenced instant AI OCR extraction.");
                                }}
                                className="w-10 h-10 bg-white hover:bg-slate-200 border-4 border-slate-700 rounded-full flex items-center justify-center cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ----------------- SCREEN 7: THE AI READER ----------------- */}
                    {currentStoryScreen === 7 && (
                      <div className="flex flex-col gap-4 animate-fadeIn text-left font-semibold">
                        <div>
                          <span className="text-[8px] font-black uppercase bg-[#0c244c]/10 text-[#0c244c] px-2 py-0.5 rounded-full font-mono font-bold">Screen 7: AI Reader</span>
                          <h2 className="text-base font-black text-slate-900 mt-1 font-bold">The Cliff Notes</h2>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-bold">Skip 10 pages of legal jargon with modern on-device summarization assistants.</p>
                        </div>

                        <div className="bg-white border rounded-2xl p-4 max-h-[160px] overflow-y-auto text-[8px] font-semibold text-slate-400 leading-normal font-mono scrollbar-thin">
                          <p className="font-bold text-slate-700 mb-1">DHL LOGISTICS CONTRACT CLAUSE 992-B</p>
                          <p>WHEREAS, the consignor wishes to execute payment of express logistics transport fees under terms of regional standard liability acts, and Whereas the recipient accepts standard courier delivery timelines...</p>
                          <p className="mt-2">FURTHERMORE, the consignor waives direct collateral refunds upon dropoff signature confirmation, under penalty of standard liability limits set forward under South Africa-UK maritime networks...</p>
                          <p className="mt-2">THEREFORE, immediate clearance of £200.00 is strictly due upon arrival of delivery nodes. Failure to execute payout clearances grants the carrier lien over shipping containers...</p>
                        </div>

                        {isContractSummarized ? (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-left">
                            <p className="text-[8px] font-black uppercase tracking-wider text-emerald-800">✨ AI Executive Summary</p>
                            <ul className="text-[9.5px] text-slate-700 list-disc list-inside mt-1 flex flex-col gap-1 font-bold">
                              <li>Pay £200.</li>
                              <li>Due today.</li>
                              <li>No refunds.</li>
                            </ul>
                            <button
                              onClick={() => {
                                setCurrentStoryScreen(8);
                                setMobileTab('authorisations');
                                addLog("STORY DECK: Document signed. Transitioning to Screen 8 (The Workspace) to execute approvals.");
                              }}
                              className="w-full mt-3 bg-[#0c244c] hover:bg-slate-900 text-white font-black py-2 rounded-xl text-xs cursor-pointer uppercase font-bold"
                            >
                              Submit for Approval (Screen 8)
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setIsContractSummarized(true);
                              addLog("AI READ: Compressed 10-page dense cargo contract into 3 core bullets.");
                            }}
                            className="w-full bg-[#059669] hover:bg-emerald-600 text-white py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer uppercase font-bold"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-white" /> AI Summarize (Screen 7)
                          </button>
                        )}
                      </div>
                    )}

                    {/* ----------------- SCREEN 1: DASHBOARD TAB ----------------- */}
                    {mobileTab === 'dashboard' && currentStoryScreen === 1 && (
                      <div className="flex flex-col gap-4 animate-fadeIn text-left font-semibold">
                        
                        {/* Header Details with Currency Dropdown & Hide Balances */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Welcome back</p>
                            <h2 className="text-base font-black text-slate-900 font-bold">Stitch Console</h2>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Currency Dropdown (GBP, VND) */}
                            <select
                              value={selectedCurrency}
                              onChange={e => {
                                setSelectedCurrency(e.target.value);
                                addLog(`CURRENCY DROPDOWN: Recalculated operating balances to ${e.target.value}.`);
                              }}
                              className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#0c244c] text-[10px] font-black rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                            >
                              <option value="GBP">GBP (£)</option>
                              <option value="VND">VND (₫)</option>
                              <option value="USD">USD ($)</option>
                              <option value="EUR">EUR (€)</option>
                            </select>

                            {/* Privacy Lock Balances button */}
                            <button
                              onClick={() => {
                                setBlurBalances(!blurBalances);
                                addLog(`SECURITY: Toggled Privacy balance blur state to ${!blurBalances ? 'ENABLED' : 'DISABLED'}`);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-[#0c244c] rounded-full border border-slate-200 transition-colors cursor-pointer"
                            >
                              {blurBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Top Card: Total Balance Large Text */}
                        <div className="bg-[#0c244c] text-white rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                          <div className="absolute right-0 top-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-teal-300">Stitch Total Balance</p>
                            <h1 className={`text-2xl font-black font-mono tracking-tight mt-1.5 tabular-nums ${blurBalances ? 'filter blur-md select-none' : ''}`}>
                              {getCurrencySymbol(selectedCurrency)}{totalBalanceDisplay.toLocaleString(undefined, { minimumFractionDigits: selectedCurrency === 'VND' ? 0 : 2 })}
                            </h1>
                          </div>
                          <div className="flex items-center justify-between mt-4 text-[10px] pt-1.5 border-t border-white/10">
                            <span className="text-teal-300 font-mono text-[9px] font-bold">Stitch Treasury ID: farah_9921</span>
                            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-black uppercase text-[8px]">Verified Pool</span>
                          </div>
                        </div>

                        {/* Horizontal account carousel */}
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-left shadow-xs">
                          <div className="flex justify-between items-center mb-2.5">
                            <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Aggregated Account Carousel (Swipe)</p>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  const el = document.getElementById('account-carousel-container');
                                  if (el) el.scrollBy({ left: -130, behavior: 'smooth' });
                                  addLog(`CAROUSEL: Scrolled left.`);
                                }}
                                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 cursor-pointer flex items-center justify-center"
                              >
                                <ChevronLeft className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => {
                                  const el = document.getElementById('account-carousel-container');
                                  if (el) el.scrollBy({ left: 130, behavior: 'smooth' });
                                  addLog(`CAROUSEL: Scrolled right.`);
                                }}
                                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 cursor-pointer flex items-center justify-center"
                              >
                                <ChevronRight className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                          
                          <div 
                            id="account-carousel-container"
                            className="flex gap-2.5 overflow-x-auto pb-1.5 mt-1 scroll-smooth flex-nowrap overscroll-x-contain touch-pan-x"
                            style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}
                          >
                            {bankAccounts.map(acc => (
                              <button
                                key={acc.id}
                                onClick={() => {
                                  setSelectedAccountId(acc.id);
                                  addLog(`BANK SWITCH: Switched primary dashboard context to ${acc.bank}.`);
                                }}
                                className={`shrink-0 w-[145px] text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex flex-col justify-between h-[85px] ${acc.id === selectedAccountId ? 'bg-[#0c244c] text-white border-[#0c244c] shadow-md ring-2 ring-emerald-500/10' : 'bg-slate-50 text-slate-800 border-slate-200/80 hover:bg-slate-100'}`}
                                style={{ scrollSnapAlign: 'start' }}
                              >
                                <div>
                                  <p className={`text-[7.5px] font-extrabold uppercase truncate ${acc.id === selectedAccountId ? 'text-teal-300' : 'text-slate-400'}`}>{acc.bank}</p>
                                  <p className="text-[7px] font-bold text-slate-400 uppercase leading-none">{acc.type}</p>
                                </div>
                                <div className="mt-1">
                                  {/* Converted Balance */}
                                  <p className={`font-mono font-black text-xs tabular-nums ${blurBalances ? 'filter blur-xs' : ''}`}>
                                    {getCurrencySymbol(selectedCurrency)}{convertBalance(acc.balance).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                  </p>
                                  {/* Native Balance */}
                                  <p className={`text-[7.5px] font-bold font-mono tracking-tight mt-0.5 ${acc.id === selectedAccountId ? 'text-slate-300' : 'text-slate-500'} ${blurBalances ? 'filter blur-xs' : ''}`}>
                                    Native: {getCurrencySymbol(acc.currency)}{acc.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })} {acc.currency}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Time Machine Sticky Pill Button Card */}
                        <div 
                          onClick={() => {
                            setCurrentStoryScreen(2);
                            addLog(`TIME MACHINE: Tap card to launch Screen 2 (Crystal Ball Future Cash Flow timeline).`);
                          }}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-3.5 text-white shadow-md flex items-center justify-between cursor-pointer hover:shadow-lg transition-all transform active:scale-98 text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                              <Clock className="w-4 h-4 text-emerald-300 animate-pulse" />
                            </div>
                            <div>
                              <div className="text-xs font-black flex items-center gap-1.5">
                                <span className="font-bold text-white font-bold">Time Machine: Future Cash Flow</span>
                                <span className="bg-emerald-500/25 text-emerald-300 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md font-mono font-bold">Crystal Ball</span>
                              </div>
                              <p className="text-[10px] text-slate-200 opacity-90 mt-0.5 font-semibold leading-none">Simulate 30-day runway, cash burn & bills</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-200" />
                        </div>

                        {/* Recent activity vertical list with infinite scroll */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-left shadow-xs flex flex-col">
                          <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-100">
                            <p className="text-[10px] font-black uppercase text-[#0c244c] tracking-wider">Recent Activity Ledger</p>
                            <span className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold">Infinite Scroll</span>
                          </div>

                          {/* Segmented Account Filter for Recent Activity */}
                          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg mb-3">
                            <button
                              onClick={() => {
                                setActivityAccountFilter('All');
                                addLog(`ACTIVITY FILTER: Showing recent transactions for All Accounts.`);
                              }}
                              className={`flex-1 py-1 text-[8px] font-extrabold rounded-md transition-colors cursor-pointer text-center ${activityAccountFilter === 'All' ? 'bg-[#0c244c] text-white shadow-xs' : 'text-slate-500 hover:text-slate-950'}`}
                            >
                              All
                            </button>
                            {bankAccounts.map(acc => (
                              <button
                                key={acc.id}
                                onClick={() => {
                                  setActivityAccountFilter(acc.id);
                                  addLog(`ACTIVITY FILTER: Filtering activity feed by ${acc.bank}.`);
                                }}
                                className={`flex-1 py-1 text-[8px] font-extrabold rounded-md transition-all cursor-pointer text-center truncate ${activityAccountFilter === acc.id ? 'bg-[#0c244c] text-white shadow-xs' : 'text-slate-500 hover:text-slate-950'}`}
                              >
                                {acc.bank.split(' ')[0]}
                              </button>
                            ))}
                          </div>

                          <div className="flex flex-col gap-2.5">
                            {dashboardTransactions.length === 0 ? (
                              <p className="text-center py-6 text-[10px] text-slate-400 font-bold font-semibold">No recent transactions recorded for this account filter.</p>
                            ) : (
                              dashboardTransactions.slice(0, 10).map(tx => (
                                <div
                                  key={tx.id}
                                  onClick={() => { setSelectedItemForDetail(tx); setSelectedAudit(tx); }}
                                  className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${tx.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : (tx.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100')}`}>
                                      {tx.status === 'Approved' ? <ArrowUpRight className="w-3.5 h-3.5" /> : (tx.status === 'Rejected' ? <X className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />)}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-extrabold text-[#0c244c] truncate font-bold">{tx.beneficiary}</p>
                                      <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{tx.id} · {tx.type}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className={`text-[11px] font-black font-mono text-slate-900 leading-tight ${blurBalances ? 'filter blur-sm select-none' : ''}`}>
                                      {getCurrencySymbol(selectedCurrency)}{convertBalance(tx.amount, tx.currency).toLocaleString(undefined, { minimumFractionDigits: selectedCurrency === 'VND' ? 0 : 2 })}
                                    </p>
                                    <p className={`text-[8px] font-bold font-mono text-slate-400 mt-0.5 uppercase leading-none ${blurBalances ? 'filter blur-sm select-none' : ''}`}>
                                      {getCurrencySymbol(tx.currency)}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: tx.currency === 'VND' ? 0 : 2 })} {tx.currency}
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}

                            {dashboardTransactions.length > 10 && (
                              <button
                                onClick={() => {
                                  setMobileTab('payments');
                                  setCurrentStoryScreen(10);
                                  addLog(`DASHBOARD: Clicked 'View More' on Recent Activity, routing to Payments ledger (Screen 10).`);
                                }}
                                className="mt-2 w-full py-2 bg-slate-50 hover:bg-slate-100 text-[#0c244c] font-black text-[9px] rounded-xl text-center uppercase tracking-widest cursor-pointer font-bold border border-slate-200/30"
                              >
                                View More Activity
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Manage Treasury Dashboard Button */}
                        <div className="mt-3 shrink-0">
                          <button
                            onClick={() => {
                              setIsManageTreasuryOpen(true);
                              addLog("DASHBOARD: Opened Manage Treasury hub subpage.");
                            }}
                            className="w-full bg-[#0c244c] hover:bg-[#071936] text-white font-extrabold text-xs py-3 rounded-2xl cursor-pointer flex items-center justify-center gap-2 uppercase tracking-widest font-bold shadow-md hover:shadow-lg transition-all"
                          >
                            <TrendingUp className="w-4 h-4 text-emerald-400" /> Manage Treasury
                          </button>
                        </div>

                      </div>
                    )}

                    {/* ----------------- SCREEN 2: PAYMENTS HISTORY TAB ----------------- */}
                    {mobileTab === 'payments' && currentStoryScreen === 10 && (
                      <div className="flex flex-col gap-3 animate-fadeIn text-left font-semibold">
                        
                        {/* Sticky Header & Filter Bar for Payments */}
                        <div className="sticky top-0 bg-slate-50/95 backdrop-blur-md pt-2 pb-3 mb-2 z-20 flex flex-col gap-3 border-b border-slate-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-bold">Financial Archive</p>
                              <h2 className="text-base font-black text-slate-900 font-bold">Payments Ledger</h2>
                              <p className="text-[9px] text-indigo-500 font-bold mt-0.5">💡 Touch & hold any payment to open its quick menu!</p>
                            </div>
                            <button
                              onClick={() => setIsCreatePaymentModalOpen(true)}
                              className="px-2.5 py-1.5 bg-[#0c244c] hover:bg-slate-900 text-white text-[9.5px] font-black rounded-lg uppercase tracking-wider shadow-xs flex items-center gap-1 cursor-pointer font-bold shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5 text-emerald-400" /> New Payout
                            </button>
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

                          {/* Payment Status filtering Segment */}
                          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
                            {['All', 'Approved', 'Rejected'].map((status) => (
                              <button
                                key={status}
                                onClick={() => setPaymentsStatusFilter(status)}
                                className={`flex-1 py-1 text-[9px] font-bold rounded-md transition-colors cursor-pointer ${paymentsStatusFilter === status ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-950'}`}
                              >
                                {status === 'All' ? 'All' : status}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2.5">
                          {slicedPaymentsHistory.map(tx => (
                            <div 
                              key={tx.id} 
                              onMouseDown={(e) => handleTouchStart(tx, e)}
                              onMouseUp={handleTouchEnd}
                              onMouseLeave={handleTouchEnd}
                              onTouchStart={(e) => handleTouchStart(tx, e)}
                              onTouchEnd={handleTouchEnd}
                              onClick={() => { setSelectedItemForDetail(tx); setSelectedAudit(tx); }} 
                              className="bg-white border rounded-xl p-3 cursor-pointer flex items-center justify-between shadow-xs hover:border-slate-300 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${tx.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : (tx.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100')}`}>
                                  {tx.status === 'Approved' ? <ArrowUpRight className="w-3.5 h-3.5" /> : (tx.status === 'Rejected' ? <X className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[11px] font-extrabold text-[#0c244c] truncate font-bold">{tx.beneficiary}</p>
                                  <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{tx.id} · {tx.type}</p>
                                </div>
                              </div>
                              <p className={`text-[11px] font-black font-mono text-slate-900 ${blurBalances ? 'filter blur-sm select-none' : ''}`}>
                                {getCurrencySymbol(selectedCurrency)}{convertBalance(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ----------------- SCREEN 3: WORKSPACE TAB (Filters & Lists) ----------------- */}
                    {mobileTab === 'authorisations' && currentStoryScreen === 8 && (
                      <div className="flex flex-col gap-1.5 animate-fadeIn text-left relative">
                        
                        {/* Sticky Header & Filter Bar for Workspace */}
                        <div className="sticky top-0 bg-slate-50/95 backdrop-blur-md pt-2 pb-3 mb-2.5 z-20 flex flex-col gap-2 border-b border-slate-100">
                          <div>
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Release Management</p>
                            <h2 className="text-base font-black text-slate-900 font-bold">Workspace Approvals ({filteredPendingTransactions.length})</h2>
                          </div>

                          {/* Filters Urgency & Type */}
                          <div className="grid grid-cols-3 gap-1 px-1">
                            <div>
                              <span className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Sort</span>
                              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-1 py-1 font-semibold text-[10px] shadow-sm focus:outline-none">
                                <option value="Standard">Standard</option>
                                <option value="AmountHighToLow">High-Low</option>
                                <option value="AmountLowToHigh">Low-High</option>
                              </select>
                            </div>
                            <div>
                              <span className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Urgency</span>
                              <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-1 py-1 font-semibold text-[10px] shadow-sm focus:outline-none">
                                <option value="All">All Urgency</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                              </select>
                            </div>
                            <div>
                              <span className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Type</span>
                              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-1 py-1 font-semibold text-[10px] shadow-sm focus:outline-none">
                                <option value="All">All Types</option>
                                <option value="Supplier">Supplier</option>
                                <option value="Payroll">Payroll</option>
                                <option value="Loan">Loan</option>
                                <option value="Misc">Misc</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons select all */}
                        <div className="flex justify-between items-center px-1 mb-2.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Queue List</span>
                          <button
                            onClick={toggleSelectAll}
                            className="text-[10px] text-indigo-700 font-black hover:text-indigo-950 flex items-center gap-1 font-bold cursor-pointer"
                          >
                            {isAllPendingSelected ? '✓ Unselect All' : '✓ Select All'}
                          </button>
                        </div>

                        {/* Active scroll items container */}
                        <div className="flex flex-col gap-2.5">
                          {slicedPendingTransactions.length === 0 ? (
                            <div className="text-center py-12 px-4 text-slate-400">
                              <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                              <p className="text-[11px] font-extrabold text-slate-800">Queue is Clear</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">Try altering sorting or filter options.</p>
                            </div>
                          ) : (
                            slicedPendingTransactions.map(tx => (
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
                                  <p className={`text-[12px] font-extrabold font-mono text-[#0c244c] tabular-nums ${blurBalances ? 'filter blur-sm select-none' : ''}`}>
                                    {getCurrencySymbol(selectedCurrency)}{convertBalance(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* ----------------- SCREEN 4: CHAT TAB ----------------- */}
                    {mobileTab === 'chat' && currentStoryScreen === 9 && (
                      <div className="flex flex-col h-full min-h-[385px] justify-between animate-fadeIn text-left font-semibold">
                        
                        {/* Header Details */}
                        <div className="sticky top-0 bg-slate-50/95 backdrop-blur-md pb-2 mb-2 z-20 flex items-center justify-between border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950"><Sparkles className="w-3.5 h-3.5" /></div>
                            <div>
                              <p className="text-[10px] font-black text-slate-900 leading-none">
                                {walkieTalkieActive ? 'Barclays VIP hotline' : 'Stitch Support Bot'}
                              </p>
                              <span className="text-[8px] font-semibold text-emerald-600 uppercase tracking-widest font-mono">ONLINE / SECURED</span>
                            </div>
                          </div>
                          
                          {walkieTalkieActive && (
                            <button onClick={exitWalkieTalkie} className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md hover:bg-slate-200 font-bold">
                              Exit VIP
                            </button>
                          )}
                        </div>

                        {/* Message Feed list */}
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

                        {/* Form controls airport Walkie-talkie mode */}
                        <div className="mt-3 border-t border-slate-200 pt-3 flex flex-col gap-2">
                          {walkieTalkieActive ? (
                            <div className="flex flex-col gap-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                              
                              {walkieTalkieStep === 1 && (
                                <div className="flex items-center justify-between gap-1.5">
                                  <p className="text-[9px] font-bold text-indigo-900 leading-normal font-bold"><strong>Step 1:</strong> Share Apex £20k sketchy invoice as evidence.</p>
                                  <button onClick={wtShareEvidence} className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[9px] px-2.5 py-1.5 rounded-md cursor-pointer font-bold">🔗 Share</button>
                                </div>
                              )}

                              {(walkieTalkieStep === 2 || walkieTalkieStep === 3) && (
                                <div className="flex flex-col items-center gap-2 py-1">
                                  <p className="text-[9px] font-bold text-indigo-950 text-center leading-normal font-bold">
                                    {walkieTalkieStep === 2 ? "Step 2: Hold Mic button to translate overnight Scam details." : "🎤 recording... Release to convert!"}
                                  </p>
                                  <div className="flex items-center justify-center mt-1">
                                    <button
                                      onMouseDown={handleMicPressStart}
                                      onMouseUp={handleMicPressEnd}
                                      onTouchStart={handleMicPressStart}
                                      onTouchEnd={handleMicPressEnd}
                                      className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all shadow-lg ${walkieTalkieStep === 3 ? 'bg-rose-500 scale-110 shadow-rose-500/20 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'}`}
                                    >
                                      {walkieTalkieStep === 3 ? <Volume2 className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {walkieTalkieStep === 4 && (
                                <div className="flex items-center gap-2 justify-center py-2 text-indigo-900"><RefreshCw className="w-4 h-4 animate-spin shrink-0" /><p className="text-[9px] font-black uppercase tracking-wider">AI transcribing voice...</p></div>
                              )}

                              {walkieTalkieStep === 6 && (
                                <div className="text-center py-1">
                                  <p className="text-[10px] font-black text-emerald-800">✅ FRAUD SUSPENDED SUCCESS!</p>
                                </div>
                              )}

                            </div>
                          ) : (
                            <form onSubmit={handleSendChat} className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                              <input type="text" placeholder="Message assistant..." value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 bg-transparent px-2.5 py-1.5 text-xs focus:outline-none" />
                              <button type="submit" className="w-8 h-8 rounded-lg bg-[#059669] hover:bg-emerald-600 text-white flex items-center justify-center shrink-0 cursor-pointer"><Send className="w-3.5 h-3.5" /></button>
                            </form>
                          )}
                        </div>

                      </div>
                    )}

                    {/* ----------------- SCREEN 5: PROFILE TAB ----------------- */}
                    {mobileTab === 'profile' && currentStoryScreen === 11 && (
                      <div className="flex flex-col gap-4 animate-fadeIn text-left font-semibold">
                        <div className="bg-white border rounded-2xl p-4 text-center shadow-xs">
                          <div className="w-12 h-12 bg-[#0c244c] rounded-full flex items-center justify-center text-white font-bold text-base mx-auto mb-2 border">FF</div>
                          <h3 className="text-sm font-extrabold text-slate-900 leading-tight">Farah Enterprise</h3>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">farahfoo@gmail.com</p>
                          <span className="inline-block mt-2 bg-emerald-50 text-emerald-800 font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-100">production active</span>
                        </div>

                        {/* Interactive Vacation Delegation Limits */}
                        <div className="bg-white border rounded-2xl p-4 shadow-xs text-left">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wider text-[#0c244c]">Vacation Mode Delegation</p>
                              <p className="text-[8px] text-slate-400 mt-0.5 font-bold">Delegate payout signing authorities.</p>
                            </div>
                            <button
                              onClick={() => {
                                setVacationMode(!vacationMode);
                                addLog(`SECURITY: Toggled Vacation Mode delegation setting to ${!vacationMode ? 'ENABLED' : 'DISABLED'}`);
                              }}
                              className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${vacationMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${vacationMode ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                          </div>

                          {vacationMode && (
                            <div className="mt-4 pt-3 border-t border-slate-100 animate-fadeIn">
                              <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                <span>Max Delegation Payout Limit</span>
                                <span className="font-mono text-indigo-600">${delegateLimit.toLocaleString()}</span>
                              </div>
                              <input 
                                type="range"
                                min="5000"
                                max="100000"
                                step="5000"
                                value={delegateLimit}
                                onChange={e => {
                                  setDelegateLimit(parseInt(e.target.value));
                                  addLog(`DELEGATION: Set vacation manager release limit caps to $${parseInt(e.target.value).toLocaleString()}`);
                                }}
                                className="w-full accent-indigo-600 cursor-pointer"
                              />
                            </div>
                          )}
                        </div>

                        {/* Daily Transfer Threshold Limit */}
                        <div className="bg-white border rounded-2xl p-4 shadow-xs text-left">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-[#0c244c]">Daily Payout Threshold Limit</p>
                            <p className="text-[8px] text-slate-400 mt-0.5 font-bold">Configure reactive authorization limits.</p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                              <span>Daily Threshold Limit</span>
                              <span className="font-mono text-emerald-600">${dailyLimit.toLocaleString()}</span>
                            </div>
                            <input 
                              type="range"
                              min="10000"
                              max="1000000"
                              step="10000"
                              value={dailyLimit}
                              onChange={e => {
                                setDailyLimit(parseInt(e.target.value));
                                addLog(`LIMITS: Configured Daily Transfer Threshold Limit to $${parseInt(e.target.value).toLocaleString()}`);
                              }}
                              className="w-full accent-emerald-600 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* API Secrets Rotation */}
                        <div className="bg-white border rounded-2xl p-4 shadow-xs text-left">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-[#0c244c]">Stitch API Credentials</p>
                            <p className="text-[8px] text-slate-400 mt-0.5 font-bold">Manage and rotate live sandbox keys.</p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                            <div className="flex items-center justify-between text-[9px] font-mono bg-slate-50 border p-2 rounded text-slate-600 font-bold break-all">
                              <span>{sandboxApiKey}</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={handleRotateKeys} 
                              className="w-full bg-[#0c244c] hover:bg-[#123061] text-white font-bold py-1.5 rounded-lg text-[10px] flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Key className="w-3.5 h-3.5 text-emerald-400" /> Rotate API Secrets
                            </button>
                          </div>
                        </div>

                        {/* Webhook Targets */}
                        <form onSubmit={handleSaveWebhook} className="bg-white border rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                          <div>
                            <p className="text-[10px] font-black uppercase text-[#0c244c] mb-1 font-bold">Webhooks URL Target</p>
                            <input type="text" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} className="w-full bg-slate-50 text-slate-800 font-mono text-[9px] px-2 py-1.5 rounded border border-slate-200 focus:outline-none focus:border-emerald-500 font-semibold" />
                          </div>
                          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-1.5 rounded-lg text-[10px] cursor-pointer">Save Callback Endpoint</button>
                        </form>
                      </div>
                    )}

                  </div>

                  {/* STICKY BULK APPROVAL GESTURE SLIDER AT WORKSPACE */}
                  {mobileTab === 'authorisations' && (
                    <div className="absolute bottom-14 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent z-40 border-t border-slate-50">
                      <div className="max-w-[320px] mx-auto">
                        <div ref={sliderTrackRef} className="relative h-11 bg-[#edf2f7] rounded-full border border-slate-200 flex items-center justify-center p-1 overflow-hidden shadow-inner">
                          <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 rounded-l-full pointer-events-none" style={{ width: '100%' }} />
                          <motion.div
                            drag={selectedPendingCount > 0 ? "x" : false}
                            dragConstraints={{ left: 0, right: sliderWidth }}
                            dragElastic={0.02}
                            dragMomentum={false}
                            onDragEnd={(_, info) => { if (info.offset.x >= sliderWidth * 0.75) handleBulkApprove(); }}
                            className={`absolute left-1 z-20 w-9 h-9 rounded-full bg-[#059669] hover:bg-emerald-600 text-white flex items-center justify-center cursor-grab shadow-md ${selectedPendingCount === 0 ? 'opacity-40 cursor-not-allowed bg-slate-400' : ''}`}
                          >
                            <span className="text-sm font-extrabold tracking-tighter">»</span>
                          </motion.div>
                          <span className="text-[9px] font-black text-slate-500 select-none z-10 pl-6 uppercase tracking-wider">
                            {selectedPendingCount > 0 ? `Slide to Bulk Approve (${selectedPendingCount})` : 'Select items to slide'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PERSISTENT BOTTOM NAVIGATION TAB BAR (Dashboard, Payments, Workspace, Chat, Profile) */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-45">
                    <div className="grid grid-cols-5 h-14 pb-safe select-none">
                      <button onClick={() => { setMobileTab('dashboard'); setCurrentStoryScreen(1); }} className={`flex flex-col items-center justify-center text-slate-400 hover:text-slate-900 transition-colors ${[1, 2, 3, 4].includes(currentStoryScreen) ? 'text-emerald-600 font-extrabold' : ''}`}>
                        <LayoutDashboard className="w-4 h-4" /><span className="text-[8px] font-extrabold mt-1 tracking-tighter uppercase">Dashboard</span>
                      </button>
                      <button onClick={() => { setMobileTab('payments'); setCurrentStoryScreen(10); }} className={`flex flex-col items-center justify-center text-slate-400 hover:text-slate-900 transition-colors ${[5, 6, 7, 10].includes(currentStoryScreen) ? 'text-emerald-600 font-extrabold' : ''}`}>
                        <DollarSign className="w-4 h-4" /><span className="text-[8px] font-extrabold mt-1 tracking-tighter uppercase">Payments</span>
                      </button>
                      <button onClick={() => { setMobileTab('authorisations'); setCurrentStoryScreen(8); }} className={`flex flex-col items-center justify-center text-slate-400 hover:text-[#0c244c] transition-colors relative ${currentStoryScreen === 8 ? 'text-emerald-600 font-extrabold' : ''}`}>
                        <div className="relative">
                          <ShieldAlert className="w-4 h-4" />
                          {pendingItems.length > 0 && <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white rounded-full text-[7px] font-black w-3.5 h-3.5 flex items-center justify-center font-mono">{pendingItems.length}</span>}
                        </div>
                        <span className="text-[8px] font-extrabold mt-1 tracking-tighter uppercase">Workspace</span>
                      </button>
                      <button onClick={() => { setMobileTab('chat'); setCurrentStoryScreen(9); }} className={`flex flex-col items-center justify-center text-slate-400 hover:text-slate-900 transition-colors relative ${currentStoryScreen === 9 ? 'text-emerald-600 font-extrabold' : ''}`}>
                        <div className="relative">
                          <MessageSquare className="w-4 h-4" />
                          {walkieTalkieActive && walkieTalkieStep < 6 && <span className="absolute -top-1.5 -right-1.5 bg-indigo-500 w-2 h-2 rounded-full animate-ping" />}
                        </div>
                        <span className="text-[8px] font-extrabold mt-1 tracking-tighter uppercase">Chat</span>
                      </button>
                      <button onClick={() => { setMobileTab('profile'); setCurrentStoryScreen(11); }} className={`flex flex-col items-center justify-center text-slate-400 hover:text-slate-900 transition-colors ${currentStoryScreen === 11 ? 'text-emerald-600 font-extrabold' : ''}`}>
                        <User className="w-4 h-4" /><span className="text-[8px] font-extrabold mt-1 tracking-tighter uppercase">Profile</span>
                      </button>
                    </div>
                  </div>

                  {/* Backdrop success indicators */}
                  <AnimatePresence>
                    {isBulkApprovedFeedback && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0c244c]/95 flex flex-col items-center justify-center z-50 text-white p-6 text-center">
                        <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mb-3 shadow-xl"><Check className="w-7 h-7 text-slate-950 stroke-[3]" /></div>
                        <h3 className="text-base font-extrabold text-emerald-400">Release Completed</h3>
                        <p className="text-[10px] text-slate-300 mt-1 max-w-xs leading-relaxed font-semibold">Stitch bulk-release transactions processed and broadcast.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Context menu overlay for long-press payments gestures */}
                  <AnimatePresence>
                    {contextMenuPay && contextMenuPos && (
                      <>
                        <div onClick={() => { setContextMenuPay(null); setContextMenuPos(null); }} className="fixed inset-0 z-45" />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
                          className="absolute z-50 bg-[#0c244c] border border-slate-800 rounded-xl p-2.5 shadow-2xl flex flex-col gap-1 w-44 text-left select-none text-[11px]"
                        >
                          <button onClick={() => { handleTriggerAudit(contextMenuPay); setContextMenuPay(null); }} className="hover:bg-slate-800 py-1.5 px-2 rounded-lg flex items-center gap-1.5 font-bold text-teal-300"><Sparkle className="w-3.5 h-3.5" /> AI Compliance Audit</button>
                          <button onClick={() => { setToastNotification(`Sharing receipt for ${contextMenuPay.id}`); setContextMenuPay(null); }} className="hover:bg-slate-800 py-1.5 px-2 rounded-lg flex items-center gap-1.5 text-slate-300 font-bold"><Share2 className="w-3.5 h-3.5" /> Share Receipt</button>
                          <button onClick={() => { handleIndividualAction(contextMenuPay.id, 'Rejected'); setContextMenuPay(null); }} className="hover:bg-slate-800 py-1.5 px-2 rounded-lg flex items-center gap-1.5 text-rose-400 font-bold"><X className="w-3.5 h-3.5" /> Force Reject</button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                </div>
              </div>

            </div>

            {/* RIGHT COL: Gemini Compliance Workspace (AI auditor + logging) */}
            <div id="logs" className="col-span-1 lg:col-span-4 flex flex-col gap-5">
              
              <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 shadow-xl flex-1 flex flex-col min-h-[420px]">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-bold">Stitch AI Auditor</h3>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-bold">gemini-3.8-flash</span>
                </div>

                {selectedAudit ? (
                  <div className="flex-1 flex flex-col text-left">
                    <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-900 mb-4">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Workspace Item Focus</p>
                      <h4 className="text-sm font-bold text-slate-200 mt-1 font-bold">{selectedAudit.beneficiary}</h4>
                      <p className={`text-lg font-black font-mono text-slate-100 mt-1 tabular-nums ${blurBalances ? 'filter blur-sm select-none' : ''}`}>
                        {getCurrencySymbol(selectedCurrency)}{convertBalance(selectedAudit.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    {selectedAudit.summary ? (
                      <div className="flex flex-col gap-4 flex-1">
                        <div>
                          <div className="flex justify-between items-center mb-1 text-[11px] font-bold">
                            <span className="text-slate-400">Risk Severity Score</span>
                            <span className={`font-bold ${selectedAudit.riskScore! >= 7 ? 'text-rose-400' : (selectedAudit.riskScore! >= 4 ? 'text-amber-400' : 'text-emerald-400')}`}>
                              {selectedAudit.riskScore}/10 ({selectedAudit.auditRating})
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-900">
                            <div className={`h-full rounded-full transition-all duration-500 ${selectedAudit.riskScore! >= 7 ? 'bg-rose-500' : (selectedAudit.riskScore! >= 4 ? 'bg-amber-500' : 'bg-emerald-500')}`} style={{ width: `${selectedAudit.riskScore! * 10}%` }} />
                          </div>
                        </div>

                        <div className="bg-slate-950/40 rounded-lg p-3 border border-slate-900/60 text-xs font-semibold">
                          <p className="font-bold text-emerald-400 mb-1 flex items-center gap-1 font-bold"><Check className="w-3.5 h-3.5" /> Assessment Summary</p>
                          <p className="text-slate-300 leading-relaxed font-semibold">{selectedAudit.summary}</p>
                        </div>

                        <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-lg p-3 text-xs font-semibold">
                          <p className="font-bold text-indigo-300 mb-1">Audit Directive</p>
                          <p className="text-slate-300 leading-relaxed font-semibold">{selectedAudit.recommendation}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                        <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-4 font-semibold">Audit this payout against transaction profiles via standard AI checkpoints.</p>
                        <button onClick={() => handleTriggerAudit(selectedAudit)} disabled={auditingId === selectedAudit.id} className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow-lg cursor-pointer font-bold uppercase">{auditingId === selectedAudit.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Run compliance audit'}</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <SlidersHorizontal className="w-5 h-5 text-slate-700 mb-2" />
                    <p className="text-xs font-bold text-slate-400 font-bold">Auditor Standby</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Select any item inside the Workspace queue list or payments ledger to trigger intelligence compliance reviews.</p>
                  </div>
                )}
              </div>

              {/* Action Log Console */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 shadow-xl h-[180px] flex flex-col text-left">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800/80 mb-3">
                  <History className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-bold">Live Session Feed</h3>
                </div>
                <div className="flex-1 overflow-y-auto flex flex-col gap-2 font-mono text-[10px] text-slate-400">
                  {logs.map((log, index) => <div key={index} className="py-0.5 border-b border-slate-950/20 last:border-0 leading-relaxed">{log}</div>)}
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
            {/* Header controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/35 border border-slate-900 rounded-xl p-5 shadow-md">
              <div className="text-left">
                <p className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">Enterprise Console</p>
                <h1 className="text-xl font-black text-slate-100 mt-1 font-bold">Stitch Corporate Workspace</h1>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 shrink-0 font-bold">
                {['dashboard', 'payments', 'authorisations', 'chat', 'profile'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setDesktopTab(tab as any); addLog(`Switched desktop panel view to ${tab}.`); }}
                    className={`px-3 py-1.5 text-xs font-extrabold rounded-md transition-all capitalize cursor-pointer ${desktopTab === tab ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-100'}`}
                  >
                    {tab === 'authorisations' ? 'Workspace' : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content areas mapping for widescreen view */}
            {desktopTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn text-left font-bold">
                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5">
                  <p className="text-xs text-slate-400 uppercase">{activeBankAccount.bank} Balance</p>
                  <p className={`text-2xl font-black font-mono text-slate-100 mt-1 ${blurBalances ? 'filter blur-md select-none' : ''}`}>
                    {getCurrencySymbol(selectedCurrency)}{convertBalance(activeBankAccount.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5">
                  <p className="text-xs text-slate-400 uppercase">Future Projected Pool</p>
                  <p className={`text-2xl font-black font-mono text-indigo-400 mt-1 ${blurBalances ? 'filter blur-md select-none' : ''}`}>
                    {getCurrencySymbol(selectedCurrency)}{convertBalance(projectedBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5">
                  <p className="text-xs text-slate-400 uppercase">Released payout volume</p>
                  <p className={`text-2xl font-black font-mono text-emerald-400 mt-1 ${blurBalances ? 'filter blur-md select-none' : ''}`}>
                    {getCurrencySymbol(selectedCurrency)}{convertBalance(volumeStats.totalOutflow).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5">
                  <p className="text-xs text-slate-400 uppercase">Security compliance holds</p>
                  <p className="text-2xl font-black font-mono text-rose-400 mt-1">{volumeStats.pendingCount} flows</p>
                </div>
              </div>
            )}

            {/* Fallback tabs standard view placeholder */}
            {desktopTab !== 'dashboard' && (
              <div className="bg-slate-900/10 border border-slate-900/50 rounded-xl p-10 text-center text-slate-400">
                <Smartphone className="w-10 h-10 text-emerald-400 mx-auto mb-3 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-200">Interactive Simulation Active inside Mobile Sandbox!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                  To view exact visual filters, gestures, long-press contextual menus, persistent tabs, and SARB web hooks, toggle back to the <strong>Mobile Sandbox</strong> in the top header.
                </p>
                <button onClick={() => setDisplayMode('split-simulator')} className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-lg uppercase cursor-pointer">Switch to Mobile Sandbox</button>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================================= */}
      {/* ================================= GLOBAL MODALS ================================ */}
      {/* ================================================================================= */}

      {/* MODAL 0: INITIATE NEW PAYOUT FORM MODAL */}
      <AnimatePresence>
        {isCreatePaymentModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreatePaymentModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0c142c] border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-md w-[92%] z-50 text-left text-slate-100 font-semibold"
            >
              <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-black uppercase tracking-wider">Initiate New Payout</h3>
                </div>
                <button onClick={() => setIsCreatePaymentModalOpen(false)} className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-400"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleInitiateNewPayment} className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Beneficiary / Payee Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newPayee} 
                    onChange={e => setNewPayee(e.target.value)} 
                    placeholder="e.g. DHL Express Da Nang" 
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 outline-none focus:border-emerald-500 font-semibold" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Amount</label>
                    <input 
                      type="number" 
                      required 
                      step="any" 
                      value={newPayoutAmount} 
                      onChange={e => setNewPayoutAmount(e.target.value)} 
                      placeholder="0.00" 
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 outline-none focus:border-emerald-500 font-mono font-semibold" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Currency</label>
                    <select 
                      value={newCurrency} 
                      onChange={e => setNewCurrency(e.target.value)} 
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 outline-none focus:border-emerald-500 font-bold"
                    >
                      <option value="GBP">GBP (£)</option>
                      <option value="USD">USD ($)</option>
                      <option value="VND">VND (₫)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="ZAR">ZAR (R)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Payout Type</label>
                    <select 
                      value={newPayoutType} 
                      onChange={e => setNewPayoutType(e.target.value)} 
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 outline-none focus:border-emerald-500 font-semibold"
                    >
                      <option value="Supplier">Supplier Wire</option>
                      <option value="Payroll">Payroll</option>
                      <option value="Transfer">Internal Transfer</option>
                      <option value="Misc">Miscellaneous</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Urgency</label>
                    <select 
                      value={newPayoutUrgency} 
                      onChange={e => setNewPayoutUrgency(e.target.value)} 
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 outline-none focus:border-emerald-500 font-semibold"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Destination Bank IBAN / Route Code</label>
                  <input 
                    type="text" 
                    value={newIban} 
                    onChange={e => setNewIban(e.target.value)} 
                    placeholder="e.g. GB21LOYD30928172648392" 
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 outline-none focus:border-emerald-500 font-mono font-semibold" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Payment Memo / Purpose Notes</label>
                  <textarea 
                    value={newMemo} 
                    onChange={e => setNewMemo(e.target.value)} 
                    placeholder="e.g. Consignment terminal fee clearance" 
                    rows={2} 
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500 font-semibold resize-none scrollbar-none" 
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsCreatePaymentModalOpen(false)} 
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-extrabold rounded-lg text-center cursor-pointer font-bold transition-all border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2.5 bg-[#059669] hover:bg-emerald-600 text-white font-extrabold rounded-lg text-center cursor-pointer font-bold transition-all shadow-md shadow-emerald-500/10"
                  >
                    Submit & Queue
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================================================================================= */}
      {/* ================================= GLOBAL MODALS ================================ */}
      {/* ================================================================================= */}

      {/* MODAL 1: STITCH HELP & README MODAL (300ms FIXED ELEVATION MODAL) */}
      <AnimatePresence>
        {helpOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setHelpOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0c142c] border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-lg w-[90%] z-50 text-left"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <HelpCircle className="w-5 h-5" />
                  <h3 className="text-sm font-black uppercase tracking-wider">Stitch Integration Playbook</h3>
                </div>
                <button onClick={() => setHelpOpen(false)} className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-400"><X className="w-4 h-4" /></button>
              </div>

              <div className="flex flex-col gap-3 text-xs leading-relaxed text-slate-300 pr-1 max-h-[350px] overflow-y-auto">
                <p>💡 <strong>Navigation Settings:</strong> Toggle persistent tab menus at the bottom of the virtual iPhone display to slide across Dashboard, Payments, Workspace, Chat, and Profile screens.</p>
                <p>💡 <strong>Workspace Filters:</strong> Inside the Workspace approvals tab, use the dropdown filters to filter items dynamically by Urgency or Payout Type. Select All toggles to "Unselect All" upon consecutive clicks.</p>
                <p>💡 <strong>VIP Privacy Blur Mode:</strong> Click the eye icon next to balances inside the Dashboard to immediately apply privacy CSS filters to obfuscate all monetary valuations.</p>
                <p>💡 <strong>Walkie-Talkie Simulation:</strong> In the Chat tab, click "Start Walkie-Talkie Demo Story" to trigger airport compliance emergencies, record transcriptions via mic, and lock sketchy vendors.</p>
                <p>💡 <strong>Long-Press Gesture:</strong> Inside the Payments Tab, tap and hold on any ledger row for 700ms to trigger context utility overlays (AI Audits, sharing receipts).</p>
                <p>💡 <strong>Updating mockData:</strong> To tweak default lists, edit the structured `mockData` JSON variable situated on the upper lines of `/src/App.tsx` file inside the filesystem.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL 2: PENDING AUTHORISATION FULL-SCREEN DRILL-DOWN MODAL */}
      <AnimatePresence>
        {selectedItemForDetail && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItemForDetail(null)} className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 shadow-2xl max-w-md w-[92%] z-50 text-slate-900 flex flex-col font-medium"
            >
              <div className="flex justify-between items-start mb-4 pb-2 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedItemForDetail.type} request</span>
                  <h4 className="text-base font-black text-[#0c244c] leading-tight mt-0.5">{selectedItemForDetail.beneficiary}</h4>
                </div>
                <button onClick={() => setSelectedItemForDetail(null)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-800 cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              {/* Cash details */}
              <div className="bg-[#f1f5f9] rounded-2xl p-4 text-center mb-4">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Release Amount</p>
                <p className="text-2xl font-black font-mono text-[#0c244c] tracking-tight mt-1">
                  {getCurrencySymbol(selectedCurrency)}{convertBalance(selectedItemForDetail.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{selectedCurrency} exchange standard</p>
              </div>

              {/* Map Routing Animation Path (Visual SVG) */}
              <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 text-slate-100 mb-4 text-left">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-400 mb-2">
                  <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>Interactive Transfer Map Path</span>
                </div>
                
                <div className="h-20 bg-slate-900/60 rounded-xl relative flex items-center justify-between px-6 border border-slate-800/40">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-[9px]">ST</div>
                    <span className="text-[8px] text-slate-400">Stitch</span>
                  </div>

                  {/* Pulsing routed line path */}
                  <div className="flex-1 px-4 relative h-1 flex items-center">
                    <div className="w-full bg-slate-800 h-0.5 rounded" />
                    <svg className="absolute inset-x-0 h-4 overflow-visible" preserveAspectRatio="none">
                      <line 
                        x1="0" y1="8" x2="100%" y2="8" 
                        className={`stroke-emerald-400 stroke-2 stroke-dasharray [stroke-dasharray:4,4] ${animateTransferRoute ? 'animate-dash [animation-duration:1s]' : ''}`}
                      />
                    </svg>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-[9px]">RC</div>
                    <span className="text-[8px] text-slate-400">Recipient</span>
                  </div>
                </div>
              </div>

              {/* Complete parameters drilldown */}
              <div className="flex flex-col gap-2 mb-5 text-[11px] text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Transaction ID</span>
                  <span className="font-mono text-slate-800 font-bold">{selectedItemForDetail.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Target Bank Details</span>
                  <span className="text-slate-800 font-bold">Barclays VIP Acc · **9901</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Due Date Limit</span>
                  <span className="text-slate-800 font-bold">October 24, 2026</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Invoice Reference</span>
                  <span className="text-slate-800 font-bold">ST-INV-2234091</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Compliance Rating</span>
                  <span className={`font-bold ${selectedItemForDetail.status === 'Approved' ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {selectedItemForDetail.status}
                  </span>
                </div>
              </div>

              {/* Action commands */}
              {selectedItemForDetail.status === 'Pending' ? (
                <div className="flex flex-col gap-2 mt-auto">
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleIndividualAction(selectedItemForDetail.id, 'Rejected')}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-rose-600 font-black py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Reject Payout
                    </button>
                    <button 
                      onClick={() => {
                        // Trigger CSS path animation
                        setAnimateTransferRoute(true);
                        addLog(`MAP VIEW: Animating transfer payout route for transaction ${selectedItemForDetail.id}`);
                        setTimeout(() => {
                          handleIndividualAction(selectedItemForDetail.id, 'Approved');
                          setAnimateTransferRoute(false);
                        }, 1200);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/10"
                    >
                      {animateTransferRoute ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Approve & Release'}
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      setMobileTab('chat');
                      setSelectedItemForDetail(null);
                      setChatInput(`Could you audit transaction ${selectedItemForDetail.id} to ${selectedItemForDetail.beneficiary}?`);
                      addLog(`CHAT: Forwarded transaction ${selectedItemForDetail.id} query to Stitch Support.`);
                    }}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#0c244c] font-black py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Request Info / AI Audit
                  </button>
                </div>
              ) : (
                <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                  Transaction is archived as {selectedItemForDetail.status}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL 3: AI PAY CHIP INPUT POPUP SHEET */}
      <AnimatePresence>
        {aiPaymentOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAiPaymentOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0b1329] border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-sm w-[90%] z-50 text-left font-semibold text-slate-100"
            >
              <div className="flex justify-between items-start mb-3 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">AI Smart Payout</h3>
                </div>
                <button onClick={() => setAiPaymentOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-[11px] text-slate-400 mb-4 leading-normal">
                Describe a transaction payment instructions naturally (e.g. *"Pay £12,500 to Global Supplies for aggregated aggregate aggregates"*).
              </p>

              <form onSubmit={handleSendAiPay} className="flex flex-col gap-3.5">
                <textarea
                  required
                  rows={3}
                  value={aiPromptInput}
                  onChange={e => setAiPromptInput(e.target.value)}
                  placeholder="e.g. pay $4,500 to AWS hosting pool"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-emerald-500 placeholder-slate-600 leading-normal"
                />

                <button
                  type="submit"
                  disabled={isAiProcessing}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-black py-2.5 rounded-lg text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isAiProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Dispatch AI Payout</>}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL 4: INSTANT EFT PAY-IN REPLENISH OVERLAY SHEET */}
      <AnimatePresence>
        {eftPayInOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEftPayInOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0b1329] border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-sm w-[90%] z-50 text-left font-semibold text-slate-100"
            >
              <div className="flex justify-between items-start mb-3 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CreditCard className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Instant EFT Pay-In</h3>
                </div>
                <button onClick={() => setEftPayInOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-[11px] text-slate-400 mb-4 leading-normal font-semibold text-slate-400">
                Simulate a real-time Instant EFT deposit to replenish your active **{activeBankAccount.bank}** account balance instantly.
              </p>

              <form onSubmit={handleEftPayIn} className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-[8px] uppercase tracking-wider text-slate-400 mb-1 font-bold">Originating Bank</label>
                  <select 
                    value={eftOriginBank} 
                    onChange={e => setEftOriginBank(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    <option value="First National Bank (FNB)">First National Bank (FNB)</option>
                    <option value="Standard Bank">Standard Bank</option>
                    <option value="Capitec Bank">Capitec Bank</option>
                    <option value="Nedbank">Nedbank</option>
                    <option value="ABSA Bank">ABSA Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-wider text-slate-400 mb-1 font-bold">Deposit Amount (USD)</label>
                  <input
                    type="number"
                    required
                    value={eftAmount}
                    onChange={e => setEftAmount(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-emerald-500 text-slate-100 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 rounded-lg text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer mt-1 font-bold"
                >
                  <Check className="w-4 h-4 stroke-[3]" /> Complete Instant EFT
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dynamic notifications toast */}
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
