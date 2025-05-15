import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useCmsContent } from "@/hooks/use-cms-content";

const Hero = () => {
  const { t } = useTranslation();
  const { contentItems, isLoading } = useCmsContent('hero');
  const heroContent = contentItems[0]?.content || {};

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="relative py-12 md:py-20 bg-gradient-to-br from-blue-100 to-blue-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="relative z-10 md:w-1/2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            variants={itemVariants}
          >
            {heroContent.title || t("hero.title")}
          </motion.h1>
          
          <motion.p 
            className="text-lg text-gray-700 mb-8 leading-relaxed"
            variants={itemVariants}
          >
            {heroContent.subtitle || t("hero.description")}
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            variants={itemVariants}
          >
            <Button size="lg" asChild>
              <a href={heroContent.cta?.url || "#contact"}>
                {heroContent.cta?.text || t("hero.tryFree")}
              </a>
            </Button>
            
            <Button size="lg" variant="outline" asChild>
              <a href="#use-cases">{t("hero.seeExamples")}</a>
            </Button>
          </motion.div>
        </motion.div>
        
        <div className="hidden md:block absolute top-0 right-0 w-1/2 h-full">
          <img 
            src={heroContent.image || "https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
            alt="Modern business reception" 
            className="object-cover w-full h-full rounded-l-3xl shadow-2xl" 
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
