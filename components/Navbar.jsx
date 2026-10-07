'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1F1F1F]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO E IDENTIDAD */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 overflow-hidden rounded-full border border-blood-red/40 group-hover:border-blood-red transition-colors duration-300">
            <Image 
              src="/logo.png" 
              alt="Outcast Streetwear Logo" 
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-widest text-white group-hover:text-blood-red transition-colors duration-300 uppercase">
              Outcast
            </span>
            <span className="text-[10px] tracking-[0.2em] text-neutral-400 uppercase">
              Streetwear Premium
            </span>
          </div>
        </Link>

        {/* NAVEGACIÓN DESKTOP */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wider uppercase">
          <Link href="/productos" className="text-neutral-300 hover:text-blood-red transition-colors duration-200">
            Catálogo
          </Link>
          <Link href="/oversize" className="text-neutral-300 hover:text-blood-red transition-colors duration-200">
            Oversize Tees
          </Link>
          <Link href="/nosotros" className="text-neutral-300 hover:text-blood-red transition-colors duration-200">
            Marca
          </Link>
        </div>

        {/* ACCIONES (CARRITO Y BÚSQUEDA) */}
        <div className="flex items-center space-x-6">
          {/* Botón Carrito */}
          <Link href="/carrito" className="relative p-2 text-neutral-300 hover:text-blood-red transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.25 10.5a.75.75 0 100-1.5.75.75 0 000 1.5zm7.5 0a.75.75 0 100-1.5.75.75 0 000 1.5z" />
            </svg>
            
            {/* Badge de contador dinámico */}
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-blood-red text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-[#0A0A0A]">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Botón Menú Mobile */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-neutral-300 hover:text-white focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* MENÚ DESPLEGABLE MOBILE */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#0A0A0A] border-b border-[#1F1F1F] px-4 pt-2 pb-6 space-y-4">
          <Link 
            href="/productos" 
            onClick={() => setIsMenuOpen(false)}
            className="block text-sm uppercase tracking-wider text-neutral-300 hover:text-blood-red py-2"
          >
            Catálogo
          </Link>
          <Link 
            href="/oversize" 
            onClick={() => setIsMenuOpen(false)}
            className="block text-sm uppercase tracking-wider text-neutral-300 hover:text-blood-red py-2"
          >
            Oversize Tees
          </Link>
          <Link 
            href="/nosotros" 
            onClick={() => setIsMenuOpen(false)}
            className="block text-sm uppercase tracking-wider text-neutral-300 hover:text-blood-red py-2"
          >
            Marca
          </Link>
        </div>
      )}
    </header>
  );
}