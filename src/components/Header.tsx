'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Mail } from 'lucide-react';
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
          <a
            href="mailto:jkksilks1@gmail.com"
            className="lg:hidden p-2 -mr-2 text-[#1F3324] hover:text-[#8A5A19] font-semibold transition-colors rounded-full hover:bg-[#1F3324]/5"
          >
            <Mail className="h-5 w-5" />
          </a>
          <div className="hidden lg:flex items-center gap-8 text-xs font-medium tracking-[0.2em] uppercase text-[#1F3324]">
            <NavLink text="Dresses" href="/collection/dresses" />
            <NavLink text="Heritage" href="/collection/heritage" />
            <a 
              href="mailto:jkksilks1@gmail.com"
              className="flex items-center gap-2 border border-[#1F3324] px-4 py-1.5 rounded-sm text-xs uppercase tracking-wider text-[#EBD4C9] bg-[#1F3324] hover:bg-[#D4AF37] font-semibold transition-all shadow-md"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Enquire</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 z-50 bg-[#EBD4C9]/98 backdrop-blur-md border-b border-[#1F3324]/10 px-6 py-6 shadow-xl">
           <div className="flex flex-col gap-3.5 text-xs font-medium uppercase tracking-[0.25em]">
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
