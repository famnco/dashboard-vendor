/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  Package, 
  Instagram, 
  Phone, 
  ExternalLink, 
  Search, 
  Filter,
  ArrowUpRight,
  Loader2,
  RefreshCcw,
  LayoutDashboard,
  Database,
  Menu,
  X,
  Settings,
  Image as ImageIcon,
  ChevronRight,
  LogOut,
  Bell,
  Printer,
  FileText,
  Save,
  CheckCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';
import { Booking } from './types';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PACKAGE_PRICES: Record<string, number> = {
  'Default': 500000,
  'Merry Prewedding': 500000,
  'Emerald Package': 500000,
  'Simple Engagement': 500000,
  'Diamond Package': 500000,
};

// Mock data based on the user's image
const MOCK_DATA: Booking[] = [
  {
    timestamp: '5/8/2026 18:57:13',
    email: 'almiral773@gmail.com',
    occasion: 'Prewedding',
    package: 'Merry Prewedding',
    coupleName: 'Rama & Mira',
    dateVenue: '26 Mei 2026 | Laras Asri',
    instagram: '@almiralivia_',
    phone: '085707409621',
    proofLink: 'https://drive.google.com/test1',
    price: 500000,
    downPayment: 200000,
    id: 'INV-001'
  },
  {
    timestamp: '5/9/2026 10:30:00',
    email: 'john@example.com',
    occasion: 'Wedding',
    package: 'Emerald Package',
    coupleName: 'John & Jane',
    dateVenue: '15 June 2026 | Grand Hyatt',
    instagram: '@johnjane_wed',
    phone: '08123456789',
    proofLink: 'https://drive.google.com/test2',
    price: 500000,
    downPayment: 500000,
    id: 'INV-002'
  },
  {
    timestamp: '5/10/2026 14:15:00',
    email: 'sara@gmail.com',
    occasion: 'Engagement',
    package: 'Simple Engagement',
    coupleName: 'Sara & Adi',
    dateVenue: '01 July 2026 | Plataran',
    instagram: '@sara_adi',
    phone: '08987654321',
    proofLink: 'https://drive.google.com/test3',
    price: 500000,
    downPayment: 150000,
    id: 'INV-003'
  },
  {
    timestamp: '5/11/2026 09:00:00',
    email: 'budi@gmail.com',
    occasion: 'Wedding',
    package: 'Diamond Package',
    coupleName: 'Budi & Ani',
    dateVenue: '20 July 2026 | Mulia Resort',
    instagram: '@budiani_forever',
    phone: '081122334455',
    proofLink: 'https://drive.google.com/test4',
    price: 500000,
    downPayment: 300000,
    id: 'INV-004'
  }
];

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

type ViewType = 'overview' | 'database' | 'settings';

