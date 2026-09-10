'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, ExternalLink, ShieldCheck, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const LotusAnimation = () => (
  <div className="lotus-animation-wrapper">
    <div className="lotus-animation">
      <div className="stem"></div>
      <div className="lotus">
        <span className="petal p1"></span>
        <span className="petal p2"></span>
        <span className="petal p3"></span>
        <span className="petal p4"></span>
        <span className="petal p5"></span>
        <span className="petal p6"></span>
        <span className="petal p7"></span>
      </div>
    </div>
  </div>
);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // If on /admin/login, bypass layout wrapper
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.replace('/admin/login');
        } else {
          setCurrentUser(session.user);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        router.replace('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user && !isLoginPage) {
        setCurrentUser(null);
        router.replace('/admin/login');
      } else if (session?.user) {
        setCurrentUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isLoginPage, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/admin/login');
  };

  // On login page, render children directly without admin shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show royal loading state while checking session
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A0106] flex flex-col items-center justify-center text-[#D4AF37]">
        <LotusAnimation />
        <p className="mt-8 text-xs uppercase tracking-[0.3em] font-light text-[#D4AF37]/80 animate-pulse">
          Verifying Admin Credentials...
        </p>
      </div>
    );
  }

  // If not logged in yet and not loading, don't flash dashboard
  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1A0106] flex flex-col md:flex-row font-sans text-[#D4AF37]">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#210209] border-r border-[#D4AF37]/20 flex-shrink-0 flex flex-col justify-between">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#D4AF37]/20 flex flex-col items-center">
            <Link href="/" className="relative h-20 w-20 rounded-full overflow-hidden border border-[#D4AF37]/40 hover:border-[#D4AF37] hover:scale-105 transition-all duration-300 block cursor-pointer mb-3 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
              <Image 
                src="/images/logo.jpg" 
                alt="JKK Silks Logo" 
                fill 
                className="object-cover"
                priority
              />
            </Link>
            <h2 className="text-lg font-serif text-[#D4AF37] tracking-wider text-center">JKK Admin</h2>
            <div className="flex items-center gap-1.5 mt-1 text-[9px] text-[#D4AF37]/70 uppercase tracking-[0.2em]">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Catalog Manager</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 flex flex-col gap-2">
            <Link 
              href="/admin/sarees" 
              className={`px-4 py-3 text-xs font-medium rounded-sm border transition-all uppercase tracking-widest text-center ${
                pathname.includes('/admin/sarees')
                  ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#FFF8E7] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                  : 'border-transparent text-[#D4AF37]/80 hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 hover:text-[#FFF8E7]'
              }`}
            >
              Pure Sarees
            </Link>
            <Link 
              href="/admin/jewellery" 
              className={`px-4 py-3 text-xs font-medium rounded-sm border transition-all uppercase tracking-widest text-center ${
                pathname.includes('/admin/jewellery')
                  ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#FFF8E7] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                  : 'border-transparent text-[#D4AF37]/80 hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 hover:text-[#FFF8E7]'
              }`}
            >
              Imitation Jewellery
            </Link>
            <Link 
              href="/admin/heritage" 
              className={`px-4 py-3 text-xs font-medium rounded-sm border transition-all uppercase tracking-widest text-center ${
                pathname.includes('/admin/heritage')
                  ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#FFF8E7] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                  : 'border-transparent text-[#D4AF37]/80 hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 hover:text-[#FFF8E7]'
              }`}
            >
              Heritage Artifacts
            </Link>
          </nav>
        </div>

        {/* User Info & Actions at Bottom of Sidebar */}
        <div className="p-4 border-t border-[#D4AF37]/20 flex flex-col gap-3">
          {/* User Email Badge */}
          <div className="flex items-center gap-2.5 px-3 py-2 bg-[#1A0106]/60 rounded-sm border border-[#D4AF37]/15">
            <div className="w-6 h-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] text-[#FFF8E7] font-medium truncate">
                {currentUser.email}
              </p>
              <p className="text-[9px] text-[#D4AF37]/60 tracking-wider uppercase">
                Active Session
              </p>
            </div>
          </div>

          {/* Storefront Link */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-wider text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors py-1.5"
          >
            <span>View Storefront</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-red-500/30 hover:border-red-500/70 bg-red-950/20 hover:bg-red-950/40 text-red-300 hover:text-red-100 rounded-sm text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-br from-[#1A0106] to-[#210209]">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
      
    </div>
  );
}
