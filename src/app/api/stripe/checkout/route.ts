import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────────────────────────────────────
// CRITICAL: Do NOT instantiate Supabase or Stripe at module scope.
//
// During `next build`, Next.js statically evaluates every route file to
// collect page data. At that point, environment variables are NOT yet
// injected — so any top-level `createClient(process.env.SUPABASE_URL!)`
// call receives `undefined` and throws "supabaseUrl is required", failing
// the entire build.
//
// Both clients are instantiated inside the POST handler so they are only
// created at actual request time, when env vars are guaranteed to exist.
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Instantiate clients here — runtime only, never at build time
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-04-10',
  })

  // Service role client — bypasses RLS, safe because this is a server-only
  // webhook route that is never exposed to the browser
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature error:', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ── checkout.session.completed ────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta    = session.metadata || {}
    const type    = meta.type

    // ── PLAN purchase — grant premium only after real Stripe payment ─────────
    if (type === 'plan' && meta.userId && meta.planId) {
      await supabase
        .from('users')
        .update({
          is_premium:         true,
          premium_tier:       meta.planId,
          premium_since:      new Date().toISOString(),
          stripe_customer_id: session.customer as string,
        })
        .eq('id', meta.userId)

      console.log(`Premium granted to ${meta.userId} — plan: ${meta.planId}`)
    }

    // ── TICKET purchase ───────────────────────────────────────────────────────
    if (type === 'ticket' && meta.eventId && meta.userId) {
      const userId    = meta.userId
      const eventId   = meta.eventId
      const amount    = session.amount_total || 0
      const userEmail = session.customer_email || ''

      // Upsert ticket row (idempotent — safe if Stripe retries the webhook)
      const { data: ticket } = await supabase
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
        .select('id')
        .single()

      // Increment attendee counters
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
            total_sold:        (ev.total_sold        || 0) + 1,
          })
          .eq('id', eventId)
      }

      // Send confirmation email — non-critical, failures are swallowed
      if (userEmail) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://enarcle.com'

        const { data: evDetail } = await supabase
          .from('events')
          .select('title, start_time, users(full_name, email)')
          .eq('id', eventId)
          .single()

        const { data: user } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', userId)
          .single()

        const host = (evDetail as Record<string, unknown> | null)?.users as
          | { full_name?: string; email?: string }
          | null
          || {}

        await fetch(`${appUrl}/api/email`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'paid_ticket',
            to:   userEmail,
            data: {
              eventTitle: (evDetail as { title?: string } | null)?.title || 'Enarcle Event',
              eventDate:  (evDetail as { start_time?: string } | null)?.start_time
                ? new Date((evDetail as { start_time: string }).start_time).toLocaleDateString(
                    'en-US',
                    { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
                  )
                : '',
              hostName: (host as { full_name?: string; email?: string }).full_name
                || (host as { email?: string }).email?.split('@')[0]
                || 'Enarcle Host',
              userName: (user as { full_name?: string } | null)?.full_name
                || userEmail.split('@')[0],
              ticketId: ticket?.id || session.id,
              amount,
              appUrl,
            },
          }),
        }).catch(() => {
          // Email failure must never break the webhook response
        })
      }
    }
  }

  // ── Subscription cancelled — revoke premium ───────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const sub        = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string

    await supabase
      .from('users')
      .update({
        is_premium:   false,
        premium_tier: null,
      })
      .eq('stripe_customer_id', customerId)

    console.log(`Premium revoked for Stripe customer: ${customerId}`)
  }

  return NextResponse.json({ received: true })
}
