"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faRocket } from "@fortawesome/free-solid-svg-icons";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export default function CTASection() {
  const [ref, isVisible] = useIntersectionObserver<HTMLElement>({ threshold: 0.1, triggerOnce: true });

  return (
    <section ref={ref} className="py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="relative p-12 rounded-3xl bg-gradient-to-br from-primary-500/10 via-surface-800 to-accent-500/10 border border-primary-500/20 text-center overflow-hidden"
        >
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={isVisible ? { scale: 1 } : {}}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6"
            >
              <FontAwesomeIcon icon={faRocket} className="h-8 w-8 text-white" />
            </motion.div>

            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your{" "}
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Document Search
              </span>
              ?
            </h2>
            <p className="text-xl text-surface-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already leveraging AI to search and understand their documents.
            </p>

            <Link href="/signup">
              <Button size="lg" rightIcon={faArrowRight}>
                Start Your Free Trial
              </Button>
            </Link>
            <p className="text-surface-500 text-sm mt-4">No credit card required. Free plan available.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
