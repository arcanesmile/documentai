"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { faBrain } from "@fortawesome/free-solid-svg-icons";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-900">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-900/80 backdrop-blur-xl border-b border-surface-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <FontAwesomeIcon icon={faBrain} className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                realAI
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-surface-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
      </main>

      <footer className="border-t border-surface-700/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <FontAwesomeIcon icon={faBrain} className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-surface-300">realAI</span>
            </div>
            <p className="text-sm text-surface-500">
              &copy; {new Date().getFullYear()} realAI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-surface-400 hover:text-surface-200 transition-colors">
                <FontAwesomeIcon icon={faTwitter} className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-surface-400 hover:text-surface-200 transition-colors">
                <FontAwesomeIcon icon={faGithub} className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
