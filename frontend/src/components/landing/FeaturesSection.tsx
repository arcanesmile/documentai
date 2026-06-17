"use client";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faFileUpload,
  faMagnifyingGlass,
  faComments,
  faShield,
  faBolt,
  faRocket,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const features = [
  {
    icon: faBrain,
    title: "AI-Powered Search",
    description: "Semantic search understands context and meaning, not just keywords. Get relevant results every time.",
    gradient: "from-primary-500 to-accent-500",
  },
  {
    icon: faFileUpload,
    title: "Multi-Format Support",
    description: "Upload PDF, DOCX, and TXT files. Our system extracts and indexes all content automatically.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: faMagnifyingGlass,
    title: "Semantic Understanding",
    description: "Vector embeddings capture the meaning of your documents for contextually aware search results.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: faComments,
    title: "Intelligent Chat",
    description: "Have natural conversations with your documents. Ask follow-up questions and get detailed answers.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: faBolt,
    title: "Lightning Fast",
    description: "FAISS vector database enables instant similarity search across millions of document chunks.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: faShield,
    title: "Enterprise Security",
    description: "Your data is encrypted at rest and in transit. SOC 2 compliant infrastructure.",
    gradient: "from-rose-500 to-red-500",
  },
];

export default function FeaturesSection() {
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
            Everything You Need for{" "}
            <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              AI-Powered Search
            </span>
          </h2>
          <p className="text-xl text-surface-400 max-w-2xl mx-auto">
            Built with cutting-edge RAG technology to provide the best document search experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-6 rounded-2xl bg-surface-800/50 border border-surface-700/50 hover:border-primary-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/5"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-2.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <FontAwesomeIcon icon={feature.icon} className="h-full w-full text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-surface-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
