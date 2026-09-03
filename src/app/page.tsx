'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Search, Menu, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

const LotusIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <Image 
      src="/images/lotus_icon_transparent.png" 
      alt="Lotus Motif" 
      fill 
      className="object-contain"
    />
  </div>
);

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

const NavLink = ({ text }: { text: string }) => {
  return (
    <div className="group relative cursor-pointer flex flex-col items-center justify-center pb-2 px-2">
      <span className="group-hover:text-[#D4AF37] transition-colors relative z-10">{text}</span>
      <LotusAnimation />
    </div>
  );
};



export default function Home() {
  const [cartItems, setCartItems] = useState<any[]>([]);

  const addToCart = (product: any) => {
    setCartItems((prev) => [...prev, product]);
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#D4AF37', '#8B6E32'] });
  };

  return (
    // Deep burgundy background matching the logo theme
    <div className="min-h-screen flex flex-col bg-[#210209] text-[#D4AF37] font-sans selection:bg-[#D4AF37] selection:text-[#210209]">
      
      {/* Top Bar */}
      <div className="w-full text-center py-3 text-xs tracking-[0.3em] uppercase border-b border-[#D4AF37]/20 flex justify-center items-center gap-3 bg-[#1A0106]">
        <LotusIcon className="w-6 h-6 hidden sm:block opacity-90" />
        <span className="text-[#D4AF37]/90 font-medium">Grace. Tradition. Timeless Beauty.</span>
        <LotusIcon className="w-6 h-6 hidden sm:block opacity-90" />
      </div>

      {/* Navigation & Logo Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-3 items-center w-full">
          
          {/* Left: Menu & Links */}
          <div className="flex items-center justify-start lg:justify-end lg:pr-12 w-full">
            <Menu className="h-6 w-6 text-[#D4AF37] cursor-pointer lg:hidden" />
            <div className="hidden lg:flex gap-10 text-xs font-medium tracking-[0.2em] uppercase text-[#D4AF37]/80">
              <NavLink text="Sarees" />
              <NavLink text="Jewellery" />
            </div>
          </div>
          
          {/* Center: Exactly Centered Logo */}
          <div className="flex justify-center my-4">
            <div className="relative h-40 w-40 md:h-52 md:w-52 rounded-full overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.15)] border border-[#D4AF37]/20">
              <Image 
                src="/images/logo.jpg" 
                alt="JKK Silks Logo" 
                fill 
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Right: Links & Icons */}
          <div className="flex items-center justify-end lg:justify-between lg:pl-12 w-full">
            <div className="hidden lg:flex gap-10 text-xs font-medium tracking-[0.2em] uppercase text-[#D4AF37]/80">
              <NavLink text="Heritage" />
              <NavLink text="Contact" />
            </div>

            <div className="flex items-center gap-6">
              <Search className="h-5 w-5 text-[#D4AF37] cursor-pointer hover:scale-110 transition-transform hidden sm:block" />
              <div className="relative cursor-pointer hover:scale-110 transition-transform">
                <ShoppingBag className="h-5 w-5 text-[#D4AF37]" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-[#210209] text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Ornate Divider */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-center gap-4 pt-2 pb-8 opacity-70 -mt-6">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
        <LotusIcon className="w-12 h-12" />
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col items-center px-4 sm:px-6 lg:px-8 pb-32">
        
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mt-8 mb-16 px-4">
          <p className="text-[#D4AF37]/70 text-[10px] tracking-[0.4em] uppercase mb-4 font-medium">
            Embrace the Heritage
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#D4AF37] leading-tight mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            Inspired by the Divine Grace of <br className="hidden md:block" />
            <span className="italic font-light">Kanchi & Kamakshi Amma</span>
          </h2>
          
          <p className="text-[#D4AF37]/80 text-xs md:text-sm tracking-[0.1em] leading-relaxed max-w-xl mx-auto mb-10">
            Step into a world of timeless elegance. We bring you meticulously crafted premium sarees, exquisite traditional wear, and stunning imitation jewellery—designed to celebrate your roots.
          </p>

          <button className="border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#210209] transition-all duration-500 px-8 py-3 uppercase tracking-[0.2em] text-[10px] font-semibold shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]">
            Explore Collection
          </button>
        </section>

        {/* Feature Highlights Grid */}
        <section className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-24 px-4">
          
          {/* Feature 1 */}
          <div className="group flex flex-col items-center text-center p-8 border border-[#D4AF37]/10 bg-[#1A0106]/50 rounded-sm hover:border-[#D4AF37]/40 transition-colors duration-500">
            <div className="w-14 h-14 mb-6 rounded-full border border-[#D4AF37]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
              <span className="text-[#D4AF37] text-2xl">✧</span>
            </div>
            <h3 className="text-[#D4AF37] font-serif text-xl mb-3">Premium Sarees</h3>
            <p className="text-[#D4AF37]/60 text-xs tracking-widest leading-relaxed uppercase">
              Authentic weaves & traditional wear for every auspicious occasion.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group flex flex-col items-center text-center p-8 border border-[#D4AF37]/10 bg-[#1A0106]/50 rounded-sm hover:border-[#D4AF37]/40 transition-colors duration-500">
            <div className="w-14 h-14 mb-6 rounded-full border border-[#D4AF37]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
              <span className="text-[#D4AF37] text-2xl">✤</span>
            </div>
            <h3 className="text-[#D4AF37] font-serif text-xl mb-3">Imitation Jewellery</h3>
            <p className="text-[#D4AF37]/60 text-xs tracking-widest leading-relaxed uppercase">
              Intricately detailed pieces to perfectly complement your attire.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group flex flex-col items-center text-center p-8 border border-[#D4AF37]/10 bg-[#1A0106]/50 rounded-sm hover:border-[#D4AF37]/40 transition-colors duration-500">
            <div className="w-14 h-14 mb-6 rounded-full border border-[#D4AF37]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
              <span className="text-[#D4AF37] text-2xl">✺</span>
            </div>
            <h3 className="text-[#D4AF37] font-serif text-xl mb-3">Pan-India Shipping</h3>
            <p className="text-[#D4AF37]/60 text-xs tracking-widest leading-relaxed uppercase">
              Secure & reliable delivery, bringing heritage directly to your doorstep.
            </p>
          </div>

        </section>

        {/* Feature Image Placeholder Area */}
        <section className="w-full max-w-5xl mx-auto relative h-[60vh] min-h-[400px] border border-[#D4AF37]/20 rounded-sm overflow-hidden flex items-center justify-center bg-[#1A0106] group cursor-pointer">
          <div className="absolute inset-0 bg-[#D4AF37]/5 transition-colors duration-700 group-hover:bg-[#D4AF37]/10"></div>
          <div className="relative z-10 flex flex-col items-center text-center p-8 transform group-hover:scale-105 transition-transform duration-700">
            <LotusIcon className="w-20 h-20 mb-8 opacity-80" />
            <h3 className="font-serif text-3xl md:text-4xl text-[#D4AF37] mb-4 tracking-wide">Our Exclusive Collection</h3>
            <p className="text-[#D4AF37]/60 text-xs tracking-[0.3em] uppercase mb-8">Releasing Soon</p>
            <div className="w-32 h-[1px] bg-[#D4AF37]/40"></div>
          </div>
        </section>

      </main>

      {/* Minimal Footer */}
      <footer className="w-full bg-[#1A0106] border-t border-[#D4AF37]/20 py-12 text-center text-[#D4AF37]/60 text-[10px] uppercase tracking-[0.2em]">
        <p>&copy; {new Date().getFullYear()} JKK Silks. All rights reserved.</p>
      </footer>
      
    </div>
  );
}
