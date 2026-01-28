# Cómo Configurar la Service Account de Firebase

Para que el servidor pueda validar los precios y crear pagos de forma segura, necesita una "Llave de Cuenta de Servicio" (Service Account Key).

Sigue estos pasos para generarla:

1.  **Ve a la Consola de Firebase**:
    [https://console.firebase.google.com/project/dinamo-f2fd2/settings/serviceaccounts/adminsdk](https://console.firebase.google.com/project/dinamo-f2fd2/settings/serviceaccounts/adminsdk)
    *(Asegúrate de estar en el proyecto "dinamo-f2fd2")*

2.  **Generar Nueva Clave**:
    - Abajo verás un botón azul que dice **"Generar nueva clave privada"** (Generate new private key).
    - Confirma la descarga.

3.  **Guardar el Archivo**:
    - Se descargará un archivo `.json` con un nombre largo.
    - **Renómbralo** a: `serviceAccountKey.json`
    - **Muévelo** a la carpeta `server` de tu proyecto:
      `/Users/adriangonzaleznajera/Documents/APPS AGNT /DINAMO/DINAMO APP CON STRIPE/server/serviceAccountKey.json`

4.  **Verificar**:
    - Una vez el archivo esté ahí, avísame para probar el servidor.