export default function App() {
  const [data, setData] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gasUrl, setGasUrl] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<{
    booking: Booking | null;
    price: number;
    dp: number;
    additional: string;
  }>({ booking: null, price: 500000, dp: 0, additional: '' });
  const [savingRows, setSavingRows] = useState<Record<string, boolean>>({});

  const [filters, setFilters] = useState<Record<keyof Booking, string>>({
    timestamp: '',
    email: '',
    occasion: '',
    package: '',
    coupleName: '',
    dateVenue: '',
    instagram: '',
    phone: '',
    proofLink: ''
  });

  const fetchData = async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch data');
      const json = await response.json();
      setData(json);
      setUseMock(false);
    } catch (err) {
      setError('Could not connect to Google Sheets. Using mock data instead.');
      setData(MOCK_DATA);
      setUseMock(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (gasUrl) {
      fetchData(gasUrl);
    } else {
      setData(MOCK_DATA);
      setIsLoading(false);
    }
  }, [gasUrl]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchMatch = !searchTerm || 
        item.coupleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.occasion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase());

      const colFiltersMatch = Object.entries(filters).every(([key, value]) => {
        const filterVal = String(value);
        if (!filterVal) return true;
        const itemValue = String(item[key as keyof Booking] || '').toLowerCase();
        return itemValue.includes(filterVal.toLowerCase());
      });

      return searchMatch && colFiltersMatch;
    });
  }, [data, searchTerm, filters]);

  const handleFilterChange = (key: keyof Booking, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      timestamp: '',
      email: '',
      occasion: '',
      package: '',
      coupleName: '',
      dateVenue: '',
      instagram: '',
      phone: '',
      proofLink: ''
    });
    setSearchTerm('');
  };

  const updateBooking = (booking: Booking, field: keyof Booking, value: any) => {
    setData(prev => prev.map(b => {
      if (b === booking) {
        return { ...b, [field]: value };
      }
      return b;
    }));
  };

  const handleSaveRow = (booking: Booking) => {
    const id = booking.id || booking.coupleName;
    setSavingRows(prev => ({ ...prev, [id]: true }));
    
    // Simulate save delay
    setTimeout(() => {
      setSavingRows(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const stats = useMemo(() => {
    const occasionMap: Record<string, number> = {};
    const dateMap: Record<string, number> = {};
    let totalRevenue = 0;

    data.forEach(item => {
      occasionMap[item.occasion] = (occasionMap[item.occasion] || 0) + 1;
      const dateParts = item.timestamp.split(' ')[0].split('/');
      const month = dateParts[0] + '/' + dateParts[2];
      dateMap[month] = (dateMap[month] || 0) + 1;
      
      const price = item.price || PACKAGE_PRICES[item.package] || PACKAGE_PRICES['Default'] || 500000;
      totalRevenue += price;
    });

    const pieData = Object.entries(occasionMap).map(([name, value]) => ({ name, value }));
    const barData = Object.entries(dateMap).map(([name, count]) => ({ name, count })).sort();

    return { total: data.length, pieData, barData, byOccasion: occasionMap, totalRevenue };
  }, [data]);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const MASTER_GDRIVE_URL = "https://drive.google.com/drive/folders/1CMziKNSwPKEN6PJlPQBGkemvZpKlaxRKSPPfgO4UgRVL6w0uJxXKyZzwnali_8seenK_cUl4";

  const printInvoice = (booking: Booking, customPrice?: number, customDp?: number, additional?: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const price = customPrice !== undefined ? customPrice : (booking.price || PACKAGE_PRICES[booking.package] || PACKAGE_PRICES['Default'] || 500000);
    const dp = customDp !== undefined ? customDp : (booking.downPayment || 0);
    const remaining = Math.max(0, price - dp);

    const formatCurrency = (num: number) => 
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${booking.coupleName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Montserrat:wght@500;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 60px; line-height: 1.5; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid #f1f5f9; padding-bottom: 40px; margin-bottom: 50px; }
            .brand { }
            .brand-name { font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 500; color: #DFD0C0; letter-spacing: -1px; text-transform: lowercase; }
            .brand-sub { font-size: 9px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; margin-top: -2px; }
            .invoice-label { font-size: 40px; font-weight: 900; color: #f1f5f9; text-transform: uppercase; line-height: 1; }
            
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-bottom: 60px; }
            .meta-box h3 { font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
            .meta-content { font-size: 14px; font-weight: 500; }
            .meta-content strong { color: #0f172a; font-weight: 800; display: block; font-size: 16px; margin-bottom: 4px; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { text-align: left; padding: 20px; font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
            td { padding: 24px 20px; border-bottom: 1px solid #f8fafc; font-size: 14px; }
            
            .additional-notes { padding: 20px; border: 1px dashed #e2e8f0; border-radius: 12px; font-size: 12px; color: #64748b; margin-bottom: 40px; }
            .additional-notes h4 { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin: 0 0 8px 0; }
            
            .summary { margin-left: auto; width: 350px; }
            .summary-row { display: flex; justify-content: space-between; padding: 4px 0; }
            .summary-label { font-size: 12px; font-weight: 700; color: #64748b; }
            .summary-value { font-size: 14px; font-weight: 800; color: #1e293b; }
            .summary-total { border-top: 2px solid #f1f5f9; margin-top: 12px; padding-top: 20px; }
            .summary-total .summary-label { font-size: 14px; color: #0f172a; font-weight: 900; }
            .summary-total .summary-value { font-size: 20px; color: #7c3aed; font-weight: 900; }
            
            .footer { margin-top: 100px; padding-top: 40px; border-top: 1px solid #f1f5f9; text-align: center; }
            .footer p { margin: 4px 0; font-size: 11px; font-weight: 600; color: #94a3b8; }
            
            @media print {
              body { padding: 40px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">
              <div class="brand-name">famnco_</div>
              <div class="brand-sub">Professional Visuals</div>
            </div>
            <div class="invoice-label">Invoice</div>
          </div>

          <div class="meta">
            <div class="meta-box">
              <h3>Client Information</h3>
              <div class="meta-content">
                <strong>${booking.coupleName}</strong>
                ${booking.email}<br>
                ${booking.phone}<br>
                IG: ${booking.instagram}
              </div>
            </div>
            <div class="meta-box" style="text-align: right;">
              <h3>Payment Details</h3>
              <div class="meta-content">
                <strong>#${booking.id || 'INV-' + Math.random().toString(36).substr(2, 9).toUpperCase()}</strong>
                Issued: ${new Date(booking.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br>
                Event: ${booking.occasion}
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Service Description</th>
                <th style="text-align: center;">Venue & Schedule</th>
                <th style="text-align: right;">Base Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style="font-weight: 800; color: #0f172a; margin-bottom: 4px;">${booking.package}</div>
                  <div style="font-size: 11px; color: #64748b;">Complete coverage for ${booking.occasion} with professional post-processing.</div>
                </td>
                <td style="text-align: center; color: #475569; font-weight: 500;">${booking.dateVenue}</td>
                <td style="text-align: right; font-weight: 800; color: #0f172a;">${formatCurrency(price)}</td>
              </tr>
            </tbody>
          </table>

          ${additional ? `
            <div class="additional-notes">
              <h4>Additional Notes</h4>
              ${additional.replace(/\n/g, '<br>')}
            </div>
          ` : ''}

          <div class="summary">
            <div class="summary-row">
              <span class="summary-label">Subtotal</span>
              <span class="summary-value">${formatCurrency(price)}</span>
            </div>
            <div class="summary-row" style="color: #059669;">
              <span class="summary-label" style="color: #059669;">Down Payment (DP)</span>
              <span class="summary-value">-${formatCurrency(dp)}</span>
            </div>
            
            <div class="summary-total">
               <div class="summary-row">
                <span class="summary-label">Final Balance Due</span>
                <span class="summary-value">${formatCurrency(remaining)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for trusting famnco_.</p>
          </div>

          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex">
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 z-[60] lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-[70] bg-white border-r border-slate-200 transition-all duration-300 flex flex-col",
        isSidebarOpen ? "w-64" : "w-20",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        !isSidebarOpen && "lg:w-20"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-slate-50 gap-3">
          <div className="bg-violet-600 p-1.5 rounded-lg shrink-0">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="font-bold text-lg tracking-tight whitespace-nowrap overflow-hidden"
            >
              Famo Photo
            </motion.span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id as ViewType);
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                activeView === item.id 
                  ? "bg-violet-50 text-violet-700" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0 transition-transform group-active:scale-90")} />
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="font-medium text-sm"
                >
                  {item.label}
                </motion.span>
              )}
              {activeView === item.id && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-6 bg-violet-600 rounded-r-full"
                />
              )}
            </button>
          ))}

          {/* New specific link for Bukti DP Folder */}
          <div className="mt-8 pt-8 border-t border-slate-50">
            <a
              href={MASTER_GDRIVE_URL}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-violet-50 hover:text-violet-700 transition-all group",
              )}
            >
              <ExternalLink className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-violet-600" />
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="font-medium text-sm"
                >
                  G-Drive Bukti DP
                </motion.span>
              )}
            </a>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
           <button
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors"
           >
             <ChevronRight className={cn("w-5 h-5 transition-transform duration-300", isSidebarOpen && "rotate-180")} />
             {isSidebarOpen && <span className="text-sm font-medium">Collapse</span>}
           </button>
           <button className="w-full flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg mt-2 transition-colors">
             <LogOut className="w-5 h-5" />
             {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
           </button>
        </div>
      </aside>

      <div className={cn(
        "flex-1 transition-all duration-300 min-w-0 h-screen overflow-y-auto",
        "lg:ml-64",
        !isSidebarOpen && "lg:ml-20"
      )}>
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-800 capitalize">{activeView}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-full px-4 py-1.5 border border-slate-200 focus-within:border-violet-300 focus-within:ring-1 focus-within:ring-violet-300 transition-all">
              <input 
                type="text" 
                placeholder="Google Script URL..." 
                className="bg-transparent border-none focus:ring-0 text-xs w-48 lg:w-64 outline-none"
                value={gasUrl}
                onChange={(e) => setGasUrl(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => gasUrl ? fetchData(gasUrl) : window.location.reload()}
                className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500 relative group"
                title="Refresh Data"
              >
                <RefreshCcw className={cn("w-5 h-5", isLoading && "animate-spin")} />
                <span className="absolute -top-1 -right-1 bg-violet-500 w-2 h-2 rounded-full hidden group-hover:block border-2 border-white" />
              </button>
              <button className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                <Bell className="w-5 h-5" />
              </button>
            </div>
            
            <div className="w-px h-6 bg-slate-200 mx-1" />
            
            <div className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-violet-100">
                FA
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
          {activeView === 'overview' && (
            <>
              {useMock && !isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-sm"
                >
                  <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Demo Mode</p>
                    <p className="text-xs opacity-80">Masukkan URL Apps Script di bagian atas untuk menghubungkan data Google Sheet Anda.</p>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                <StatsCard title="Total Bookings" value={stats.total} icon={<Calendar className="w-5 h-5 text-violet-600" />} description="All recorded entries" trend="+12%" />
                <StatsCard 
                  title="Total Revenue" 
                  value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats.totalRevenue).replace('Rp', 'IDR')} 
                  icon={<FileText className="w-5 h-5 text-emerald-600" />} 
                  description="Global earnings" 
                  trend="+24%" 
                />
                <StatsCard title="Prewedding" value={stats.byOccasion['Prewedding'] || 0} icon={<Users className="w-5 h-5 text-pink-600" />} description="Leads in pipeline" trend="+5%" />
                <StatsCard title="Wedding" value={stats.byOccasion['Wedding'] || 0} icon={<Package className="w-5 h-5 text-blue-600" />} description="Primary service" trend="+2%" />
                <StatsCard title="Engagement" value={stats.byOccasion['Engagement'] || 0} icon={<Instagram className="w-5 h-5 text-orange-600" />} description="Social growth" trend="+18%" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm transition-all hover:shadow-md">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Growth</h3>
                  <h2 className="text-2xl font-bold tracking-tight mb-8">Booking History</h2>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.barData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                        <Tooltip cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="count" fill="url(#colorBar)" radius={[6, 6, 0, 0]} barSize={32} />
                        <defs><linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.4}/></linearGradient></defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm transition-all hover:shadow-md flex flex-col">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Market</h3>
                  <h2 className="text-2xl font-bold tracking-tight mb-8">Lead Distribution</h2>
                  <div className="h-[350px] w-full flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value">
                          {stats.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeView === 'database' && (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Records</h3>
                    <h2 className="text-3xl font-bold tracking-tight">Booking Database</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl w-full md:w-80 outline-none transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-2xl border transition-all text-sm font-bold", showFilters ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200")}>
                      <Filter className="w-4 h-4" /> Filter
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <FilterField label="Email" value={filters.email} onChange={(v) => handleFilterChange('email', v)} />
                      <FilterField label="Occasion" value={filters.occasion} onChange={(v) => handleFilterChange('occasion', v)} />
                      <FilterField label="Package" value={filters.package} onChange={(v) => handleFilterChange('package', v)} />
                      <FilterField label="Couple" value={filters.coupleName} onChange={(v) => handleFilterChange('coupleName', v)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="overflow-x-auto p-2">
                <table className="w-full text-left min-w-[1200px] lg:min-w-0">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Owner</th>
                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</th>
                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Product</th>
                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Timeline</th>
                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Down Payment</th>
                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Price</th>
                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Additional</th>
                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {!isLoading && filteredData.map((booking, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 group transition-all duration-200">
                        <td className="px-4 py-4">
                          <div className="font-bold text-slate-900 text-sm whitespace-nowrap">{booking.coupleName}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{booking.email}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border whitespace-nowrap", 
                            booking.occasion === 'Wedding' ? "bg-blue-50 text-blue-600 border-blue-100" : 
                            booking.occasion === 'Prewedding' ? "bg-pink-50 text-pink-600 border-pink-100" : "bg-orange-50 text-orange-600 border-orange-100")}>
                            {booking.occasion}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-600 whitespace-nowrap"><Package className="w-3 h-3 inline mr-1 text-slate-300" />{booking.package}</td>
                        <td className="px-4 py-4 text-xs text-slate-600 whitespace-nowrap"><Calendar className="w-3 h-3 inline mr-1 text-slate-300" />{booking.dateVenue}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-bold">Rp</span>
                            <input 
                              type="number"
                              value={booking.downPayment || 0}
                              onChange={(e) => updateBooking(booking, 'downPayment', Number(e.target.value))}
                              className="w-20 bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-xs font-bold text-emerald-600 outline-none focus:ring-1 focus:ring-violet-300 transition-all"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-bold">Rp</span>
                            <input 
                              type="number"
                              value={booking.price || PACKAGE_PRICES[booking.package] || PACKAGE_PRICES['Default'] || 500000}
                              onChange={(e) => updateBooking(booking, 'price', Number(e.target.value))}
                              className="w-20 bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-xs font-bold text-slate-900 outline-none focus:ring-1 focus:ring-violet-300 transition-all"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <input 
                            type="text"
                            value={booking.additional || ''}
                            placeholder="Notes..."
                            onChange={(e) => updateBooking(booking, 'additional', e.target.value)}
                            className="w-full min-w-[120px] bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-[11px] text-slate-600 outline-none focus:ring-1 focus:ring-violet-300 transition-all"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <a 
                              href={booking.proofLink} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-violet-600 hover:text-white transition-all"
                              title="View Proof"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button 
                              onClick={() => {
                                const basePrice = booking.price || PACKAGE_PRICES[booking.package] || PACKAGE_PRICES['Default'] || 500000;
                                const dp = booking.downPayment || 0;
                                setEditingInvoice({ 
                                  booking, 
                                  price: basePrice, 
                                  dp, 
                                  additional: booking.additional || '' 
                                });
                                setIsInvoiceModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-600 hover:text-white transition-all"
                              title="Invoice"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => {
                                const basePrice = booking.price || PACKAGE_PRICES[booking.package] || PACKAGE_PRICES['Default'] || 500000;
                                printInvoice(booking, basePrice, basePrice, booking.additional || 'STATUS: LUNAS / PAID IN FULL');
                              }}
                              className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                              title="Lunas"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleSaveRow(booking)}
                              className={cn(
                                "p-2 rounded-lg transition-all",
                                savingRows[booking.id || booking.coupleName] 
                                  ? "bg-amber-50 text-amber-600" 
                                  : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                              )}
                              title="Save"
                            >
                              {savingRows[booking.id || booking.coupleName] ? (
                                <CheckCheck className="w-3.5 h-3.5 animate-in zoom-in duration-300" />
                              ) : (
                                <Save className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'settings' && (
            <div className="max-w-3xl mx-auto bg-white p-12 rounded-[3rem] border border-slate-200">
              <h2 className="text-3xl font-black tracking-tight mb-8">System Configuration</h2>
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-800 uppercase tracking-widest">Connect Data Pipeline</label>
                  <input type="text" placeholder="Apps Script URL" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-medium" value={gasUrl} onChange={(e) => setGasUrl(e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Invoice Editor Modal */}
      <AnimatePresence>
        {isInvoiceModalOpen && editingInvoice.booking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsInvoiceModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
            >
              <div className="mb-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Print Setup</h3>
                <h2 className="text-2xl font-black tracking-tight">Invoice Details</h2>
                <p className="text-sm text-slate-500 mt-2">Adjust pricing for <strong>{editingInvoice.booking.coupleName}</strong></p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Base Price (IDR)</label>
                  <input 
                    type="number" 
                    value={editingInvoice.price}
                    onChange={(e) => setEditingInvoice(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-bold text-lg"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Down Payment (IDR)</label>
                  <input 
                    type="number" 
                    value={editingInvoice.dp}
                    onChange={(e) => setEditingInvoice(prev => ({ ...prev, dp: Number(e.target.value) }))}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-bold text-lg"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Additional Info / Terms</label>
                  <textarea 
                    value={editingInvoice.additional}
                    onChange={(e) => setEditingInvoice(prev => ({ ...prev, additional: e.target.value }))}
                    placeholder="E.g. Transport fees, specific deliverables, or custom terms..."
                    rows={3}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-medium text-sm resize-none"
                  />
                </div>

                <div className="bg-violet-50 p-6 rounded-3xl border border-violet-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">Remaining Balance</span>
                    <span className="text-xl font-black text-violet-700">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Math.max(0, editingInvoice.price - editingInvoice.dp))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-3">
                <button 
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (editingInvoice.booking) {
                      printInvoice(editingInvoice.booking, editingInvoice.price, editingInvoice.dp, editingInvoice.additional);
                      setIsInvoiceModalOpen(false);
                    }
                  }}
                  className="flex-[2] flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200 transition-all"
                >
                  <Printer className="w-5 h-5" />
                  Print Invoice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatsCard({ title, value, icon, description, trend }: { title: string, value: number | string, icon: React.ReactNode, description: string, trend?: string }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 hover:shadow-xl transition-all duration-500 group">
      <div className="flex justify-between items-center mb-6">
        <div className="p-3.5 bg-slate-50 rounded-2xl group-hover:bg-violet-600 group-hover:text-white transition-colors duration-500">{icon}</div>
        {trend && <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">{trend}</span>}
      </div>
      <div>
        <h4 className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1.5">{title}</h4>
        <div className={cn(
          "font-black tracking-tighter mb-1.5 text-slate-900 leading-none transition-all",
          String(value).length > 15 ? "text-lg" : 
          String(value).length > 12 ? "text-xl" : 
          String(value).length > 8 ? "text-2xl" : 
          "text-3xl"
        )}>
          {value}
        </div>
        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FilterField({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <input type="text" placeholder={placeholder || `...`} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-violet-500 outline-none transition-all shadow-sm" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
