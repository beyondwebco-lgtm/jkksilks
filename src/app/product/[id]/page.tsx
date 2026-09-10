'use client';

import { useState, useEffect } from 'react';
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    const fetchProduct = async () => {
      setLoading(true);
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
      } catch (err) {
        console.error('Error fetching product details:', err);
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
      <div className="min-h-screen bg-[#210209] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#210209] text-[#FFF8E7] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-serif text-3xl text-[#D4AF37] mb-4">Product Not Found</h1>
        <p className="text-[#D4AF37]/60 text-sm mb-8">This piece may have been reserved or moved.</p>
        <Link 
          href="/" 
          className="border border-[#D4AF37] text-[#D4AF37] px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#210209] transition-all"
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
    
    const message = `Hello JKK Silks,\n\nI am interested in purchasing this piece:\n*${product.name}* ${priceText}\nCategory: ${product.category.toUpperCase()}\n\n${product.description ? `Note: "${product.description}"\n\n` : ''}Could you please confirm availability and provide payment details? Thank you!`;
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#210209] text-[#FFF8E7] flex flex-col font-sans selection:bg-[#D4AF37] selection:text-[#210209]">
      
      {/* Top Header */}
      <header className="w-full border-b border-[#D4AF37]/20 bg-[#1A0106]/90 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-1.5 sm:gap-2 text-[#D4AF37] hover:text-white transition-colors text-xs uppercase tracking-widest cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-[#D4AF37]/50">
            <Image src="/images/logo.jpg" alt="JKK Silks" fill className="object-cover" />
          </div>
          <span className="font-serif text-base sm:text-lg tracking-widest text-[#D4AF37] font-semibold">JKK SILKS</span>
        </Link>

        <span className="text-[#D4AF37]/80 text-[10px] sm:text-xs uppercase tracking-widest font-medium">
          {product.category}
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">
          
          {/* Left Column: Image Gallery */}
          <div className="space-y-3 sm:space-y-4 max-w-lg mx-auto md:max-w-none w-full">
            {/* Primary Large Image with bold golden border */}
            <div className="relative w-full aspect-[3/4] rounded-sm overflow-hidden border-2 border-[#D4AF37] shadow-[0_0_35px_rgba(212,175,55,0.15)] bg-black/40">
              <Image 
                src={currentImage} 
                alt={product.name} 
                fill 
                priority
                className="object-cover transition-all duration-500"
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
                    className={`relative w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 rounded-sm overflow-hidden border-2 transition-all cursor-pointer bg-black/30 active:scale-95 ${
                      selectedImageIndex === index 
                        ? 'border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.4)] scale-105' 
                        : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/70 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={imgUrl} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Details & Purchase */}
          <div className="flex flex-col justify-between h-full space-y-6 sm:space-y-8">
            <div className="space-y-5 sm:space-y-6">
              
              {/* Category & Title */}
              <div>
                <span className="inline-block text-[#D4AF37]/70 text-[11px] sm:text-xs uppercase tracking-[0.3em] font-semibold mb-1.5 sm:mb-2">
                  {product.category}
                </span>
                <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-[#D4AF37] leading-tight font-medium">
                  {product.name}
                </h1>
              </div>

              {/* Price Block matching reference */}
              {(product.original_price || product.discount_price) && (
                <div className="p-3.5 sm:p-4 bg-[#1A0106] border border-[#D4AF37]/30 rounded-sm inline-block w-full">
                  <div className="flex items-baseline gap-2.5 sm:gap-3 flex-wrap">
                    <span className="text-white text-xl sm:text-3xl font-bold tracking-tight">
                      MRP ₹{product.discount_price ? Number(product.discount_price).toLocaleString('en-IN') : Number(product.original_price).toLocaleString('en-IN')}
                    </span>
                    {product.discount_price && product.original_price && Number(product.original_price) > Number(product.discount_price) && (
                      <span className="text-gray-400 line-through text-sm sm:text-lg">
                        ₹{Number(product.original_price).toLocaleString('en-IN')}
                      </span>
                    )}
                    {discountPercent && (
                      <span className="text-[#E57373] text-sm sm:text-lg font-bold italic ml-1 sm:ml-2">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  <p className="text-[#D4AF37]/50 text-[10px] sm:text-[11px] uppercase tracking-wider mt-1">
                    Inclusive of all taxes • Pan-India Free Delivery
                  </p>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="space-y-1.5 sm:space-y-2 pt-1 sm:pt-2">
                  <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                    Product Description
                  </h3>
                  <p className="text-[#FFF8E7]/80 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-light">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-[#D4AF37]/20">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="p-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] sm:text-xs text-[#D4AF37]/80 font-medium">100% Authentic Handloom</span>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="p-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37]">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] sm:text-xs text-[#D4AF37]/80 font-medium">Safe & Insured Shipping</span>
                </div>
              </div>
            </div>

            {/* Order Action Button */}
            <div className="pt-4 sm:pt-6 border-t border-[#D4AF37]/20 space-y-3">
              <button
                onClick={handleBuyOnWhatsApp}
                className="w-full py-3.5 sm:py-4 bg-[#D4AF37] hover:bg-[#c49f2e] text-[#210209] font-bold text-xs sm:text-sm uppercase tracking-[0.2em] rounded-sm transition-all duration-300 flex items-center justify-center gap-2.5 sm:gap-3 shadow-[0_0_25px_rgba(212,175,55,0.25)] hover:shadow-[0_0_35px_rgba(212,175,55,0.4)] active:scale-[0.98] cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                Order via WhatsApp
              </button>

              <button
                onClick={() => setEnquiryModalOpen(true)}
                className="w-full py-3 sm:py-3.5 border border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#D4AF37] font-semibold text-xs uppercase tracking-[0.2em] rounded-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                Formal Enquiry (Email)
              </button>

              <p className="text-center text-[#D4AF37]/60 text-[10px] uppercase tracking-widest">
                Direct weaver assistance • Instant response on WhatsApp
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#1A0106] border-t border-[#D4AF37]/20 py-6 text-center text-[#D4AF37]/60 text-[10px] uppercase tracking-[0.2em] px-4">
        <p>&copy; {new Date().getFullYear()} JKK Silks. All rights reserved.</p>
      </footer>

      {/* Floating Quick Contact & Enquiry Modal */}
      <QuickContactFloating onOpenEnquiry={() => setEnquiryModalOpen(true)} />
      <EnquiryModal
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        defaultCategory={product?.category ? product.category.toUpperCase() : 'Pure Silk Sarees'}
        defaultProduct={product?.name || ''}
      />

    </div>
  );
}
