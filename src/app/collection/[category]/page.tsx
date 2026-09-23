import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { InstagramIcon } from '@/components/Icons';
import { supabase } from '@/lib/supabase';
import QuickContactFloating from '@/components/QuickContactFloating';
import CategoryProductGrid from '@/components/CategoryProductGrid';

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

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categoryId } = await params;
  
  let categoryInfo = {
    id: categoryId,
    name: categoryId ? categoryId.charAt(0).toUpperCase() + categoryId.slice(1) : '',
    description: `Discover our collection of ${categoryId}`,
    icon: '✦',
  };

  let products = [];
  let categoryNamesToQuery: string[] = [];

  try {
    const { data: allCategories } = await supabase.from('categories').select('*');
    
    if (allCategories) {
      if (['sarees', 'jewellery', 'heritage', 'dresses'].includes(categoryId)) {
        // Main section: get all subcategories in this section
        const sectionCategories = allCategories.filter(c => c.section === categoryId);
        categoryNamesToQuery = sectionCategories.map(c => c.name);
        categoryNamesToQuery.push(categoryId); // for older products saved directly under 'sarees'
        
        // Set basic info for main section
        if (curatedCategories[categoryId as keyof typeof curatedCategories]) {
          categoryInfo = curatedCategories[categoryId as keyof typeof curatedCategories];
        }
      } else {
        // Subcategory page
        const matchedCategory = allCategories.find(c => 
          c.name.toLowerCase().replace(/\s+/g, '-') === categoryId
        );
        if (matchedCategory) {
          categoryNamesToQuery = [matchedCategory.name];
          categoryInfo = {
            id: matchedCategory.id,
            name: matchedCategory.name,
            description: matchedCategory.description || `Explore our exclusive ${matchedCategory.name} collection.`,
            icon: '✧'
          };
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
      products = data;
    }
  } catch (err) {
    console.error('Failed to fetch products:', err);
  }

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
        <CategoryProductGrid 
          categoryInfo={categoryInfo}
          initialProducts={products}
        />
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
              <a
                href="mailto:jkksilks1@gmail.com"
                className="w-8 h-8 rounded-full border border-[#8A5A19]/40 hover:border-[#8A5A19] text-[#8A5A19] hover:text-[#1F3324] hover:bg-[#8A5A19]/10 flex items-center justify-center transition-all cursor-pointer shadow-[0_0_10px_rgba(138,90,25,0.15)] active:scale-95"
                title="Email Enquiry"
                aria-label="Email"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>

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
      <QuickContactFloating />
      
    </div>
  );
}
