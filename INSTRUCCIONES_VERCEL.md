# Cómo desplegar en Vercel

Tu app ahora es "Vercel Ready". Sigue estos pasos para subirla:

### 1. Preparar las Variables de Entorno
Necesitamos sacar las credenciales de tu archivo `server/serviceAccountKey.json` para ponerlas en Vercel.

Abre ese archivo y ten a la mano:
- `project_id`
- `client_email`
- `private_key` (Copia TODO el texto, incluyendo `-----BEGIN PRIVATE KEY...`)

### 2. Subir a GitHub
Asegúrate de haber subido todos los cambios recientes:
```bash
git add .
git commit -m "Preparado para Vercel"
git push
```

### 3. Conectar con Vercel
1. Ve a [vercel.com](https://vercel.com) e inicia sesión.
2. Dale a **"Add New..."** -> **"Project"**.
3. Importa tu repositorio `dinamo-app` (o como le hayas puesto).

### 4. Configurar el Proyecto (IMPORTANTE)
En la pantalla de configuración ("Configure Project"):
1. **Framework Preset**: Déjalo en `Vite`.
2. **Environment Variables**: Aquí es donde ocurre la magia. Agrega estas variables **EXACTAMENTE** con estos nombres:

| Nombre (Key) | Valor (Value) |
| :--- | :--- |
| `STRIPE_SECRET_KEY` | Tu clave secreta de Stripe que empieza con `sk_live_...` |
| `VITE_STRIPE_PUBLIC_KEY` | Tu clave pública de Stripe que empieza con `pk_live_...` |
| `FIREBASE_PROJECT_ID` | El `project_id` del JSON |
| `FIREBASE_CLIENT_EMAIL` | El `client_email` del JSON |
| `FIREBASE_PRIVATE_KEY` | El `private_key` del JSON |

3. Dale a **Deploy**.

### 5. Configurar Stripe (Producción)
Una vez desplegado:
1. Copia la URL de tu sitio (ej: `https://dinamo-app.vercel.app`).
2. Ve al Dashboard de Stripe -> Developers -> API Keys.
3. Asegúrate de estar usando las claves `Live`.

¡Y listo! Tu servidor Node.js ahora vive dentro de Vercel y no tienes que pagar hosting extra.
