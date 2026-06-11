# TreeLink Backend

API REST para gestión de usuarios y enlaces de TreeLink.

## Stack

- Node.js >= 20
- Express 4
- MongoDB + Mongoose 8
- JWT, Cloudinary, Nodemailer

## Requisitos

- Node.js >= 20
- MongoDB
- Cuenta Cloudinary
- Credenciales SMTP (Gmail u otro)

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

El servidor inicia en `http://localhost:4000`

## Producción

```bash
npm start
```

## Documentación de API

Ver [API.md](./API.md) para el listado completo de endpoints.

## Checklist de verificación

- [ ] `GET /api/health` responde correctamente
- [ ] Conexión a MongoDB exitosa
- [ ] Registro y verificación de email

## Seed de datos demo

```bash
cp .env.example .env   # configura MONGO_URI
npm run seed
```

Credenciales demo:
- Email: `demo@treelink.com`
- Password: `demo1234`
- Username: `juan-morales`
- [ ] Login, refresh token y logout
- [ ] CRUD de enlaces con imágenes
- [ ] Árbol público por username
