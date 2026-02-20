import React from 'react';

interface HeaderProps {
  isLoggedIn: boolean;
  onViewSalas?: () => void;
  onGoHome?: () => void;
  onViewQuienes?: () => void;
  onViewEspacio?: () => void;
  onOpenLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isLoggedIn, onViewSalas, onGoHome, onViewQuienes, onViewEspacio, onOpenLogin }) => {
  // Helper for Image Buttons
  const HeaderImgBtn = ({ src, label, onClick }: { src: string, label: string, onClick?: () => void }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center gap-2 group w-20"
    >
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#D2B48C] group-hover:scale-110 transition-transform bg-black">
            <img src={src} alt={label} className="w-full h-full object-cover" />
        </div>
        <span className="text-[10px] font-bold uppercase text-[#D2B48C] group-hover:text-white tracking-wider text-center w-full leading-tight">{label}</span>
    </button>
  );

  // Helper for Image Links
  const HeaderImgLink = ({ src, label, href }: { src: string, label: string, href: string }) => (
    <a 
        href={href}
        target="_blank" 
        rel="noreferrer"
        className="flex flex-col items-center gap-2 group w-20"
    >
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#D2B48C] group-hover:scale-110 transition-transform bg-black">
            <img src={src} alt={label} className="w-full h-full object-cover" />
        </div>
        <span className="text-[10px] font-bold uppercase text-[#D2B48C] group-hover:text-white tracking-wider text-center w-full leading-tight">{label}</span>
    </a>
  );

  // Helper for SVG Buttons (Login)
  const HeaderSvgBtn = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center gap-2 group w-20"
    >
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#D2B48C] group-hover:scale-110 transition-transform bg-black flex items-center justify-center">
            {icon}
        </div>
        <span className="text-[10px] font-bold uppercase text-[#D2B48C] group-hover:text-white tracking-wider text-center w-full leading-tight">{label}</span>
    </button>
  );

  return (
    <div className="w-full bg-black border-b border-[#D2B48C]/20 py-4 flex justify-center items-center shrink-0 z-50 sticky top-0 shadow-md shadow-[#D2B48C]/5">
      
      {/* Centered Icons Container */}
      <div className="flex flex-wrap items-start justify-center gap-4 md:gap-8 px-2">
          
          {/* 1. Instagram */}
          <HeaderImgLink 
            src="https://lh3.googleusercontent.com/d/1W2G-CEV6k0JDEyR9JQazI8UECoFaSFYh"
            label="Nuestro Instagram"
            href="https://www.instagram.com/calacuta?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
          />

          {/* 2. Youtube */}
          <HeaderImgLink 
            src="https://lh3.googleusercontent.com/d/1FxSTeHggBZklmB9z88_FnVnult19gkhJ"
            label="Canal Youtube"
            href="http://www.youtube.com/@Calacuta"
          />
          
          {/* 3. Map */}
          <HeaderImgLink 
            src="https://lh3.googleusercontent.com/d/1vqJIeDFST_oRnFk0VNQuKTkOkVzoCQP-"
            label="Donde estamos"
            href="https://www.google.com/maps/search/?api=1&query=Forest+445,+CABA"
          />

          {/* 4. Login (Visible only if logged out) */}
          {!isLoggedIn && (
             <HeaderSvgBtn 
                label="Ingresar"
                onClick={onOpenLogin}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D2B48C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                }
             />
          )}

          {/* 5. Espacio */}
          <HeaderImgBtn 
            src="https://lh3.googleusercontent.com/d/12SZJ9hoq5pui4Bs30LCaqLVdlpSpfLeo"
            label="Nuestro Espacio"
            onClick={onViewEspacio}
          />

          {/* 6. Salas */}
          <HeaderImgBtn 
            src="https://lh3.googleusercontent.com/d/1cKhE-HdhR-9XZfDlRdbA9oKFCrlIhhX2"
            label="Nuestras Salas"
            onClick={onViewSalas}
          />

          {/* 7. Quienes Somos */}
          <HeaderImgBtn 
            src="https://lh3.googleusercontent.com/d/13ljKPpAeu7pq9ZX-QTQm_8tbWp_IHxKC"
            label="Quienes Somos"
            onClick={onViewQuienes}
          />
      </div>

    </div>
  );
};