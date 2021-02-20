import { useEffect, useState } from 'react'
import { getCountryEmoji, getCountryName } from '../lib/country'
import { loadStripe } from '@stripe/stripe-js'
import Head from 'next/head'
import { SeoHeaders } from '../components/seo-headers'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

export default function Home() {
  const [selectedOption, setSelectedOption] = useState('with-adjusted-price')
  const adjustedPriceInfo = useApiCall('/api/with-adjusted-price/price')
  const discountCodeInfo = useApiCall('/api/with-discount-code/price')

  return (
    <>
      <SeoHeaders
        title="Parity Coffee"
        description="An example implementation of using Purchasing Power Parity to adjust the price of a product based on the user’s location"
        author="Sebastien Castiel"
        twitterAuthor="@scastiel"
        twitterSite="@scastiel"
        url="https://parity.coffee"
        imageUrl="https://parity.coffee/banner.jpg"
      />
      <Head>
        <title>Parity Coffee</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>☕️</text></svg>"
        ></link>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Berkshire+Swash&amp;display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="min-w-screen min-h-screen p-4 bg-green-700 flex flex-col space-y-4 justify-center items-center">
        <div className="bg-white rounded-xl shadow-xl flex flex-col lg:flex-row">
          <div className="max-w-lg p-8 flex flex-col text-center space-y-8">
            <h1 className="text-4xl text-yellow-900 font-bold font-cursive">
              Parity Coffee
            </h1>
            <p className="text-lg text-gray-700">
              This website is an example implementation of using{' '}
              <strong className="whitespace-nowrap">
                Purchasing Power Parity
              </strong>{' '}
              to adjust the price of a product based on the user’s location.
            </p>
            <ChoiceSelector
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              options={[
                {
                  id: 'with-adjusted-price',
                  title: 'Option #1',
                  description: 'Adjust the price based on your location.',
                },
                {
                  id: 'with-discount-code',
                  title: 'Option #2',
                  description:
                    'Offer a discount code that you are free to use or not.',
                },
              ]}
            />
          </div>

          <div className="p-8 flex flex-col space-y-6 items-center justify-center lg:border-l text-center lg:w-screen lg:max-w-md">
            <div className="flex flex-row items-center space-x-6">
              <div className="text-6xl">☕️</div>

              <div className="text-5xl w-32 font-bold text-gray-700">
                {selectedOption === 'with-adjusted-price' ? (
                  <Price price={adjustedPriceInfo?.price} />
                ) : (
                  <Price price={discountCodeInfo?.basePrice} />
                )}
              </div>
            </div>

            <BuyButton selectedOption={selectedOption} />

            <div className="text-sm text-gray-700 h-24 sm:w-96 flex flex-col justify-end">
              <p>
                {selectedOption === 'with-adjusted-price' ? (
                  <AdjustedPriceMessage priceInfo={adjustedPriceInfo} />
                ) : (
                  <DiscountCodeMessage priceInfo={discountCodeInfo} />
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-xl text-center text-gray-200 flex flex-col space-y-4 text-sm">
          <p>
            Although this website was made for educational purpose, the payment
            system in place is working. Feel free to offer me a coffee, or
            contribute to the small fees to host the application and the domain
            name.
          </p>
          <p>
            <ExternalLink href="https://github.com/scastiel/parity.coffee">
              The website’s source code (a Next.js app) is fully available on
              GitHub.
            </ExternalLink>
          </p>
          <p>
            Built with ❤️ by{' '}
            <ExternalLink href="https://twitter.com/scastiel">
              @scastiel
            </ExternalLink>
          </p>
        </div>
      </div>
      <div>
        <ExternalLink href="https://github.com/scastiel/parity.coffee">
          <img
            src="/github-corner-right.svg"
            className="absolute right-0 top-0 w-12 h-12 sm:w-auto sm:h-auto"
          />
        </ExternalLink>
      </div>
    </>
  )
}

function useApiCall(url) {
  const [result, setResult] = useState(null)
  useEffect(() => {
    setResult(null)
    fetch(url)
      .then((res) => res.json())
      .then((info) => setResult(info))
  }, [])
  return result
}

function ExternalLink({ ...props }) {
  return (
    <a
      className="underline"
      target="_blank"
      rel="noreferrer noopener"
      {...props}
    />
  )
}

function BuyButton({ selectedOption }) {
  const [redirecting, setRedirecting] = useState(false)

  const onBuyClick = async () => {
    setRedirecting(true)
    const stripe = await stripePromise
    const response = await fetch(
      `/api/${selectedOption}/create-checkout-session`,
      {
        method: 'POST',
      }
    )
    const session = await response.json()
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    })
    if (result.error) {
      setRedirecting(false)
      console.error(result.error)
    }
  }

  return (
    <button
      onClick={onBuyClick}
      disabled={redirecting}
      className={`font-cursive self-center text-2xl bg-green-800 hover:bg-green-700 hover:shadow-md text-white w-64 py-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-100 ${
        redirecting ? 'opacity-80' : ''
      }`}
    >
      {redirecting ? 'Processing…' : 'Buy me a coffee'}
    </button>
  )
}

