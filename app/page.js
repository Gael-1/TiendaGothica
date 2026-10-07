import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-[#E5E5E5]">
      
      {/* HERO SECTION / PORTADA PRINCIPAL */}
      <section className="relative w-full py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-[#1F1F1F] flex flex-col items-center text-center justify-center overflow-hidden">
        
        {/* Glow de fondo rojo sutil */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blood-red/10 blur-[120px] pointer-events-none rounded-full" />

        {/* LOGO EN PORTADA */}
        <div className="relative w-36 h-36 md:w-48 md:h-48 mb-8 border-2 border-blood-red/30 rounded-full p-2 shadow-[0_0_50px_rgba(139,0,0,0.2)]">
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image 
              src="/logo.png" 
              alt="Outcast Streetwear Logo" 
              fill 
              className="object-cover" 
              priority
            />
          </div>
        </div>

        {/* TÍTULO Y ESLOGAN */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-widest uppercase mb-4 text-white">
          Outcast Streetwear
        </h1>
        
        <p className="text-blood-red font-semibold text-lg md:text-xl tracking-[0.3em] uppercase mb-8">
          SHADOWS EMBRACE US
        </p>

        <p className="max-w-xl text-neutral-400 text-sm md:text-base mb-10 leading-relaxed font-light">
          Descubre nuestra colección de streetwear oversize de alta calidad, diseñada para aquellos que no temen destacar.  
        </p>

        {/* BOTONES DE ACCIÓN (CTA) */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md justify-center">
          <Link 
            href="/productos"
            className="w-full sm:w-auto px-8 py-4 bg-blood-red hover:bg-blood-red-hover text-white font-bold uppercase tracking-wider text-sm transition-all duration-300 shadow-[0_0_20px_rgba(139,0,0,0.4)] text-center"
          >
            Ver Catálogo
          </Link>
          <Link 
            href="#destacados"
            className="w-full sm:w-auto px-8 py-4 bg-transparent border border-[#1F1F1F] hover:border-blood-red text-neutral-300 hover:text-white font-bold uppercase tracking-wider text-sm transition-all duration-300 text-center"
          >
            Destacados
          </Link>
        </div>
      </section>

      {/* SECCIÓN DE PRODUCTOS DESTACADOS (PLACEHOLDER) */}
      <section id="destacados" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-widest uppercase text-white mb-2">
            Nuevas Lanzas
          </h2>
          <div className="w-16 h-1 bg-blood-red"></div>
        </div>

        {/* Malla de Productos (Próximamente conectada a la Base de Datos) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-[#121212] border border-[#1F1F1F] p-4 group hover:border-blood-red/50 transition-all duration-300">
            <div className="relative aspect-square bg-neutral-900 mb-4 overflow-hidden flex items-center justify-center">
              <span className="text-neutral-600 uppercase text-xs tracking-widest">Noir Phoenix Oversize Tee</span>
            </div>
            <h3 className="font-bold text-white uppercase text-sm mb-1">Noir Phoenix Oversize Tee</h3>
            <p className="text-blood-red font-bold text-sm">$450 MXN</p>
          </div>

          <div className="bg-[#121212] border border-[#1F1F1F] p-4 group hover:border-blood-red/50 transition-all duration-300">
            <div className="relative aspect-square bg-neutral-900 mb-4 overflow-hidden flex items-center justify-center">
              <span className="text-neutral-600 uppercase text-xs tracking-widest">Midnight Curse Hoodie</span>
            </div>
            <h3 className="font-bold text-white uppercase text-sm mb-1">Midnight Curse Hoodie</h3>
            <p className="text-blood-red font-bold text-sm">$650 MXN</p>
          </div>

          <div className="bg-[#121212] border border-[#1F1F1F] p-4 group hover:border-blood-red/50 transition-all duration-300">
            <div className="relative aspect-square bg-neutral-900 mb-4 overflow-hidden flex items-center justify-center">
              <span className="text-neutral-600 uppercase text-xs tracking-widest">Demon Crest Oversize Tee</span>
            </div>
            <h3 className="font-bold text-white uppercase text-sm mb-1">Demon Crest Oversize Tee</h3>
            <p className="text-blood-red font-bold text-sm">$450 MXN</p>
          </div>
        </div>
      </section>

    </div>
  );
}