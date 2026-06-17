import { Stripe, loadStripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    documentsLimit: 10,
    searchesLimit: 50,
    storageLimit: 50 * 1024 * 1024,
    maxFileSize: 5 * 1024 * 1024,
    features: [
      "10 document uploads",
      "50 AI searches",
      "50 MB storage",
      "5 MB max file size",
      "Basic support",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 19.99,
    documentsLimit: 500,
    searchesLimit: 999999,
    storageLimit: 1024 * 1024 * 1024,
    maxFileSize: 50 * 1024 * 1024,
    features: [
      "Unlimited document uploads",
      "Unlimited AI searches",
      "1 GB storage",
      "50 MB max file size",
      "Priority support",
      "Faster AI responses",
      "Export to PDF",
      "Advanced analytics",
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;
