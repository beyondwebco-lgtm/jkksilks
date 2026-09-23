import Link from 'next/link';
import Image from 'next/image';
import { InstagramIcon } from '@/components/Icons';
import { supabase } from '@/lib/supabase';

import QuickContactFloating from '@/components/QuickContactFloating';
import Header from '@/components/Header';

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

export const dynamic = 'force-dynamic';

async function getCategories() {
  const { data: dbCategories } = await supabase.from('categories').select('*');
  const { data: products } = await supabase.from('products').select('category');
  
  const counts: Record<string, number> = {};
  products?.forEach(p => {
    const catName = typeof p.category === 'string' ? p.category.toLowerCase() : '';
    if (catName) {
      counts[catName] = (counts[catName] || 0) + 1;
    }
  });

  const categories = (dbCategories || []).map((c: any) => ({
    ...c,
    count: counts[(c.name || '').toLowerCase()] || 0
  }));

  return categories;
}

const CategoryGrid = async () => {
  const categories = await getCategories();
  
  const visibleCategories = categories.filter(cat => cat.coverImage);

  if (visibleCategories.length === 0) {
    return <div className="text-[#8A5A19]/60 text-sm py-10 w-full text-center tracking-widest uppercase">Collections coming soon</div>;
  }

  return (
    <>
      {visibleCategories.map((cat, index) => (
        <Link 
          key={cat.id} 
          href={`/collection/${cat.name.toLowerCase().replace(/\s+/g, '-')}`} 
          className="group relative w-[calc(50%-0.375rem)] md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] aspect-[3/4] flex flex-col overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-700"
        >
          <div className="absolute inset-0 w-full h-full bg-[#EAE3D9]">
            <Image src={cat.coverImage!} alt={cat.name} fill sizes="(max-width: 768px) 50vw, 33vw" priority={index < 4} className="object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" />
          </div>

          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 w-[75%] sm:w-[70%] bg-white/95 backdrop-blur-md py-3.5 px-2 text-center shadow-[0_8px_25px_rgba(0,0,0,0.1)] border border-[#D4AF37]/30 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_15px_35px_rgba(212,175,55,0.15)]">
            <h3 className="font-serif font-medium tracking-[0.15em] sm:tracking-[0.2em] text-[12px] sm:text-[14px] md:text-[15px] uppercase text-[#1F3324] truncate px-2">
              {cat.name}
            </h3>
            <p className="flex items-center justify-center gap-2 text-[8px] sm:text-[9px] tracking-[0.25em] text-[#8A5A19] mt-2 font-semibold uppercase">
              <span className="w-4 h-[1px] bg-[#8A5A19]/40"></span>
              {cat.count || 0} {cat.count === 1 ? 'PRODUCT' : 'PRODUCTS'}
              <span className="w-4 h-[1px] bg-[#8A5A19]/40"></span>
            </p>
          </div>
        </Link>
      ))}
    </>
  );
};

export default async function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EBD4C9] text-[#1F3324] font-sans selection:bg-[#1F3324] selection:text-[#EBD4C9]">
      {/* Top Announcement Bar */}
      <div className="w-full text-center py-2.5 text-xs tracking-[0.3em] uppercase border-b border-[#1F3324]/10 flex justify-center items-center gap-3 bg-[#E1C7BB]">
        <LotusIcon className="w-5 h-5 hidden sm:block opacity-90" />
        <span className="text-[#1F3324] font-medium text-[11px] sm:text-xs">Grace. Tradition. Timeless Beauty.</span>
        <LotusIcon className="w-5 h-5 hidden sm:block opacity-90" />
      </div>

      {/* Navigation & Brand Logo (Client Component) */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col items-center pb-24 sm:pb-32">
        
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden flex items-center justify-center min-h-[220px] sm:min-h-[260px] md:min-h-[300px] lg:min-h-[340px] pt-4 pb-4 md:pt-6 md:pb-4 my-0">

          {/* Left Golden Branch & Glowing Dots - connected directly to left edge of page */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-20 sm:w-44 md:w-72 lg:w-[380px] xl:w-[460px] 2xl:w-[540px] pointer-events-none select-none z-0 transition-all duration-500 opacity-25 sm:opacity-95 md:opacity-100 -translate-x-3 sm:translate-x-0">
            <div className="relative w-full h-full">
              <Image src="/images/golden_branch_left.png" alt="Left Decorative Golden Branch" width={1024} height={682} className="w-full h-auto object-contain" priority />
              {[
                { top: '30%', left: '30%', size: 4, delay: '0s', duration: '2.6s' },
                { top: '40%', left: '40%', size: 3, delay: '0.8s', duration: '3.2s' },
                { top: '50%', left: '50%', size: 5, delay: '1.4s', duration: '2.4s' },
                { top: '60%', left: '45%', size: 3, delay: '2.1s', duration: '3.6s' },
                { top: '45%', left: '20%', size: 4.5, delay: '0.3s', duration: '3.0s' },
                { top: '35%', left: '55%', size: 3, delay: '1.7s', duration: '2.8s' },
                { top: '55%', left: '35%', size: 4, delay: '1.1s', duration: '3.4s' },
                { top: '42%', left: '60%', size: 2.5, delay: '2.4s', duration: '3.9s' },
                { top: '65%', left: '25%', size: 3.5, delay: '1.5s', duration: '3.1s' },
                { top: '25%', left: '45%', size: 4, delay: '0.9s', duration: '2.7s' },
                { top: '48%', left: '70%', size: 3, delay: '1.2s', duration: '3.3s' },
                { top: '52%', left: '15%', size: 2.5, delay: '0.6s', duration: '2.3s' },
              ].map((dot, index) => (
                <span key={`left-glow-dot-${index}`} className="golden-glowing-dot" style={{ top: dot.top, left: dot.left, width: `${dot.size}px`, height: `${dot.size}px`, animationDelay: dot.delay, animationDuration: dot.duration }} />
              ))}
            </div>
          </div>
          <div className="relative z-10 text-center max-w-lg sm:max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <p className="text-[#8A5A19] font-semibold text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-2 sm:mb-3 font-medium">
              Embrace the Heritage
            </p>
            <h1 className="font-serif text-xl sm:text-3xl md:text-[34px] lg:text-[38px] text-[#1F3324] leading-snug md:leading-tight mb-3 sm:mb-4">
              Inspired by the Divine Grace of <br className="hidden sm:block" />
              <span className="italic font-medium text-[#8A5A19] font-semibold">Kanchi & Kamakshi Amma</span>
            </h1>
            <p className="text-[#1F3324] text-xs sm:text-[13px] tracking-wide leading-relaxed max-w-md md:max-w-lg mx-auto font-medium">
              Step into a world of timeless elegance. Handcrafted weaves, pure zari craftsmanship, and exquisite heritage treasures curated for life&apos;s sacred celebrations.
            </p>
          </div>

          {/* Right Golden Branch & Glowing Dots - connected directly to right edge of page */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-20 sm:w-44 md:w-72 lg:w-[380px] xl:w-[460px] 2xl:w-[540px] pointer-events-none select-none z-0 transition-all duration-500 opacity-25 sm:opacity-95 md:opacity-100 translate-x-3 sm:translate-x-0">
            <div className="relative w-full h-full">
              <Image src="/images/golden_branch_right.png" alt="Right Decorative Golden Branch" width={1024} height={682} className="w-full h-auto object-contain" priority />
              {[
                { top: '30%', right: '30%', size: 4, delay: '0.4s', duration: '2.8s' },
                { top: '40%', right: '40%', size: 3, delay: '1.2s', duration: '3.3s' },
                { top: '50%', right: '50%', size: 5, delay: '1.8s', duration: '2.5s' },
                { top: '60%', right: '45%', size: 3, delay: '0.2s', duration: '3.5s' },
                { top: '45%', right: '20%', size: 4.5, delay: '1.5s', duration: '3.1s' },
                { top: '35%', right: '55%', size: 3, delay: '2.0s', duration: '3.2s' },
                { top: '55%', right: '35%', size: 4, delay: '0.7s', duration: '3.7s' },
                { top: '42%', right: '60%', size: 2.5, delay: '1.6s', duration: '4.1s' },
                { top: '65%', right: '25%', size: 3.5, delay: '0.5s', duration: '3.0s' },
                { top: '25%', right: '45%', size: 4, delay: '2.3s', duration: '2.7s' },
                { top: '48%', right: '70%', size: 3, delay: '0.9s', duration: '3.4s' },
                { top: '52%', right: '15%', size: 2.5, delay: '1.7s', duration: '2.4s' },
              ].map((dot, index) => (
                <span key={`right-glow-dot-${index}`} className="golden-glowing-dot" style={{ top: dot.top, right: dot.right, width: `${dot.size}px`, height: `${dot.size}px`, animationDelay: dot.delay, animationDuration: dot.duration }} />
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section (New) */}
        <section className="w-full max-w-5xl mx-auto px-4 mt-8 sm:mt-12">
          <div className="text-center mb-10">
            <p className="text-[#8A5A19] font-semibold font-semibold text-[11px] sm:text-xs tracking-[0.25em] uppercase mb-2 flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-[#D4AF37]/50"></span>
              EXPLORE OUR COLLECTIONS
              <span className="w-8 h-[1px] bg-[#D4AF37]/50"></span>
            </p>
            <h2 className="text-[#1F3324] font-serif text-3xl sm:text-4xl mt-3">Find your perfect weave</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6">
            <CategoryGrid />
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="w-full bg-[#E1C7BB] border-t border-[#1F3324]/10 py-6 px-4 sm:px-6 lg:px-8 text-[#1F3324]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-[11px] uppercase tracking-widest text-[#1F3324]">
            &copy; {new Date().getFullYear()} JKK Silks. All Rights Reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 gap-y-2.5 text-xs">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#1F3324]">Wyra, Khammam</span>
            <span className="hidden sm:inline text-[#1F3324]">&bull;</span>
            <div className="flex items-center gap-1.5 text-[11px] tracking-wider">
              <span className="uppercase text-[#1F3324] font-medium tracking-widest">Contact Us:</span>
              <a href="https://wa.me/916309143484" target="_blank" rel="noreferrer" className="text-[#1F3324] hover:text-[#8A5A19] font-semibold transition-colors font-medium">+91 6309 143 484</a>
            </div>
            <div className="flex items-center gap-3 ml-2">
              <a 
                href="https://www.instagram.com/jkk_silks?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==" 
                target="_blank" 
                rel="noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#1F3324]/40 hover:border-[#8A5A19] text-[#1F3324] hover:text-[#8A5A19] hover:bg-[#8A5A19]/10 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                title="Instagram"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      <QuickContactFloating />
    </div>
  );
}
