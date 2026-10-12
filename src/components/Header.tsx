'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Mail, Sparkles } from 'lucide-react';
import SearchBar from '@/components/SearchBar';

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

const NavLink = ({ text, href, onClick }: { text: string; href?: string; onClick?: (e: React.MouseEvent) => void }) => {
  return (
    <Link href={href || '#'} onClick={onClick} className="group relative cursor-pointer flex flex-col items-center justify-center pb-2 px-2">
      <span className="group-hover:text-[#8A5A19] font-semibold transition-colors relative z-10">{text}</span>
      <LotusAnimation />
    </Link>
  );
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative">
      <div className="grid grid-cols-3 items-center w-full">
        {/* Left: Nav */}
        <div className="flex items-center justify-start lg:justify-center w-full">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-[#1F3324] hover:text-[#8A5A19] font-semibold transition-colors rounded-full hover:bg-[#1F3324]/5"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="hidden lg:flex items-center gap-8 text-xs font-medium tracking-[0.2em] uppercase text-[#1F3324]">
            <SearchBar />
            <NavLink text="Sarees" href="/collection/sarees" />
            <NavLink text="Jewellery" href="/collection/jewellery" />
          </div>
        </div>
        
        {/* Center: Logo */}
        <div className="flex justify-center my-1 sm:my-2 relative z-20">
          <Link href="/" className="group relative z-10 flex items-center justify-center">
            {/* Doctor Strange style Mandala Rings */}
            <div className="magic-mandala-container absolute inset-0 z-0 flex items-center justify-center">
              <div className="mandala-ring mandala-ring-1"></div>
              <div className="mandala-ring mandala-ring-2"></div>
              <div className="mandala-ring mandala-ring-3"></div>
              <div className="mandala-geometry"></div>
            </div>
            
            <div className="relative h-24 w-24 sm:h-36 sm:w-36 md:h-44 md:w-44 lg:h-48 lg:w-48 rounded-full overflow-hidden shadow-[0_0_20px_rgba(31,51,36,0.1)] border border-[#1F3324]/20 group-hover:border-[#D4AF37]/50 transition-all z-10 bg-[#EBD4C9]">
              <Image src="/images/logo.jpg" alt="JKK Silks Logo" fill priority sizes="(max-width: 768px) 96px, 192px" className="object-cover" />
            </div>
          </Link>
        </div>

        {/* Right: Heritage & Contact */}
        <div className="flex items-center justify-end lg:justify-center w-full">
          <Link
            href="/collection/new-collection"
            className="lg:hidden flex items-center gap-1.5 border border-[#8A5A19]/30 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider text-[#1F3324] font-semibold bg-gradient-to-r from-[#D4AF37]/25 to-[#F1C40F]/30"
          >
            <Sparkles className="h-3 w-3 text-[#8A5A19]" />
            <span>New In</span>
          </Link>
          <div className="hidden lg:flex items-center gap-7 text-xs font-medium tracking-[0.2em] uppercase text-[#1F3324]">
            <NavLink text="Dresses" href="/collection/dresses" />
            <NavLink text="Heritage" href="/collection/heritage" />
            <Link 
              href="/collection/new-collection"
              className="relative group inline-flex items-center gap-2 px-4 py-2 rounded-sm text-[11px] tracking-[0.22em] uppercase font-semibold text-[#EBD4C9] bg-[#1F3324] hover:bg-[#8A5A19] border border-[#8A5A19]/50 hover:border-[#D4AF37] shadow-[0_2px_12px_rgba(31,51,36,0.18)] hover:shadow-[0_4px_20px_rgba(138,90,25,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] group-hover:rotate-12 transition-transform duration-300" />
              <span>New Collection</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 z-50 bg-[#EBD4C9]/98 backdrop-blur-md border-b border-[#1F3324]/10 px-6 py-6 shadow-xl">
           <div className="flex flex-col gap-3.5 text-xs font-medium uppercase tracking-[0.25em]">
            <Link 
              href="/collection/new-collection" 
              onClick={() => setMobileMenuOpen(false)} 
              className="text-left py-2.5 px-3 rounded-sm bg-gradient-to-r from-[#D4AF37]/30 to-[#D4AF37]/50 font-bold text-[#1F3324] flex items-center justify-between border border-[#8A5A19]/30 shadow-sm"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#8A5A19]" />
                New Collection
              </span>
              <span className="text-[10px] bg-[#1F3324] text-[#EBD4C9] px-1.5 py-0.5 rounded-xs">NEW</span>
            </Link>
            <Link href="/collection/sarees" onClick={() => setMobileMenuOpen(false)} className="text-left py-2.5 border-b border-[#1F3324]/10 hover:text-[#8A5A19] font-semibold text-[#1F3324] flex justify-between">
              <span>✦ Pure Sarees</span>
            </Link>
            <Link href="/collection/jewellery" onClick={() => setMobileMenuOpen(false)} className="text-left py-2.5 border-b border-[#1F3324]/10 hover:text-[#8A5A19] font-semibold text-[#1F3324] flex justify-between">
              <span>✤ Imitation Jewellery</span>
            </Link>
            <Link href="/collection/dresses" onClick={() => setMobileMenuOpen(false)} className="text-left py-2.5 border-b border-[#1F3324]/10 hover:text-[#8A5A19] font-semibold text-[#1F3324] flex justify-between">
              <span>✧ Dresses</span>
            </Link>
            <Link href="/collection/heritage" onClick={() => setMobileMenuOpen(false)} className="text-left py-2.5 border-b border-[#1F3324]/10 hover:text-[#8A5A19] font-semibold text-[#1F3324] flex justify-between">
              <span>✺ Heritage Artifacts</span>
            </Link>
           </div>
        </div>
      )}
    </header>
  );
}
