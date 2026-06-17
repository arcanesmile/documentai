"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faArrowRight, faBrain } from "@fortawesome/free-solid-svg-icons";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "10 document uploads",
      "50 AI searches per month",
      "50 MB storage",
      "5 MB max file size",
      "Basic support",
      "Standard AI model",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19.99",
    period: "/month",
    description: "For power users and teams",
    features: [
      "Unlimited document uploads",
      "Unlimited AI searches",
      "1 GB storage",
      "50 MB max file size",
      "Priority support",
      "Faster AI responses",
      "Export to PDF",
      "Advanced analytics",
      "Custom branding",
    ],
    cta: "Subscribe Now",
    highlighted: true,
  },
];

export default function PricingSection() {
  const [ref, isVisible] = useIntersectionObserver<HTMLElement>({ threshold: 0.1, triggerOnce: true });
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section ref={ref} className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-900 via-primary-900/5 to-surface-900" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-surface-400 mb-8">Choose the plan that fits your needs</p>

          <div className="inline-flex items-center gap-3 p-1.5 rounded-2xl bg-surface-800 border border-surface-700">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${!isAnnual ? "bg-primary-500 text-white shadow-lg" : "text-surface-400 hover:text-surface-100"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isAnnual ? "bg-primary-500 text-white shadow-lg" : "text-surface-400 hover:text-surface-100"}`}
            >
              Annual
              <Badge variant="success" className="ml-2">Save 20%</Badge>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                plan.highlighted
                  ? "bg-gradient-to-b from-primary-500/10 to-accent-500/5 border-primary-500/30 shadow-xl shadow-primary-500/10"
                  : "bg-surface-800/50 border-surface-700/50 hover:border-surface-600"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="premium" size="md">
                    <FontAwesomeIcon icon={faBrain} className="h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <p className="text-surface-400 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {isAnnual && plan.price !== "$0" ? "$15.99" : plan.price}
                  </span>
                  {plan.period && <span className="text-surface-400 text-sm">{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-surface-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-emerald-400" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? "primary" : "outline"}
                className="w-full"
                rightIcon={faArrowRight}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
