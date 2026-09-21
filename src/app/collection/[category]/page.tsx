'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Mail, Search } from 'lucide-react';
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
  const params = useParams();
  const categoryId = params?.category as string;
  const [categoryInfo, setCategoryInfo] = useState({
    id: categoryId,
    name: categoryId ? categoryId.charAt(0).toUpperCase() + categoryId.slice(1) : '',
    description: `Discover our collection of ${categoryId}`,
    icon: '✦',
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let categoryNamesToQuery: string[] = [];

        const res = await fetch('/api/categories');
        if (res.ok) {
          const allCategories = await res.json();
          type CatType = { name: string, section: string, id: string, description?: string };
          
          if (['sarees', 'jewellery', 'heritage', 'dresses'].includes(categoryId)) {
            // Main section: get all subcategories in this section
            const sectionCategories = allCategories.filter((c: CatType) => c.section === categoryId);
            categoryNamesToQuery = sectionCategories.map((c: CatType) => c.name);
            categoryNamesToQuery.push(categoryId); // for older products saved directly under 'sarees'
            
            // Set basic info for main section
            if (curatedCategories[categoryId as keyof typeof curatedCategories]) {
              setCategoryInfo(curatedCategories[categoryId as keyof typeof curatedCategories]);
            }
          } else {
            // Subcategory page
            const matchedCategory = allCategories.find((c: CatType) => 
              c.name.toLowerCase().replace(/\s+/g, '-') === categoryId
            );
            if (matchedCategory) {
              categoryNamesToQuery = [matchedCategory.name];
              setCategoryInfo({
                id: matchedCategory.id,
                name: matchedCategory.name,
                description: matchedCategory.description || `Explore our exclusive ${matchedCategory.name} collection.`,
                icon: '✧'
              });
            } else {
              categoryNamesToQuery = [categoryId.replace(/-/g, ' ')];
            }
          }
        } else {
          categoryNamesToQuery = [categoryId.replace(/-/g, ' ')];
        }

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('category', categoryNamesToQuery)
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
    <div className="min-h-screen flex flex-col bg-[#EBD4C9] text-[#8A5A19] font-sans selection:bg-[#8A5A19] selection:text-[#EBD4C9]">
      {/* Top Navigation: Only Back to Home Button */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-2 sm:pb-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[#8A5A19] hover:text-[#1F3324] transition-all text-xs uppercase tracking-[0.2em] font-medium bg-[#8A5A19]/10 hover:bg-[#8A5A19]/25 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-[#8A5A19]/30 hover:border-[#8A5A19] shadow-[0_0_15px_rgba(138,90,25,0.15)] active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col items-center px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32">
        
        {/* Category Products */}
        {loading ? (
          <div className="flex justify-center items-center py-20 w-full">
            <LotusAnimation />
          </div>
        ) : (
          <div className="w-full flex flex-col mt-4 sm:mt-8">
            <section className="w-full max-w-7xl mx-auto px-4">
              <div className="text-center mb-8 sm:mb-10 flex flex-col items-center">
                <LotusIcon className="w-8 h-8 sm:w-9 sm:h-9 mb-2.5 opacity-95" />
                <h2 className="text-[#8A5A19] font-serif text-2xl sm:text-3xl mb-2 sm:mb-3">{categoryInfo.name}</h2>
                <p className="text-[#1F3324]/60 text-xs sm:text-sm tracking-wide font-light max-w-md mb-6">{categoryInfo.description}</p>
                
                <div className="relative w-full max-w-md">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search this collection..."
                    className="w-full bg-white/50 border border-[#8A5A19]/20 text-[#1F3324] placeholder-[#1F3324]/50 rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:border-[#8A5A19] focus:bg-white transition-all shadow-[0_2px_10px_rgba(138,90,25,0.05)]"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F3324]/50" />
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 max-w-sm sm:max-w-none mx-auto w-full">
                  {filteredProducts.map((product) => (
                    <Link 
                      href={`/product/${product.id}`} 
                      key={product.id}
                      className="group relative flex flex-col bg-[#EAE3D9] rounded-md border border-[#8A5A19] shadow-[0_0_15px_rgba(138,90,25,0.2)] hover:shadow-[0_0_30px_rgba(138,90,25,0.4)] transition-all duration-300 overflow-hidden active:scale-[0.99]"
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden border-b border-[#8A5A19]/30">
                        <Image 
                          src={product.image_url} 
                          alt={product.name} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        {calculateDiscountPercent(product.original_price, product.discount_price) && (
                          <div className="absolute top-3 left-3 bg-[#8A5A19] text-[#EBD4C9] text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm shadow-md">
                            {calculateDiscountPercent(product.original_price, product.discount_price)}% Off
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-1 items-center text-center">
                        <h3 className="text-[#8A5A19] font-serif text-lg mb-2">{product.name}</h3>
                        {(() => {
                          let descText = product.description || '';
                          let colorName = '';
                          let colorHex = '';
                          try {
                            if (descText.trim().startsWith('{')) {
                              const parsed = JSON.parse(descText);
                              descText = parsed.text;
                              colorName = parsed.colorName;
                              colorHex = parsed.colorHex;
                            }
                          } catch (e) {}
                          
                          return (
                            <>
                              {(colorName || colorHex) && (
                                <div className="flex items-center gap-1.5 mb-2 mt-1 justify-center">
                                  {colorHex && <div className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: colorHex }}></div>}
                                  {colorName && <span className="text-[10px] text-[#1F3324]/60 uppercase tracking-wider">{colorName}</span>}
                                </div>
                              )}
                              {descText && (
                                <p className="text-[#1F3324]/70 text-xs line-clamp-2 mb-4 leading-relaxed font-light">{descText}</p>
                              )}
                            </>
                          );
                        })()}
                        <div className="mt-auto flex flex-col items-center gap-1">
                          {product.discount_price ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[#8A5A19] font-medium">₹{product.discount_price.toLocaleString('en-IN')}</span>
                              <span className="text-[#1F3324]/50 text-xs line-through decoration-[#8A5A19]/50">₹{product.original_price?.toLocaleString('en-IN')}</span>
                            </div>
                          ) : product.original_price ? (
                            <span className="text-[#8A5A19] font-medium">₹{product.original_price.toLocaleString('en-IN')}</span>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="font-serif text-2xl sm:text-3xl text-[#8A5A19] tracking-[0.3em] uppercase font-light drop-shadow-[0_2px_15px_rgba(138,90,25,0.25)]">
                    Coming Soon
                  </p>
                  <p className="text-[#1F3324]/50 text-xs tracking-[0.15em] uppercase mt-3 font-light">
                    Curating sacred treasures for life&apos;s celebrations
                  </p>
                </div>
              )}
            </section>
          </div>
        )}

      </main>

      {/* Sleek Horizontal Footer Bar */}
      <footer className="w-full bg-[#E1C7BB] border-t border-[#8A5A19]/25 py-6 px-4 sm:px-6 lg:px-8 text-[#8A5A19]/70">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          {/* Left: Copyright & Return link */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-widest text-[#8A5A19]/60">
            <p>&copy; {new Date().getFullYear()} JKK Silks. All Rights Reserved.</p>
            <span>&bull;</span>
            <Link href="/" className="text-[#8A5A19]/80 hover:text-[#1F3324] transition-colors underline sm:no-underline">
              Return to Storefront
            </Link>
          </div>

          {/* Right in series: Address | Contact Us | Logos */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 gap-y-2.5 text-xs">
            {/* Address */}
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#1F3324]/70">
              Wyra, Khammam
            </span>

            <span className="hidden sm:inline text-[#8A5A19]/30">&bull;</span>

            {/* Contact Us & Phone */}
            <div className="flex items-center gap-1.5 text-[11px] tracking-wider">
              <span className="uppercase text-[#8A5A19] font-medium tracking-widest">Contact Us:</span>
              <a 
                href="https://wa.me/916309143484" 
                target="_blank" 
                rel="noreferrer"
                className="text-[#1F3324] hover:text-[#25D366] transition-colors font-medium tracking-wider"
              >
                +91 6309 143 484
              </a>
            </div>

            <span className="hidden sm:inline text-[#8A5A19]/30">&bull;</span>

            {/* Logos of Mail and Instagram */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEnquiryModalOpen(true)}
                className="w-8 h-8 rounded-full border border-[#8A5A19]/40 hover:border-[#8A5A19] text-[#8A5A19] hover:text-[#1F3324] hover:bg-[#8A5A19]/10 flex items-center justify-center transition-all cursor-pointer shadow-[0_0_10px_rgba(138,90,25,0.15)] active:scale-95"
                title="Email Enquiry"
                aria-label="Email"
              >
                <Mail className="w-3.5 h-3.5" />
              </button>

              <a 
                href="https://www.instagram.com/jkk_silks?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-[#8A5A19]/40 hover:border-[#8A5A19] text-[#8A5A19] hover:text-[#1F3324] hover:bg-[#8A5A19]/10 flex items-center justify-center transition-all shadow-[0_0_10px_rgba(138,90,25,0.15)] active:scale-95"
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
