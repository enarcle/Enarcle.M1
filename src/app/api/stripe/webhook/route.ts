import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-04-10' as any,
  })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set in environment')
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
    console.error('Webhook signature failed:', message)
    return NextResponse.json({ error: `Invalid signature: ${message}` }, { status: 400 })
  }

  // ── checkout.session.completed ────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta    = session.metadata || {}
    const type    = meta.type

    // ── PLAN purchase — set premium tier based on planId ──────────────────
    if (type === 'plan' && meta.userId && meta.planId) {

      // Map planId to what features they unlock
      // pro          → is_premium false (just messaging)
      // premium      → is_premium true (recordings of enrolled events)
      // premium_pro  → is_premium true (full access + free weekly event)
      const isPremium = meta.planId === 'premium' || meta.planId === 'premium_pro'

      // Group member limits per plan
      const GROUP_LIMITS: Record<string, number> = {
        free:        5,
        pro:         5,
        premium:     40,
        premium_pro: 150,
      }

      const { error } = await supabase
        .from('users')
        .update({
          is_premium:          isPremium,
          premium_tier:        meta.planId,
          premium_since:       new Date().toISOString(),
          stripe_customer_id:  session.customer as string,
          group_member_limit:  GROUP_LIMITS[meta.planId] || 5,
        })
        .eq('id', meta.userId)

      if (error) {
        console.error('Failed to update user plan:', error)
      } else {
        console.log(`Plan activated: ${meta.planId} for user ${meta.userId}`)
      }
    }

    // ── TICKET purchase ───────────────────────────────────────────────────
    if (type === 'ticket' && meta.eventId && meta.userId) {
      const userId  = meta.userId
      const eventId = meta.eventId
      const amount  = session.amount_total || 0

      // Create ticket
      const { error: ticketError } = await supabase
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

      if (ticketError) {
        console.error('Failed to create ticket:', ticketError)
      }

      // Increment event attendee count
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

      console.log(`Ticket created for user ${userId} — event ${eventId}`)
    }
  }

  // ── Subscription cancelled — downgrade to free ────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const sub        = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string

    const { error } = await supabase
      .from('users')
      .update({
        is_premium:         false,
        premium_tier:       'free',
        group_member_limit: 5,
      })
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('Failed to revoke subscription:', error)
    } else {
      console.log(`Subscription cancelled for Stripe customer: ${customerId}`)
    }
  }

  return NextResponse.json({ received: true })
}
