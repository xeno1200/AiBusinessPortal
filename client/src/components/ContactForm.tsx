import { useTranslation } from "react-i18next";
import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Facebook, Linkedin, Twitter, Instagram } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  business: z.string().min(2, {
    message: "Business name must be at least 2 characters."
  }),
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
  phone: z.string().min(5, {
    message: "Please enter a valid phone number."
  }),
  businessType: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const ContactForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      business: "",
      email: "",
      phone: "",
      businessType: ""
    }
  });

  const contactMutation = useMutation({
    mutationFn: (data: FormValues) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: t("contact.successTitle"),
        description: t("contact.successMessage"),
      });
      setSubmitted(true);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: t("contact.errorTitle"),
        description: error.message || t("contact.errorMessage"),
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: FormValues) => {
    contactMutation.mutate(data);
  };

  const businessTypes = [
    { value: "salon", label: t("contact.businessTypes.salon") },
    { value: "hotel", label: t("contact.businessTypes.hotel") },
    { value: "auto", label: t("contact.businessTypes.auto") },
    { value: "restaurant", label: t("contact.businessTypes.restaurant") },
    { value: "other", label: t("contact.businessTypes.other") }
  ];

  return (
    <section id="contact" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid md:grid-cols-2">
              {/* Form Column */}
              <div className="p-8 md:p-12">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {t("contact.title")}
                </h2>
                
                <p className="text-gray-600 mb-8">
                  {t("contact.subtitle")}
                </p>
                
                {!submitted ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.form.nameLabel")} *</FormLabel>
                            <FormControl>
                              <Input required {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="business"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.form.businessLabel")} *</FormLabel>
                            <FormControl>
                              <Input required {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.form.emailLabel")} *</FormLabel>
                            <FormControl>
                              <Input type="email" required {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.form.phoneLabel")} *</FormLabel>
                            <FormControl>
                              <Input type="tel" required {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="businessType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.form.businessTypeLabel")}</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("contact.form.businessTypePlaceholder")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {businessTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full mt-6" 
                        disabled={contactMutation.isPending}
                      >
                        {contactMutation.isPending 
                          ? t("contact.form.submitting") 
                          : t("contact.form.submitButton")}
                      </Button>
                    </form>
                  </Form>
                ) : (
                  <div className="text-center py-10">
                    <div className="text-primary-600 mb-4">
                      <svg className="w-16 h-16 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t("contact.thankYouTitle")}</h3>
                    <p className="text-gray-600">{t("contact.thankYouMessage")}</p>
                  </div>
                )}
              </div>
              
              {/* Info Column */}
              <div className="bg-primary-600 text-white p-8 md:p-12 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading text-2xl font-semibold mb-6">
                    {t("contact.infoTitle")}
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <MapPin className="mt-1 mr-4 text-white opacity-80 h-5 w-5" />
                      <div>
                        <h4 className="font-semibold mb-1">{t("contact.info.locationTitle")}</h4>
                        <p className="opacity-80">Sofia Tech Park, 111 Tsarigradsko Shose Blvd</p>
                        <p>Sofia, Bulgaria</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Phone className="mt-1 mr-4 text-white opacity-80 h-5 w-5" />
                      <div>
                        <h4 className="font-semibold mb-1">{t("contact.info.phoneTitle")}</h4>
                        <p className="opacity-80">+359 2 123 4567</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Mail className="mt-1 mr-4 text-white opacity-80 h-5 w-5" />
                      <div>
                        <h4 className="font-semibold mb-1">{t("contact.info.emailTitle")}</h4>
                        <p className="opacity-80">info@aiphoneagent.bg</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12">
                  <h4 className="font-semibold mb-4">{t("contact.info.socialTitle")}</h4>
                  <div className="flex space-x-4">
                    <a href="#" className="text-white hover:text-primary-100 transition duration-150">
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-white hover:text-primary-100 transition duration-150">
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-white hover:text-primary-100 transition duration-150">
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-white hover:text-primary-100 transition duration-150">
                      <Instagram className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
