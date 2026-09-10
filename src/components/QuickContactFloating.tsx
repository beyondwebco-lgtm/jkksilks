'use client';

interface QuickContactFloatingProps {
  onOpenEnquiry?: () => void;
}

export default function QuickContactFloating({}: QuickContactFloatingProps = {}) {
  const whatsappUrl = 'https://wa.me/916309143484';

  return (
    <aside aria-label="WhatsApp Contact" className="fixed bottom-6 right-6 z-40 pointer-events-auto select-none">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-[0_4px_20px_rgba(37,211,102,0.5)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.7)] hover:scale-110 transition-all duration-300 cursor-pointer"
        title="Chat with JKK Silks on WhatsApp"
        aria-label="WhatsApp"
      >
        {/* Crisp Official WhatsApp SVG Logo */}
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.054 21.64c-.114.417.26.804.68.704l4.577-1.084A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.182a8.14 8.14 0 0 1-4.22-1.177l-.302-.178-2.733.647.674-2.458-.198-.316A8.14 8.14 0 0 1 3.818 12c0-4.518 3.664-8.182 8.182-8.182s8.182 3.664 8.182 8.182-3.664 8.182-8.182 8.182z" />
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
        </svg>
      </a>
    </aside>
  );
}
