import './globals.css';
import { CartProvider } from '../context/CartContext';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Outcast | Gothic & Anime Streetwear',
  description: 'Tienda de ropa streetwear estilo gótico y anime.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-[#0A0A0A] text-white antialiased selection:bg-blood-red selection:text-white">
        {/* El CartProvider DEBE envolver a Navbar y a children */}
        <CartProvider>
          <Navbar />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}