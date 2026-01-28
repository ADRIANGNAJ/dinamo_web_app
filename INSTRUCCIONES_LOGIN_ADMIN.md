# Configuración de Autenticación en Firebase

Para entrar al panel de administrador, necesitas habilitar el inicio de sesión y crear tu usuario "Admin".

Sigue estos pasos en la Consola de Firebase:

1.  **Ir a Authentication**:
    - Ve a [Firebase Console](https://console.firebase.google.com/).
    - En el menú izquierdo, busca **Build** -> **Authentication**.
    - Haz clic en **Get Started** (Comenzar) si es la primera vez.

2.  **Habilitar Email/Password**:
    - Ve a la pestaña **Sign-in method** (Método de inicio de sesión).
    - Haz clic en **Email/Password**.
    - Activa el interruptor **Enable** (Habilitar).
    - Haz clic en **Save** (Guardar).

3.  **Crear Usuario Administrador**:
    - Ve a la pestaña **Users** (Usuarios).
    - Haz clic en **Add user** (Agregar usuario).
    - Ingresa el correo que usarás (ej: `admin@dinamo.com`).
    - Ingresa una contraseña segura.
    - Haz clic en **Add user**.

¡Listo! Esas son las credenciales que usarás en la página de Login de la app (`/admin/login`).
