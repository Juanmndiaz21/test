import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
    const envFile = readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
    for (const line of envFile.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const val = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
            if (!process.env[key]) {
                process.env[key] = val;
            }
        }
    }
} catch (e) {
    console.warn('Could not read .env.local', e.message);
}

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is missing in .env.local');
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const newArticles = [
    {
        title: 'Cómo Crear una Cuenta de Discord Paso a Paso: Guía Completa (con Diagrama)',
        slug: 'como-crear-cuenta-discord-guia-paso-a-paso',
        excerpt: 'Guía definitiva para crear y configurar tu cuenta de Discord en PC, navegador y móvil. Incluye diagrama de flujo visual paso a paso, seguridad 2FA y consejos para gaming.',
        category: 'Guides',
        image_url: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?q=80&w=1200&auto=format&fit=crop',
        is_featured: false,
        published: true,
        author: 'OGmodz Specialist',
        read_time: '7 min read',
        meta_title: 'Cómo Crear una Cuenta de Discord (2026) | Guía con Diagrama | OGmodz',
        meta_description: 'Aprende cómo crear una cuenta de Discord paso a paso en PC y móvil. Incluye diagrama de flujo, verificación de email, autenticación 2FA y configuración para gaming.',
        content: `# Cómo Crear una Cuenta de Discord Paso a Paso: Guía Completa (con Diagrama)

En el mundo del gaming, los eSports y las comunidades online, **Discord** es la plataforma de comunicación por excelencia. Ya sea para coordinar partidas de CS2, unirte a sesiones de GTA Online, charlar por voz en alta fidelidad o acceder a soporte y promociones exclusivas, tener una cuenta activa de Discord es prácticamente obligatorio.

En esta guía te explicamos **cómo crear tu cuenta de Discord en PC y dispositivos móviles**, acompañada de un **diagrama visual del proceso**, consejos de seguridad y cómo unirte a tus primeros servidores.

---

## Diagrama Visual: Proceso de Creación de Cuenta

Para que tengas una vista panorámica de todo el proceso antes de empezar, aquí tienes el flujo estructurado:

\`\`\`diagram
1. Acceso a la Plataforma | Entra a discord.com en tu navegador o descarga la aplicación oficial para Windows, Mac, iOS o Android. | Web o App Oficial
2. Registro de Credenciales | Haz clic en 'Registrarse' e ingresa tu correo electrónico, nombre de usuario y contraseña segura. | Datos Personales
3. Fecha de Nacimiento | Selecciona tu fecha de nacimiento (requisito indispensable por ley; edad mínima 13 años). | Verificación de Edad
4. Confirmación de Correo | Abre la bandeja de entrada de tu email y presiona el enlace 'Verificar Correo Electrónico'. | Activación de Cuenta
5. Configurar Seguridad 2FA | Activa la autenticación en dos pasos desde Ajustes de Usuario con Google Authenticator o Authy. | Blindaje Anti-Hackeo
6. Unirse a Comunidades | Personaliza tu avatar, nombre para mostrar y únete a servidores de gaming (ej. Discord de OGmodz). | ¡Listo para Chatear!
\`\`\`

Y si prefieres visualizar el flujo lógico paso a paso:

\`\`\`
[ Inicio ]
    │
    ▼
[ ¿Descargar App o Usar Navegador? ]
    │
    ├─► Navegador: Ir a discord.com
    └─► App: Instalar desde tienda oficial
    │
    ▼
[ Formulario de Registro ] ──► (Email, Usuario, Password, Cumpleaños)
    │
    ▼
[ Resolver Captcha de Seguridad ]
    │
    ▼
[ Bandeja de Entrada: Verificar Email ] ──► (Hacer clic en el botón)
    │
    ▼
[ Cuenta Activa ] ──► [ Blindar con 2FA ] ──► [ Unirse a Servidores ]
\`\`\`

---

## Cómo Crear una Cuenta de Discord en PC (Navegador o App)

El método más habitual y cómodo para jugadores de ordenador:

### Paso 1: Entra en la Web Oficial de Discord
1. Abre tu navegador preferido (Chrome, Firefox, Brave, Edge).
2. Entra en el sitio oficial: [discord.com](https://discord.com).
3. Tienes dos opciones:
   * **Abrir Discord en tu navegador:** Para usarlo directamente sin instalar nada.
   * **Descargar para Windows / Mac:** Muy recomendado para jugadores porque ofrece menor latencia, superposición en partida (overlay) y atajos de teclado globales.

### Paso 2: Pulsa en "Iniciar Sesión" y luego en "Registrarse"
1. En la esquina superior derecha, haz clic en **Iniciar Sesión**.
2. Debajo de los campos de inicio de sesión, verás un enlace azul que dice: **¿Necesitas una cuenta? Registrarse**. Haz clic en él.

### Paso 3: Completa el Formulario de Registro
Llena los campos obligatorios:
* **Correo Electrónico:** Usa un correo al que tengas acceso permanente (Gmail, Outlook, etc.).
* **Nombre de Usuario (@username):** Tu identificador único en Discord (letras minúsculas, números, guiones y puntos).
* **Nombre para Mostrar (Display Name):** El nombre que verán los demás usuarios en los servidores (puedes cambiarlo en cualquier momento).
* **Contraseña:** Elige una clave de al menos 10-12 caracteres con letras, números y símbolos.
* **Fecha de Nacimiento:** Por normativas de protección a menores (COPPA), Discord exige tener al menos 13 años (o 14-16 según tu país).

### Paso 4: Resuelve el Captcha y Confirma tu Email
1. Marca la casilla de verificación antibot (hCloudflare Turnstile o reCAPTCHA).
2. **¡Paso Crucial!** Entra a tu cliente de correo electrónico. Verás un mensaje de Discord con el asunto *"Verificar dirección de correo electrónico para Discord"*.
3. Abre el mensaje y haz clic en el botón morado: **Verificar correo electrónico**.

---

## Cómo Crear una Cuenta de Discord en Móvil (Android / iOS)

Si vas a utilizar Discord principalmente desde tu teléfono o tablet:

1. **Descarga la aplicación:**
   * En Android: Abre **Google Play Store** y busca *"Discord"*.
   * En iPhone/iPad: Abre **App Store** y busca *"Discord - Chat for Gamers"*.
2. **Abre la app y pulsa "Registrarse"**:
   * Podrás elegir registrarte mediante **Número de teléfono** o **Correo electrónico**.
   * *Recomendación:* Elige **Correo electrónico**, ya que facilita la recuperación de cuenta en caso de pérdida del dispositivo móvil.
3. **Introduce tu fecha de nacimiento y nombre de usuario.**
4. **Verifica tu correo electrónico** tocando el enlace de confirmación que te llegará por mail.

---

## 3 Ajustes de Seguridad Imprescindibles tras Crear tu Cuenta

Una cuenta recién creada sin protecciones puede ser vulnerable a ataques de phishing o robo de tokens. Aplica estos 3 ajustes de inmediato:

### 1. Activa la Autenticación en Dos Pasos (2FA)
* Ve a **Ajustes de Usuario** (el icono de engranaje ⚙️ abajo a la izquierda).
* Entra en la sección **Mi Cuenta**.
* Haz clic en **Habilitar autenticación en dos pasos**.
* Escanea el código con una aplicación autenticadora en tu móvil como **Google Authenticator** o **Authy**.
* Guarda los **Códigos de Respaldo** en un lugar seguro (por ejemplo, en un bloc de notas protegido o gestor de contraseñas).

### 2. Bloquea Mensajes Directos de Desconocidos
Muchos bots envían enlaces fraudulentos por mensaje privado prometiendo "Nitro gratis" o skins de juegos:
* En **Ajustes de Usuario**, dirígete a **Privacidad y Seguridad**.
* Desactiva la opción: *"Permitir mensajes directos de miembros del servidor"* si te unes a servidores masivos de desconocidos.

### 3. Personaliza tu Perfil Gamer
* En **Ajustes > Perfiles**, puedes subir una foto de perfil (avatar) y un banner personalizado.
* Escribe una breve biografía sobre tus juegos favoritos (GTA 5, CS2, etc.) y vincula tus cuentas de **Steam**, **PlayStation Network**, **Xbox** o **Twitch**.

---

## Comparativa: Discord Gratis vs Discord Nitro

Discord es **100% gratuito** para chatear, llamar y compartir pantalla, pero existe una suscripción opcional llamada **Nitro**:

| Función | Discord Gratuito | Discord Nitro |
|---|---|---|
| **Chat de Voz y Texto** | Ilimitado | Ilimitado |
| **Calidad de Streaming de Pantalla** | 720p a 30 FPS | **4K a 60 FPS** |
| **Límite de Subida de Archivos** | Hasta 10 MB | **Hasta 500 MB** |
| **Emojis Personalizados** | Solo en el servidor de origen | **En cualquier servidor del mundo** |
| **Super Reacciones y Pegatinas** | Estándar | Exclusivas animadas |
| **Insignia en el Perfil** | No | Insignia de suscriptor Nitro |

---

## Únete a la Comunidad Oficial de OGmodz en Discord

Ahora que tienes tu cuenta creada, ¡el siguiente paso es unirte a comunidades de gaming!

En el servidor oficial de **OGmodz** podrás:
* Recibir soporte 24/7 para tus pedidos de boosting y cuentas.
* Participar en sorteos semanales de GTA$ y skins.
* Conocer a otros jugadores para armar escuadras de CS2 o golpes de GTA Online.

> **Enlace de Invitación Directa:** [Únete a nuestro Discord Oficial](https://discord.gg/qwyQjn4Aqx)

---

## Preguntas Frecuentes (FAQ)

### ¿Es gratis crear una cuenta de Discord?
Sí, crear una cuenta y utilizar Discord para llamadas de voz individuales, grupales, canales de texto y compartir pantalla es completamente gratuito para siempre.

### ¿Por qué Discord me pide un número de teléfono?
Algunos servidores con alta protección contra spam exigen que tu cuenta tenga un número de teléfono verificado para poder escribir en los canales. No es obligatorio para crear la cuenta, pero sí muy recomendable.

### ¿Puedo tener dos cuentas de Discord?
Sí. La aplicación oficial de Discord para PC cuenta con la función de **Cambio de Cuentas**, que te permite vincular hasta 5 cuentas simultáneamente y alternar entre ellas en un clic sin cerrar sesión.
`
    },
    {
        title: '¿Para qué sirven los Commends en CS2? Guía Completa de Elogios y Trust Factor',
        slug: 'para-que-sirven-los-commends-en-cs2-guia-elogios',
        excerpt: 'Descubre qué son los commends (elogios) en Counter-Strike 2, su impacto real en el Trust Factor (Factor de Confianza), cómo darlos y cómo conseguirlos de forma legítima.',
        category: 'CS2',
        image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
        is_featured: false,
        published: true,
        author: 'Alex "KRONOS" Diaz',
        read_time: '6 min read',
        meta_title: '¿Para qué sirven los Commends en CS2? Elogios y Trust Factor | OGmodz',
        meta_description: 'Guía definitiva de commends en CS2: Amigable, Buen Maestro y Buen Líder. Analizamos el Trust Factor de Valve, límites diarios y cómo conseguir elogios legítimos.',
        content: `# ¿Para qué sirven los Commends en CS2? Guía Completa de Elogios y Trust Factor

Cuando abres el perfil de un jugador en **Counter-Strike 2** o inspeccionas tu propia tarjeta de servicio, verás tres pequeños iconos con contadores numéricos: una cara sonriente, un birrete de graduación y una corona.

Estos son los **Commends (Elogios)** de CS2. 

Entre la comunidad competitiva existen infinidad de rumores: *¿Realmente te emparejan con menos cheaters si tienes muchos elogios? ¿Mejoran tu Trust Factor? ¿Cuántos puedes dar al día?*

En esta guía desglosamos **qué son los commends en CS2, para qué sirven en la práctica y cómo influyen en tu reputación**.

---

## ¿Qué son los Commends (Elogios) en Counter-Strike 2?

Los **Commends** son un sistema de valoración social y comportamiento positivo implementado por Valve. Permiten que cualquier jugador reconozca a un compañero de equipo (o a un rival) por su buen desempeño, actitud deportiva o liderazgo durante una partida.

Existen **tres tipos de elogios** en CS2:

1. **Amigable (Friendly) – Icono de Cara Sonriente 😊:**  
   Se otorga a jugadores que mantienen una actitud positiva, no se frustran ni caen en la toxicidad, animan al equipo y facilitan una convivencia agradable en el chat de voz.
2. **Buen Maestro (Teacher) – Icono de Birrete 🎓:**  
   Destinado a jugadores experimentados que comparten información útil, enseñan alineaciones (lineups) de granadas de humo, dan pautas tácticas sin arrogancia y ayudan a los principiantes.
3. **Buen Líder (Leader) – Icono de Corona 👑:**  
   Reservado para los estrategas e In-Game Leaders (IGLs) que coordinan jugadas, piden rotaciones acertadas en el momento justo, administran la economía del equipo y mantienen la calma en rondas de presión.

---

## ¿Afectan los Commends al Trust Factor de Valve?

Esta es la pregunta del millón. Valve mantiene el algoritmo exacto de su **Trust Factor (Factor de Confianza)** bajo estricto secreto para evitar que sea manipulado. Sin embargo, Valve ha confirmado en sus comunicados oficiales que el sistema analiza **docenas de variables de comportamiento**.

Aquí está la realidad comprobada:

### El Impacto Real de los Elogios Orgánicos
* **Karma Positivo:** Recibir elogios legítimos de jugadores reales en partidas competitivas o Premier actúa como un **amortiguador frente a reportes esporádicos**. Si un rival enfadado te reporta por sospecha injustificada de wallhack tras un buen tiro, un historial con elogios constantes ayuda al algoritmo a clasificar tu cuenta como deportiva.
* **Mejores Salas de Emparejamiento:** Los jugadores con alto Trust Factor son emparejados con otros usuarios respetuosos, reduciendo drásticamente la cantidad de trolls, abandonadores de partidas y usuarios con cuentas sospechosas de trampas.
* **Prestigio Visual en tu Perfil:** Un perfil de CS2 con números equilibrados de elogios (por ejemplo, 50/48/52) proyecta inmediatamente la imagen de un jugador veterano, confiable y respetado en el servidor.

---

## Cómo Dar un Commend a Otro Jugador en Partida

Elogiar a un compañero o contrincante en CS2 solo toma 5 segundos:

1. Durante la partida (o en el calentamiento / cambio de bando), mantén presionada la tecla **Tab** para abrir la tabla de puntuaciones.
2. Haz **clic derecho** con el ratón para habilitar el cursor en pantalla.
3. Haz **clic izquierdo sobre el nombre** del jugador al que deseas elogiar.
4. Selecciona el icono con una **cara sonriente y un signo más (+)** que dice **"Elogiar" (Commend)**.
5. Marca las categorías que correspondan: *Amigable*, *Buen Maestro* o *Buen Líder*.
6. Haz clic en **Aceptar**. El jugador recibirá una notificación sutil en su pantalla y su contador aumentará.

---

## Límites de Valve: ¿Cuántos Elogios Puedes Dar al Día?

Para evitar el abuso del sistema, Valve impone un límite estricto:

* **Límite Diario:** Solo puedes dar un máximo de **3 elogios cada 24 horas** (1 de cada tipo).
* **Restricción por Partida:** No puedes elogiar al mismo jugador dos veces en la misma partida ni en días consecutivos de forma inmediata si juegas en la misma sala previa.

---

## Elogios Legítimos vs "Commend Bots" (¡Peligro!)

En foros y servidores de trade abundan servicios de *"Botting de Elogios"* que prometen inflar tu perfil con 500 o 1,000 commends en minutos a través de cuentas fantasma controladas por scripts.

> **¡Advertencia Importante!**  
> Valve y su sistema **VACnet** rastrean con precisión las IPs y el origen de las conexiones. Cuando una cuenta recibe cientos de elogios en pocos minutos procedentes de cuentas vacías sin partidas jugadas:
> 1. Valve suele **resetear el contador a cero**.
> 2. Tu **Trust Factor se desploma a rojo** por detección de actividad automatizada artificial.
> 3. En casos severos, la cuenta puede recibir penalizaciones de emparejamiento.

**La recomendación de oro:** Consigue tus elogios jugando de manera limpia y comunicativa en partidas oficiales.

---

## 5 Consejos para Conseguir Elogios Orgánicos en CS2

Si quieres que tus compañeros de equipo te dejen elogios de forma natural tras cada victoria:

1. **Usa el Micrófono para Información Útil:** Di cosas claras y concisas (*"Uno en rampa, 40 de daño"*), evita gritar o hacer ruido cuando otros compañeros están en situaciones de clutch.
2. **Compra Armas a tus Compañeros:** Si tienes 8,000$ y un aliado no tiene dinero para comprar un rifle, suéltale un AK-47 o un M4A1-S sin que te lo pida. El gesto de comprar armas al equipo genera elogios inmediatos.
3. **Mantén una Actitud Positiva en las Derrotas:** Decir *"buen intento"* (NT) cuando un compañero pierde una ronda de 1vs2 sube la moral y demuestra que eres un jugador con el que da gusto jugar.
4. **Enseña Humos y Flashes Útiles:** Comparte trucos de utilidad sin soberbia. Si ves que alguien no conoce el humo de ventana en Mirage, ofrécete a lanzarlo tú.
5. **Pide Intercambio Cordial (Commend for Commend):** Al final de una partida reñida y amistosa, puedes escribir en el chat: *"Good game everyone! Swapping commends if anyone wants :)"*. La mayoría de jugadores devolverán el favor con gusto.

---

## Preguntas Frecuentes (FAQ)

### ¿Los commends te suben el rango o rating Premier en CS2?
No. Los elogios no tienen ningún impacto en los puntos de CS Rating (CSR) ni en los rangos competitivos de mapas individuales. Su función se limita al comportamiento social y al Trust Factor.

### ¿Se pueden perder o reiniciar los commends?
Los elogios legítimos otorgados por jugadores reales nunca caducan ni se borran. Solo son reseteados por Valve si se detecta el uso de bots automatizados de elogios masivos.

### ¿Pueden los rivales elogiarte?
Sí. Si juegas una partida limpia y demuestras deportividad ante el equipo contrario, cualquier jugador del bando enemigo puede abrir la tabla y elogiarte como "Amigable" o "Buen Líder".
`
    }
];

