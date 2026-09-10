'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.replace('/admin/sarees');
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid email or password.');
      } else if (data?.user) {
        router.replace('/admin/sarees');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#120004] via-[#210209] to-[#120004] px-4 py-12 text-[#D4AF37] selection:bg-[#D4AF37] selection:text-[#210209]">
      
      {/* Centered Login Card */}
      <div className="w-full max-w-md bg-[#1A0106]/95 border border-[#D4AF37]/30 rounded-lg p-8 sm:p-10 shadow-[0_0_50px_rgba(212,175,55,0.15)] relative overflow-hidden backdrop-blur-md">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <Link href="/" className="group mb-4">
            <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-[#D4AF37]/40 group-hover:border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300">
              <Image 
                src="/images/logo.jpg" 
                alt="JKK Silks Logo" 
                fill 
                className="object-cover"
                priority
              />
            </div>
          </Link>
          
          <h1 className="font-serif text-2xl sm:text-3xl text-[#D4AF37] tracking-wider mb-1">
            Admin Portal
          </h1>
          <p className="text-[11px] text-[#FFF8E7]/60 tracking-[0.25em] uppercase font-light">
            Catalog &amp; Inventory Management
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3.5 bg-red-950/60 border border-red-500/40 rounded-sm text-red-200 text-xs text-center leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-[#D4AF37]/90 mb-2 font-medium">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#D4AF37]/50">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jkksilks.com"
                className="w-full bg-[#120004]/80 border border-[#D4AF37]/30 rounded-sm py-3 pl-10 pr-4 text-sm text-[#FFF8E7] placeholder-[#FFF8E7]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-[#D4AF37]/90 mb-2 font-medium">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#D4AF37]/50">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#120004]/80 border border-[#D4AF37]/30 rounded-sm py-3 pl-10 pr-11 text-sm text-[#FFF8E7] placeholder-[#FFF8E7]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#D4AF37] hover:bg-[#E5C158] text-[#210209] font-semibold text-xs uppercase tracking-[0.2em] py-3.5 px-4 rounded-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_30px_rgba(212,175,55,0.45)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-[#210209] border-t-transparent rounded-full"></span>
            ) : (
              <>
                <span>Secure Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Badge & Back Link */}
        <div className="mt-8 pt-6 border-t border-[#D4AF37]/15 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-1.5 text-[10px] text-[#D4AF37]/60 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]/80" />
            <span>Encrypted Supabase Authentication</span>
          </div>
          
          <Link 
            href="/" 
            className="text-xs text-[#FFF8E7]/50 hover:text-[#D4AF37] transition-colors tracking-wider mt-1"
          >
            ← Return to JKK Silks Storefront
          </Link>
        </div>

      </div>
    </div>
  );
}