function Price({ price }) {
  return <>{price ? <>${(price / 100).toFixed(2)}</> : '…'}</>
}

function AdjustedPriceMessage({ priceInfo }) {
  if (!priceInfo) return <>Loading…</>
  const { country, discount, price, basePrice } = priceInfo
  if (!country) {
    return (
      <>
        Hey! We support Purchasing Power Parity, but unfortunately we are unable
        to know the country you are from, so we cannot adjust the price.
      </>
    )
  }
  if (discount > 0) {
    return (
      <>
        {getCountryEmoji(country)} Hey! It looks like you are from{' '}
        <strong>{getCountryName(country)}</strong>. We support Purchasing Power
        Parity so we automatically adjusted the price, adding a discount of{' '}
        <strong>{discount}%</strong>, so you will pay $
        <strong>{(price / 100).toFixed(2)}</strong> instead of $
        <strong>{(basePrice / 100).toFixed(2)}</strong>.
      </>
    )
  }
  return (
    <>
      {getCountryEmoji(country)} Hey! It looks like you are from{' '}
      <strong>{getCountryName(country)}</strong>. We support Purchasing Power
      Parity, but unfortunately your country is not elligible for a discount.
    </>
  )
}

function DiscountCodeMessage({ priceInfo }) {
  if (!priceInfo) return <>Loading…</>
  const { country, code, discount } = priceInfo
  if (!country) {
    return (
      <>
        Hey! We support Purchasing Power Parity, but unfortunately we are unable
        to know the country you are from, so we cannot offer you a discount
        code.
      </>
    )
  }
  if (discount > 0) {
    return (
      <>
        {getCountryEmoji(country)} Hey! It looks like you are from{' '}
        <strong>{getCountryName(country)}</strong>. We support Purchasing Power
        Parity so if you need it, use code “<strong>{code}</strong>” to get{' '}
        <strong>{discount}%</strong> off your purchase at checkout.
      </>
    )
  }
  return (
    <>
      {getCountryEmoji(country)} Hey! It looks like you are from{' '}
      <strong>{getCountryName(country)}</strong>. We support Purchasing Power
      Parity, but unfortunately your country is not elligible for a discount
      code.
    </>
  )
}

function ChoiceSelector({ options, selectedOption, setSelectedOption }) {
  return (
    <dl className="flex flex-col space-y-1">
      {options.map(({ id, title, description }) => (
        <button
          key={id}
          className={`${
            selectedOption === id
              ? 'bg-yellow-100 border-yellow-800'
              : 'bg-white hover:bg-yellow-50 border-gray-200'
          } border-2 rounded p-4 focus:outline-none focus:ring-2 focus:ring-yellow-200`}
          onClick={() => setSelectedOption(id)}
        >
          <dt className="text-yellow-800 font-cursive">{title}</dt>
          <dd>{description}</dd>
        </button>
      ))}
    </dl>
  )
}
