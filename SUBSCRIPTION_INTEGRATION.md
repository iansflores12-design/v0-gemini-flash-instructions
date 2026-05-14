# ClearGrade - Guía de Integración: Suscripciones, Límites y Anuncios

Esta guía te explica cómo terminar de integrar el sistema de suscripciones, límites de uso y anuncios que ya tenemos bases creadas.

## 🏗️ Arquitectura Actual

### Componentes Creados

1. **`lib/types.ts`** - Tipos TypeScript para suscripciones y límites
2. **`lib/limits.ts`** - Funciones para verificar y rastrear límites de uso
3. **`components/usage-banner.tsx`** - Banner que muestra uso actual al usuario
4. **`components/ad-banner.tsx`** - Banner para mostrar anuncios
5. **`app/dashboard/upgrade/page.tsx`** - Página de planes de suscripción
6. **`scripts/001-add-subscriptions.sql`** - Migración de base de datos

### Base de Datos

Se agregaron 4 tablas nuevas:
- **`user_usage`** - Rastrea mensajes de chat y tareas creadas por día
- **`stripe_subscriptions`** - Almacena suscripciones de Stripe
- **`ads`** - Gestiona anuncios por plan
- **Campo en `profiles`** - `subscription_plan` (free/pro/premium)

## 📋 Planes y Límites

```typescript
Free:
- 5 mensajes de chat por día
- Hasta 50 tareas
- Hasta 10 materias
- Con anuncios

Pro ($4.99/mes):
- 50 mensajes de chat por día
- Hasta 500 tareas
- Hasta 100 materias
- Sin anuncios

Premium ($9.99/mes):
- 500 mensajes de chat por día
- Tareas ilimitadas
- Materias ilimitadas
- Sin anuncios
```

## 🔧 Pasos para Completar la Integración

### 1. Ejecutar la Migración de Base de Datos

```bash
# Usando psql
psql -U <usuario> -d <base_de_datos> -f scripts/001-add-subscriptions.sql

# O copia el contenido en el SQL Editor de Supabase
```

### 2. Integrar Stripe

#### 2a. Instalar el SDK de Stripe

```bash
pnpm add stripe @stripe/react-stripe-js @stripe/stripe-js
```

#### 2b. Crear variables de entorno

