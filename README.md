# Práctica: Crear el archivo `docker-compose.yml` para ejecutar una aplicación con 3 contenedores

## Objetivo de la práctica

En esta práctica se entrega al alumno un repositorio con una aplicación web dividida en varios componentes, pero **sin el archivo `docker-compose.yml`**.

El objetivo es que el alumno analice la estructura del proyecto, identifique los servicios necesarios y construya el archivo Docker Compose para poder ejecutar la aplicación completa.

La aplicación está formada por tres partes principales:

```text
Frontend  ->  Backend/API  ->  Base de datos
```

Cada parte debe ejecutarse en un contenedor diferente.

---

## 1. Contexto de la práctica

El repositorio ya contiene el código de la aplicación, pero no contiene el archivo que permite levantar todos los servicios juntos.

El alumno deberá crear manualmente el archivo:

```text
docker-compose.yml
```

Este archivo debe permitir ejecutar toda la aplicación con un solo comando:

```bash
docker compose up -d --build
```

---

## 2. Estructura del repositorio entregado

El repositorio tiene una estructura similar a la siguiente:

```text
practica-compose-3-contenedores/
│
├── frontend/
│   └── index.html
│
└── backend/
    ├── Dockerfile
    ├── package.json
    └── server.js
```

El alumno debe agregar el archivo faltante:

```text
docker-compose.yml
```

Al finalizar, la estructura debe quedar así:

```text
practica-compose-3-contenedores/
│
├── docker-compose.yml
│
├── frontend/
│   └── index.html
│
└── backend/
    ├── Dockerfile
    ├── package.json
    └── server.js
```

---

# 3. Explicación de la estructura de la aplicación

## 3.1 Carpeta `frontend`

La carpeta `frontend` contiene la página web que verá el usuario.

```text
frontend/
└── index.html
```

Este archivo contiene una interfaz sencilla en HTML. Desde esta página se puede consultar al backend usando JavaScript.

Ejemplo de una petición desde el frontend:

```javascript
fetch('http://localhost:3000')
```

Esto significa que el navegador consultará el backend en el puerto `3000`.

El frontend será ejecutado usando un contenedor de **Nginx**.

---

## 3.2 Carpeta `backend`

La carpeta `backend` contiene la API de la aplicación.

```text
backend/
├── Dockerfile
├── package.json
└── server.js
```

---

## 3.3 Archivo `Dockerfile`

El archivo `Dockerfile` indica cómo se construye la imagen del backend.

Ejemplo:

```dockerfile
FROM node:20

WORKDIR /app

COPY package.json .

RUN npm install

COPY server.js .

EXPOSE 3000

CMD ["npm", "start"]
```

Este archivo le indica a Docker que debe:

1. Usar Node.js como imagen base.
2. Crear una carpeta de trabajo dentro del contenedor.
3. Copiar el archivo `package.json`.
4. Instalar las dependencias del proyecto.
5. Copiar el archivo `server.js`.
6. Exponer el puerto `3000`.
7. Ejecutar la aplicación con `npm start`.

---

## 3.4 Archivo `package.json`

El archivo `package.json` define las dependencias del backend.

Ejemplo:

```json
{
  "name": "backend-compose",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "cors": "^2.8.5"
  }
}
```

Las dependencias principales son:

| Dependencia | Función |
|---|---|
| `express` | Permite crear el servidor web/API |
| `pg` | Permite conectar Node.js con PostgreSQL |
| `cors` | Permite peticiones desde el frontend |

---

## 3.5 Archivo `server.js`

El archivo `server.js` contiene la lógica principal del backend.

Este backend realiza las siguientes acciones:

1. Levanta una API en el puerto `3000`.
2. Se conecta a PostgreSQL.
3. Crea una tabla llamada `visitas` si no existe.
4. Inserta una visita cada vez que se consulta la API.
5. Devuelve el número total de visitas registradas.

El backend necesita conectarse a la base de datos usando variables de entorno.

Ejemplo:

```javascript
host: process.env.DB_HOST
port: process.env.DB_PORT
database: process.env.DB_NAME
user: process.env.DB_USER
password: process.env.DB_PASSWORD
```

Por esta razón, en el archivo `docker-compose.yml` se deben declarar estas variables.

---

# 4. Servicios que debe crear el alumno

El archivo `docker-compose.yml` debe definir tres servicios:

