import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// App Router equivalents — replaces the deprecated `export const config = {}`
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-04-10' as any,
  })
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Read raw body as text — critical for Stripe signature verification
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature error:', message)
    console.error('Secret used starts with:', process.env.STRIPE_WEBHOOK_SECRET?.slice(0, 10))
    return NextResponse.json({ error: `Invalid signature: ${message}` }, { status: 400 })
  }

  // ── checkout.session.completed ─────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta    = session.metadata || {}
    const type    = meta.type

    // PLAN purchase — grant premium only after real Stripe payment
    if (type === 'plan' && meta.userId && meta.planId) {
      const { error } = await supabase
        .from('users')
        .update({
          is_premium:         true,
          premium_tier:       meta.planId,
          premium_since:      new Date().toISOString(),
          stripe_customer_id: session.customer as string,
        })
        .eq('id', meta.userId)
      if (error) console.error('Failed to grant premium:', error)
      else console.log(`Premium granted to ${meta.userId} — plan: ${meta.planId}`)
    }

    // TICKET purchase
    if (type === 'ticket' && meta.eventId && meta.userId) {
      const userId  = meta.userId
      const eventId = meta.eventId
      const amount  = session.amount_total || 0

      await supabase
        .from('tickets')
        .upsert(
          {
            user_id:           userId,
            event_id:          eventId,
            amount,
            status:            'paid',
            ticket_type:       'general',
            stripe_session_id: session.id,
          },
          { onConflict: 'user_id,event_id' }
        )

      const { data: ev } = await supabase
        .from('events')
        .select('current_attendees, total_sold')
        .eq('id', eventId)
        .single()
      if (ev) {
        await supabase
          .from('events')
          .update({
            current_attendees: (ev.current_attendees || 0) + 1,
            total_sold:        (ev.total_sold || 0) + 1,
          })
          .eq('id', eventId)
      }
    }
  }

  // ── Subscription cancelled — revoke premium ────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const sub        = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string
    await supabase
      .from('users')
      .update({ is_premium: false, premium_tier: null })
      .eq('stripe_customer_id', customerId)
    console.log(`Premium revoked for Stripe customer: ${customerId}`)
  }

  return NextResponse.json({ received: true })
}
