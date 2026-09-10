'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Mail } from 'lucide-react';
import { InstagramIcon } from '@/components/Icons';
import { supabase, Product } from '@/lib/supabase';
import EnquiryModal from '@/components/EnquiryModal';
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

const curatedCategories = {
  sarees: {
    id: 'sarees',
    name: 'Pure Sarees',
    description: 'Handwoven Kanjivaram, Banarasi & Pure Silk Sarees',
    icon: '✦',
  },
  jewellery: {
    id: 'jewellery',
    name: 'Imitation Jewellery',
    description: 'Intricate temple necklaces, matte jhumkas & bridal adornments',
    icon: '✤',
  },
  heritage: {
    id: 'heritage',
    name: 'Heritage Artifacts',
    description: 'Sacred bronze pieces, puja brassware & divine heirlooms',
    icon: '✺',
  },
};

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.category as string;
  const categoryInfo = curatedCategories[categoryId as keyof typeof curatedCategories] || {
    id: categoryId,
    name: categoryId ? categoryId.charAt(0).toUpperCase() + categoryId.slice(1) : '',
    description: `Discover our collection of ${categoryId}`,
    icon: '✦',
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', categoryId)
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
    if (categoryId) {
      fetchProducts();
    }
  }, [categoryId]);

  const calculateDiscountPercent = (orig?: number | null, disc?: number | null) => {
    if (orig && disc && orig > disc && orig > 0) {
      return Math.round(((orig - disc) / orig) * 100);
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#210209] text-[#D4AF37] font-sans selection:bg-[#D4AF37] selection:text-[#210209]">
      {/* Top Navigation: Only Back to Home Button */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#FFF8E7] transition-all text-xs uppercase tracking-[0.2em] font-medium bg-[#D4AF37]/10 hover:bg-[#D4AF37]/25 px-5 py-2.5 rounded-full border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col items-center px-4 sm:px-6 lg:px-8 pb-32">
        
        {/* Category Products */}
        {loading ? (
          <div className="flex justify-center items-center py-20 w-full">
            <LotusAnimation />
          </div>
        ) : (
          <div className="w-full flex flex-col mt-8">
            <section className="w-full max-w-7xl mx-auto px-4">
              <div className="text-center mb-10 flex flex-col items-center">
                <LotusIcon className="w-9 h-9 mb-2.5 opacity-95 filter drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)]" />
                <h2 className="text-[#D4AF37] font-serif text-3xl mb-3">{categoryInfo.name}</h2>
                <p className="text-[#FFF8E7]/60 text-sm tracking-wide font-light">{categoryInfo.description}</p>
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

      {/* Sleek Horizontal Footer Bar */}
      <footer className="w-full bg-[#140004] border-t border-[#D4AF37]/25 py-6 px-4 sm:px-6 lg:px-8 text-[#D4AF37]/70">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Copyright & Return link */}
          <div className="flex items-center gap-4 text-[11px] uppercase tracking-widest text-[#D4AF37]/60">
            <p>&copy; {new Date().getFullYear()} JKK Silks. All Rights Reserved.</p>
            <span>&bull;</span>
            <Link href="/" className="text-[#D4AF37]/80 hover:text-[#FFF8E7] transition-colors">
              Return to Storefront
            </Link>
          </div>

          {/* Right in series: Address | Contact Us | Logos */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-2 text-xs">
            {/* Address */}
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#FFF8E7]/70">
              Wyra, Khammam
            </span>

            <span className="hidden sm:inline text-[#D4AF37]/30">&bull;</span>

            {/* Contact Us & Phone */}
            <div className="flex items-center gap-1.5 text-[11px] tracking-wider">
              <span className="uppercase text-[#D4AF37] font-medium tracking-widest">Contact Us:</span>
              <a 
                href="https://wa.me/916309143484" 
                target="_blank" 
                rel="noreferrer"
                className="text-[#FFF8E7] hover:text-[#25D366] transition-colors font-medium tracking-wider"
              >
                +91 6309 143 484
              </a>
            </div>

            <span className="hidden sm:inline text-[#D4AF37]/30">&bull;</span>

            {/* Logos of Mail and Instagram */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEnquiryModalOpen(true)}
                className="w-8 h-8 rounded-full border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#D4AF37] hover:text-[#FFF8E7] hover:bg-[#D4AF37]/10 flex items-center justify-center transition-all cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.15)]"
                title="Email Enquiry"
                aria-label="Email"
              >
                <Mail className="w-3.5 h-3.5" />
              </button>

              <a 
                href="https://www.instagram.com/jkk_silks?stkn=MWttamdoangxZWEzeA==" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#D4AF37] hover:text-[#FFF8E7] hover:bg-[#D4AF37]/10 flex items-center justify-center transition-all shadow-[0_0_10px_rgba(212,175,55,0.15)]"
                title="Instagram"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Quick Contact & Enquiry Modal */}
      <QuickContactFloating onOpenEnquiry={() => setEnquiryModalOpen(true)} />
      <EnquiryModal 
        isOpen={enquiryModalOpen} 
        onClose={() => setEnquiryModalOpen(false)} 
        defaultCategory={categoryInfo.name} 
      />
      
    </div>
  );
}
