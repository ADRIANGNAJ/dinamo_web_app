# Cómo subir tu App a GitHub

Ya he inicializado el repositorio local y guardado tus cambios (ignorando las claves secretas).

Sigue estos pasos para subirlo:

1.  **Crea el Repositorio en GitHub**:
    - Ve a [github.com/new](https://github.com/new).
    - Ponle un nombre (ej: `dinamo-app`).
    - **No** marques "Initialize with README", .gitignore o License (ya tenemos eso).
    - Dale a **Create repository**.

2.  **Conecta tu computadora**:
    - Copia el comando que dice: `git remote add origin ...`
    - Pégalo en tu terminal y dale Enter.
    - Luego ejecuta:
      ```bash
      git branch -M main
      git push -u origin main
      ```

¡Listo!

> **Nota Importante:**
> Los archivos con claves secretas (`.env`, `serviceAccountKey.json`) **NO** se subirán.
> Si otro desarrollador baja el código, tendrá que pedirte esas claves y ponerlas manualmente en su computadora.
