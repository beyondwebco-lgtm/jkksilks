'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, ShieldCheck, Truck, Mail } from 'lucide-react';
import { supabase, Product } from '@/lib/supabase';
import EnquiryModal from '@/components/EnquiryModal';
import QuickContactFloating from '@/components/QuickContactFloating';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || '';

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Drag-to-pan and Zoom state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoomOrigin, setZoomOrigin] = useState('center center');

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (isMounted) {
          setProduct(data);
        }
      } catch (err: any) {
        console.error('Error fetching product details:', err);
        if (isMounted) {
          setErrorMsg(err.message || JSON.stringify(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EBD4C9] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#8A5A19] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#EBD4C9] text-[#1F3324] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-serif text-3xl text-[#8A5A19] mb-4">Product Not Found</h1>
        <p className="text-[#8A5A19]/60 text-sm mb-4">This piece may have been reserved or moved.</p>
        {errorMsg && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-3 rounded-md mb-8 text-xs max-w-md break-all">
            Debug Info: {errorMsg}
            <br />
            ID: {id}
          </div>
        )}
        <Link
          href="/"
          className="border border-[#8A5A19] text-[#8A5A19] px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-[#8A5A19] hover:text-[#EBD4C9] transition-all"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  // Compile all available images
  const allImages = (product.image_urls && product.image_urls.length > 0)
    ? product.image_urls
    : [product.image_url];

  const currentImage = allImages[selectedImageIndex] || product.image_url;

  const calculateDiscountPercent = (orig?: number | null, disc?: number | null) => {
    if (orig && disc && orig > disc && orig > 0) {
      return Math.round(((orig - disc) / orig) * 100);
    }
    return null;
  };

  const discountPercent = calculateDiscountPercent(product.original_price, product.discount_price);

  const handleBuyOnWhatsApp = () => {
    const whatsappNumber = '916309143484';
    const priceText = product.discount_price
      ? `(₹${product.discount_price.toLocaleString('en-IN')})`
      : product.original_price
        ? `(₹${product.original_price.toLocaleString('en-IN')})`
        : '';

    let descText = product.description || '';
    try {
      if (descText.trim().startsWith('{')) {
        descText = JSON.parse(descText).text;
      }
    } catch (e) { }

    const message = `Hello JKK Silks,\n\nI am interested in purchasing this piece:\n*${product.name}* ${priceText}\nCategory: ${product.category.toUpperCase()}\n\n${descText ? `Note: "${descText}"\n\n` : ''}Could you please confirm availability and provide payment details? Thank you!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#EBD4C9] text-[#1F3324] flex flex-col font-sans selection:bg-[#8A5A19] selection:text-[#EBD4C9]">

      {/* Top Header */}
      <header className="w-full border-b border-[#8A5A19]/20 bg-[#E1C7BB]/90 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 sm:gap-2 text-[#8A5A19] hover:text-[#1F3324] transition-colors text-xs uppercase tracking-widest cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-[#8A5A19]/50">
            <Image src="/images/logo.jpg" alt="JKK Silks" fill className="object-cover" />
          </div>
          <span className="font-serif text-base sm:text-lg tracking-widest text-[#1F3324] font-semibold">JKK SILKS</span>
        </Link>

        <span className="text-[#8A5A19]/80 text-[10px] sm:text-xs uppercase tracking-widest font-medium">
          {product.category}
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* Left Column: Image Gallery */}
          <div className="space-y-3 sm:space-y-4 max-w-lg mx-auto md:max-w-none w-full">
            {/* Primary Large Image with bold golden border */}
            <div 
              className="relative w-full aspect-[3/4] rounded-sm overflow-hidden border-2 border-[#8A5A19] shadow-[0_0_35px_rgba(138,90,25,0.1)] bg-black/5 cursor-zoom-in group"
              onClick={() => setIsZoomModalOpen(true)}
            >
              <Image 
                src={currentImage} 
                alt={product.name} 
                fill 
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Thumbnails Row if multiple pictures exist */}
            {allImages.length > 1 && (
              <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 pt-1">
                {allImages.map((imgUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 rounded-sm overflow-hidden border-2 transition-all cursor-pointer bg-black/5 active:scale-95 ${selectedImageIndex === index
                        ? 'border-[#8A5A19] shadow-[0_0_12px_rgba(138,90,25,0.2)] scale-105'
                        : 'border-[#8A5A19]/30 hover:border-[#8A5A19]/70 opacity-70 hover:opacity-100'
                      }`}
                  >
                    <Image src={imgUrl} alt={`Thumbnail ${index + 1}`} fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Details & Purchase */}
          <div className="flex flex-col space-y-6 sm:space-y-8">
            <div className="space-y-5 sm:space-y-6">

              {/* Category & Title */}
              <div>
                <span className="inline-block text-[#8A5A19] text-[11px] sm:text-xs uppercase tracking-[0.3em] font-semibold mb-1.5 sm:mb-2 bg-[#8A5A19]/10 px-2 py-1 rounded-sm">
                  {product.category}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1F3324] leading-tight font-medium mt-1">
                  {product.name}
                </h1>
              </div>

              {/* Price Block matching reference */}
              {(product.original_price || product.discount_price) && (
                <div className="p-4 sm:p-5 bg-white/40 border border-[#8A5A19]/20 rounded-md shadow-sm inline-block w-full backdrop-blur-sm">
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                    <span className="text-[#1F3324] text-2xl sm:text-3xl font-bold tracking-tight">
                      MRP ₹{product.discount_price ? Number(product.discount_price).toLocaleString('en-IN') : Number(product.original_price).toLocaleString('en-IN')}
                    </span>
                    {product.discount_price && product.original_price && Number(product.original_price) > Number(product.discount_price) && (
                      <span className="text-[#8A5A19]/70 line-through text-base sm:text-lg font-medium">
                        ₹{Number(product.original_price).toLocaleString('en-IN')}
                      </span>
                    )}
                    {discountPercent && (
                      <span className="bg-[#1F3324] text-[#EBD4C9] px-2.5 py-1 rounded-sm text-xs sm:text-sm font-bold tracking-widest uppercase ml-auto sm:ml-2 shadow-md">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  <p className="text-[#8A5A19] text-[10px] sm:text-[11px] uppercase tracking-[0.15em] mt-2 font-medium">
                    Inclusive of all taxes • Pan-India Free Delivery
                  </p>
                </div>
              )}

              {/* Description */}
              {(() => {
                let descText = product.description || '';
                let colorName = '';
                let colorHex = '';
                let fabricSpec = '';

                try {
                  if (descText.trim().startsWith('{')) {
                    const parsed = JSON.parse(descText);
                    descText = parsed.text;
                    colorName = parsed.colorName;
                    colorHex = parsed.colorHex;
                    fabricSpec = parsed.fabricSpec;
                  }
                } catch (e) { }

                return (
                  <>
                    {(colorName || fabricSpec) && (
                      <div className="flex gap-6 mt-4 mb-2 pt-2 border-t border-[#8A5A19]/10">
                        {colorName && (
                          <div className="flex items-center gap-2.5 text-sm text-[#1F3324] font-medium">
                            <span className="text-[#8A5A19] uppercase tracking-widest text-[10px] font-bold">Color</span>
                            <div className="w-4 h-4 rounded-full border border-[#8A5A19]/40 shadow-sm" style={{ backgroundColor: colorHex }}></div>
                            <span>{colorName}</span>
                          </div>
                        )}
                        {fabricSpec && (
                          <div className="flex items-center gap-2.5 text-sm text-[#1F3324] font-medium">
                            <span className="text-[#8A5A19] uppercase tracking-widest text-[10px] font-bold">Fabric</span>
                            <span>{fabricSpec}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {descText && (
                      <div className="space-y-2 sm:space-y-2.5 pt-3 sm:pt-4">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-[#8A5A19] font-bold">
                          Product Description
                        </h3>
                        <p className="text-[#1F3324]/90 text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium">
                          {descText}
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 sm:gap-5 pt-4 sm:pt-5 border-t border-[#8A5A19]/20">
                <div className="flex items-center gap-3 sm:gap-3.5">
                  <div className="p-2.5 rounded-full border border-[#8A5A19]/40 bg-[#8A5A19]/10 text-[#1F3324]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm text-[#1F3324] font-semibold leading-tight">100% Authentic<br />Handloom</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-3.5">
                  <div className="p-2.5 rounded-full border border-[#8A5A19]/40 bg-[#8A5A19]/10 text-[#1F3324]">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm text-[#1F3324] font-semibold leading-tight">Safe & Insured<br />Shipping</span>
                </div>
              </div>
            </div>

            {/* Order Action Button */}
            <div className="pt-3 sm:pt-4 border-t border-[#8A5A19]/20 space-y-3">
              <button
                onClick={handleBuyOnWhatsApp}
                className="w-full py-3.5 sm:py-4 bg-[#1F3324] hover:bg-[#8A5A19] text-[#EBD4C9] font-bold text-xs sm:text-sm uppercase tracking-[0.2em] rounded-sm transition-all duration-300 flex items-center justify-center gap-2.5 sm:gap-3 shadow-[0_0_25px_rgba(31,51,36,0.15)] hover:shadow-[0_0_35px_rgba(138,90,25,0.25)] active:scale-[0.98] cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                Order via WhatsApp
              </button>

              <p className="text-center text-[#8A5A19]/60 text-[10px] uppercase tracking-widest mt-2">
                Direct weaver assistance • Instant response on WhatsApp
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#EAE3D9] border-t border-[#8A5A19]/20 py-6 text-center text-[#8A5A19]/60 text-[10px] uppercase tracking-[0.2em] px-4">
        <p>&copy; {new Date().getFullYear()} JKK Silks. All rights reserved.</p>
      </footer>

      {/* Floating Quick Contact */}
      <QuickContactFloating />

      {/* Image Zoom Modal */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 z-[100] bg-[#120004]/98 backdrop-blur-sm">
          
          <button 
            className="fixed top-4 right-4 sm:top-6 sm:right-6 text-[#EBD4C9] bg-white/10 hover:bg-white/20 rounded-full p-2 backdrop-blur-md transition-all z-[110]"
            onClick={() => {
              setIsZoomModalOpen(false);
              setIsZoomed(false);
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          
          <div 
            className="w-full h-full flex items-center justify-center overflow-hidden"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isZoomed) {
                setIsZoomModalOpen(false);
              }
            }}
            onMouseDown={(e) => {
              if (isZoomed) {
                setIsDragging(true);
                setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
              }
            }}
            onMouseMove={(e) => {
              if (isDragging && isZoomed) {
                setTranslate({
                  x: e.clientX - dragStart.x,
                  y: e.clientY - dragStart.y
                });
              }
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            <div 
              className={`relative w-full h-full max-h-[90vh] max-w-[90vw] ${isZoomed ? 'transition-none cursor-grab active:cursor-grabbing' : 'transition-transform duration-300 ease-out cursor-zoom-in'}`}
              style={{
                transformOrigin: zoomOrigin,
                transform: `translate(${translate.x}px, ${translate.y}px) scale(${isZoomed ? 2.5 : 1})`
              }}
              onDragStart={(e) => e.preventDefault()}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (!isZoomed) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  setZoomOrigin(`${x}% ${y}%`);
                  setIsZoomed(true);
                  setTranslate({ x: 0, y: 0 });
                } else {
                  setIsZoomed(false);
                  setTranslate({ x: 0, y: 0 });
                }
                setIsDragging(false);
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Image 
                src={currentImage} 
                alt={product.name} 
                fill 
                className="object-contain"
                quality={100}
                draggable={false}
              />
            </div>
          </div>
          
          <div className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-[110]">
            <span className="bg-[#1F3324] text-[#EBD4C9] text-[10px] sm:text-xs uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg border border-[#8A5A19]/30">
              Double-click to {isZoomed ? 'zoom out' : 'zoom in'}
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
