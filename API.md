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
| POST | `/forgot-password` | No | Recuperar contraseña |
| POST | `/reset-password/:token` | No | Restablecer contraseña |
| GET | `/verified/:token` | No | Verificar email |
| POST | `/profile` | Access Token | Actualizar perfil |
| GET | `/:username` | No | Obtener árbol público |

## Enlaces (`/link`)

Todas las rutas requieren Access Token (`Authorization: Bearer <token>`).

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar enlaces del usuario |
| POST | `/` | Crear enlace (multipart) |
| PUT | `/:id` | Actualizar enlace |
| DELETE | `/:id` | Eliminar enlace |

## Respuestas

```json
{ "ok": true, "message": "..." }
{ "ok": false, "message": "..." }
{ "ok": false, "errors": [{ "field": "email", "message": "..." }] }
```
