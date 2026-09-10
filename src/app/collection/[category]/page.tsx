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

const FilterIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" x2="14" y1="4" y2="4" />
    <line x1="10" x2="3" y1="4" y2="4" />
    <line x1="21" x2="12" y1="12" y2="12" />
    <line x1="8" x2="3" y1="12" y2="12" />
    <line x1="21" x2="16" y1="20" y2="20" />
    <line x1="12" x2="3" y1="20" y2="20" />
    <line x1="14" x2="14" y1="2" y2="6" />
    <line x1="8" x2="8" y1="10" y2="14" />
    <line x1="16" x2="16" y1="18" y2="22" />
  </svg>
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
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');

  const priceRanges = [
    { id: 'all', label: 'All Prices', min: 0, max: Infinity },
    { id: 'under-5k', label: 'Under ₹5,000', min: 0, max: 5000 },
    { id: '5k-15k', label: '₹5,000 – ₹15,000', min: 5000, max: 15000 },
    { id: '15k-30k', label: '₹15,000 – ₹30,000', min: 15000, max: 30000 },
    { id: 'above-30k', label: '₹30,000 & Above', min: 30000, max: Infinity },
  ];

  const getProductPrice = (p: Product) => {
    return p.discount_price ?? p.original_price ?? 0;
  };

  const filteredProducts = products
    .filter((product) => {
      if (selectedPriceRange === 'all') return true;
      const range = priceRanges.find((r) => r.id === selectedPriceRange);
      if (!range) return true;
      const price = getProductPrice(product);
      return price >= range.min && (range.max === Infinity ? true : price < range.max);
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') {
        return getProductPrice(a) - getProductPrice(b);
      }
      if (sortBy === 'price-desc') {
        return getProductPrice(b) - getProductPrice(a);
      }
      return 0;
    });

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

              {/* Cost-Based Filter & Sorting Bar */}
              {products.length > 0 && (
                <div className="w-full mb-8">
                  <div className="bg-[#180106]/90 border border-[#D4AF37]/30 rounded-md p-3.5 sm:p-4 shadow-[0_0_20px_rgba(212,175,55,0.1)] backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4">
                    
                    {/* Price Range Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                      <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-medium mr-1.5 whitespace-nowrap flex items-center gap-1.5">
                        <FilterIcon className="w-3.5 h-3.5 text-[#D4AF37]" /> Price:
                      </span>
                      {priceRanges.map((range) => {
                        const isSelected = selectedPriceRange === range.id;
                        return (
                          <button
                            key={range.id}
                            onClick={() => setSelectedPriceRange(range.id)}
                            className={`px-3 py-1.5 rounded-full text-xs tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                              isSelected
                                ? 'bg-[#D4AF37] text-[#210209] font-semibold shadow-[0_0_15px_rgba(212,175,55,0.35)] scale-105'
                                : 'bg-[#120004] text-[#D4AF37]/80 hover:text-[#FFF8E7] border border-[#D4AF37]/30 hover:border-[#D4AF37]'
                            }`}
                          >
                            {range.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Sort Dropdown & Count */}
                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                      <span className="text-xs text-[#FFF8E7]/60 tracking-wider">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
                      </span>

                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="bg-[#120004] border border-[#D4AF37]/30 text-[#D4AF37] text-xs py-1.5 px-3 rounded-sm tracking-wider focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                        >
                          <option value="default">Sort: Default</option>
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                        </select>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredProducts.map((product) => (
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
              ) : products.length > 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="font-serif text-2xl text-[#D4AF37] mb-2">No Sarees In This Price Range</p>
                  <p className="text-xs text-[#FFF8E7]/60 tracking-wider mb-6">Try selecting another cost bracket or reset your filter.</p>
                  <button
                    onClick={() => { setSelectedPriceRange('all'); setSortBy('default'); }}
                    className="border border-[#D4AF37] bg-[#D4AF37] text-[#210209] font-medium hover:bg-[#E5C158] px-6 py-2.5 text-xs uppercase tracking-widest rounded-sm transition-all cursor-pointer shadow-md"
                  >
                    Reset Price Filters
                  </button>
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
