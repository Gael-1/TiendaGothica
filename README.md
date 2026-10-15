# Outcast · Tienda streetwear

Next.js + React + Tailwind. Catálogo real administrable, carrito persistente, cuentas de cliente y pedidos por WhatsApp a **+52 81 2340 8200**.

## Desarrollo

Requiere **Node.js 24 LTS** (SQLite integrado).

```bash
npm ci
cp .env.example .env.local
# Edita ADMIN_PASSWORD con una contraseña única de al menos 12 caracteres.
npm run dev
```

En Windows PowerShell: `Copy-Item .env.example .env.local`.

1. Entra a `/admin` con ADMIN_PASSWORD. No hay credenciales predeterminadas.
2. Agrega productos, precio y existencias por talla. Las fotos se colocan en `public` y se referencian como `/playera.jpg`. No se publican productos ficticios.
3. El cliente selecciona talla, arma su carrito y prepara la solicitud. El servidor valida precios y stock y guarda el pedido pendiente.
4. El cliente pulsa **Abrir WhatsApp y enviar**, y después envía el mensaje en WhatsApp. Abrir el enlace no envía mensajes automáticamente.
5. Admin confirma el pedido tras hablar con el cliente: se descuenta stock en una transacción. Cancelar un confirmado devuelve existencias. Puede marcar enviado y completado.
6. `/cuenta` permite registro e inicio de sesión. Los clientes ven solo pedidos realizados con su sesión. También se permite compra sin cuenta.

La solicitud no reserva existencias ni acredita pago. Reabrir una solicitud idéntica dentro de 5 minutos reutiliza el folio. Envío por cotizar; total guardado corresponde a productos. No se recopilan tarjetas.

## Verificación

```bash
npm run lint
npm run build
npm test
```

## Producción

Usa HTTPS, Node.js 24 y **un servidor con disco persistente**. Configura DATABASE_PATH, respalda el archivo SQLite usando un mecanismo de backup consistente y protege sus permisos. Ejecuta `npm run build` y `npm start`. No desplegar esta versión con base SQLite local en funciones efímeras de Vercel/Netlify ni múltiples instancias independientes. Para ese entorno se debe migrar a PostgreSQL u otra base compartida.

Sesiones HttpOnly de 24 horas, contraseñas cliente con scrypt, permisos verificados en servidor, control de origen y límites de intentos de acceso. Reiniciar contraseña, verificación de correo, recuperación de cuenta y protección avanzada contra abuso quedan pendientes antes de un lanzamiento amplio. No hay carga de fotos desde el panel: las fotos se añaden al repositorio en public.

Antes de lanzar: definir nombre definitivo (Outcast proviene del código original), fotografías y productos, puntos de entrega, costos/zonas de envío, políticas de cambios y aviso de privacidad con los datos del negocio. El texto de la marca es provisional.

El pago con tarjeta se deja pendiente. Debe integrarse con un checkout de proveedor, credenciales del comercio, webhooks verificados y confirmación de pago en servidor. Nunca guardar número de tarjeta ni CVV en esta aplicación.

## Avance: catálogo y detalle de prendas

- Filtros por categoría y talla disponible, búsqueda por nombre/descripción, solo disponibles y orden por precio.
- Página `/productos/[id]` con descripción, imagen, selección de talla/cantidad, consulta de medidas por WhatsApp y metadatos del producto.
- Las prendas ocultas no tienen página pública. La página de detalle consulta el producto actual en servidor.
- La selección avisa al alcanzar existencias en la bolsa. El servidor sigue validando stock al preparar/confirmar el pedido.
- Recursos: se reutilizan Next.js, React, Tailwind y SQLite. Sin dependencias nuevas. No se inventaron medidas ni fotografías.

Pendientes para la próxima etapa: carga de fotos desde administración, recuperación/verificación de cuenta, datos y políticas reales del negocio, alojamiento persistente, proveedor de pago con tarjeta y revisión visual en navegador.

## Acceso unificado

`/login` ofrece acceso de cliente, registro y acceso de administrador. La navegación muestra Iniciar sesión, Mi cuenta o Administración según la sesión. Al comprar, `/login?next=/carrito` vuelve a la bolsa después del acceso de cliente sin perder las prendas. Se conserva la compra como invitado. El administrador usa ADMIN_PASSWORD, no una cuenta cliente; los permisos continúan verificándose en servidor. No hay nuevas dependencias.

## Fotografías desde administración

El panel abre el selector de archivos del equipo y muestra una vista previa. Al guardar, `/api/images` valida sesión de administrador y formatos JPG/PNG/WebP de hasta 5 MB; Sharp decodifica y convierte a WebP, elimina metadatos y limita dimensiones a 1600 × 2000. Las imágenes se guardan en la misma base SQLite persistente y se sirven por `/api/images/[id]`. Respaldar SQLite incluye las fotografías. Las fotos anteriores se conservan cuando no se selecciona un archivo nuevo; al reemplazar, el archivo anterior permanece guardado. El logo original `public/Logo.png` vuelve a mostrarse en la navegación.
