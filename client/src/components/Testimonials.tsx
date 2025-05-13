import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Star, User } from "lucide-react";

const Testimonials = () => {
  const { t } = useTranslation();
  
  const testimonials = [
    {
      name: t("testimonials.testimonial1.name"),
      position: t("testimonials.testimonial1.position"),
      content: t("testimonials.testimonial1.content"),
      stars: 5
    },
    {
      name: t("testimonials.testimonial2.name"),
      position: t("testimonials.testimonial2.position"),
      content: t("testimonials.testimonial2.content"),
      stars: 5
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
    <section className="py-16 bg-gradient-to-br from-blue-100 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {t("testimonials.title")}
          </motion.h2>
        </div>
        
        <motion.div 
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition duration-300"
              variants={itemVariants}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 mr-4">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.position}</p>
                </div>
                <div className="ml-auto text-primary-500 flex">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              
              <p className="text-gray-600 italic mb-4">{testimonial.content}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
