import "./globals.css";
import Link from "next/link";
import { CartProvider } from "../context/CartContext";
import Navbar from "../components/Navbar";
export const metadata = {
  title: "Outcast | Streetwear",
  description:
    "Ropa streetwear. Explora la colección y confirma tu pedido por WhatsApp.",
};
export default function Layout({ children }) {
  return (
    <html lang="es">
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <footer className="shell footer">
            <div>
              <strong>OUTCAST</strong>
              <p>Gothic · Anime · Streetwear</p>
            </div>
            <div>
              <a
                href="https://wa.me/528123408200"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp ↗
              </a>
              <Link href="/cuenta">Mi cuenta</Link>
              <Link href="/admin">Administración</Link>
            </div>
            <p className="muted">
              Pedidos sujetos a confirmación. Envío por cotizar.
            </p>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
