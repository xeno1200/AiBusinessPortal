import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const Pricing = () => {
  const { t } = useTranslation();

  const plans = [
    {
      name: t("pricing.starter.name"),
      price: "€49",
      features: [
        t("pricing.starter.feature1"),
        t("pricing.starter.feature2"),
        t("pricing.starter.feature3"),
        t("pricing.starter.feature4")
      ],
      buttonText: t("pricing.getStarted"),
      buttonVariant: "secondary",
      borderColor: "border-gray-300",
      popular: false
    },
    {
      name: t("pricing.professional.name"),
      price: "€99",
      features: [
        t("pricing.professional.feature1"),
        t("pricing.professional.feature2"),
        t("pricing.professional.feature3"),
        t("pricing.professional.feature4"),
        t("pricing.professional.feature5")
      ],
      buttonText: t("pricing.getStarted"),
      buttonVariant: "default",
      borderColor: "border-primary-600",
      popular: true
    },
    {
      name: t("pricing.business.name"),
      price: "€199",
      features: [
        t("pricing.business.feature1"),
        t("pricing.business.feature2"),
        t("pricing.business.feature3"),
        t("pricing.business.feature4"),
        t("pricing.business.feature5"),
        t("pricing.business.feature6")
      ],
      buttonText: t("pricing.contactSales"),
      buttonVariant: "warning",
      borderColor: "border-amber-500",
      popular: false
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
    <section id="pricing" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {t("pricing.title")}
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t("pricing.subtitle")}
          </motion.p>
        </div>
        
        <motion.div 
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((plan, index) => (
            <motion.div 
              key={index}
              className={`relative ${plan.popular ? 'bg-white shadow-lg transform scale-105 z-10' : 'bg-gray-50 shadow hover:shadow-xl'} rounded-xl overflow-hidden transition duration-300 border-t-4 ${plan.borderColor}`}
              variants={itemVariants}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  {t("pricing.mostPopular")}
                </div>
              )}
              
              <div className="p-8">
                <h3 className="font-heading text-xl font-semibold mb-2">{plan.name}</h3>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600 ml-1">{t("pricing.perMonth")}</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="text-green-500 h-5 w-5 mt-1 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={plan.buttonVariant === "warning" ? "default" : plan.buttonVariant === "secondary" ? "secondary" : "default"}
                  asChild
                >
                  <a 
                    href="#contact" 
                    className={plan.buttonVariant === "warning" ? "bg-amber-500 hover:bg-amber-600" : ""}
                  >
                    {plan.buttonText}
                  </a>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
