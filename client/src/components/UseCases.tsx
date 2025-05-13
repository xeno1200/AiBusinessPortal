import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const UseCases = () => {
  const { t } = useTranslation();

  const useCases = [
    {
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: t("useCases.case1.title"),
      benefits: [
        t("useCases.case1.benefit1"),
        t("useCases.case1.benefit2"),
        t("useCases.case1.benefit3")
      ],
      testimonial: t("useCases.case1.testimonial"),
      author: t("useCases.case1.author")
    },
    {
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: t("useCases.case2.title"),
      benefits: [
        t("useCases.case2.benefit1"),
        t("useCases.case2.benefit2"),
        t("useCases.case2.benefit3")
      ],
      testimonial: t("useCases.case2.testimonial"),
      author: t("useCases.case2.author")
    },
    {
      image: "https://images.unsplash.com/photo-1625047509252-ab38fb5c5b8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: t("useCases.case3.title"),
      benefits: [
        t("useCases.case3.benefit1"),
        t("useCases.case3.benefit2"),
        t("useCases.case3.benefit3")
      ],
      testimonial: t("useCases.case3.testimonial"),
      author: t("useCases.case3.author")
    }
  ];

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
    <section id="use-cases" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {t("useCases.title")}
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t("useCases.subtitle")}
          </motion.p>
        </div>
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {useCases.map((useCase, index) => (
            <motion.div 
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition duration-300"
              variants={itemVariants}
            >
              <img 
                src={useCase.image} 
                alt={useCase.title} 
                className="w-full h-56 object-cover" 
              />
              
              <div className="p-8">
                <h3 className="font-heading text-xl font-semibold mb-3">{useCase.title}</h3>
                
                <ul className="space-y-3 mb-6">
                  {useCase.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="text-green-500 h-5 w-5 mt-1 mr-2" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm italic text-gray-600 mb-4">{useCase.testimonial}</p>
                  <p className="text-sm font-medium">{useCase.author}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="text-center mt-10">
          <Button size="lg" asChild>
            <a href="#contact">{t("useCases.ctaButton")}</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UseCases;
