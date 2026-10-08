import Link from "next/link";
import Catalog from "../components/Catalog";
export default function Home() {
  return (
    <>
      <section className="hero shell">
        <p className="eyebrow">GOTHIC · ANIME · STREETWEAR</p>
        <h1>
          VISTE A TU
          <br />
          <span>MANERA.</span>
        </h1>
        <p className="hero-copy">
          Siluetas amplias. Una identidad propia.
          <br />
          Descubre Outcast y encuentra tu siguiente prenda.
        </p>
        <div className="actions">
          <Link className="button" href="/productos">
            Explorar colección ↗
          </Link>
          <a
            className="button secondary"
            href="https://wa.me/528123408200"
            target="_blank"
            rel="noopener noreferrer"
          >
            Habla con nosotros
          </a>
        </div>
        <div className="hero-index">OUTCAST / STREETWEAR</div>
      </section>
      <div className="strip">
        ELIGE TU PRENDA <span>＋</span> ARMA TU BOLSA <span>＋</span> CONFIRMA
        POR WHATSAPP
      </div>
      <Catalog featured />
      <section className="shell section info-grid">
        <div>
          <p className="eyebrow">01 / ELIGE</p>
          <h2>Tu estilo, tu talla.</h2>
          <p className="muted">
            Consulta las tallas disponibles de cada prenda y agrégala a tu
            bolsa.
          </p>
        </div>
        <div>
          <p className="eyebrow">02 / CONECTA</p>
          <h2>Atención directa.</h2>
          <p className="muted">
            Revisa tu pedido y envíanos el resumen por WhatsApp.
          </p>
        </div>
        <div>
          <p className="eyebrow">03 / CONFIRMA</p>
          <h2>Coordinamos contigo.</h2>
          <p className="muted">
            Confirmamos existencias, costo de envío y pago antes de preparar tu
            pedido.
          </p>
        </div>
      </section>
    </>
  );
}