async function seed() {
    console.log('Seeding Discord Guide (with Diagram) & CS2 Commends articles...');

    for (const post of newArticles) {
        await sql`
            INSERT INTO blog_posts (
                title, slug, excerpt, content, category, image_url,
                is_featured, published, author, read_time,
                meta_title, meta_description, updated_at
            ) VALUES (
                ${post.title}, ${post.slug}, ${post.excerpt}, ${post.content},
                ${post.category}, ${post.image_url}, ${post.is_featured},
                ${post.published}, ${post.author}, ${post.read_time},
                ${post.meta_title}, ${post.meta_description}, CURRENT_TIMESTAMP
            )
            ON CONFLICT (slug) DO UPDATE SET
                title = EXCLUDED.title,
                excerpt = EXCLUDED.excerpt,
                content = EXCLUDED.content,
                category = EXCLUDED.category,
                image_url = EXCLUDED.image_url,
                author = EXCLUDED.author,
                read_time = EXCLUDED.read_time,
                meta_title = EXCLUDED.meta_title,
                meta_description = EXCLUDED.meta_description,
                published = true,
                updated_at = CURRENT_TIMESTAMP
        `;
        console.log(`✓ Seeded: ${post.title} (/blog/${post.slug})`);
    }

    console.log('\nBoth articles successfully seeded into database!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Error seeding articles:', err);
    process.exit(1);
});
