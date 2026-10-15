"use client";
import { useState } from "react";
import Link from "next/link";
import { request } from "../lib/client";
export default function Login({ returnTo = "", initialAdmin = false }) {
  const [mode, setMode] = useState(initialAdmin ? "admin" : "customer"),
    [register, setRegister] = useState(false),
    [visible, setVisible] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const result = await request({
        action:
          mode === "admin" ? "adminLogin" : register ? "register" : "login",
        name: f.get("name"),
        email: f.get("email"),
        password: f.get("password"),
      });
      window.location.assign(
        result.role === "admin"
          ? "/admin"
          : returnTo === "/carrito"
            ? "/carrito"
            : "/cuenta",
      );
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }
  function choose(value) {
    setMode(value);
    setRegister(false);
    setVisible(false);
    setError("");
  }
  return (
    <section className="shell section login-layout">
      <div className="login-intro">
        <p className="eyebrow">OUTCAST STREETWEAR</p>
        <h1>
          Tu estilo.
          <br />
          Tu cuenta.
        </h1>
        <p className="muted">
          Inicia sesión para consultar tus pedidos y continuar con tu selección.
        </p>
        <Link href="/productos">Explorar catálogo ↗</Link>
      </div>
      <div className="panel">
        <div className="login-tabs" role="group" aria-label="Tipo de acceso">
          <button
            disabled={busy}
            aria-pressed={mode === "customer"}
            onClick={() => choose("customer")}
          >
            Cliente
          </button>
          <button
            disabled={busy}
            aria-pressed={mode === "admin"}
            onClick={() => choose("admin")}
          >
            Administrador
          </button>
        </div>
        <form key={mode + register} onSubmit={submit}>
          <h2>
            {mode === "admin"
              ? "Acceso de administrador"
              : register
                ? "Crear tu cuenta"
                : "Iniciar sesión"}
          </h2>
          {mode !== "admin" && (
            <>
              {register && (
                <label>
                  Nombre
                  <input
                    name="name"
                    autoComplete="name"
                    maxLength="100"
                    required
                    disabled={busy}
                  />
                </label>
              )}
              <label>
                Correo electrónico
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength="200"
                  required
                  disabled={busy}
                />
              </label>
            </>
          )}
          <label>
            Contraseña
            <input
              name="password"
              type={visible ? "text" : "password"}
              autoComplete={register ? "new-password" : "current-password"}
              minLength={mode === "admin" ? 12 : 10}
              maxLength="200"
              required
              disabled={busy}
            />
          </label>
          <button
            type="button"
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            {visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          </button>
          {error && (
            <p role="alert" className="notice">
              {error}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy
              ? "Ingresando…"
              : register
                ? "Crear cuenta"
                : mode === "admin"
                  ? "Entrar al panel"
                  : "Entrar"}
          </button>
          {mode === "customer" && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setRegister(!register);
                setError("");
                setVisible(false);
              }}
            >
              {register ? "Ya tengo cuenta" : "Crear una cuenta"}
            </button>
          )}
        </form>
        <p className="muted">
          {mode === "admin"
            ? "Usa la contraseña de administración configurada para esta tienda."
            : "Tu cuenta muestra los pedidos que realices con la sesión iniciada."}
        </p>
        {returnTo === "/carrito" && (
          <Link className="button secondary" href="/carrito">
            Continuar compra como invitado
          </Link>
        )}
      </div>
    </section>
  );
}
