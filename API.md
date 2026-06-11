# TreeLink API

Base URL: `http://localhost:4000/api`

## Health

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado del servidor |

## Usuario (`/user`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/register` | No | Registro de usuario |
| POST | `/login` | No | Inicio de sesión |
| GET | `/refresh` | Refresh Token | Renovar sesión |
| POST | `/google` | Google Token | Login con Google |
| POST | `/facebook` | No | Login con Facebook |
| POST | `/forgot-password` | No | Enviar código de 6 dígitos al correo |
| POST | `/reset-password-code` | No | Restablecer con email, código y nueva contraseña |
| POST | `/password-reset/send` | Access Token | Enviar código al correo del usuario autenticado |
| POST | `/password-reset/confirm` | Access Token | Confirmar código y nueva contraseña |
| POST | `/reset-password/:token` | No | Restablecer contraseña (enlaces legacy) |
| GET | `/verified/:token` | No | Verificar email |
| POST | `/resend-verification` | No | Reenviar email de verificación (máx. 5/día, body: `{ "email" }`) |
| POST | `/profile` | Access Token | Actualizar perfil |
| GET | `/:username` | No | Obtener árbol público |

## Enlaces (`/link`)

Todas las rutas requieren Access Token (`Authorization: Bearer <token>`).

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar enlaces del usuario (ordenados) |
| POST | `/seed-defaults` | Crear enlaces de ejemplo (solo si no tiene ninguno) |
| POST | `/` | Crear enlace (multipart: name, url, file, description?, featured?, isActive?) |
| PUT | `/reorder` | Reordenar enlaces (`{ "linkIds": ["id1", "id2"] }`) |
| PATCH | `/:id` | Actualizar campos rápidos (`featured`, `isActive`) |
| PUT | `/:id` | Actualizar enlace |
| DELETE | `/:id` | Eliminar enlace |

## Respuestas

```json
{ "ok": true, "message": "..." }
{ "ok": false, "message": "..." }
{ "ok": false, "errors": [{ "field": "email", "message": "..." }] }
```
