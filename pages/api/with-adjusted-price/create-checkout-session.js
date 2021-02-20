import { BASE_PRICE, getDiscountForRequest } from '../../../lib/price'
import { stripe } from '../../../lib/stripe'

export default async function createCheckoutSession(req, res) {
  const { discount } = await getDiscountForRequest(req)
  const price = Math.round(BASE_PRICE * (1 - discount / 100))

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'One coffee' },
          unit_amount: price,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.DOMAIN}?success=true`,
    cancel_url: `${process.env.DOMAIN}`,
  })
  res.json({ id: session.id })
}
