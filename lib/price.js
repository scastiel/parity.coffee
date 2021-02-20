import requestIp from 'request-ip'
import geoip from 'geoip-lite'

export const BASE_PRICE = 400 // cents

export async function getCountryForRequest(req) {
  try {
    if (process.env.SIMULATE_COUNTRY) return process.env.SIMULATE_COUNTRY
    const clientIp = requestIp
      .getClientIp(req)
      .replace('::1', process.env.LOCAL_IP)
      .replace('127.0.0.1', process.env.LOCAL_IP)
    return geoip.lookup(clientIp).country || null
  } catch (err) {
    return null
  }
}

export async function getConversionFactorForCountry(country) {
  try {
    const url = `https://api.purchasing-power-parity.com/?target=${country}`
    const res = await fetch(url)
    const { ppp } = await res.json()
    return ppp.pppConversionFactor
  } catch (err) {
    console.error(err)
    return 1
  }
}

export function getDiscountForConversionFactor(pppConversionFactor) {
  if (pppConversionFactor <= 0.1) return { code: 'CSVVSDVV', discount: 90 }
  if (pppConversionFactor <= 0.2) return { code: 'LLSJDLWF', discount: 80 }
  if (pppConversionFactor <= 0.3) return { code: 'KRUFLDLF', discount: 70 }
  if (pppConversionFactor <= 0.4) return { code: 'PJLKHJHI', discount: 60 }
  if (pppConversionFactor <= 0.5) return { code: 'AGEFDXSL', discount: 50 }
  if (pppConversionFactor <= 0.6) return { code: 'FDJGFYLX', discount: 40 }
  if (pppConversionFactor <= 0.7) return { code: 'SYSDJSMF', discount: 30 }
  if (pppConversionFactor <= 0.8) return { code: 'WUEJCCFJ', discount: 20 }
  if (pppConversionFactor <= 1.0) return { code: 'DHFVUFKE', discount: 10 }
  return { code: null, discount: null }
}

export async function getDiscountForRequest(req) {
  const country = await getCountryForRequest(req)
  const pppConversionFactor =
    country && (await getConversionFactorForCountry(country))
  const { discount, code } = pppConversionFactor
    ? getDiscountForConversionFactor(pppConversionFactor)
    : { discount: null, code: null }
  return { country, discount, code }
}
