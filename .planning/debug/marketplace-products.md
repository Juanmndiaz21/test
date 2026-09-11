---
status: resolved
trigger: Los productos agregados desde el panel de admin no aparecen en marketplace
created: 2026-09-10
updated: 2026-09-10
---

## Symptoms
- Expected: Los productos creados en el panel de administración aparecen en `/store`.
- Actual: `/store` muestra el estado vacío aunque el admin permite agregar productos.
- Errors: No se proporcionó un error visible.
- Timeline: No especificado.
- Reproduction: Crear un producto en admin y abrir marketplace.

## Current Focus
- hypothesis: `app/store/page.js` no consulta la tabla `products` ni pasa `products` a `ProductList`.
- test: Comparar el flujo de lectura de `/store` con la consulta existente en `app/admin/products/page.js`.
- expecting: La página `/store` debe consultar Neon y renderizar `<ProductList products={products} />`.
- next_action: Aplicar el fix mínimo y ejecutar lint/build.

## Evidence
- timestamp: 2026-09-10
  observation: `ProductList` devuelve el estado vacío cuando `products` es undefined; `/store` lo invoca sin argumentos.
- timestamp: 2026-09-10
  observation: `addProduct` inserta en `products` y ejecuta `revalidatePath('/store')`.

## Eliminated

## Resolution
- root_cause: `app/store/page.js` no consultaba la tabla `products` y renderizaba `<ProductList />` sin la prop `products`, por lo que el componente siempre mostraba el estado vacío.
- fix: Se convirtió `/store` en un Server Component async, se añadió la consulta `SELECT * FROM products ORDER BY id DESC`, y se pasó el resultado como `products` a `ProductList`.
- verification: `npm run lint -- app/store/page.js` pasó correctamente sin errores.
- files_changed: `app/store/page.js`
- final_status: RESOLVED
