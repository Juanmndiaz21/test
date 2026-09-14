# Rowmodz

Marketplace de boosting y servicios para videojuegos. Compra boosts, cuentas modded y servicios competitivos con configuración por plataforma y cantidad.

## Stack

- [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Neon](https://neon.tech) (PostgreSQL serverless) con `@neondatabase/serverless`
- [NextAuth v4](https://next-auth.js.org) (credentials + bcrypt)
- [Zustand](https://zustand-demo.pmnd.rs) para el carrito

## Requisitos previos

- Node.js 20+
- Base de datos PostgreSQL (Neon) — copia `.env.example` a `.env.local` y rellena:

```
DATABASE_URL=postgres://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
SETUP_TOKEN=
NEXT_PUBLIC_SETUP_TOKEN_REQUIRED=false
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

Variables:

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `DATABASE_URL` | Sí | Cadena de conexión a PostgreSQL (Neon) |
| `NEXTAUTH_SECRET` | Sí | Secreto de NextAuth (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Sí | URL pública de la app |
| `SETUP_TOKEN` | No | Token para crear el primer administrador; vacío en producción ⇒ el primer usuario es `USER` |
| `NEXT_PUBLIC_SETUP_TOKEN_REQUIRED` | No | `'true'` muestra el campo "setup code" en el login |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | No | Site key de Cloudflare Turnstile |
| `TURNSTILE_SECRET_KEY` | No | Secret de Cloudflare Turnstile (require captcha en producción) |

## Puesta en marcha

```bash
npm install
npm run dev
```

Las tablas (`products`, `games`, `users`) se crean automáticamente la primera vez que se usan.

## Primer administrador

La creación de cuentas está abierta, pero la primera cuenta **solo** recibe el rol `ADMIN` si en el servidor está configurado `SETUP_TOKEN` y el usuario introduce ese token (campo "setup code", visible cuando `NEXT_PUBLIC_SETUP_TOKEN_REQUIRED` es `'true'`). Sin `SETUP_TOKEN`, la primera cuenta se crea como `USER` (fail-closed). Después, se pueden añadir más administradores desde el panel *Control Room → Administradores*.

## Scripts

```bash
npm run dev      # desarrollo
npm run build    # build de producción
npm run start    # servidor de producción
npm run lint     # eslint
```

## Estructura

- `app/` — páginas y rutas (App Router)
  - `store` — catálogo de juegos y servicios
  - `admin` — gestión de productos y administradores (requiere sesión)
  - `login`, `checkout`, `help`
  - `api/setup` — crea/actualiza tablas (solo sin sesión durante bootstrap)
  - `api/auth/[...nextauth]` — autenticación
- `components/` — componentes reutilizables
- `store/` — estado del carrito (Zustand)