'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Product } from '@/lib/supabase';

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

const calculateDiscountPercent = (orig?: number | null, disc?: number | null) => {
  if (orig && disc && orig > disc && orig > 0) {
    return Math.round(((orig - disc) / orig) * 100);
  }
  return null;
};

interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export default function CategoryProductGrid({
  categoryInfo,
  initialProducts
}: {
  categoryInfo: CategoryInfo;
  initialProducts: Product[];
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = initialProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
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
            {filteredProducts.map((product, index) => (
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
                    priority={index < 4}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
  );
}
