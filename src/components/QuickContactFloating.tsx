'use client';

import { MessageCircle, Mail } from 'lucide-react';
import { InstagramIcon } from './Icons';

interface QuickContactFloatingProps {
  onOpenEnquiry: () => void;
}

export default function QuickContactFloating({ onOpenEnquiry }: QuickContactFloatingProps) {
  const whatsappUrl = 'https://wa.me/916309143484';
  const instagramUrl = 'https://www.instagram.com/jkk_silks?stkn=MWttamdoangxZWEzeA==';

  return (
    <aside aria-label="Quick contact" className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto select-none">
      {/* Instagram Button */}
      <a
        href={instagramUrl}
        target="_blank"
        rel="noreferrer"
        className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(225,48,108,0.4)] hover:scale-110 transition-transform duration-300"
        title="Follow JKK Silks on Instagram"
        aria-label="Instagram"
      >
        <InstagramIcon className="w-5 h-5" />
      </a>

      {/* Enquiry Form Trigger Button */}
      <button
        onClick={onOpenEnquiry}
        className="w-11 h-11 rounded-full bg-[#1A0106] border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center shadow-[0_4px_16px_rgba(212,175,55,0.3)] hover:scale-110 hover:bg-[#D4AF37] hover:text-[#210209] transition-all duration-300 cursor-pointer"
        title="Formal Enquiry (jikkichowdary1@gmail.com)"
        aria-label="Submit Enquiry"
      >
        <Mail className="w-5 h-5" />
      </button>

      {/* WhatsApp Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="group relative flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.45)] hover:scale-105 transition-all duration-300 cursor-pointer"
        aria-label="Chat on WhatsApp (+91 6309 143 484)"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline-block text-xs font-semibold tracking-wide">
          +91 6309 143 484
        </span>
      </a>
    </aside>
  );
}
