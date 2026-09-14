# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing codebase: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, Neon (PostgreSQL serverless), NextAuth v4 (credentials + bcrypt), Zustand (carrito). See README.md.

## Users

Cliente premium de servicios: compradores que pagan por boosts, cuentas modded y servicios competitivos para videojuegos. Llegan buscando resultados rápidos (subir de rango/derrotas/cuenta) y valoran la confianza y la ausencia de fricción por encima del precio mínimo. No se ha confirmado una audiencia secundaria.

## Product Purpose

Marketplace de boosting y servicios para videojuegos: comprar boosts, cuentas modded y servicios competitivos con configuración por plataforma y cantidad (elodriomé). El éxito es que el comprador configure y obtenga su servicio con confianza y sin sorpresas, y que el vendedor gestione el catálogo desde un panel.

## Positioning

Marca y profesionalismo por encima del precio: Rowmodz busca transmitir confianza y calidad de servicio premium frente a los boosters genéricos. El mecanismo diferenciador confirmado es la configuración transparente por plataforma y cantidad, apoyado en una imagen de marca premium. No usar promesas ni claims de servicios no verificados.

## Operating Context

- El comprador navega el catálogo por juegos (`/store`, `/store/game/[game]`), configura producto (plataforma + cantidad, stepper de unidades), lo añade al carrito (Zustand, con persistencia) y pasa por checkout.
- El checkout es mock/placeholder: no hay pasarela de pago real.
- Los administradores gestionan productos, juegos/categorías y otros administradores desde `/admin` (Control Room), con sesión requerida.
- Registro público cerrado tras el bootstrap del primer administrador; nuevos admins solo desde el panel.
- Catálogo `General` recoge productos cuyo juego fue eliminado.

## Capabilities and Constraints

- Carrito con clave (id|platform|boostAmount), cantidades y total acumulado.
- Categorías de juego con borrado verificando por nombre exacto.
- Panel admin para productos y administradores.
- Toasts propios (Zustand), sin react-toastify.
- Checkout real NO se implementa (sin pasarela de pago).
- `npm run lint` global falla por errores preexistentes en `.github/`; usar `npx eslint app components store`.

## Brand Commitments

- Confirmado: nombre de marca **Rowmodz**, estética **dark gamer** (dark theme).
- Confirmado y aplicado (rediseño 2026-09-11): rebranding a **Rowmodz** en logo, metadata, footer, copy y admin; mundo visual **"Ranked Ladder"** violeta oscuro (escalera de rangos como interfaz), código y tokens en `app/globals.css`, diseño documentado en `DESIGN.md`.
- Voz (confirmada en critique 2026-09-11): **todo el copy de la UI en inglés**, del inicio al checkout. El español actual del cuerpo de página es deuda a traducir, no voz deseada.

## Evidence on Hand

- Código fuente completo (App Router) y README.md.
- No hay testimonios reales, prensa, benchmarks, ni pricing/legal verbatim: no inventar contenido de ese tipo.

## Product Principles

- Confianza premium: la imagen debe sostener la promesa de profesionalismo y resultados, nunca parecer improvisada.
- Transparencia: la configuración por plataforma y cantidad es el núcleo de la oferta; el diseño debe hacerla clara y predecible.
- Eficiencia: el comprador premium valora completar la compra con fricción mínima.
- Coherencia dark gamer: cualquier evolución visual respeta la estética oscura confirmada.
- Seguridad y sanidad del panel: las acciones de admin (productos, categorías, usuarios) son privilegiadas y deben mantenerse protegidas.

## Accessibility & Inclusion

Sin requisito específico confirmado por el usuario más allá del dark theme accesible.