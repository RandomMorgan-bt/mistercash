import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function POST(request) {
  try {
    const { priceId, userId, userEmail } = await request.json()

    // Check if user has already used their trial
    const { data: profile } = await supabase
      .from('profiles')
      .select('trial_started_at')
      .eq('user_id', userId)
      .single()

    const trialStart = profile?.trial_started_at
      ? new Date(profile.trial_started_at)
      : null
    const daysSinceTrial = trialStart
      ? (new Date() - trialStart) / (1000 * 60 * 60 * 24)
      : 0
    const trialAlreadyUsed = daysSinceTrial > 14

    const sessionConfig = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      client_reference_id: userId,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?cancelled=true`,
    }

    // Only add trial if they haven't used it yet
    if (!trialAlreadyUsed) {
      sessionConfig.subscription_data = {
        trial_period_days: 14,
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return Response.json({ url: session.url })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
