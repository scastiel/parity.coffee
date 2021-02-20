import { BASE_PRICE, getDiscountForRequest } from '../../../lib/price'

export default async function getPrice(req, res) {
  const { country, discount } = await getDiscountForRequest(req)
  const price = Math.round(BASE_PRICE * (1 - discount / 100))
  res.send({ country, discount, price, basePrice: BASE_PRICE })
}