```text
frontend
backend
db
```

Cada servicio representa un contenedor.

---

## 4.1 Servicio `frontend`

Este servicio debe ejecutar Nginx para mostrar la página web.

Debe cumplir con lo siguiente:

- Usar la imagen `nginx`.
- Publicar el puerto `8080` de la computadora hacia el puerto `80` del contenedor.
- Montar la carpeta `frontend` dentro de la carpeta web de Nginx.
- Conectarse a la red de la aplicación.
- Depender del backend.

Nginx sirve archivos web desde la siguiente ruta interna:

```text
/usr/share/nginx/html
```

Por lo tanto, se debe montar la carpeta local `frontend` en esa ruta:

```yaml
volumes:
  - ./frontend:/usr/share/nginx/html
```

---

## 4.2 Servicio `backend`

Este servicio debe ejecutar la API de Node.js.

Debe cumplir con lo siguiente:

- Construirse usando el `Dockerfile` de la carpeta `backend`.
- Publicar el puerto `3000`.
- Declarar las variables de conexión a PostgreSQL.
- Conectarse a la misma red que los demás servicios.
- Depender de la base de datos.

El punto más importante es que el backend **no se conecta a PostgreSQL usando `localhost`**.

Dentro de Docker Compose, los servicios se comunican usando el nombre del servicio.

Si la base de datos se llama:

```yaml
db:
```

Entonces el backend debe conectarse usando:

```yaml
DB_HOST: db
```

No debe usar:

```yaml
DB_HOST: localhost
```

---

## 4.3 Servicio `db`

Este servicio debe ejecutar PostgreSQL.

Debe cumplir con lo siguiente:

- Usar la imagen `postgres`.
- Crear una base de datos llamada `escuela`.
- Crear un usuario llamado `admin`.
- Asignar una contraseña.
- Guardar los datos en un volumen.
- Conectarse a la red de la aplicación.

Variables necesarias:

```yaml
POSTGRES_DB: escuela
POSTGRES_USER: admin
POSTGRES_PASSWORD: admin123
```

---

# 5. Red que debe crear el alumno

Los tres contenedores deben estar en la misma red.

La red se llamará:

```text
red_app
```

Es recomendable forzar el nombre real de la red para que los alumnos puedan verla fácilmente con:

```bash
docker network ls
```

Por eso, al final del archivo Compose se debe agregar:

```yaml
networks:
  red_app:
    name: red_app
    driver: bridge
```

Esto hace que Docker cree una red llamada exactamente:

```text
red_app
```

Si no se agrega `name: red_app`, Compose puede crear la red con el nombre del proyecto como prefijo.

Ejemplo:

```text
practica-compose-3-contenedores_red_app
```

---

# 6. Volumen que debe crear el alumno

La base de datos necesita persistencia.

Si no se usa un volumen, los datos podrían perderse al eliminar el contenedor.

Por eso se debe crear un volumen llamado:

```text
datos_postgres
```

Este volumen se debe montar en la siguiente ruta interna del contenedor de PostgreSQL:

```text
/var/lib/postgresql/data
```

Ejemplo:

```yaml
volumes:
  - datos_postgres:/var/lib/postgresql/data
```

Y al final del archivo:

```yaml
volumes:
  datos_postgres:
```

---



---


---

# 7. Comandos que debe ejecutar el alumno

## 7.1 Levantar la aplicación

```bash
docker compose up -d --build
```

Este comando realiza lo siguiente:

1. Construye la imagen del backend.
2. Descarga las imágenes necesarias.
3. Crea la red.
4. Crea el volumen.
5. Levanta los tres contenedores.

---

## 7.2 Ver contenedores

```bash
docker compose ps
```

Debe aparecer algo parecido a:

```text
frontend_nginx
backend_node
postgres_db
```

---

## 7.3 Ver redes

```bash
docker network ls
```

Debe aparecer:

```text
red_app
```

---

## 7.4 Ver volúmenes

```bash
docker volume ls
```

Debe aparecer un volumen relacionado con:

```text
datos_postgres
```

---

## 7.5 Ver logs

```bash
docker compose logs -f
```

Este comando sirve para revisar si algún contenedor tiene errores.

---

## 7.6 Probar la aplicación

Frontend:

```text
http://localhost:8080
```

Backend:

```text
http://localhost:3000
```

---

# 8. Errores esperados y explicación para el alumno

