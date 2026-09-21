'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
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
        <span className="petal center"></span>
      </div>
    </div>
  </div>
);

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        if (!initialQuery) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${initialQuery}%,description.ilike.%${initialQuery}%,category.ilike.%${initialQuery}%`)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Failed to fetch search results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const calculateDiscountPercent = (orig?: number | null, disc?: number | null) => {
    if (orig && disc && orig > disc && orig > 0) {
      return Math.round(((orig - disc) / orig) * 100);
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EBD4C9] text-[#8A5A19] font-sans selection:bg-[#8A5A19] selection:text-[#EBD4C9]">
      {/* Top Navigation */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-2 sm:pb-4 flex justify-between items-center">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[#8A5A19] hover:text-[#1F3324] transition-all text-xs uppercase tracking-[0.2em] font-medium bg-[#8A5A19]/10 hover:bg-[#8A5A19]/25 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-[#8A5A19]/30 hover:border-[#8A5A19] shadow-[0_0_15px_rgba(138,90,25,0.15)] active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <main className="flex-1 w-full flex flex-col items-center px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32">
        {loading ? (
          <div className="flex justify-center items-center py-20 w-full">
            <LotusAnimation />
          </div>
        ) : (
          <div className="w-full flex flex-col mt-4 sm:mt-8">
            <section className="w-full max-w-7xl mx-auto px-4">
              <div className="text-center mb-8 sm:mb-12 flex flex-col items-center">
                <LotusIcon className="w-8 h-8 sm:w-9 sm:h-9 mb-2.5 opacity-95" />
                <h2 className="text-[#8A5A19] font-serif text-2xl sm:text-3xl mb-2 sm:mb-3">Search Results</h2>
                
                <form onSubmit={handleSearch} className="relative w-full max-w-md mt-4">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for sarees, jewellery..."
                    className="w-full bg-white/50 border border-[#8A5A19]/30 text-[#1F3324] placeholder-[#1F3324]/50 rounded-full pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#8A5A19] focus:bg-white transition-all shadow-[0_4px_15px_rgba(138,90,25,0.05)]"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F3324]/50" />
                  <button type="submit" className="hidden">Search</button>
                </form>
                
                {initialQuery && (
                  <p className="mt-6 text-[#1F3324]/70 text-sm tracking-wide">
                    Found {products.length} {products.length === 1 ? 'result' : 'results'} for <span className="font-semibold italic text-[#8A5A19]">&quot;{initialQuery}&quot;</span>
                  </p>
                )}
              </div>

              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 max-w-sm sm:max-w-none mx-auto w-full">
                  {products.map((product) => (
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
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                        />
                      </div>
                      
                      <div className="p-4 sm:p-5 flex flex-col flex-grow relative bg-gradient-to-b from-[#EAE3D9] to-[#E3D8CA]">
                        <h3 className="text-base sm:text-lg font-serif text-[#1F3324] line-clamp-1 mb-1">{product.name}</h3>
                        <p className="text-[10px] sm:text-xs text-[#8A5A19] uppercase tracking-widest mb-3 font-medium opacity-80">{product.category}</p>
                        
                        <div className="mt-auto">
                          <div className="flex items-baseline gap-2">
                            {product.discount_price && product.discount_price > 0 && product.original_price && product.discount_price < product.original_price ? (
                              <>
                                <span className="text-base sm:text-lg font-semibold text-[#1F3324]">₹{product.discount_price.toLocaleString()}</span>
                                <span className="text-xs sm:text-sm text-[#1F3324]/50 line-through">₹{product.original_price.toLocaleString()}</span>
                                <span className="text-[10px] text-green-700 font-bold ml-auto bg-green-100 px-1.5 py-0.5 rounded-sm">
                                  {calculateDiscountPercent(product.original_price, product.discount_price)}% OFF
                                </span>
                              </>
                            ) : (
                              <span className="text-base sm:text-lg font-semibold text-[#1F3324]">₹{product.original_price?.toLocaleString() || 'Price on request'}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity pointer-events-none">
                          <LotusIcon className="w-8 h-8" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                initialQuery && !loading && (
                  <div className="text-center py-20 bg-[#EAE3D9] border border-[#8A5A19]/20 rounded-lg max-w-2xl mx-auto shadow-sm">
                    <Search className="w-12 h-12 text-[#1F3324]/20 mx-auto mb-4" />
                    <h3 className="text-xl font-serif text-[#1F3324] mb-2">No matching products</h3>
                    <p className="text-[#1F3324]/60 text-sm max-w-md mx-auto">
                      We couldn&apos;t find any products matching your search query. Try using different keywords or browsing our collections directly.
                    </p>
                    <Link 
                      href="/" 
                      className="mt-6 inline-block bg-[#1F3324] text-[#EBD4C9] px-6 py-2 rounded-sm text-xs uppercase tracking-wider font-semibold hover:bg-[#8A5A19] transition-colors"
                    >
                      Browse Collections
                    </Link>
                  </div>
                )
              )}
            </section>
          </div>
        )}
      </main>

      {/* Footer minimal */}
      <footer className="w-full bg-[#1F3324] text-[#EBD4C9] py-8 border-t-[4px] border-[#D4AF37]">
        <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center">
           <LotusIcon className="w-6 h-6 mb-3 opacity-70 brightness-200" />
           <p className="text-xs tracking-[0.2em] uppercase font-light">&copy; {new Date().getFullYear()} JKK Silks</p>
        </div>
      </footer>

      <EnquiryModal 
        isOpen={enquiryModalOpen} 
        onClose={() => setEnquiryModalOpen(false)} 
      />
      <QuickContactFloating onOpenEnquiry={() => setEnquiryModalOpen(true)} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-[#EBD4C9] justify-center items-center">
        <LotusAnimation />
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
