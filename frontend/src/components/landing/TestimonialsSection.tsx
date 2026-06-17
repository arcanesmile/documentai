"use client";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Data Scientist",
    company: "TechCorp",
    content: "realAI revolutionized how our team searches through technical documentation. The semantic search is incredibly accurate.",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Product Manager",
    company: "StartupX",
    content: "The AI chat feature is a game-changer. We can now ask natural language questions and get precise answers from our knowledge base.",
    rating: 5,
  },
  {
    name: "Emily Watson",
    role: "Researcher",
    company: "University Lab",
    content: "Processing research papers has never been easier. The RAG pipeline extracts exactly what I need from hundreds of PDFs.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [ref, isVisible] = useIntersectionObserver<HTMLElement>({ threshold: 0.1, triggerOnce: true });

  return (
    <section ref={ref} className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Loved by{" "}
            <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="text-xl text-surface-400">See what our users say about realAI</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-surface-800/50 border border-surface-700/50 hover:border-primary-500/30 transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <FontAwesomeIcon key={i} icon={faStar} className="h-4 w-4 text-amber-400" />
                ))}
              </div>
              <p className="text-surface-300 text-sm leading-relaxed mb-6">&ldquo;{testimonial.content}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-medium">
                  {testimonial.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{testimonial.name}</p>
                  <p className="text-xs text-surface-400">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
