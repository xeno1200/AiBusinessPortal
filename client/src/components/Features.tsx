import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  Phone, 
  Calendar, 
  Bot, 
  Languages, 
  LineChart, 
  RefreshCw 
} from "lucide-react";

const Features = () => {
  const { t } = useTranslation();

  const featureItems = [
    {
      icon: <Phone className="h-10 w-10" />,
      title: t("features.feature1.title"),
      description: t("features.feature1.description")
    },
    {
      icon: <Calendar className="h-10 w-10" />,
      title: t("features.feature2.title"),
      description: t("features.feature2.description")
    },
    {
      icon: <Bot className="h-10 w-10" />,
      title: t("features.feature3.title"),
      description: t("features.feature3.description")
    },
    {
      icon: <Languages className="h-10 w-10" />,
      title: t("features.feature4.title"),
      description: t("features.feature4.description")
    },
    {
      icon: <LineChart className="h-10 w-10" />,
      title: t("features.feature5.title"),
      description: t("features.feature5.description")
    },
    {
      icon: <RefreshCw className="h-10 w-10" />,
      title: t("features.feature6.title"),
      description: t("features.feature6.description")
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
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
    <section id="features" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {t("features.title")}
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t("features.subtitle")}
          </motion.p>
        </div>
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {featureItems.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition duration-300"
              variants={itemVariants}
            >
              <div className="text-primary-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
