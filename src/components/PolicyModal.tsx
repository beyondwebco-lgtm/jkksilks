'use client';

import { X, ShieldCheck, Truck, FileText, RotateCcw } from 'lucide-react';

export type PolicyType = 'privacy' | 'shipping' | 'terms' | 'return' | null;

interface PolicyModalProps {
  policy: PolicyType;
  onClose: () => void;
}

const policyData: Record<
  NonNullable<PolicyType>,
  { title: string; icon: typeof ShieldCheck; content: React.ReactNode }
> = {
  privacy: {
    title: 'Privacy Policy',
    icon: ShieldCheck,
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-[#FFF8E7]/80 leading-relaxed font-light">
        <p>
          At <strong className="text-[#D4AF37]">JKK Silks</strong>, we deeply value the trust you place in us. This Privacy Policy outlines how your personal information is collected, used, and safeguarded.
        </p>
        <div>
          <h4 className="text-[#D4AF37] font-medium uppercase tracking-wider text-xs mb-1">Information Collection</h4>
          <p>
            We collect personal details such as your name, telephone/WhatsApp number, email address, and shipping address solely to process enquiries, handle orders, and provide bespoke client concierge services.
          </p>
        </div>
        <div>
          <h4 className="text-[#D4AF37] font-medium uppercase tracking-wider text-xs mb-1">Data Protection &amp; Confidentiality</h4>
          <p>
            Your information is stored securely. We do not sell, rent, trade, or disclose your personal details to third-party marketing entities.
          </p>
        </div>
        <div>
          <h4 className="text-[#D4AF37] font-medium uppercase tracking-wider text-xs mb-1">Communications</h4>
          <p>
            We only contact you regarding your direct orders, shipping status, or customer inquiries through WhatsApp, phone, or email.
          </p>
        </div>
      </div>
    ),
  },
  shipping: {
    title: 'Shipping Policy',
    icon: Truck,
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-[#FFF8E7]/80 leading-relaxed font-light">
        <p>
          Every handwoven saree, jewellery adornment, and heritage artifact from <strong className="text-[#D4AF37]">JKK Silks</strong> is packed with the utmost devotion and care.
        </p>
        <div>
          <h4 className="text-[#D4AF37] font-medium uppercase tracking-wider text-xs mb-1">Pan-India Delivery</h4>
          <p>
            We deliver across India with trusted, insured courier logistics partners ensuring safe transit directly to your doorstep.
          </p>
        </div>
        <div>
          <h4 className="text-[#D4AF37] font-medium uppercase tracking-wider text-xs mb-1">Dispatch Timelines</h4>
          <p>
            Ready catalog orders are dispatched within 24 to 48 business hours. Custom bridal or personalized weaving orders follow mutually agreed timelines.
          </p>
        </div>
        <div>
          <h4 className="text-[#D4AF37] font-medium uppercase tracking-wider text-xs mb-1">Tracking</h4>
          <p>
            Once dispatched from our Wyra / Khammam establishment, courier tracking credentials are provided via WhatsApp (+91 6309 143 484).
          </p>
        </div>
      </div>
    ),
  },
  terms: {
    title: 'Terms of Service',
    icon: FileText,
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-[#FFF8E7]/80 leading-relaxed font-light">
        <p>
          Welcome to <strong className="text-[#D4AF37]">JKK Silks</strong>. By browsing our catalog or ordering our collections, you agree to comply with our authentic weaving terms.
        </p>
        <div>
          <h4 className="text-[#D4AF37] font-medium uppercase tracking-wider text-xs mb-1">Handloom Authenticity</h4>
          <p>
            Our sarees are genuine handwoven silks. Subtle irregularities in weave, motifs, or zari threads are intrinsic hallmarks of authentic artisanal weaving, not defects.
          </p>
        </div>
        <div>
          <h4 className="text-[#D4AF37] font-medium uppercase tracking-wider text-xs mb-1">Color Representation</h4>
          <p>
            While we strive for accurate digital representation, slight variations in color tone may occur depending on digital display settings and natural silk luster under varying lighting.
          </p>
        </div>
        <div>
          <h4 className="text-[#D4AF37] font-medium uppercase tracking-wider text-xs mb-1">Pricing &amp; Availability</h4>
          <p>
            All prices and discounts are subject to confirmation at the time of order placement.
          </p>
        </div>
      </div>
    ),
  },
  return: {
    title: 'Return & Exchange Policy',
    icon: RotateCcw,
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-[#FFF8E7]/80 leading-relaxed font-light">
        <p>
          At <strong className="text-[#D4AF37]">JKK Silks</strong>, customer satisfaction and heritage reverence are our highest priorities.
        </p>
        <div>
          <h4 className="text-[#D4AF37] font-medium uppercase tracking-wider text-xs mb-1">Eligibility</h4>
          <p>
            Due to the delicate, pure-silk and sacred nature of our handlooms, returns or exchanges are accepted only if the product received is physically damaged in transit or incorrect.
          </p>
        </div>
        <div>
          <h4 className="text-[#D4AF37] font-medium uppercase tracking-wider text-xs mb-1">Reporting Window</h4>
          <p>
            Please report any discrepancy within 48 hours of delivery to our WhatsApp concierge (+91 6309 143 484) or email (jikkichowdary1@gmail.com) along with mandatory continuous parcel unboxing video footage.
          </p>
        </div>
        <div>
          <h4 className="text-[#D4AF37] font-medium uppercase tracking-wider text-xs mb-1">Resolution</h4>
          <p>
            Verified claims are promptly rectified with replacement or suitable resolution upon receipt and inspection of the item in its original condition.
          </p>
        </div>
      </div>
    ),
  },
};

export default function PolicyModal({ policy, onClose }: PolicyModalProps) {
  if (!policy) return null;

  const data = policyData[policy];
  const Icon = data.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1F0208] to-[#140004] border border-[#D4AF37]/50 rounded-lg p-6 sm:p-8 shadow-[0_0_50px_rgba(212,175,55,0.25)] text-[#FFF8E7] my-8 max-h-[85vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors rounded-full hover:bg-[#D4AF37]/10 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#D4AF37]/20">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl text-[#D4AF37] tracking-wider">
              {data.title}
            </h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/60">
              JKK Silks &bull; Wyra, Khammam
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">{data.content}</div>

        {/* Footer button */}
        <div className="pt-4 border-t border-[#D4AF37]/20 flex justify-end">
          <button
            onClick={onClose}
            className="border border-[#D4AF37] bg-[#D4AF37] text-[#210209] font-medium text-xs uppercase tracking-wider py-2 px-6 rounded-sm hover:bg-[#E5C158] transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
