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

## Conventional Commits

Para mantener un historial de commits limpio, legible y útil, este proyecto sigue la especificación de [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Esto facilita la generación automática de changelogs, la detección de cambios que rompen la compatibilidad y la comprensión del propósito de cada commit.

**Formato del Mensaje de Commit:**

Cada mensaje de commit debe tener el siguiente formato:

```
<tipo>[ámbito opcional]: <descripción>

[cuerpo opcional]

[pie de página opcional]
```

**Tipos Comunes:**

*   `feat`: Una nueva característica.
*   `fix`: Una corrección de un error.
*   `docs`: Cambios solo en la documentación.
*   `style`: Cambios que no afectan el significado del código (espacios en blanco, formato, puntos y comas faltantes, etc.).
*   `refactor`: Un cambio de código que no corrige un error ni añade una característica.
*   `perf`: Un cambio de código que mejora el rendimiento.
*   `test`: Añadir pruebas faltantes o corregir pruebas existentes.
*   `build`: Cambios que afectan el sistema de construcción o dependencias externas (ej. npm, gulp).
*   `ci`: Cambios en los archivos y scripts de configuración de CI (ej. Travis, Circle, BrowserStack, SauceLabs).
*   `chore`: Otros cambios que no modifican el código fuente ni los archivos de prueba.
*   `revert`: Revierte un commit anterior.

**Ejemplos:**

*   `feat(auth): añadir autenticación con Google`
*   `fix(api): corregir error al obtener usuarios`
*   `docs: actualizar guía de contribución`
*   `chore(deps): actualizar dependencia de Next.js`

**Automatización con Husky:**

Para asegurar que todos los commits sigan esta convención, hemos configurado un hook de Git con [Husky](https://typicode.github.io/husky/) que validará el mensaje de tu commit antes de que se complete. Si el mensaje no cumple con el formato, el commit será rechazado y se te pedirá que lo corrijas.

## Uso del Makefile

Hemos centralizado los comandos más comunes en un `Makefile` para simplificar el flujo de trabajo.

## Prerrequisitos

Para asegurar un entorno de desarrollo consistente, es necesario tener instalados `make` y [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm).

*   **Make**: Es una herramienta de automatización de tareas. Generalmente viene preinstalado en sistemas operativos basados en Unix (Linux, macOS). Para Windows, puedes instalarlo como parte de [Git Bash](https://git-scm.com/downloads) o a través de un gestor de paquetes como [Chocolatey](https://chocolatey.org/install).
*   **nvm (Node Version Manager)**: Permite gestionar múltiples versiones de Node.js. Asegúrate de tenerlo instalado en tu sistema.

Una vez instalados `make` y `nvm`, el comando `make install` se encargará automáticamente de instalar y usar la versión de Node.js especificada en el archivo `.nvmrc` del proyecto.

### Inicio Rápido

Para instalar las dependencias y arrancar el servidor de desarrollo, ejecuta:

```bash
# Instala las dependencias (equivale a npm install)
$ make install

# Inicia el servidor de desarrollo en http://localhost:3000
$ make dev

# Muestra todos los comandos disponibles en el Makefile
$ make help
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