```
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

#### 2c. Crear rutas de Stripe

Crea `app/api/stripe/checkout/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { plan } = await req.json()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const priceMap: Record<string, string> = {
    pro: 'price_1Xxx...', // Obtén esto de tu dashboard de Stripe
    premium: 'price_1Yyy...'
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    metadata: { userId: user.id },
    line_items: [
      {
        price: priceMap[plan],
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${req.nextUrl.origin}/dashboard?success=true`,
    cancel_url: `${req.nextUrl.origin}/dashboard/upgrade`
  })

  return NextResponse.json({ url: session.url })
}
```

Crea `app/api/stripe/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 })
  }

  const supabase = await createClient()

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    const subscription = event.data.object as Stripe.Subscription
    const userId = subscription.metadata.userId

    // Actualizar plan del usuario
    const plan = subscription.items.data[0]?.price.metadata.plan || 'pro'
    await supabase
      .from('profiles')
      .update({
        subscription_plan: plan,
        stripe_customer_id: subscription.customer as string,
        subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString()
      })
      .eq('id', userId)
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const userId = subscription.metadata.userId

    // Revertir a plan free
    await supabase
      .from('profiles')
      .update({
        subscription_plan: 'free',
        subscription_end_date: null
      })
      .eq('id', userId)
  }

  return NextResponse.json({ received: true })
}
```

### 3. Integrar Límites en el Chat

En `app/dashboard/chat/page.tsx`, agrega verificación de límites:

```typescript
import { checkChatLimit, getUserLimits, trackChatUsage } from '@/lib/limits'

// En el handleSendMessage:
const handleSendMessage = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!input.trim() || loading || !contextLoaded) return

  // ✅ Nuevo: Verificar límites
  const limits = await getUserLimits(userId)
  const isLimited = await checkChatLimit(userId)
  
  if (isLimited) {
    alert('Has alcanzado tu límite de mensajes por hoy')
    return
  }

  // ... resto del código ...

  // ✅ Después de enviar un mensaje exitoso:
  await trackChatUsage(userId)
}
```

### 4. Mostrar Banners de Uso y Anuncios

En `app/dashboard/page.tsx` o donde corresponda:

```typescript
import { UsageBanner } from '@/components/usage-banner'
import { AdBanner } from '@/components/ad-banner'
import { getUserUsage, getUserLimits } from '@/lib/limits'

export default async function Dashboard() {
  const usage = await getUserUsage(userId)
  const limits = await getUserLimits(userId)
  const profile = await getProfile(userId)

  return (
    <>
      {/* Mostrar banner de anuncios solo a usuarios gratis */}
      {profile.subscription_plan === 'free' && (
        <AdBanner
          title="Actualiza a Pro"
          description="Obtén acceso ilimitado a todas las funciones"
          cta="Ver planes"
          ctaHref="/dashboard/upgrade"
        />
      )}

      {/* Mostrar uso actual */}
      <UsageBanner
        used={usage.chatMessagesUsedToday}
        limit={limits.chatMessagesPerDay}
        plan={profile.subscription_plan}
        label="Mensajes de chat"
      />
    </>
  )
}
```

### 5. Respetar Límites en Tareas

Agrega validación al crear tareas:

```typescript
export async function createTask(
  title: string,
  dueDate: string,
  subjectId?: string,
  description?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // ✅ Verificar límites
  const limits = await getUserLimits(user.id)
  const usage = await getUserUsage(user.id)

  if (usage.totalTasksCreated >= limits.totalTasksAllowed) {
    throw new Error(`Has alcanzado el límite de ${limits.totalTasksAllowed} tareas`)
  }

  // ... resto del código ...
}
```

### 6. Agregar Anuncios

Crea anuncios en la tabla `ads`:

```sql
INSERT INTO ads (title, description, cta_text, cta_url, show_to_plans, active)
VALUES (
  'Actualiza a Pro',
  'Obtén acceso ilimitado a todas las funciones y elimina anuncios',
  'Ver planes',
  '/dashboard/upgrade',
  ARRAY['free'],
  true
);

INSERT INTO ads (title, description, cta_text, cta_url, show_to_plans, active)
VALUES (
  'Exporta tus tareas',
  'Con Pro ahora puedes exportar tu agenda a PDF',
  'Saber más',
  '/dashboard/upgrade',
  ARRAY['free'],
  true
);
```

## 🧪 Testing

### Verificar que los límites funcionen:

```bash
# 1. Verifica que el plan se asigne correctamente
SELECT * FROM profiles WHERE id = 'user-id';

# 2. Simula 5+ mensajes de chat y verifica que se bloquee
# 3. Verifica que los anuncios aparezcan para usuarios gratis
```

### Testing de Stripe (Sandbox):

1. Ve a `stripe.com/test`
2. Usa tarjeta de prueba: `4242 4242 4242 4242`
3. Completa el formulario con cualquier fecha/CVC futuros
4. Verifica webhooks en tu dashboard de Stripe

## 📊 Base de Datos - Ejemplos de Consultas

```sql
-- Ver suscripciones activas
SELECT u.email, p.subscription_plan, p.subscription_end_date 
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.subscription_plan != 'free';

-- Ver uso del chat hoy
SELECT user_id, chat_messages_used_today 
FROM user_usage 
WHERE last_chat_reset = CURRENT_DATE;

-- Anuncios activos para usuarios gratis
SELECT * FROM ads 
WHERE 'free' = ANY(show_to_plans) 
AND active = true 
AND (end_date IS NULL OR end_date > NOW());
```

## 🚀 Próximos Pasos Opcionales

- [ ] Agregar dashboard de analytics (cuántos usuarios por plan)
- [ ] Implementar auto-renovación de suscripciones expiradas
- [ ] Agregar descuentos/cupones
- [ ] Crear email de confirmación de pago
- [ ] Agregar botón "Cancelar suscripción" en perfil
- [ ] Implementar "Período de prueba gratis"
- [ ] Analytics de uso por plan

## 📞 Soporte

Si tienes preguntas sobre la integración:
1. Revisa la documentación de Stripe: `stripe.com/docs`
2. Revisa la documentación de Supabase: `supabase.com/docs`
3. Consulta los tipos en `lib/types.ts` para entender la estructura
