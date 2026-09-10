'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Sparkles, MessageCircle, X, Mail } from 'lucide-react';
import { InstagramIcon } from '@/components/Icons';
import { supabase, Product } from '@/lib/supabase';
import EnquiryModal from '@/components/EnquiryModal';
import PolicyModal, { PolicyType } from '@/components/PolicyModal';
import QuickContactFloating from '@/components/QuickContactFloating';

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

const NavLink = ({ 
  text, 
  href, 
  onClick 
}: { 
  text: string; 
  href?: string; 
  onClick?: (e: React.MouseEvent) => void;
}) => {
  return (
    <Link 
      href={href || '#'} 
      onClick={onClick}
      className="group relative cursor-pointer flex flex-col items-center justify-center pb-2 px-2"
    >
      <span className="group-hover:text-[#D4AF37] transition-colors relative z-10">{text}</span>
      <LotusAnimation />
    </Link>
  );
};

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_explore_collection', true)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const calculateDiscountPercent = (orig?: number | null, disc?: number | null) => {
    if (orig && disc && orig > disc && orig > 0) {
      return Math.round(((orig - disc) / orig) * 100);
    }
    return null;
  };

  const curatedCategories = [
    {
      id: 'sarees',
      name: 'Pure Sarees',
      description: 'Handwoven Kanjivaram, Banarasi & Pure Silk Sarees',
      icon: '✦',
    },
    {
      id: 'jewellery',
      name: 'Imitation Jewellery',
      description: 'Intricate temple necklaces, matte jhumkas & bridal adornments',
      icon: '✤',
    },
    {
      id: 'heritage',
      name: 'Heritage Artifacts',
      description: 'Sacred bronze pieces, puja brassware & divine heirlooms',
      icon: '✺',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#210209] text-[#D4AF37] font-sans selection:bg-[#D4AF37] selection:text-[#210209]">
      
      {/* Top Announcement Bar */}
      <div className="w-full text-center py-2.5 text-xs tracking-[0.3em] uppercase border-b border-[#D4AF37]/20 flex justify-center items-center gap-3 bg-[#1A0106]">
        <LotusIcon className="w-5 h-5 hidden sm:block opacity-90" />
        <span className="text-[#D4AF37]/90 font-medium text-[11px] sm:text-xs">Grace. Tradition. Timeless Beauty.</span>
        <LotusIcon className="w-5 h-5 hidden sm:block opacity-90" />
      </div>

      {/* Navigation & Brand Logo */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        <div className="grid grid-cols-3 items-center w-full">
          
          {/* Left: Sarees & Jewellery Nav Links */}
          <div className="flex items-center justify-start lg:justify-end lg:pr-12 w-full">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1 text-[#D4AF37] hover:text-[#FFF8E7] transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden lg:flex gap-10 text-xs font-medium tracking-[0.2em] uppercase text-[#D4AF37]/80">
              <NavLink text="Sarees" href="/collection/sarees" />
              <NavLink text="Jewellery" href="/collection/jewellery" />
            </div>
          </div>
          
          {/* Center: Exactly Centered Logo */}
          <div className="flex justify-center my-2">
            <Link href="/" className="group">
              <div className="relative h-36 w-36 sm:h-44 sm:w-44 md:h-48 md:w-48 rounded-full overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.15)] border-2 border-[#D4AF37]/30 group-hover:border-[#D4AF37] transition-all">
                <Image 
                  src="/images/logo.jpg" 
                  alt="JKK Silks Logo" 
                  fill 
                  className="object-cover"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Right: Heritage & Enquire */}
          <div className="flex items-center justify-end lg:justify-start lg:pl-12 w-full">
            <div className="hidden lg:flex items-center gap-8 text-xs font-medium tracking-[0.2em] uppercase text-[#D4AF37]/80">
              <NavLink text="Heritage" href="/collection/heritage" />

              <button 
                onClick={() => setEnquiryModalOpen(true)}
                className="flex items-center gap-2 border border-[#D4AF37] px-4 py-1.5 rounded-sm text-xs uppercase tracking-wider text-[#210209] bg-[#D4AF37] hover:bg-[#E5C158] font-semibold transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Enquire</span>
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 z-50 bg-[#1A0106]/98 backdrop-blur-md border-b border-[#D4AF37]/30 px-6 py-6 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            <div className="flex flex-col gap-4 text-xs font-medium uppercase tracking-[0.25em]">
              <Link 
                href="/collection/sarees" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-left py-2.5 border-b border-[#D4AF37]/15 hover:text-[#FFF8E7] text-[#D4AF37]"
              >
                ✦ Pure Sarees
              </Link>
              <Link 
                href="/collection/jewellery" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-left py-2.5 border-b border-[#D4AF37]/15 hover:text-[#FFF8E7] text-[#D4AF37]"
              >
                ✤ Imitation Jewellery
              </Link>
              <Link 
                href="/collection/heritage" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-left py-2.5 border-b border-[#D4AF37]/15 hover:text-[#FFF8E7] text-[#D4AF37]"
              >
                ✺ Heritage Artifacts
              </Link>
              <a 
                href="https://www.instagram.com/jkk_silks?stkn=MWttamdoangxZWEzeA==" 
                target="_blank" 
                rel="noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2.5 border-b border-[#D4AF37]/15 hover:text-[#FFF8E7] text-[#D4AF37]"
              >
                <InstagramIcon className="w-4 h-4 text-[#E1306C]" /> Follow on Instagram
              </a>
              <a 
                href="https://wa.me/916309143484" 
                target="_blank" 
                rel="noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 border border-[#25D366] text-white bg-[#25D366] px-4 py-2.5 mt-2 rounded-sm text-xs uppercase tracking-wider font-semibold shadow-md"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp: +91 6309 143 484
              </a>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setEnquiryModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 border border-[#D4AF37] px-4 py-2.5 rounded-sm text-xs uppercase tracking-wider text-[#210209] bg-[#D4AF37] font-semibold cursor-pointer shadow-md"
              >
                <Mail className="w-4 h-4" /> Formal Enquiry
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Ornate Divider */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-center gap-4 pt-1 pb-6 opacity-70">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
        <LotusIcon className="w-10 h-10" />
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col items-center pb-32">
        
        {/* Full-width Hero Section with Large Flanking Golden Branches Connected to Page Ends */}
        <section className="relative w-full overflow-hidden flex items-center justify-center min-h-[240px] md:min-h-[300px] lg:min-h-[340px] pt-4 pb-2 md:pt-6 md:pb-4 my-0">
          {/* Left Golden Branch & Glowing Dots - connected directly to left edge of page */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 sm:w-56 md:w-72 lg:w-[380px] xl:w-[460px] 2xl:w-[540px] pointer-events-none select-none z-0 transition-all duration-500 opacity-40 sm:opacity-95 md:opacity-100 -translate-x-2 sm:translate-x-0">
            <div className="relative w-full h-full">
              <Image
                src="/images/golden_branch_left.png"
                alt="Left Decorative Golden Branch"
                width={1024}
                height={682}
                className="w-full h-auto object-contain filter drop-shadow-[0_8px_30px_rgba(212,175,55,0.35)]"
                priority
              />
              
              {/* Little Glowing Golden Dots around Left Branch */}
              {[
                { top: '10%', left: '78%', size: 4, delay: '0s', duration: '2.6s' },
                { top: '16%', left: '60%', size: 3, delay: '0.8s', duration: '3.2s' },
                { top: '22%', left: '88%', size: 5, delay: '1.4s', duration: '2.4s' },
                { top: '32%', left: '48%', size: 3, delay: '2.1s', duration: '3.6s' },
                { top: '42%', left: '70%', size: 4.5, delay: '0.3s', duration: '3.0s' },
                { top: '54%', left: '32%', size: 3, delay: '1.7s', duration: '2.8s' },
                { top: '64%', left: '44%', size: 4, delay: '1.1s', duration: '3.4s' },
                { top: '26%', left: '36%', size: 2.5, delay: '2.4s', duration: '3.9s' },
                { top: '6%', left: '85%', size: 3.5, delay: '1.5s', duration: '3.1s' },
                { top: '48%', left: '86%', size: 4, delay: '0.9s', duration: '2.7s' },
                { top: '76%', left: '20%', size: 3, delay: '1.2s', duration: '3.3s' },
                { top: '36%', left: '78%', size: 2.5, delay: '0.6s', duration: '2.3s' },
              ].map((dot, index) => (
                <span
                  key={`left-glow-dot-${index}`}
                  className="golden-glowing-dot"
                  style={{
                    top: dot.top,
                    left: dot.left,
                    width: `${dot.size}px`,
                    height: `${dot.size}px`,
                    animationDelay: dot.delay,
                    animationDuration: dot.duration,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Central Heritage Text */}
          <div className="relative z-10 text-center max-w-lg sm:max-w-xl md:max-w-2xl mx-auto px-6 py-4">
            <p className="text-[#D4AF37]/80 text-[10px] sm:text-xs tracking-[0.35em] uppercase mb-3 font-medium">
              Embrace the Heritage
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-[34px] lg:text-[38px] text-[#D4AF37] leading-snug md:leading-tight mb-4 drop-shadow-[0_2px_15px_rgba(212,175,55,0.25)]">
              Inspired by the Divine Grace of <br className="hidden sm:block" />
              <span className="italic font-light text-[#F5E6BE]">Kanchi & Kamakshi Amma</span>
            </h1>
            
            <p className="text-[#FFF8E7]/80 text-xs sm:text-[13px] tracking-wide leading-relaxed max-w-md md:max-w-lg mx-auto font-light">
              Step into a world of timeless elegance. Handcrafted weaves, pure zari craftsmanship, and exquisite heritage treasures curated for life&apos;s sacred celebrations.
            </p>
          </div>

          {/* Right Golden Branch & Glowing Dots - connected directly to right edge of page */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 sm:w-56 md:w-72 lg:w-[380px] xl:w-[460px] 2xl:w-[540px] pointer-events-none select-none z-0 transition-all duration-500 opacity-40 sm:opacity-95 md:opacity-100 translate-x-2 sm:translate-x-0">
            <div className="relative w-full h-full">
              <Image
                src="/images/golden_branch_right.png"
                alt="Right Decorative Golden Branch"
                width={1024}
                height={682}
                className="w-full h-auto object-contain filter drop-shadow-[0_8px_30px_rgba(212,175,55,0.35)]"
                priority
              />
              
              {/* Little Glowing Golden Dots around Right Branch */}
              {[
                { top: '10%', right: '78%', size: 4, delay: '0.4s', duration: '2.8s' },
                { top: '16%', right: '60%', size: 3, delay: '1.2s', duration: '3.3s' },
                { top: '22%', right: '88%', size: 5, delay: '1.8s', duration: '2.5s' },
                { top: '32%', right: '48%', size: 3, delay: '0.2s', duration: '3.5s' },
                { top: '42%', right: '70%', size: 4.5, delay: '1.5s', duration: '3.1s' },
                { top: '54%', right: '32%', size: 3, delay: '2.0s', duration: '3.2s' },
                { top: '64%', right: '44%', size: 4, delay: '0.7s', duration: '3.7s' },
                { top: '26%', right: '36%', size: 2.5, delay: '1.6s', duration: '4.1s' },
                { top: '6%', right: '85%', size: 3.5, delay: '0.5s', duration: '3.0s' },
                { top: '48%', right: '86%', size: 4, delay: '2.3s', duration: '2.7s' },
                { top: '76%', right: '20%', size: 3, delay: '0.9s', duration: '3.4s' },
                { top: '36%', right: '78%', size: 2.5, delay: '1.7s', duration: '2.4s' },
              ].map((dot, index) => (
                <span
                  key={`right-glow-dot-${index}`}
                  className="golden-glowing-dot"
                  style={{
                    top: dot.top,
                    right: dot.right,
                    width: `${dot.size}px`,
                    height: `${dot.size}px`,
                    animationDelay: dot.delay,
                    animationDuration: dot.duration,
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Explore Collection Section */}
        {loading ? (
          <div className="flex justify-center items-center py-16 w-full">
            <LotusAnimation />
          </div>
        ) : (
          <div className="w-full flex flex-col -mt-2 sm:-mt-6">
            <section className="w-full max-w-7xl mx-auto px-4">
              <div className="text-center mb-8 flex flex-col items-center">
                <LotusIcon className="w-8 h-8 sm:w-9 sm:h-9 mb-2 opacity-95 filter drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)]" />
                <h2 className="text-[#D4AF37] font-serif text-2xl sm:text-3xl mb-2">Explore Collection</h2>
                <p className="text-[#FFF8E7]/60 text-xs sm:text-sm tracking-wide font-light">Handpicked treasures curated just for you</p>
              </div>

              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {products.map((product) => (
                    <Link 
                      href={`/product/${product.id}`} 
                      key={product.id}
                      className="group relative flex flex-col bg-[#1A0106] rounded-md border border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300 overflow-hidden"
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden border-b border-[#D4AF37]/30">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {calculateDiscountPercent(product.original_price, product.discount_price) && (
                          <div className="absolute top-3 left-3 bg-[#D4AF37] text-[#210209] text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm shadow-md">
                            {calculateDiscountPercent(product.original_price, product.discount_price)}% Off
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-1 items-center text-center">
                        <h3 className="text-[#D4AF37] font-serif text-lg mb-2">{product.name}</h3>
                        {product.description && (
                          <p className="text-[#FFF8E7]/70 text-xs line-clamp-2 mb-4 leading-relaxed font-light">{product.description}</p>
                        )}
                        <div className="mt-auto flex flex-col items-center gap-1">
                          {product.discount_price ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[#D4AF37] font-medium">₹{product.discount_price.toLocaleString('en-IN')}</span>
                              <span className="text-[#FFF8E7]/50 text-xs line-through decoration-[#D4AF37]/50">₹{product.original_price?.toLocaleString('en-IN')}</span>
                            </div>
                          ) : product.original_price ? (
                            <span className="text-[#D4AF37] font-medium">₹{product.original_price.toLocaleString('en-IN')}</span>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="font-serif text-2xl sm:text-3xl text-[#D4AF37] tracking-[0.3em] uppercase font-light drop-shadow-[0_2px_15px_rgba(212,175,55,0.25)]">
                    Coming Soon
                  </p>
                  <p className="text-[#FFF8E7]/50 text-xs tracking-[0.15em] uppercase mt-3 font-light">
                    Curating sacred treasures for life&apos;s celebrations
                  </p>
                </div>
              )}
            </section>
          </div>
        )}

      </main>

      {/* Footer with Mail & Instagram Logos, Contact Us, and Address */}
      <footer className="w-full bg-[#140004] border-t border-[#D4AF37]/25 pt-10 pb-12 px-4 sm:px-6 lg:px-8 text-center text-[#D4AF37]/70">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-5">
          {/* Logos of Mail and Instagram */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setEnquiryModalOpen(true)}
              className="w-10 h-10 rounded-full border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#D4AF37] hover:text-[#FFF8E7] hover:bg-[#D4AF37]/10 flex items-center justify-center transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.15)]"
              title="Email Enquiry"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </button>

            <a 
              href="https://www.instagram.com/jkk_silks?stkn=MWttamdoangxZWEzeA==" 
              target="_blank" 
              rel="noreferrer"
              className="w-10 h-10 rounded-full border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#D4AF37] hover:text-[#FFF8E7] hover:bg-[#D4AF37]/10 flex items-center justify-center transition-all shadow-[0_0_15px_rgba(212,175,55,0.15)]"
              title="Instagram"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
          </div>

          {/* Contact Us & Phone Number */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-medium">
              Contact Us
            </span>
            <a 
              href="https://wa.me/916309143484" 
              target="_blank" 
              rel="noreferrer"
              className="text-sm font-medium text-[#FFF8E7] hover:text-[#25D366] transition-colors tracking-widest"
            >
              +91 6309 143 484
            </a>
          </div>

          {/* Address */}
          <p className="text-xs text-[#FFF8E7]/70 tracking-[0.2em] uppercase font-light">
            Wyra, Khammam
          </p>

          {/* Bottom Bar: Copyright | Policy Links | Admin Portal */}
          <div className="pt-6 border-t border-[#D4AF37]/15 w-full flex flex-col lg:flex-row items-center justify-between text-xs text-[#D4AF37]/60 tracking-wider gap-4">
            <p className="text-[11px] uppercase tracking-widest text-[#D4AF37]/50">
              &copy; {new Date().getFullYear()} JKK Silks. All Rights Reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-widest">
              <button 
                onClick={() => setActivePolicy('privacy')}
                className="hover:text-[#FFF8E7] transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => setActivePolicy('shipping')}
                className="hover:text-[#FFF8E7] transition-colors cursor-pointer"
              >
                Shipping Policy
              </button>
              <button 
                onClick={() => setActivePolicy('terms')}
                className="hover:text-[#FFF8E7] transition-colors cursor-pointer"
              >
                Terms Of Service
              </button>
              <button 
                onClick={() => setActivePolicy('return')}
                className="hover:text-[#FFF8E7] transition-colors cursor-pointer"
              >
                Return Policy
              </button>
            </div>

            <div className="text-[11px] uppercase tracking-widest">
              <Link href="/admin/login" className="text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Quick Contact, Enquiry Modal & Policy Modal */}
      <QuickContactFloating onOpenEnquiry={() => setEnquiryModalOpen(true)} />
      <EnquiryModal isOpen={enquiryModalOpen} onClose={() => setEnquiryModalOpen(false)} />
      <PolicyModal policy={activePolicy} onClose={() => setActivePolicy(null)} />
      
    </div>
  );
}
