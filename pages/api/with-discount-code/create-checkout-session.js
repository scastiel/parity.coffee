import { BASE_PRICE } from '../../../lib/price'
import { stripe } from '../../../lib/stripe'

export default async function createCheckoutSession(req, res) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'One coffee' },
          unit_amount: BASE_PRICE,
        },
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    mode: 'payment',
    success_url: `${process.env.DOMAIN}?success=true`,
    cancel_url: `${process.env.DOMAIN}`,
  })
  res.json({ id: session.id })
}
