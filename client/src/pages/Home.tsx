import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import UseCases from "@/components/UseCases";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import ContactForm from "@/components/ContactForm";

const Home = () => {
  const { t, i18n } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("meta.homeTitle")}</title>
        <meta name="description" content={t("meta.homeDescription")} />
        <meta property="og:title" content={t("meta.homeTitle")} />
        <meta property="og:description" content={t("meta.homeDescription")} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://aiphoneagent.bg" />
        <meta property="og:locale" content={i18n.language === "bg" ? "bg_BG" : "en_US"} />
      </Helmet>
      
      <Hero />
      <Features />
      <UseCases />
      <Pricing />
      <Testimonials />
      <ContactForm />
    </>
  );
};

export default Home;
