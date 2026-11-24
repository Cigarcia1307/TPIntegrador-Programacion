# FoodStore - Trabajo Práctico Integrador
# Alumna: García Cintia.

## Programación IV - UTN

Tecnicatura Universitaria en Programación a Distancia.

## Descripción del proyecto

FoodStore es una aplicación web de comercio electrónico
que permite consultar productos, realizar compras y
administrar categorías, productos, pedidos y usuarios.

El sistema cuenta con dos roles: cliente y administrador.

## Tecnologías utilizadas

### Backend

- Python 3.11
- FastAPI
- SQLModel
- PostgreSQL
- JWT mediante cookies HttpOnly
- Unit of Work y Repository

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Zustand
- TanStack Query
- TanStack Form
- TanStack Table
- React Router

## Estructura del proyecto

- foodstore-backend: API REST y lógica de negocio.
- foodstore-frontend: interfaz web.
- README.md: instrucciones de instalación y ejecución.

## Requisitos previos

- Python 3.11
- PostgreSQL
- Node.js 22.12 o superior, compatible con Vite
- pnpm
- Git

## 1. Configuración de la base de datos

Crear una base de datos en PostgreSQL llamada:

```sql
CREATE DATABASE foodstore_tpi;
```

También se puede crear desde pgAdmin.

## 2. Instalación del backend

Desde la raíz del proyecto:

```powershell
cd foodstore-backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Variables de entorno

Copiar el archivo .env.example con el nombre .env:

```powershell
Copy-Item .env.example .env
```

Configurar las siguientes variables en el archivo .env:

```dotenv
DATABASE_URL=postgresql+psycopg2://postgres:TU_CONTRASENA@localhost:5432/foodstore_tpi
SECRET_KEY=TU_CLAVE_SECRETA
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=http://127.0.0.1:5173
```

Reemplazar TU_CONTRASENA por la contraseña de PostgreSQL
y TU_CLAVE_SECRETA por una clave segura.

Para generar una clave secreta se puede ejecutar:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

### Carga inicial de datos

```powershell
python -m app.db.seed
```

El seed carga el usuario administrador, categorías
y productos iniciales sin duplicar registros existentes.

### Ejecutar el backend

```powershell
uvicorn app.main:app --reload
```

API REST:

http://127.0.0.1:8000/api/v1

Documentación Swagger:

http://127.0.0.1:8000/docs

## 3. Instalación del frontend

Abrir una nueva terminal desde la raíz del proyecto:

```powershell
cd foodstore-frontend
pnpm install
```

Copiar el archivo de configuración:

```powershell
Copy-Item .env.example .env
```

El archivo .env debe contener:

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

### Verificar compilación

```powershell
pnpm build
```

### Ejecutar el frontend

```powershell
pnpm dev --host 127.0.0.1
```

Abrir la aplicación en:

http://127.0.0.1:5173

Utilizar el puerto 5173 para mantener la configuración
de CORS establecida en el backend.

## 4. Usuario administrador de prueba

Usuario: admin

Contraseña: Admin1234!

Estas credenciales corresponden al usuario de prueba
generado por el seed.

Los clientes pueden crear su cuenta desde la opción
Registrarme de la aplicación.

## 5. Funcionalidades

### Cliente

- Registro e inicio de sesión.
- Consulta del catálogo de productos.
- Búsqueda, filtros y paginación.
- Carrito de compras persistente.
- Confirmación de pedidos.
- Consulta del historial y detalle de pedidos.
- Cancelación de pedidos pendientes.

### Administrador

- Resumen de pedidos e ingresos.
- Alta, modificación y baja lógica de categorías.
- Alta, modificación y baja lógica de productos.
- Gestión de stock y disponibilidad.
- Administración de estados de pedidos.
- Activación y desactivación de usuarios.

## 6. Reglas de negocio

- Los productos deben estar activos, disponibles y
  contar con stock suficiente para realizar una compra.
- El stock se descuenta al crear un pedido.
- La cancelación de un pedido restituye el stock.
- Los pedidos entregados y cancelados son estados finales.
- Los detalles conservan el nombre y precio del producto
  al momento de realizar la compra.
- La baja lógica de una categoría no elimina sus productos.
- Las operaciones administrativas requieren el rol admin.

## 7. Pruebas

Las pruebas de la API pueden realizarse mediante Swagger
o REST Client, utilizando el archivo:

foodstore-backend/tests/foodstore.http

Para ejecutar las pruebas que requieren un cliente,
registrar previamente el usuario indicado en dicho archivo.

También se realizaron pruebas funcionales desde la
interfaz web, verificando el flujo de compra, cancelación,
gestión administrativa y control de stock.

## 8. Repositorio GitHub

https://github.com/Cigarcia1307/TPIntegrador-Programacion.git

## 9. Video de demostración

https://youtu.be/2H_wal0n1dI