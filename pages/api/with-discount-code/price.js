import { BASE_PRICE, getDiscountForRequest } from '../../../lib/price'

export default async function getPrice(req, res) {
  const { country, discount, code } = await getDiscountForRequest(req)
  res.send({ country, code, discount, basePrice: BASE_PRICE })
}
