import Link from 'next/link';
import Image from 'next/image';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1A0106] flex flex-col md:flex-row font-sans text-[#D4AF37]">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#210209] border-r border-[#D4AF37]/20 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-[#D4AF37]/20 flex flex-col items-center">
          <Link href="/" className="relative h-24 w-24 rounded-full overflow-hidden border border-[#D4AF37]/40 hover:scale-105 transition-transform duration-300 block cursor-pointer mb-4">
            <Image 
              src="/images/logo.jpg" 
              alt="JKK Silks Logo" 
              fill 
              className="object-cover"
              priority
            />
          </Link>
          <h2 className="text-lg font-serif text-[#D4AF37] tracking-wider text-center">JKK Admin</h2>
          <p className="text-[10px] text-[#D4AF37]/60 mt-1 uppercase tracking-[0.2em] text-center">Catalog Manager</p>
        </div>
        
        <nav className="p-4 flex flex-col gap-2 flex-1">
          <Link 
            href="/admin/new-collection" 
            className="px-4 py-3 text-sm font-semibold rounded-sm border border-[#D4AF37]/40 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] transition-all uppercase tracking-widest text-center flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
          >
            <span>✨ New Collection</span>
          </Link>
          <div className="h-[1px] bg-[#D4AF37]/20 my-1"></div>
          <Link 
            href="/admin/sarees" 
            className="px-4 py-3 text-sm font-medium rounded-sm border border-transparent hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-colors uppercase tracking-widest text-center"
          >
            Sarees
          </Link>
          <Link 
            href="/admin/jewellery" 
            className="px-4 py-3 text-sm font-medium rounded-sm border border-transparent hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-colors uppercase tracking-widest text-center"
          >
            Jewellery
          </Link>
          <Link 
            href="/admin/heritage" 
            className="px-4 py-3 text-sm font-medium rounded-sm border border-transparent hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-colors uppercase tracking-widest text-center"
          >
            Heritage
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-br from-[#1A0106] to-[#210209]">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
      
    </div>
  );
}
