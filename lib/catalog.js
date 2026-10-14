export const categories = {
  oversize: "Oversize",
  clasica: "Clásica",
  hoodie: "Hoodie",
};
export const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
export function filterProducts(
  products,
  {
    search = "",
    category = "",
    size = "",
    available = false,
    sort = "name",
  } = {},
) {
  const term = search.trim().toLocaleLowerCase("es");
  return products
    .filter(
      (p) =>
        (!category || p.category === category) &&
        (!term ||
          (p.name + " " + p.description)
            .toLocaleLowerCase("es")
            .includes(term)) &&
        (!size || (p.stock[size] || 0) > 0) &&
        (!available || Object.values(p.stock).some((n) => n > 0)),
    )
    .sort((a, b) =>
      sort === "price-asc"
        ? a.price - b.price
        : sort === "price-desc"
          ? b.price - a.price
          : a.name.localeCompare(b.name, "es"),
    );
}
export function cartLimit(product, size) {
  return Math.min(99, Math.max(0, product.stock?.[size] ?? 0));
}
