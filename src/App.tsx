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
  RefreshCw,
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
  CheckCheck,
  Moon,
  Sun,
  Camera,
  User,
  ClipboardList,
  CalendarDays
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
import { motion, AnimatePresence } from 'motion/react';
import { Booking } from './types';
import Login from './components/Login';
import { cn } from './lib/utils';

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
    id: 'INV-001',
    progressStatus: 'UPCOMING'
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
    id: 'INV-002',
    progressStatus: 'SELECTION AND EDITING'
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
    id: 'INV-003',
    progressStatus: 'PRINTING'
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
    id: 'INV-004',
    progressStatus: 'DELIVERING'
  }
];

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

type ViewType = 'overview' | 'database' | 'calendar' | 'status' | 'settings';

export default function App() {
  const [data, setData] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gasUrl, setGasUrl] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('famo-logged-in') === 'true');
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
  
  // New Settings State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('famo-theme') as 'light' | 'dark') || 'light';
  });
  const [appName, setAppName] = useState(() => localStorage.getItem('famo-appname') || 'Famo Photo');
  const [profileImage, setProfileImage] = useState<string | null>(() => localStorage.getItem('famo-profile'));
  const [calendarUrl, setCalendarUrl] = useState(() => localStorage.getItem('famo-calendar-url') || '');
  const [targetCalendarId, setTargetCalendarId] = useState(() => localStorage.getItem('famo-target-calendar-id') || 'primary');

  useEffect(() => {
    localStorage.setItem('famo-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('famo-appname', appName);
  }, [appName]);

  useEffect(() => {
    localStorage.setItem('famo-calendar-url', calendarUrl);
  }, [calendarUrl]);

  useEffect(() => {
    localStorage.setItem('famo-target-calendar-id', targetCalendarId);
  }, [targetCalendarId]);

  useEffect(() => {
    if (profileImage) localStorage.setItem('famo-profile', profileImage);
  }, [profileImage]);

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

  const sortedJobs = useMemo(() => {
    return [...data].sort((a, b) => {
      const dateMatchA = a.dateVenue.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
      const dateMatchB = b.dateVenue.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
      
      const [dA, mA, yA] = dateMatchA ? dateMatchA[0].split('/').map(Number) : [0, 0, 0];
      const [dB, mB, yB] = dateMatchB ? dateMatchB[0].split('/').map(Number) : [0, 0, 0];
      
      const dateA = yA ? new Date(yA, mA - 1, dA) : new Date(0);
      const dateB = yB ? new Date(yB, mB - 1, dB) : new Date(0);
      
      return dateB.getTime() - dateA.getTime();
    });
  }, [data]);

  const updateBooking = (booking: Booking, field: keyof Booking, value: any) => {
    setData(prev => prev.map(b => {
      if (b === booking) {
        const updated = { ...b, [field]: value };
        if (field === 'progressStatus' && value === 'DELIVERING' && !b.deliveryDate) {
          updated.deliveryDate = new Date().toISOString();
        }
        return updated;
      }
      return b;
    }));
  };

  const getOccasionStyles = (occasion: string, theme: 'light' | 'dark') => {
    const isDark = theme === 'dark';
    const cleanOccasion = (occasion || '').trim();
    if (cleanOccasion === 'Wedding') {
      return isDark ? "bg-emerald-900/30 text-emerald-400 border-emerald-900/50" : "bg-emerald-50 text-emerald-600 border-emerald-100";
    }
    if (cleanOccasion === 'Prewedding') {
      return isDark ? "bg-violet-900/30 text-violet-400 border-violet-900/50" : "bg-violet-50 text-violet-600 border-violet-100";
    }
    if (cleanOccasion === 'Engagement' || cleanOccasion === 'Lamaran') {
      return isDark ? "bg-amber-900/30 text-amber-400 border-amber-900/50" : "bg-amber-50 text-amber-600 border-amber-100";
    }
    return isDark ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-50 text-slate-500 border-slate-200";
  };

  const handleSaveRow = async (booking: Booking) => {
    const id = booking.id || booking.coupleName;
    setSavingRows(prev => ({ ...prev, [id]: true }));
    
    if (!gasUrl || useMock) {
      // Simulate save delay for mock mode
      setTimeout(() => {
        setSavingRows(prev => ({ ...prev, [id]: false }));
      }, 1000);
      return;
    }

    try {
      // Using no-cors because GAS redirect causes opaque response, 
      // but we need to send data. For real response, GAS needs careful handling.
      // However, typical implementation for GAS is to use a form-like POST.
      await fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors', // Standard workaround for GAS redirects
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ ...booking, targetCalendarId })
      });
      
      // Since mode is no-cors, we won't know if it actually succeeded on the server,
      // but we assume success if the request was sent without error.
      setTimeout(() => {
        setSavingRows(prev => ({ ...prev, [id]: false }));
      }, 1000);
      alert('Syncing with Sheets & Calendar...');
    } catch (err) {
      console.error('Failed to save:', err);
      setSavingRows(prev => ({ ...prev, [id]: false }));
      alert('Gagal menyimpan ke Google Sheets. Pastikan URL benar dan sudah di-publish.');
    }
  };

  const handleStatClick = (type: 'total' | 'occasion', value?: string) => {
    resetFilters();
    if (type === 'occasion' && value) {
      setFilters(prev => ({ ...prev, occasion: value }));
    }
    setActiveView('database');
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
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'status', label: 'Status', icon: ClipboardList },
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

  const printRecap = (booking: Booking) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Use regex to extract date from strings like "11/12/2026 @ Villa" (Assuming DD/MM/YYYY)
    const dateMatch = booking.dateVenue.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    let startDate: Date;
    
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]);
      const year = parseInt(dateMatch[3]);
      startDate = new Date(year, month - 1, day);
    } else {
      // Fallback: try parsing timestamp
      const tsDateStr = booking.timestamp.split(' ')[0] || '';
      const tsMatch = tsDateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (tsMatch) {
        startDate = new Date(parseInt(tsMatch[3]), parseInt(tsMatch[2]) - 1, parseInt(tsMatch[1]));
      } else {
        startDate = new Date(booking.timestamp);
      }
    }
    
    // Set to start of day for accurate day difference
    startDate.setHours(0, 0, 0, 0);
    
    // If invalid date, default to now
    if (isNaN(startDate.getTime())) {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    }

    const endDate = booking.deliveryDate ? new Date(booking.deliveryDate) : new Date();
    // Also set to end/noon of day for inclusive difference if needed, or just keep as is
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    printWindow.document.write(`
      <html>
        <head>
          <title>Job Recap - ${booking.coupleName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Montserrat:wght@500;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 60px; line-height: 1.5; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid #f1f5f9; padding-bottom: 40px; margin-bottom: 50px; }
            .brand-name { font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 500; color: #DFD0C0; letter-spacing: -1px; text-transform: lowercase; }
            .brand-sub { font-size: 9px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; }
            .invoice-label { font-size: 40px; font-weight: 900; color: #f1f5f9; text-transform: uppercase; line-height: 1; }
            
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-bottom: 60px; }
            .meta-box h3 { font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
            .meta-content { font-size: 14px; font-weight: 500; }
            .meta-content strong { color: #0f172a; font-weight: 800; display: block; font-size: 16px; margin-bottom: 4px; }
            
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
            .stat-card { border: 1px solid #f1f5f9; padding: 24px; text-align: center; border-radius: 20px; }
            .stat-card h4 { font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; }
            .stat-card .value { font-size: 18px; font-weight: 900; color: #7c3aed; }
            
            .detail-row { display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #f8fafc; }
            .detail-label { font-size: 12px; font-weight: 700; color: #64748b; }
            .detail-value { font-size: 12px; font-weight: 900; color: #1e293b; }
            
            .footer { margin-top: 100px; padding-top: 40px; border-top: 1px solid #f1f5f9; text-align: center; }
            .footer p { margin: 4px 0; font-size: 11px; font-weight: 600; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">
              <div class="brand-name">famnco_</div>
              <div class="brand-sub">Professional Visuals</div>
            </div>
            <div class="invoice-label">Recap</div>
          </div>

          <div class="meta">
            <div class="meta-box">
              <h3>Client</h3>
              <div class="meta-content">
                <strong>${booking.coupleName}</strong>
                ${booking.occasion} - ${booking.package}
              </div>
            </div>
            <div class="meta-box" style="text-align: right;">
              <h3>Report ID</h3>
              <div class="meta-content">
                <strong>RECAP-${booking.id || 'N/A'}</strong>
                Generated: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <h4>Start Date</h4>
              <div class="value">${startDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
            </div>
            <div class="stat-card">
              <h4>End Date</h4>
              <div class="value">${endDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
            </div>
            <div class="stat-card">
              <h4>Duration</h4>
              <div class="value">${diffDays} Days</div>
            </div>
          </div>

          <div style="margin-bottom: 40px;">
            <h3 style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 20px;">Project Details</h3>
            <div class="detail-row"><span class="detail-label">Client Name</span><span class="detail-value">${booking.coupleName}</span></div>
            <div class="detail-row"><span class="detail-label">Event Category</span><span class="detail-value">${booking.occasion}</span></div>
            <div class="detail-row"><span class="detail-label">Selected Package</span><span class="detail-value">${booking.package}</span></div>
            <div class="detail-row"><span class="detail-label">Venue</span><span class="detail-value">${booking.dateVenue}</span></div>
            <div class="detail-row"><span class="detail-label">Final Status</span><span class="detail-value">${booking.progressStatus || 'DELIVERING'}</span></div>
          </div>

          <div class="footer">
            <p>famnco_ studio | Report automatically generated</p>
          </div>
          
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const handleSyncAll = async () => {
    if (!gasUrl) {
      alert("Please configure Google Apps Script URL in Settings first.");
      return;
    }

    if (!confirm("This will sync all listed jobs to your Google Calendar. Continue?")) return;

    setIsSyncingAll(true);
    let successCount = 0;
    
    try {
      for (const booking of data) {
        try {
          await fetch(gasUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({ ...booking, targetCalendarId })
          });
          successCount++;
        } catch (jobErr) {
          console.error(`Failed to sync job for ${booking.coupleName}:`, jobErr);
        }
      }
      alert(`Sync process complete. Requested sync for ${successCount} jobs.`);
    } catch (err) {
      console.error('Bulk sync failed:', err);
      alert("Bulk sync encountered an error. Check console for details.");
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('famo-logged-in');
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} theme={theme} />;
  }

  return (
    <div className={cn(
      "min-h-screen font-sans flex transition-colors duration-300",
      theme === 'dark' ? "bg-slate-950 text-slate-100" : "bg-[#F8FAFC] text-[#1E293B]"
    )}>
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
        "fixed inset-y-0 left-0 z-[70] border-r transition-all duration-300 flex flex-col",
        theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
        isSidebarOpen ? "w-64" : "w-20",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        !isSidebarOpen && "lg:w-20"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-slate-50 dark:border-slate-800 gap-3">
          <div className="bg-violet-600 p-1.5 rounded-lg shrink-0">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className={cn(
                "font-bold text-lg tracking-tight whitespace-nowrap overflow-hidden",
                theme === 'dark' ? "text-white" : "text-slate-900"
              )}
            >
              {appName}
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

        <div className={cn("p-4 border-t", theme === 'dark' ? "border-slate-800" : "border-slate-100")}>
           <button
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className={cn(
               "hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-lg transition-colors",
               theme === 'dark' ? "text-slate-500 hover:bg-slate-800" : "text-slate-400 hover:bg-slate-50"
             )}
           >
             <ChevronRight className={cn("w-5 h-5 transition-transform duration-300", isSidebarOpen && "rotate-180")} />
             {isSidebarOpen && <span className="text-sm font-medium">Collapse</span>}
           </button>
           <button 
             onClick={handleLogout}
             className={cn(
               "w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-2 transition-colors",
               theme === 'dark' ? "text-rose-400 hover:bg-rose-950/30" : "text-rose-600 hover:bg-rose-50"
             )}
           >
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
        <header className={cn(
          "h-16 backdrop-blur-md border-b sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between transition-colors",
          theme === 'dark' ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200"
        )}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className={cn("p-2 rounded-lg lg:hidden", theme === 'dark' ? "hover:bg-slate-800" : "hover:bg-slate-100")}
            >
              <Menu className={cn("w-5 h-5", theme === 'dark' ? "text-slate-300" : "text-slate-600")} />
            </button>
            <div className="hidden sm:block">
              <h1 className={cn("text-lg font-bold capitalize", theme === 'dark' ? "text-white" : "text-slate-800")}>{activeView}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className={cn(
              "hidden md:flex items-center gap-2 rounded-full px-4 py-1.5 border transition-all",
              theme === 'dark' ? "bg-slate-800 border-slate-700 focus-within:border-violet-500" : "bg-slate-100 border-slate-200 focus-within:border-violet-300"
            )}>
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
                className={cn("p-2.5 rounded-full transition-colors relative group", theme === 'dark' ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500")}
                title="Refresh Data"
              >
                <RefreshCcw className={cn("w-5 h-5", isLoading && "animate-spin")} />
              </button>
              <button className={cn("p-2.5 rounded-full transition-colors", theme === 'dark' ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500")}>
                <Bell className="w-5 h-5" />
              </button>
            </div>
            
            <div className={cn("w-px h-6 mx-1", theme === 'dark' ? "bg-slate-700" : "bg-slate-200")} />
            
            <div className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-violet-600 flex items-center justify-center ring-2 ring-violet-100 dark:ring-violet-900 shadow-sm">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-white text-xs font-bold capitalize">{appName.substring(0, 2)}</span>
                )}
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
                <StatsCard 
                  title="Total Bookings" 
                  value={stats.total} 
                  icon={<Calendar className="w-5 h-5 text-violet-600" />} 
                  description="All recorded entries" 
                  trend="+12%"
                  onClick={() => handleStatClick('total')}
                  theme={theme}
                />
                <StatsCard 
                  title="Total Revenue" 
                  value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats.totalRevenue).replace('Rp', 'IDR')} 
                  icon={<FileText className="w-5 h-5 text-emerald-600" />} 
                  description="Global earnings" 
                  trend="+24%" 
                  theme={theme}
                />
                <StatsCard 
                  title="Prewedding" 
                  value={stats.byOccasion['Prewedding'] || 0} 
                  icon={<Users className="w-5 h-5 text-pink-600" />} 
                  description="Leads in pipeline" 
                  trend="+5%"
                  onClick={() => handleStatClick('occasion', 'Prewedding')}
                  theme={theme}
                />
                <StatsCard 
                  title="Wedding" 
                  value={stats.byOccasion['Wedding'] || 0} 
                  icon={<Package className="w-5 h-5 text-blue-600" />} 
                  description="Primary service" 
                  trend="+2%"
                  onClick={() => handleStatClick('occasion', 'Wedding')}
                  theme={theme}
                />
                <StatsCard 
                  title="Engagement" 
                  value={stats.byOccasion['Engagement'] || 0} 
                  icon={<Instagram className="w-5 h-5 text-orange-600" />} 
                  description="Social growth" 
                  trend="+18%"
                  onClick={() => handleStatClick('occasion', 'Engagement')}
                  theme={theme}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={cn(
                  "p-8 rounded-[2rem] border shadow-sm transition-all hover:shadow-md",
                  theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                )}>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Growth</h3>
                  <h2 className={cn("text-2xl font-bold tracking-tight mb-8", theme === 'dark' ? "text-white" : "text-slate-900")}>Booking History</h2>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.barData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "rgba(255,255,255,0.05)" : "#F1F5F9"} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme === 'dark' ? '#64748B' : '#94A3B8' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme === 'dark' ? '#64748B' : '#94A3B8' }} />
                        <Tooltip 
                          cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(139, 92, 246, 0.05)' }} 
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                            backgroundColor: theme === 'dark' ? '#0F172A' : '#FFFFFF',
                            color: theme === 'dark' ? '#F8FAFC' : '#1E293B'
                          }} 
                        />
                        <Bar dataKey="count" fill="url(#colorBar)" radius={[6, 6, 0, 0]} barSize={32} />
                        <defs><linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.4}/></linearGradient></defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={cn(
                  "p-8 rounded-[2rem] border shadow-sm transition-all hover:shadow-md flex flex-col",
                  theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                )}>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Market</h3>
                  <h2 className={cn("text-2xl font-bold tracking-tight mb-8", theme === 'dark' ? "text-white" : "text-slate-900")}>Lead Distribution</h2>
                  <div className="h-[350px] w-full flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value">
                          {stats.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                            backgroundColor: theme === 'dark' ? '#0F172A' : '#FFFFFF',
                            color: theme === 'dark' ? '#F8FAFC' : '#1E293B'
                          }} 
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeView === 'database' && (
            <div className={cn(
              "rounded-[2rem] border shadow-sm overflow-hidden",
              theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            )}>
              <div className={cn("p-8 border-b space-y-6", theme === 'dark' ? "border-slate-800" : "border-slate-100")}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Records</h3>
                    <h2 className={cn("text-3xl font-bold tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Booking Database</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        className={cn(
                          "pl-10 pr-4 py-2.5 border rounded-2xl w-full md:w-80 outline-none transition-all text-sm shadow-sm",
                          theme === 'dark' ? "bg-slate-800 border-slate-700 text-white focus:border-violet-500" : "bg-slate-50 border-slate-200 focus:border-violet-300"
                        )}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={() => setShowFilters(!showFilters)} 
                      className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-2xl border transition-all text-sm font-bold", 
                        showFilters 
                          ? "bg-violet-600 text-white border-violet-600" 
                          : theme === 'dark' ? "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600" : "bg-white text-slate-600 border-slate-200"
                      )}
                    >
                      <Filter className="w-4 h-4" /> Filter
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={cn(
                      "grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-3xl border",
                      theme === 'dark' ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100"
                    )}>
                      <FilterField label="Email" value={filters.email} onChange={(v) => handleFilterChange('email', v)} theme={theme} />
                      <FilterField label="Occasion" value={filters.occasion} onChange={(v) => handleFilterChange('occasion', v)} theme={theme} />
                      <FilterField label="Package" value={filters.package} onChange={(v) => handleFilterChange('package', v)} theme={theme} />
                      <FilterField label="Couple" value={filters.coupleName} onChange={(v) => handleFilterChange('coupleName', v)} theme={theme} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="overflow-x-auto p-2">
                <table className="w-full text-left min-w-[1200px] lg:min-w-0">
                  <thead>
                    <tr className={cn("border-b", theme === 'dark' ? "border-slate-800" : "border-slate-50")}>
                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Client</th>
                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</th>
                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Product</th>
                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Timeline</th>
                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Down Payment</th>
                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Price</th>
                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Additional</th>
                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y", theme === 'dark' ? "divide-slate-800" : "divide-slate-50")}>
                    {!isLoading && filteredData.map((booking, idx) => (
                      <tr key={idx} className={cn("group transition-all duration-200", theme === 'dark' ? "hover:bg-slate-800/50" : "hover:bg-slate-50")}>
                        <td className="px-4 py-4">
                          <div className={cn("font-bold text-sm whitespace-nowrap", theme === 'dark' ? "text-slate-100" : "text-slate-900")}>{booking.coupleName}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{booking.email}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border whitespace-nowrap", getOccasionStyles(booking.occasion, theme))}>
                            {booking.occasion}
                          </span>
                        </td>
                        <td className={cn("px-4 py-4 text-xs whitespace-nowrap", theme === 'dark' ? "text-slate-400" : "text-slate-600")}><Package className="w-3 h-3 inline mr-1 text-slate-300" />{booking.package}</td>
                        <td className={cn("px-4 py-4 text-xs whitespace-nowrap", theme === 'dark' ? "text-slate-400" : "text-slate-600")}><Calendar className="w-3 h-3 inline mr-1 text-slate-300" />{booking.dateVenue}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-bold">Rp</span>
                            <input 
                              type="number"
                              value={booking.downPayment || 0}
                              onChange={(e) => updateBooking(booking, 'downPayment', Number(e.target.value))}
                              className={cn(
                                "w-20 border rounded-lg py-1 px-2 text-xs font-bold text-emerald-600 outline-none focus:ring-1 focus:ring-violet-300 transition-all",
                                theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                              )}
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
                              className={cn(
                                "w-20 border rounded-lg py-1 px-2 text-xs font-bold transition-all",
                                theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
                              )}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <input 
                            type="text"
                            value={booking.additional || ''}
                            placeholder="Notes..."
                            onChange={(e) => updateBooking(booking, 'additional', e.target.value)}
                            className={cn(
                              "w-full min-w-[120px] border rounded-lg py-1 px-2 text-[11px] outline-none transition-all",
                              theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-400 focus:border-violet-500" : "bg-slate-50 border-slate-200 text-slate-600 focus:border-violet-300"
                            )}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <a 
                              href={booking.proofLink} 
                              target="_blank" 
                              rel="noreferrer" 
                              className={cn(
                                "p-2 rounded-lg transition-all",
                                theme === 'dark' ? "bg-slate-800 text-slate-400 hover:bg-violet-900 hover:text-white" : "bg-slate-100 text-slate-600 hover:bg-violet-600 hover:text-white"
                              )}
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
                              className={cn(
                                "p-2 rounded-lg transition-all",
                                theme === 'dark' ? "bg-violet-900/30 text-violet-400 hover:bg-violet-800 hover:text-white" : "bg-violet-50 text-violet-600 hover:bg-violet-600 hover:text-white"
                              )}
                              title="Invoice (Draft/DP)"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => {
                                const basePrice = booking.price || PACKAGE_PRICES[booking.package] || PACKAGE_PRICES['Default'] || 500000;
                                printInvoice(booking, basePrice, basePrice, (booking.additional || '') + '\nSTATUS: LUNAS / PAID IN FULL');
                              }}
                              className={cn(
                                "p-2 rounded-lg transition-all",
                                theme === 'dark' ? "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-800 hover:text-white" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                              )}
                              title="Invoice Lunas"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleSaveRow(booking)}
                              className={cn(
                                "p-2 rounded-lg transition-all",
                                savingRows[booking.id || booking.coupleName] 
                                  ? (theme === 'dark' ? "bg-amber-900/30 text-amber-500" : "bg-amber-50 text-amber-600")
                                  : (theme === 'dark' ? "bg-blue-900/30 text-blue-400 hover:bg-blue-800 hover:text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white")
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

          {activeView === 'calendar' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className={cn(
                "xl:col-span-1 p-8 rounded-[2.5rem] border shadow-sm h-fit",
                theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              )}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Internal Schedule</h3>
                  <button 
                    onClick={handleSyncAll}
                    disabled={isSyncingAll}
                    className={cn(
                      "p-2 rounded-xl transition-all flex items-center gap-2",
                      theme === 'dark' ? "bg-slate-800 text-slate-400 hover:text-violet-400" : "bg-slate-50 text-slate-500 hover:text-violet-600",
                      isSyncingAll && "animate-spin opacity-50"
                    )}
                    title="Sync All Jobs to Google Calendar"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {isSyncingAll && <span className="text-[8px] font-black uppercase">Syncing...</span>}
                  </button>
                </div>
                <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-2 custom-scrollbar">
                  {sortedJobs.map((booking, idx) => (
                    <div key={idx} className={cn(
                      "p-5 rounded-2xl border transition-all",
                      theme === 'dark' ? "bg-slate-800/40 border-slate-700 hover:border-violet-700" : "bg-slate-50 border-slate-100 hover:border-violet-200"
                    )}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                          getOccasionStyles(booking.occasion, theme)
                        )}>{booking.occasion}</span>
                        <span className="text-[10px] font-bold text-slate-400">{booking.dateVenue.split('@')[0].trim()}</span>
                      </div>
                      <h4 className={cn("font-black text-sm", theme === 'dark' ? "text-slate-100" : "text-slate-900")}>{booking.coupleName}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">{booking.package} • {booking.instagram}</p>
                    </div>
                  ))}
                  {sortedJobs.length === 0 && (
                    <div className="text-center py-12">
                      <CalendarDays className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No jobs scheduled</p>
                    </div>
                  )}
                </div>
              </div>

              <div className={cn(
                "xl:col-span-2 h-[calc(100vh-160px)] rounded-[2.5rem] border shadow-sm overflow-hidden p-1 transition-all",
                theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              )}>
                {calendarUrl ? (
                  <iframe 
                    src={calendarUrl} 
                    style={{ border: 0 }} 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no"
                    className="rounded-[2.2rem]"
                  ></iframe>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full space-y-6 p-12 text-center">
                    <div className="w-20 h-20 bg-violet-100 rounded-3xl flex items-center justify-center text-violet-600">
                      <CalendarDays className="w-10 h-10" />
                    </div>
                    <div className="max-w-md">
                      <h2 className={cn("text-2xl font-black mb-2", theme === 'dark' ? "text-white" : "text-slate-900")}>Google Calendar</h2>
                      <p className="text-slate-500 text-sm">
                        Connect your Google Calendar in Settings to see events side-by-side with your internal jobs.
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveView('settings')}
                      className="px-8 py-3 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"
                    >
                      Settings
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === 'status' && (
            <div className="space-y-8">
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Production</h3>
                  <h2 className={cn("text-3xl font-black tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Job Progress Tracker</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {(['UPCOMING', 'SELECTION AND EDITING', 'PRINTING', 'DELIVERING'] as const).map((status) => {
                  const filtered = filteredData.filter(b => b.progressStatus === status || (!b.progressStatus && status === 'UPCOMING'));
                  return (
                    <div key={status} className={cn(
                      "p-6 rounded-[2rem] border h-fit",
                      theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                    )}>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{status}</h4>
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-black",
                          theme === 'dark' ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-500"
                        )}>{filtered.length}</span>
                      </div>

                      <div className="space-y-3">
                        {filtered.map((booking, idx) => (
                          <div 
                            key={idx}
                            className={cn(
                              "p-4 rounded-2xl border-2 group transition-all cursor-pointer shadow-sm",
                              booking.occasion === 'Wedding' ? (
                                theme === 'dark' ? "bg-emerald-900/20 border-emerald-900/50 hover:border-emerald-500" : "bg-emerald-50 border-emerald-100 hover:border-emerald-200"
                              ) :
                              booking.occasion === 'Prewedding' ? (
                                theme === 'dark' ? "bg-violet-900/20 border-violet-900/50 hover:border-violet-500" : "bg-violet-50 border-violet-100 hover:border-violet-200"
                              ) :
                              (
                                theme === 'dark' ? "bg-amber-900/20 border-amber-900/50 hover:border-amber-500" : "bg-amber-50 border-amber-100 hover:border-amber-200"
                              )
                            )}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className={cn("font-bold text-sm", theme === 'dark' ? "text-slate-100" : "text-slate-900")}>{booking.coupleName}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{booking.dateVenue}</p>
                              </div>
                              <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-violet-100 transition-all">
                                <ChevronRight className="w-4 h-4 text-violet-600" />
                              </button>
                            </div>
                            
                            <select 
                              value={booking.progressStatus || 'UPCOMING'}
                              onChange={(e) => updateBooking(booking, 'progressStatus', e.target.value)}
                              className={cn(
                                "w-full mt-2 bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer",
                                theme === 'dark' ? "text-slate-400" : "text-slate-600"
                              )}
                            >
                              <option value="UPCOMING">Upcoming</option>
                              <option value="SELECTION AND EDITING">Selection & Editing</option>
                              <option value="PRINTING">Printing</option>
                              <option value="DELIVERING">Delivering</option>
                            </select>

                            {status === 'DELIVERING' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  printRecap(booking);
                                }}
                                className={cn(
                                  "w-full mt-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                                  theme === 'dark' ? "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-800" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                )}
                              >
                                <Printer className="w-3 h-3" /> Print Recap
                              </button>
                            )}
                          </div>
                        ))}
                        {filtered.length === 0 && (
                          <div className={cn(
                            "py-12 border-2 border-dashed rounded-2xl flex items-center justify-center",
                            theme === 'dark' ? "border-slate-800" : "border-slate-100"
                          )}>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No jobs</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeView === 'settings' && (
            <div className={cn(
              "max-w-3xl mx-auto p-12 rounded-[3rem] border transition-all",
              theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            )}>
              <h2 className={cn("text-3xl font-black tracking-tight mb-10", theme === 'dark' ? "text-white" : "text-slate-900")}>System Configuration</h2>
              
              <div className="space-y-12">
                {/* Profile Section */}
                <section className="space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <User className="w-4 h-4" /> Profile Identity
                  </h3>
                  <div className="flex items-center gap-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-violet-600 flex items-center justify-center ring-4 ring-violet-100 dark:ring-violet-900 shadow-xl">
                        {profileImage ? (
                          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-white text-3xl font-black">{appName.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                        <Camera className="w-6 h-6 text-white" />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setProfileImage(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Company Name (Top Left)</label>
                        <input 
                          type="text" 
                          value={appName}
                          onChange={(e) => setAppName(e.target.value)}
                          className={cn(
                            "w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-violet-600 transition-all font-bold",
                            theme === 'dark' ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Appearance Section */}
                <section className="space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Appearance
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setTheme('light')}
                      className={cn(
                        "p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all",
                        theme === 'light' ? "bg-violet-50 border-violet-600" : "bg-white border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className="w-12 h-12 bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center text-slate-600">
                        <Sun className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-black text-slate-900 uppercase">Light Theme</span>
                    </button>
                    <button 
                      onClick={() => setTheme('dark')}
                      className={cn(
                        "p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all",
                        theme === 'dark' ? "bg-slate-800 border-violet-600" : "bg-slate-900 border-slate-800 hover:border-slate-700"
                      )}
                    >
                      <div className="w-12 h-12 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-200">
                        <Moon className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-black text-white uppercase">Dark Theme</span>
                    </button>
                  </div>
                </section>

                {/* Pipeline Section */}
                <section className="space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Database className="w-4 h-4" /> Data Integration
                  </h3>
                  <div className={cn(
                    "p-6 rounded-3xl border space-y-4",
                    theme === 'dark' ? "bg-slate-800/30 border-slate-700" : "bg-slate-50 border-slate-100"
                  )}>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Connect Data Pipeline</label>
                    <input 
                      type="text" 
                      placeholder="Apps Script URL" 
                      className={cn(
                        "w-full px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-medium",
                        theme === 'dark' ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
                      )}
                      value={gasUrl} 
                      onChange={(e) => setGasUrl(e.target.value)} 
                    />
                    <p className="text-[10px] text-slate-400 font-medium px-2">This URL should point to your deployed Google Apps Script Web App for real-time synchronization.</p>
                  </div>

                  <div className={cn(
                    "p-6 rounded-3xl border space-y-4",
                    theme === 'dark' ? "bg-slate-800/30 border-slate-700" : "bg-slate-50 border-slate-100"
                  )}>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Connect Google Calendar</label>
                    <input 
                      type="text" 
                      placeholder="Google Calendar Embed URL (src contents)" 
                      className={cn(
                        "w-full px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-medium",
                        theme === 'dark' ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
                      )}
                      value={calendarUrl} 
                      onChange={(e) => setCalendarUrl(e.target.value)} 
                    />
                    <p className="text-[10px] text-slate-400 font-medium px-2">Copy the 'src' value from your Google Calendar embed code.</p>
                  </div>

                  <div className={cn(
                    "p-6 rounded-3xl border space-y-4",
                    theme === 'dark' ? "bg-slate-800/30 border-slate-700" : "bg-slate-50 border-slate-100"
                  )}>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Google Calendar ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. primary or your-email@gmail.com" 
                      className={cn(
                        "w-full px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-medium",
                        theme === 'dark' ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
                      )}
                      value={targetCalendarId} 
                      onChange={(e) => setTargetCalendarId(e.target.value)} 
                    />
                    <p className="text-[10px] text-slate-400 font-medium px-2">Default is 'primary'. You can find other Calendar IDs in Google Calendar Settings {" > "} Integrate Calendar.</p>
                  </div>
                </section>
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
              className={cn(
                "relative w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 overflow-hidden",
                theme === 'dark' ? "bg-slate-900 border border-slate-800" : "bg-white"
              )}
            >
              <div className="mb-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Print Setup</h3>
                <h2 className={cn("text-2xl font-black tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Invoice Details</h2>
                <p className="text-sm text-slate-500 mt-2">Adjust pricing for <strong>{editingInvoice.booking.coupleName}</strong></p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Base Price (IDR)</label>
                  <input 
                    type="number" 
                    value={editingInvoice.price}
                    onChange={(e) => setEditingInvoice(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className={cn(
                      "w-full px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-bold text-lg",
                      theme === 'dark' ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                    )}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Down Payment (IDR)</label>
                  <input 
                    type="number" 
                    value={editingInvoice.dp}
                    onChange={(e) => setEditingInvoice(prev => ({ ...prev, dp: Number(e.target.value) }))}
                    className={cn(
                      "w-full px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-bold text-lg",
                      theme === 'dark' ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                    )}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Additional Info / Terms</label>
                  <textarea 
                    value={editingInvoice.additional}
                    onChange={(e) => setEditingInvoice(prev => ({ ...prev, additional: e.target.value }))}
                    placeholder="E.g. Transport fees, specific deliverables, or custom terms..."
                    rows={3}
                    className={cn(
                      "w-full px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-medium text-sm resize-none",
                      theme === 'dark' ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                    )}
                  />
                </div>

                <div className={cn(
                  "p-6 rounded-3xl border",
                  theme === 'dark' ? "bg-violet-950/20 border-violet-900/50" : "bg-violet-50 border-violet-100"
                )}>
                  <div className="flex justify-between items-center">
                    <span className={cn("text-xs font-bold uppercase tracking-wider", theme === 'dark' ? "text-violet-400" : "text-violet-600")}>Remaining Balance</span>
                    <span className={cn("text-xl font-black", theme === 'dark' ? "text-violet-400" : "text-violet-700")}>
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Math.max(0, editingInvoice.price - editingInvoice.dp))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3">
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsInvoiceModalOpen(false)}
                    className={cn(
                      "flex-1 px-6 py-4 rounded-2xl font-bold transition-all text-sm",
                      theme === 'dark' ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (editingInvoice.booking) {
                        printInvoice(editingInvoice.booking, editingInvoice.price, editingInvoice.price, (editingInvoice.additional || '') + '\nSTATUS: LUNAS / PAID IN FULL');
                        setIsInvoiceModalOpen(false);
                      }
                    }}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all text-sm"
                  >
                    Invoice Lunas
                  </button>
                </div>
                <button 
                  onClick={() => {
                    if (editingInvoice.booking) {
                      printInvoice(editingInvoice.booking, editingInvoice.price, editingInvoice.dp, editingInvoice.additional);
                      setIsInvoiceModalOpen(false);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200 transition-all"
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

function StatsCard({ title, value, icon, description, trend, onClick, theme }: { title: string, value: number | string, icon: React.ReactNode, description: string, trend?: string, onClick?: () => void, theme?: 'light' | 'dark' }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-6 rounded-[2rem] border transition-all duration-500 group",
        theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
        onClick ? cn(
          "cursor-pointer hover:shadow-xl hover:-translate-y-1",
          theme === 'dark' ? "hover:border-violet-900" : "hover:border-violet-100"
        ) : ""
      )}
    >
      <div className="flex justify-between items-center mb-6">
        <div className={cn(
          "p-3.5 rounded-2xl transition-colors duration-500",
          theme === 'dark' ? "bg-slate-800" : "bg-slate-50",
          onClick ? "group-hover:bg-violet-600 group-hover:text-white" : ""
        )}>
          {icon}
        </div>
        {trend && (
          <span className={cn(
            "text-[10px] font-black px-3 py-1 rounded-full",
            theme === 'dark' ? "text-emerald-400 bg-emerald-950/50" : "text-emerald-500 bg-emerald-50"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <h4 className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{title}</h4>
          {onClick && <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />}
        </div>
        <div className={cn(
          "font-black tracking-tighter mb-1.5 leading-none transition-all",
          theme === 'dark' ? "text-white" : "text-slate-900",
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

function FilterField({ label, value, onChange, placeholder, theme }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, theme?: 'light' | 'dark' }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type="text" 
        placeholder={placeholder || `...`} 
        className={cn(
          "w-full px-4 py-2.5 border rounded-xl text-xs font-bold outline-none transition-all shadow-sm",
          theme === 'dark' ? "bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-violet-900" : "bg-white border-slate-200 focus:ring-2 focus:ring-violet-500"
        )}
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  );
}
