import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-04-10' as any,
  })

  try {
    const body = await req.json()
    const { planId, billing, userId, userEmail, eventId, amount, eventName } = body
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://enarcle.com'

    // ── PLAN / SUBSCRIPTION purchase ────────────────────────────────────────
    if (planId) {
      const PLANS: Record<string, { name: string; monthly: number; yearly: number }> = {
        basic: {
          name:    'Enarcle Basic',
          monthly: 1000,  // $10.00 in cents
          yearly:  7000,  // $70.00 in cents
        },
        premium_plus: {
          name:    'Enarcle Premium Plus',
          monthly: 1700,  // $17.00 in cents
          yearly:  20400, // $204.00 in cents
        },
      }

      const plan = PLANS[planId]
      if (!plan) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
      }

      const isYearly   = billing === 'yearly'
      const unitAmount = isYearly ? plan.yearly : plan.monthly
      const interval   = isYearly ? 'year' : 'month'

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode:           'subscription',
        customer_email: userEmail,
        line_items: [{
          price_data: {
            currency:     'usd',
            product_data: { name: plan.name },
            unit_amount:  unitAmount,
            recurring:    { interval },
          },
          quantity: 1,
        }],
        metadata: {
          userId:  userId || '',
          planId,
          billing: isYearly ? 'yearly' : 'monthly',
          type:    'plan',
        },
        success_url: `${appUrl}/dashboard?plan_success=${planId}`,
        cancel_url:  `${appUrl}/pricing?cancelled=1`,
      })

      return NextResponse.json({ url: session.url })
    }

    // ── EVENT TICKET purchase ────────────────────────────────────────────────
    if (eventId) {
      const rawPrice    = amount ?? 0
      const priceInCents = rawPrice < 500
        ? Math.round(rawPrice * 100)
        : Math.round(rawPrice)

      if (priceInCents < 50) {
        return NextResponse.json({ error: 'Minimum charge is $0.50' }, { status: 400 })
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode:           'payment',
        customer_email: userEmail,
        line_items: [{
          price_data: {
            currency:     'usd',
            product_data: { name: eventName || 'Enarcle Event' },
            unit_amount:  priceInCents,
          },
          quantity: 1,
        }],
        metadata: {
          eventId: eventId || '',
          userId:  userId  || '',
          type:    'ticket',
        },
        success_url: `${appUrl}/events/${eventId}?success=1`,
        cancel_url:  `${appUrl}/events/${eventId}?cancelled=1`,
      })

      return NextResponse.json({ url: session.url })
    }

    return NextResponse.json({ error: 'Missing planId or eventId' }, { status: 400 })

  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
