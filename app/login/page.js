import Login from "../../components/Login";
export const metadata = { title: "Iniciar sesión | Outcast Streetwear" };
export default async function Page({ searchParams }) {
  const query = await searchParams;
  return (
    <Login
      returnTo={query.next === "/carrito" ? "/carrito" : ""}
      initialAdmin={query.role === "admin"}
    />
  );
}
