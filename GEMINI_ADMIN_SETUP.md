# ClearGrade: Gemini + Subscriptions + Admin Panel - Setup Guide

## Overview

Esta guía te ayudará a integrar completamente:
- **Google Gemini API** con la API key proporcionada
- **Sistema de 3 tiers de suscripción** (Free, Pro, Ultra)
- **Panel de control admin** en `/activate` con autenticación
- **Límites y paywalls** configurables en tiempo real

## 1. Setup de Base de Datos

### Ejecutar migraciones SQL

En tu panel de Supabase:

1. Ve a **SQL Editor**
2. Crea una nueva query
3. Copia y pega el contenido de `scripts/002-add-admin-config.sql`
4. Ejecuta la query

Esto crea:
- Tabla `admin_config`: Almacena configuración global
- Tabla `user_usage`: Rastrea uso de chat y agendas por usuario

## 2. Configurar Gemini API

### Opción A: Variable de entorno (Recomendado)

En Vercel o tu `.env.local`:

```env
GEMINI_API_KEY=AIzaSyBthuQfIIQ2SQJtar_uslJiGoWqAr7UeCw
```

### Opción B: Vía panel admin

1. Ir a `https://tu-dominio.com/activate`
2. Credenciales: `rootmanager` / `rootmanager`
3. Pegar API key en el campo "API Key Gemini"
4. Guardar cambios

**Nota**: La API key se almacena en la BD. Para producción, considera encriptarla.

## 3. Estructura de Suscripciones

### Free Tier
- **15 agendas por mes**
- **10 requests de chat por día**
- **Con anuncios**
- **Gratis**

### Pro Tier
- **50 agendas por mes**
- **100 requests de chat por día**
- **Sin anuncios**
- **$4.99/mes**

### Ultra Tier
- **Ilimitadas agendas**
- **500 requests de chat por día**
- **Sin anuncios**
- **$9.99/mes**

## 4. Panel de Admin (/activate)

### Acceso

```
URL: https://tu-dominio.com/activate
Usuario: rootmanager
Contraseña: rootmanager
```

### Funciones

**Suscripciones**: Activa/desactiva el sistema completo de suscripciones

**Anuncios**: Muestra/oculta ads a usuarios free

**Límites de Chat**: Aplica/remove límites de requests según plan

**Límites de Agendas**: Aplica/remove límites de agendas por mes

**API Key Gemini**: Configura la key en la BD

## 5. Cómo funcionan los Límites

### Chat Requests

```typescript
// Cuando chatLimitsEnabled = true:
- El usuario hace una request al API de chat
- Se verifica su plan y límite diario
- Si excede límite → retorna error 429 con paywall
- Si está OK → se incrementa contador y se procesa chat
- Cada medianoche se resetea el contador
```

### Agendas por Mes

```typescript
// Cuando agendaLimitsEnabled = true:
- Cuando se sube una agenda PDF/DOCX
- Se verifica cuántas agendas creo este mes
- Si excede límite → se bloquea la carga con paywall
- El contador se resetea el 1° de cada mes
```

## 6. Flujo de Paywalls

### Paywall de Chat
```
Usuario: "Hola IA"
  ↓
Sistema verifica: Plan free + 10 requests ya usados
  ↓
Retorna error con mensaje: "Limite de 10 chats/día. Actualiza a Pro"
  ↓
Frontend muestra modal de upgrade
```

### Paywall de Agenda
```
Usuario: Sube agenda PDF
  ↓
Sistema verifica: Plan free + 15 agendas creadas este mes
  ↓
Bloquea la carga y muestra: "Limite de 15 agendas/mes. Actualiza a Pro"
  ↓
Frontend muestra modal de upgrade
```

## 7. Mostrar/Ocultar Ads

### Cuando adsEnabled = true

```tsx
// En cualquier página
<AdBanner />  // Se muestra en usuarios free
```

### Cuando adsEnabled = false

```tsx
// Los ads no se renderizan aunque tengas el componente
// porque verifican: profile?.subscription_plan !== 'free' || !adsEnabled
```

## 8. Integración con Chat

El chat API ahora:

1. **Valida usuario**: Requiere `userId` en el body
2. **Verifica límites**: Si `chatLimitsEnabled = true`
3. **Usa Gemini**: Con la API key de admin config
4. **Rastrea uso**: Actualiza tabla `user_usage`

### Ejemplo de request:

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Ayúdame con matemáticas',
    history: [],
    userId: user.id  // IMPORTANTE
  })
})

