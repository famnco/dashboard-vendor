import React, { useState } from 'react';
import { Lock, User, Camera, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface LoginProps {
  onLogin: (user: string) => void;
  theme: 'light' | 'dark';
}

export default function Login({ onLogin, theme }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      onLogin(username);
      localStorage.setItem('famo-logged-in', 'true');
    } else {
      setError('Invalid credentials. Hint: admin/admin');
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-6 transition-all duration-500",
      theme === 'dark' ? "bg-[#0a0c10]" : "bg-slate-50"
    )}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20",
          theme === 'dark' ? "bg-violet-900" : "bg-violet-200"
        )}></div>
        <div className={cn(
          "absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20",
          theme === 'dark' ? "bg-emerald-900" : "bg-emerald-200"
        )}></div>
      </div>

      <div className={cn(
        "w-full max-w-md p-10 rounded-[3rem] border shadow-2xl relative z-10 backdrop-blur-xl transition-all",
        theme === 'dark' ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200"
      )}>
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-violet-600 rounded-[2rem] flex items-center justify-center shadow-lg shadow-violet-200 mb-6 rotate-3">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className={cn("text-3xl font-black tracking-tight mb-2", theme === 'dark' ? "text-white" : "text-slate-900")}>
            Login Vendor
          </h1>
          <p className="text-slate-500 text-sm font-medium">Professional Photography Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={cn(
                  "w-full pl-14 pr-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-medium",
                  theme === 'dark' ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-100 text-slate-900"
                )}
                placeholder="Enter username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full pl-14 pr-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-medium",
                  theme === 'dark' ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-100 border-slate-100 text-slate-900"
                )}
                placeholder="Enter password"
              />
            </div>
          </div>

          {error && (
            <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 mt-4 active:scale-95"
          >
            Access Dashboard
          </button>
        </form>

        <div className="mt-10 flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck className="w-3 h-3" />
          <span className="text-[10px] font-black uppercase tracking-widest">Secured Environment</span>
        </div>
      </div>
    </div>
  );
}
