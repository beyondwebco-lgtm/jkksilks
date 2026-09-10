'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Send, Mail, Phone, User, Calendar, CheckCircle2, MessageCircle } from 'lucide-react';

export default function EnquirySection() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Pure Silk Sarees');
  const [timeline, setTimeline] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const targetEmail = 'jikkichowdary1@gmail.com';
  const whatsappNumber = '916309143484';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailSubject = `[JKK Silks Enquiry] ${category} - ${fullName}`;
    const emailBody = `Dear JKK Silks Concierge,

I would like to submit an enquiry regarding your collections.

-------------------------------------------
CLIENT DETAILS:
-------------------------------------------
Name: ${fullName}
Phone / WhatsApp: ${phone}
Email: ${email}
Collection of Interest: ${category}
${timeline ? `Occasion / Timeline: ${timeline}\n` : ''}-------------------------------------------
MESSAGE & REQUIREMENTS:
-------------------------------------------
${message}

-------------------------------------------
Sent via JKK Silks Official Storefront
`;

    // Open mail client directly to jikkichowdary1@gmail.com
    const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;

    setSubmitted(true);
  };

  const handleSendViaWhatsApp = () => {
    const waText = `Hello JKK Silks,\n\nI have submitted an enquiry:\n*Name:* ${fullName}\n*Phone:* ${phone}\n*Email:* ${email}\n*Category:* ${category}\n${timeline ? `*Timeline:* ${timeline}\n` : ''}\n*Message:* ${message}`;
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <section id="enquiry" className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-[#D4AF37]/20 relative bg-gradient-to-b from-[#1A0106] via-[#140004] to-[#120003] overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header Motif */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative w-10 h-10 mb-3 opacity-95 filter drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)]">
            <Image 
              src="/images/lotus_icon_transparent.png" 
              alt="Lotus Motif" 
              fill 
              className="object-contain" 
            />
          </div>
          <p className="text-[11px] text-[#D4AF37]/80 uppercase tracking-[0.3em] font-medium mb-1">
            Client Concierge &amp; Bespoke Orders
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#D4AF37] tracking-wider mb-3">
            Formal Enquiry Form
          </h2>
          <p className="text-xs sm:text-sm text-[#FFF8E7]/70 tracking-wide font-light max-w-lg leading-relaxed">
            For custom weaves, bridal trousseau consultations, or general enquiries. Directly addressed to <strong className="text-[#D4AF37] font-medium">{targetEmail}</strong>.
          </p>
        </div>

        {submitted ? (
          /* Confirmation State */
          <div className="bg-[#180106] border border-[#D4AF37] rounded-lg p-8 text-center shadow-[0_0_40px_rgba(212,175,55,0.2)]">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37] flex items-center justify-center mx-auto mb-5 text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="font-serif text-2xl text-[#D4AF37] mb-2 tracking-wide">
              Enquiry Form Prepared
            </h3>
            
            <p className="text-xs sm:text-sm text-[#FFF8E7]/80 max-w-md mx-auto leading-relaxed mb-6 font-light">
              Your formal enquiry email has been generated for <strong className="text-[#D4AF37] font-medium">{targetEmail}</strong>. You can also forward these details directly to WhatsApp for rapid concierge assistance.
            </p>

            <div className="w-full bg-[#120004] border border-[#D4AF37]/20 rounded-md p-4 mb-6 text-left text-xs space-y-2 text-[#FFF8E7]/80">
              <p><span className="text-[#D4AF37] font-medium">To:</span> {targetEmail}</p>
              <p><span className="text-[#D4AF37] font-medium">Client:</span> {fullName} ({phone})</p>
              <p><span className="text-[#D4AF37] font-medium">Collection:</span> {category}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleSendViaWhatsApp}
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium text-xs uppercase tracking-wider py-3.5 px-6 rounded-sm transition-all shadow-md cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Also Forward to WhatsApp
              </button>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="inline-flex items-center justify-center gap-2 border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 font-medium text-xs uppercase tracking-wider py-3.5 px-6 rounded-sm transition-all cursor-pointer"
              >
                Submit Another Enquiry
              </button>
            </div>
          </div>
        ) : (
          /* Form Body */
          <div className="bg-[#180106]/90 border border-[#D4AF37]/40 rounded-lg p-6 sm:p-10 shadow-[0_0_40px_rgba(212,175,55,0.15)] backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/90 mb-1.5 font-medium">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#D4AF37]/50">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Smt. Lakshmi / Sri Rajesh"
                    className="w-full bg-[#120004] border border-[#D4AF37]/30 rounded-sm py-3 pl-10 pr-3 text-xs sm:text-sm text-[#FFF8E7] placeholder-[#FFF8E7]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/90 mb-1.5 font-medium">
                    Phone / WhatsApp *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#D4AF37]/50">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#120004] border border-[#D4AF37]/30 rounded-sm py-3 pl-10 pr-3 text-xs sm:text-sm text-[#FFF8E7] placeholder-[#FFF8E7]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/90 mb-1.5 font-medium">
                    Your Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#D4AF37]/50">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full bg-[#120004] border border-[#D4AF37]/30 rounded-sm py-3 pl-10 pr-3 text-xs sm:text-sm text-[#FFF8E7] placeholder-[#FFF8E7]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Collection & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/90 mb-1.5 font-medium">
                    Collection of Interest
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#120004] border border-[#D4AF37]/30 rounded-sm py-3 px-3 text-xs sm:text-sm text-[#FFF8E7] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  >
                    <option value="Pure Silk Sarees" className="bg-[#1A0106] text-[#FFF8E7]">Pure Silk Sarees (Kanjivaram / Banarasi)</option>
                    <option value="Bridal Wedding Trousseau" className="bg-[#1A0106] text-[#FFF8E7]">Bridal Wedding Trousseau</option>
                    <option value="Imitation Jewellery" className="bg-[#1A0106] text-[#FFF8E7]">Imitation Jewellery Adornments</option>
                    <option value="Heritage Artifacts" className="bg-[#1A0106] text-[#FFF8E7]">Heritage Artifacts &amp; Puja Brassware</option>
                    <option value="Custom Order / Bespoke" className="bg-[#1A0106] text-[#FFF8E7]">Custom Order / Bespoke Weaving</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/90 mb-1.5 font-medium">
                    Occasion / Date (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#D4AF37]/50">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      placeholder="e.g. Wedding in Nov, Festive"
                      className="w-full bg-[#120004] border border-[#D4AF37]/30 rounded-sm py-3 pl-10 pr-3 text-xs sm:text-sm text-[#FFF8E7] placeholder-[#FFF8E7]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/90 mb-1.5 font-medium">
                  Detailed Requirements / Questions *
                </label>
                <div className="relative">
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Kindly describe your preferred color palette, zari preferences, budget range, or specific requirements..."
                    className="w-full bg-[#120004] border border-[#D4AF37]/30 rounded-sm p-3.5 text-xs sm:text-sm text-[#FFF8E7] placeholder-[#FFF8E7]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all leading-relaxed"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-2 bg-[#D4AF37] hover:bg-[#E5C158] text-[#210209] font-bold text-xs uppercase tracking-[0.2em] py-4 px-4 rounded-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Formal Enquiry to JKK Silks ({targetEmail})</span>
              </button>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-[#D4AF37]/70 tracking-wider">
                  Prefer direct messaging? <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="text-[#25D366] font-medium hover:underline">Chat on WhatsApp: +91 6309 143 484</a>
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
