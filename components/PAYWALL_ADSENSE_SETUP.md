# Paywall + Google AdSense Setup Guide

## 1. Google AdSense Setup

### Paso 1: Registrarse en Google AdSense
1. Ve a https://www.google.com/adsense/
2. Haz clic en "Sign up now"
3. Completa el formulario con tu información
4. Google revisará tu sitio (puede tomar algunos días)

### Paso 2: Obtener tu Client ID
Una vez aprobado:
1. Ve a "Settings" → "Account information"
2. Copia tu **Publisher ID** (ca-pub-xxxxxxxxxxxxxxxx)
3. Reemplaza `ca-pub-xxxxxxxxxxxxxxxx` en:
   - `app/layout.tsx` (línea 72)
   - `components/ads-banner.tsx` (línea 16)

### Paso 3: Crear Ad Slots
1. En AdSense, ve a "Ads" → "Ad units"
2. Crea un nuevo ad unit, copia el **Slot ID**
3. Úsalo cuando llames a `<AdsBanner adSlot="..." />`

## 2. Activar Anuncios en la App

### Dónde mostrar anuncios:
Puedes colocar ads en:
- Dashboard (entre secciones)
- Chat page (inferior)
- Landing page (footer)

**Ejemplo en un componente:**
```tsx
import { AdsBanner } from '@/components/ads-banner'

export function Dashboard() {
  return (
    <>
      {/* Contenido */}
      <AdsBanner adSlot="1234567890" className="my-6" />
      {/* Más contenido */}
    </>
  )
}
```

## 3. Stripe Checkout Setup (Paywall)

### Paso 1: Crear cuenta Stripe
1. Ve a https://stripe.com
2. Crea una cuenta
3. Ve a "Developers" → "API Keys"
4. Copia tu **Publishable Key** y **Secret Key**

### Paso 2: Variables de entorno
En Vercel Settings → "Vars", agrega:
```
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Paso 3: Crear productos en Stripe
1. Ve a "Products"
2. Crea 2 productos:
   - **Pro**: $4.99/mes
   - **Ultra**: $9.99/mes
3. Copia los **Price IDs**

### Paso 4: Variables de precios
```
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ULTRA=price_...
```

## 4. Activar Toggles en Admin Panel

1. Ve a `/activate`
2. Login: `rootmanager` / `rootmanager`
3. Activa estos toggles:

- ✅ **subscriptionsEnabled** - Activa sistema de suscripciones
- ✅ **adsEnabled** - Muestra anuncios de Google AdSense
- ✅ **chatLimitsEnabled** - Limita mensajes de chat por día
- ✅ **agendaLimitsEnabled** - Limita agendas por mes

## 5. Crear Checkout API (Backend)

Crea `/app/api/checkout/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const priceId = plan === 'pro' 
      ? process.env.STRIPE_PRICE_PRO
      : process.env.STRIPE_PRICE_ULTRA

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      metadata: {
        userId: user.id,
        plan
      }
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Error creating checkout' }, { status: 500 })
  }
}
```

## 6. Webhook de Stripe (Actualizar Suscripción)

Crea `/app/api/webhooks/stripe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') || ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (error) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const supabase = await createClient()

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    const subscription = event.data.object as Stripe.Subscription
    const userId = subscription.metadata?.userId

    if (userId) {
      const plan = subscription.metadata?.plan || 'free'
      await supabase
        .from('profiles')
        .update({
          subscription_plan: plan,
          subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
          subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_customer_id: subscription.customer as string
        })
        .eq('id', userId)
    }
  }

  return NextResponse.json({ received: true })
}
```

## 7. Mostrar Paywall cuando se alcanza límite

El paywall se muestra automáticamente cuando:
- Usuario Free alcanza 10 chats/día
- Usuario Free alcanza 15 agendas/mes

Puedes importar y usar `PaywallModal`:

```tsx
import { PaywallModal } from '@/components/paywall-modal'

export function ChatComponent() {
  const [showPaywall, setShowPaywall] = useState(false)

  const handleLimitExceeded = () => {
    setShowPaywall(true)
  }

  return (
    <>
      {/* Chat */}
      {showPaywall && (
        <PaywallModal
          plan="free"
          limitType="chat"
          currentUsage={10}
          limit={10}
          onClose={() => setShowPaywall(false)}
        />
      )}
    </>
  )
}
```

## 8. Checklist de Activación

- [ ] Google AdSense aprobado y Client ID agregado
- [ ] Ad Slots creados y Slot IDs copiados
- [ ] Ads mostrados en al menos 3 lugares
- [ ] Cuenta Stripe creada
- [ ] Productos (Pro/Ultra) creados en Stripe
- [ ] Price IDs en variables de entorno
- [ ] API de checkout implementado
- [ ] Webhook de Stripe implementado
- [ ] Toggle `subscriptionsEnabled` activado en admin
- [ ] Toggle `adsEnabled` activado en admin
- [ ] Toggle `chatLimitsEnabled` activado en admin
- [ ] Toggle `agendaLimitsEnabled` activado en admin
- [ ] Gemini API Key confirmada en admin
- [ ] Prueba creando usuario Free y alcanzando límites

## Test en Stripe (Sandbox)

Tarjetas de prueba de Stripe:
- **4242 4242 4242 4242** - Éxito
- **4000 0025 0000 3155** - Require autenticación
- **5555 5555 5555 4444** - Mastercard

Usa cualquiera con fecha futura y CVC aleatorio.
