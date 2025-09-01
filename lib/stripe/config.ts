import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true
})

// Stripe price IDs for different plans
export const STRIPE_CONFIG = {
  prices: {
    basic: process.env.STRIPE_BASIC_PRICE_ID!,
    premium: process.env.STRIPE_PREMIUM_PRICE_ID!
  },
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!
}

// Plan configuration
export const PLANS = {
  free: {
    name: 'フリープラン',
    price: 0,
    currency: 'jpy',
    interval: null,
    features: {
      interviews: 1,
      esCorrections: 5,
      support: 'basic'
    }
  },
  basic: {
    name: 'ベーシックプラン',
    price: 500,
    currency: 'jpy',
    interval: 'month',
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID!,
    features: {
      interviews: 20,
      esCorrections: 20,
      support: 'priority'
    }
  },
  premium: {
    name: 'プレミアムプラン',
    price: 2000,
    currency: 'jpy',
    interval: 'month',
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    features: {
      interviews: 999,
      esCorrections: 999,
      support: '24/7'
    }
  }
} as const

export type PlanId = keyof typeof PLANS