## 8.1 La red no aparece como `red_app`

Puede suceder si el alumno pone únicamente:

```yaml
networks:
  red_app:
```

En ese caso Compose puede crear una red con prefijo:

```text
nombrecarpeta_red_app
```

Para que aparezca exactamente como `red_app`, debe poner:

```yaml
networks:
  red_app:
    name: red_app
    driver: bridge
```

---

## 8.2 Error `ECONNREFUSED` al conectar con PostgreSQL

Ejemplo:

```text
Error conectando a PostgreSQL: connect ECONNREFUSED
```

Esto significa que el backend encontró al contenedor de PostgreSQL, pero la base de datos todavía no estaba lista para recibir conexiones.

La explicación importante es:

```text
depends_on arranca primero la base de datos,
pero no siempre espera a que PostgreSQL esté completamente listo.
```

En proyectos reales se puede solucionar con:

- `healthcheck`
- reintentos en el backend
- scripts de espera

Para esta práctica básica puede bastar con revisar logs o reiniciar el backend después de unos segundos:

```bash
docker compose restart backend
```

---

## 8.3 El backend no se conecta a la base de datos

Revisar que la variable sea:

```yaml
DB_HOST: db
```

No debe ser:

```yaml
DB_HOST: localhost
```

Porque `localhost` dentro del contenedor backend significa el mismo contenedor backend, no el contenedor de PostgreSQL.

---

## 8.4 Puerto ocupado

Ejemplo:

```text
port is already allocated
```

Significa que el puerto ya está siendo usado.

Solución: cambiar el puerto izquierdo.

Por ejemplo:

```yaml
ports:
  - "8081:80"
```

En ese caso se abriría:

```text
http://localhost:8081
```

---

# 9. Criterios de evaluación sugeridos

| Criterio | Valor |
|---|---:|
| Crea correctamente el archivo `docker-compose.yml` | 20% |
| Define los tres servicios: `frontend`, `backend` y `db` | 20% |
| Configura correctamente puertos, volúmenes y variables de entorno | 20% |
| Usa correctamente una red común entre contenedores | 15% |
| Comprende que el backend se conecta a `db` y no a `localhost` | 15% |
| Ejecuta y valida la aplicación correctamente | 10% |

---

# 10. Entregable del alumno

El alumno debe entregar:

1. Archivo `docker-compose.yml`.
2. Captura de `docker compose ps`.
3. Captura de `docker network ls` mostrando `red_app`.
4. Captura del frontend funcionando.
5. Captura del backend funcionando.
6. Breve explicación de cómo se comunican los tres contenedores.
7. Todo en video - enviar a eduardo.vl@saltillo.tecnm.mx

---

# 11. Preguntas para reforzar el aprendizaje

1. ¿Para qué sirve Docker Compose?
2. ¿Qué diferencia hay entre `image` y `build`?
3. ¿Por qué el backend usa `DB_HOST=db`?
4. ¿Qué función cumple el volumen `datos_postgres`?
5. ¿Qué pasa si se ejecuta `docker compose down`?
6. ¿Qué pasa si se ejecuta `docker compose down -v`?
7. ¿Por qué se usa una red llamada `red_app`?
8. ¿Qué significa `"8080:80"` en la sección `ports`?
9. ¿Qué contenedor usa el `Dockerfile`?
10. ¿Qué servicio usa una imagen ya existente?

---

# 12. Instrucción final para el alumno

El repositorio ya contiene la aplicación, pero no contiene el archivo Docker Compose.

Tu tarea es crear un archivo llamado:

```text
docker-compose.yml
```

en la raíz del proyecto.

Ese archivo debe permitir levantar toda la aplicación con un solo comando:

```bash
docker compose up -d --build
```

Al finalizar, la aplicación debe funcionar en:

```text
Frontend: http://localhost:8080
Backend:  http://localhost:3000
```

La base de datos debe ejecutarse en PostgreSQL y debe estar conectada al backend mediante el nombre del servicio:

```text
db
```

---

# 13. Resumen

- Identificar los servicios principales de una aplicación.
- Crear un archivo `docker-compose.yml`.
- Levantar una aplicación con varios contenedores.
- Conectar un frontend, un backend y una base de datos.
- Usar redes en Docker Compose.
- Usar volúmenes para persistencia.
- Entender por qué los contenedores se comunican usando el nombre del servicio.
