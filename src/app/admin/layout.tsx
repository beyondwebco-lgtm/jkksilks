'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, ExternalLink } from 'lucide-react';
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
  const isLoginPage = pathname ? pathname.includes('/admin/login') : false;
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(!isLoginPage);
  
  useEffect(() => {
    if (isLoginPage) return;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.replace('/admin/login');
        } else {
          setCurrentUser(session.user);
        }
      } catch (err) {
        console.error('Auth error:', err);
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

    return () => subscription.unsubscribe();
  }, [isLoginPage, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/admin/login');
  };

  if (isLoginPage) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EBD4C9] flex flex-col items-center justify-center text-[#1F3324]">
        <LotusAnimation />
        <p className="mt-8 text-xs uppercase tracking-[0.3em] font-light text-[#1F3324]/80 animate-pulse">
          Verifying Admin Credentials...
        </p>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#EBD4C9] flex flex-col font-sans text-[#1F3324]">
      
      {/* Top Navigation / Header */}
      <header className="w-full border-b border-[#8A5A19]/20 bg-[#EAE3D9] py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="relative h-12 w-12 rounded-full overflow-hidden border border-[#8A5A19]/40 shadow-[0_4px_15px_rgba(138,90,25,0.1)]">
            <Image src="/images/logo.jpg" alt="JKK Silks Logo" fill className="object-cover" priority />
          </Link>
          <h1 className="text-xl font-serif text-[#1F3324] tracking-widest uppercase shadow-sm">Catalog Management</h1>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" target="_blank" className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#1F3324]/70 hover:text-[#1F3324] transition-colors">
            <span>View Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-xs uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#EAE3D9] border-r border-[#8A5A19]/20 flex flex-col p-6 overflow-y-auto">
          
          <div className="flex flex-col gap-2 mb-8 flex-1 overflow-y-auto pr-2">
            
            <Link 
              href="/admin/sarees"
              className={`px-4 py-3 rounded-sm border transition-all flex items-center justify-between ${
                pathname.includes('/admin/sarees')
                  ? 'border-[#8A5A19] bg-[#1F3324] text-[#EBD4C9] shadow-[0_4px_15px_rgba(138,90,25,0.15)]'
                  : 'border-[#8A5A19]/20 bg-white/40 text-[#1F3324] hover:border-[#8A5A19]/50'
              }`}
            >
              <span className="font-semibold text-sm">Sarees</span>
            </Link>

            <Link 
              href="/admin/jewellery"
              className={`px-4 py-3 rounded-sm border transition-all flex items-center justify-between ${
                pathname.includes('/admin/jewellery')
                  ? 'border-[#8A5A19] bg-[#1F3324] text-[#EBD4C9] shadow-[0_4px_15px_rgba(138,90,25,0.15)]'
                  : 'border-[#8A5A19]/20 bg-white/40 text-[#1F3324] hover:border-[#8A5A19]/50'
              }`}
            >
              <span className="font-semibold text-sm">Jewellery</span>
            </Link>

            <Link 
              href="/admin/heritage"
              className={`px-4 py-3 rounded-sm border transition-all flex items-center justify-between ${
                pathname.includes('/admin/heritage')
                  ? 'border-[#8A5A19] bg-[#1F3324] text-[#EBD4C9] shadow-[0_4px_15px_rgba(138,90,25,0.15)]'
                  : 'border-[#8A5A19]/20 bg-white/40 text-[#1F3324] hover:border-[#8A5A19]/50'
              }`}
            >
              <span className="font-semibold text-sm">Heritage</span>
            </Link>

            <Link 
              href="/admin/dresses"
              className={`px-4 py-3 rounded-sm border transition-all flex items-center justify-between ${
                pathname.includes('/admin/dresses')
                  ? 'border-[#8A5A19] bg-[#1F3324] text-[#EBD4C9] shadow-[0_4px_15px_rgba(138,90,25,0.15)]'
                  : 'border-[#8A5A19]/20 bg-white/40 text-[#1F3324] hover:border-[#8A5A19]/50'
              }`}
            >
              <span className="font-semibold text-sm">Dresses</span>
            </Link>

          </div>

        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto bg-[#EBD4C9]">
          <div className="max-w-4xl border border-[#8A5A19]/10 bg-[#EAE3D9]/80 rounded-lg p-8 shadow-2xl relative">
            {/* Subtle decorative dashed border matching screenshot */}
            <div className="absolute inset-4 border border-dashed border-[#8A5A19]/10 pointer-events-none rounded-sm"></div>
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </main>
        
      </div>
    </div>
  );
}
