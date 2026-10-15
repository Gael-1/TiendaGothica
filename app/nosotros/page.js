export default function Page() {
  return (
    <section className="shell section narrow">
      <p className="eyebrow">LA MARCA</p>
      <h1>Outcast Streetwear</h1>
      <p>
        Una tienda de ropa con inspiración en el estilo urbano, gótico y anime.
      </p>
      <div className="panel">
        <h2>Cómo comprar</h2>
        <p>
          Elige tus prendas y tallas, agrégalas a la bolsa y completa tus datos.
          La tienda generará una solicitud y abrirá WhatsApp con el resumen.
          Pulsa enviar en WhatsApp para contactarnos.
        </p>
        <p>
          La disponibilidad se confirma al aceptar el pedido. El envío y el pago
          se coordinan por WhatsApp; el subtotal de la bolsa no incluye envío.
        </p>
        <h2>Datos de tu pedido</h2>
        <p>
          Tu nombre, teléfono y prendas elegidas se utilizan para gestionar tu
          solicitud. No introduzcas datos de tarjeta en mensajes. Para consultas
          sobre tus datos, entregas o cambios, contáctanos.
        </p>
        <a
          className="button"
          href="https://wa.me/528123408200"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contactar por WhatsApp
        </a>
      </div>
    </section>
  );
}
