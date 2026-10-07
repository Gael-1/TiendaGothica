'use client';

import { useCart } from "../../context/CartContext";
import Link from 'next/link';
import Image from 'next/image';

export default function CarritoPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart, addToCart } = useCart();

  const WHATSAPP_NUMBER = "528100000000"; // Sustituye con tu número real

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    let message = `*¡HOLA OUTCAST! DESEO REALIZAR UN PEDIDO:* \n\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   - Talla: ${item.size}\n`;
      message += `   - Cantidad: ${item.quantity}\n`;
      message += `   - Precio unitario: $${item.price} MXN\n\n`;
    });
    message += `*TOTAL DEL PEDIDO: $${totalPrice} MXN*\n\n`;
    message += `Quedo a la espera de sus datos para el pago y envío.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  const addTestProduct = () => {
    addToCart({
      id: 'test-1',
      name: 'Oversize Tee "Gothic Shadow"',
      price: 599,
      image: '/logo.png'
    }, 'L', 1);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-widest text-white mb-4">
          TU CARRITO ESTÁ VACÍO
        </h1>
        <p className="text-neutral-400 mb-8 font-light">
          Aún no has añadido ninguna prenda a tu bolsa.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-4 bg-blood-red hover:bg-red-700 text-white font-bold uppercase tracking-wider text-sm transition-all duration-300"
          >
            Volver al Inicio
          </Link>
          <button
            onClick={addTestProduct}
            className="px-8 py-4 border border-blood-red text-blood-red hover:bg-blood-red hover:text-white font-bold uppercase tracking-wider text-sm transition-all duration-300"
          >
            + Agregar Prenda de Prueba
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold uppercase tracking-widest text-white mb-8 border-b border-[#1F1F1F] pb-4">
        Carrito de Compras
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={`${item.id}-${item.size}`}
              className="flex flex-col sm:flex-row items-center justify-between bg-[#121212] border border-[#1F1F1F] p-4 gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative w-20 h-20 bg-neutral-900 flex-shrink-0 border border-neutral-800">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-600 uppercase">
                      Outcast
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white uppercase text-sm">{item.name}</h3>
                  <p className="text-xs text-neutral-400 uppercase mt-1">
                    Talla: <span className="text-blood-red font-bold">{item.size}</span>
                  </p>
                  <p className="text-sm font-bold text-white mt-1">${item.price} MXN</p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 border-[#1F1F1F] pt-3 sm:pt-0">
                <div className="flex items-center border border-[#1F1F1F] bg-[#0A0A0A]">
                  <button
                    onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                    className="px-3 py-1 text-neutral-400 hover:text-white transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-sm font-bold text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                    className="px-3 py-1 text-neutral-400 hover:text-white transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id, item.size)}
                  className="text-xs uppercase tracking-wider text-neutral-500 hover:text-blood-red transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-xs uppercase tracking-wider text-neutral-500 hover:text-white transition-colors pt-2"
          >
            Vaciar Carrito
          </button>
        </div>

        <div className="bg-[#121212] border border-[#1F1F1F] p-6 h-fit space-y-6">
          <h2 className="text-lg font-bold uppercase tracking-wider text-white border-b border-[#1F1F1F] pb-3">
            Resumen del Pedido
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-neutral-400">
              <span>Subtotal</span>
              <span className="text-white font-medium">${totalPrice} MXN</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Envío</span>
              <span className="text-neutral-500">Por coordinar</span>
            </div>
            <div className="border-t border-[#1F1F1F] pt-3 flex justify-between font-bold text-base text-white">
              <span>TOTAL</span>
              <span className="text-blood-red">${totalPrice} MXN</span>
            </div>
          </div>

          <button
            onClick={handleWhatsAppCheckout}
            className="w-full py-4 bg-blood-red hover:bg-red-700 text-white font-bold uppercase tracking-wider text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,0,0,0.3)]"
          >
            Completar Pedido por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}