const data = await response.json()
// Si limitExceeded: true → mostrar paywall
// Si success: true → mostrar respuesta del chat
```

## 9. Cambiar Contraseña Admin

En `app/activate/page.tsx`, línea 32:

```typescript
// Cambiar esto:
if (username === 'rootmanager' && password === 'rootmanager') {

// A esto (en producción usa proper auth):
if (username === 'tuUsuario' && password === 'tuContraseña') {
```

## 10. Testing

### Test 1: Verificar config se guarda

1. Ve a `/activate`
2. Habilita "Suscripciones"
3. Pega la API key de Gemini
4. Guarda
5. Recarga → debe seguir habilitado

### Test 2: Chat con límites

1. Habilita "Límites de Chat"
2. Asigna plan "free" a tu usuario
3. Envía 10 mensajes en chat
4. El 11° debe retornar error 429

### Test 3: Agendas con límites

1. Habilita "Límites de Agendas"
2. Asigna plan "free" a tu usuario
3. Sube 15 agendas
4. La 16° debe bloquearse

### Test 4: Ads

1. Habilita "Anuncios"
2. Con plan "free" → ve ads
3. Con plan "pro" → no ves ads

## 11. Queries SQL útiles para debugging

```sql
-- Ver config actual
SELECT * FROM admin_config WHERE id = 'default';

-- Ver uso de un usuario
SELECT * FROM user_usage WHERE user_id = 'user-id-aqui';

-- Ver todos los usuarios y planes
SELECT id, subscription_plan, full_name FROM profiles LIMIT 10;

-- Cambiar plan de usuario manualmente
UPDATE profiles SET subscription_plan = 'pro' WHERE id = 'user-id';

-- Resetear uso de chat de un usuario
UPDATE user_usage SET chat_requests_used_today = 0 WHERE user_id = 'user-id';

-- Ver cuántos chats usó hoy
SELECT user_id, chat_requests_used_today FROM user_usage WHERE DATE(last_chat_reset) = TODAY();
```

## 12. Próximos pasos (Opcional)

### Implementar Stripe

```typescript
// En app/api/stripe/checkout
// Crear sesión de checkout con `subscription_plan` en metadata
// Webhook en app/api/stripe/webhook
// Al completar pago → actualizar subscription_plan en profiles
```

### Proteger rutas por suscripción

```typescript
// En middleware.ts
if (limitedFeature && profile.subscription_plan === 'free') {
  redirect('/upgrade')
}
```

### Agregar más tiers

```typescript
// En lib/types.ts - SUBSCRIPTION_LIMITS
// Agrega nueva entrada: 
// business: { agendaPerMonth: 999, chatRequestsPerDay: 1000, ... }
```

### Email de bienvenida

```typescript
// Cuando se crear user en auth webhook
// Enviar email: "Bienvenido a ClearGrade Free Tier"
// Con límites claros y opción de upgrade
```

## 13. Troubleshooting

### Error: "API no configurada"

**Causa**: `geminiApiKey` está vacío en admin_config

**Solución**: Ve a `/activate` y pega la API key

### Error: "Unauthorized" en admin panel

**Causa**: Credenciales incorrectas

**Solución**: Usuario = `rootmanager`, Contraseña = `rootmanager`

### Chat retorna error 429

**Causa**: Usuario alcanzó límite diario y `chatLimitsEnabled = true`

**Solución**: 
- Cambiar plan a pro/ultra, O
- Esperar a mañana para que se resetee, O
- En admin desactivar "Límites de Chat"

### Las agendas no tienen límite

**Causa**: `agendaLimitsEnabled = false`

**Solución**: Ve a `/activate` y habilita "Límites de Agendas"

## 14. API Endpoints Creados

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/chat` | POST | User | Chat con Gemini + límites |
| `/api/admin/config` | GET | Admin | Obtener configuración |
| `/api/admin/config` | POST | Admin | Actualizar configuración |
| `/activate` | GET | None | Panel de admin (requiere login) |

## 15. Archivos Modificados

- `lib/types.ts`: Tipos para admin config y suscripciones
- `lib/admin-config.ts`: Funciones para acceder a configuración
- `app/api/chat/route.ts`: Integración con Gemini + límites
- `app/activate/page.tsx`: Panel de admin
- `app/api/admin/config/route.ts`: API para configuración
- `scripts/002-add-admin-config.sql`: Migración de BD

---

**¡Todo está listo!** Ahora puedes:
1. Ejecutar las migraciones SQL
2. Ir a `/activate` e ingresar la API key de Gemini
3. Activar/desactivar features desde el panel
4. Los límites y paywalls se aplicarán automáticamente
