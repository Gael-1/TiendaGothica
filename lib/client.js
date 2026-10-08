export async function request(body) {
  const r = await fetch("/api/shop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Error de conexión.");
  return data;
}
export const money = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    n,
  );
export const statuses = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  completed: "Completado",
  cancelled: "Cancelado",
};
