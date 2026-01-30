# Guía de Contribución

¡Gracias por tu interés en contribuir al proyecto! Toda contribución es bienvenida. Para asegurar un proceso claro y consistente, por favor sigue esta guía.

## Proceso de Contribución

Recomendamos el flujo de trabajo "Forking Workflow":

1.  **Haz un Fork:** Crea una copia de este repositorio en tu propia cuenta de GitHub.
2.  **Clona tu Fork:** Clona el repositorio desde tu cuenta a tu máquina local.
    ```bash
    git clone https://github.com/tu-usuario/dashboard-classroom-b4os.git
    ```
3.  **Crea una Rama:** Crea una nueva rama para trabajar en tu funcionalidad o corrección.
    ```bash
    git checkout -b feature/nombre-de-tu-feature
    ```
4.  **Realiza tus Cambios:** Haz los cambios necesarios en el código.
5.  **Haz Commit:** Guarda tus cambios con un mensaje claro y descriptivo.
    ```bash
    git commit -m "feat: Agrega nueva funcionalidad X"
    ```
6.  **Sube tus Cambios:** Sube la rama a tu fork en GitHub.
    ```bash
    git push origin feature/nombre-de-tu-feature
    ```
7.  **Crea un Pull Request:** Abre un Pull Request (PR) desde tu rama hacia la rama `main` del repositorio original. Asegúrate de describir los cambios que realizaste.

## Estrategia de Ramas

Utilizamos una estrategia de "feature branches".

-   La rama `main` es la rama principal y siempre debe estar en un estado desplegable.
-   Todo nuevo desarrollo se realiza en una rama de funcionalidad (`feature/...`).
-   El nombre de la rama debe ser descriptivo (ej. `feature/login-con-google`, `fix/error-en-dashboard`).
-   Una vez que el desarrollo en la rama de funcionalidad está completo, se abre un Pull Request hacia `main`.

## Uso del Makefile

Hemos centralizado los comandos más comunes en un `Makefile` para simplificar el flujo de trabajo.

### Inicio Rápido

Para instalar las dependencias y arrancar el servidor de desarrollo, ejecuta:

```bash
# Instala las dependencias (equivale a npm install)
make install

# Inicia el servidor de desarrollo en http://localhost:3000
make dev
```

### Configuración del Entorno

El proyecto requiere variables de entorno para funcionar. Puedes crear el archivo `.env.local` a partir del ejemplo con este comando:

```bash
# Crea el archivo .env.local a partir de env.local.example
make setup-env
```
Después de ejecutar el comando, **debes editar el archivo `.env.local`** y rellenar las credenciales correctas.

### Uso de Datos Mock para Desarrollo Local

Para facilitar el desarrollo frontend sin necesidad de una base de datos real, el proyecto utiliza **Mock Service Worker (MSW)** para interceptar las llamadas a la API y devolver datos mock.

**Cómo funciona:**

-   Cuando ejecutas `make dev`, MSW se activa automáticamente en tu navegador.
-   Las peticiones a rutas como `/api/students`, `/api/assignments`, `/api/grades`, `/api/authorized-users` y `/api/user-privacy` serán interceptadas y responderán con datos predefinidos.
-   Puedes inspeccionar las respuestas mock en la pestaña "Network" de las herramientas de desarrollador de tu navegador.

**Personalizar los datos mock:**

-   Los datos mock se definen en el archivo `src/mocks/handlers.ts`.
-   Puedes modificar este archivo para ajustar los datos existentes o añadir nuevos mocks para otras rutas de API que necesites probar.
