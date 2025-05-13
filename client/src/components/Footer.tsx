import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Linkedin, Twitter, Instagram, Send } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-400 h-8 w-8 mr-2"
              >
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
                <line x1="8" y1="16" x2="8" y2="16" />
                <line x1="16" y1="16" x2="16" y2="16" />
                <line x1="12" y1="16" x2="12" y2="16" />
              </svg>
              <span className="font-heading font-bold text-xl">
                {t("footer.logo")}
              </span>
            </div>
            <p className="text-gray-400 mb-6">{t("footer.tagline")}</p>
          </div>

          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-gray-400 hover:text-white transition duration-150"
                >
                  {t("footer.features")}
                </a>
              </li>
              <li>
                <a
                  href="#use-cases"
                  className="text-gray-400 hover:text-white transition duration-150"
                >
                  {t("footer.useCases")}
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-gray-400 hover:text-white transition duration-150"
                >
                  {t("footer.pricing")}
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-gray-400 hover:text-white transition duration-150"
                >
                  {t("footer.contact")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">
              {t("footer.legal")}
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition duration-150"
                >
                  {t("footer.privacyPolicy")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition duration-150"
                >
                  {t("footer.termsOfService")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition duration-150"
                >
                  {t("footer.cookiePolicy")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">
              {t("footer.newsletter")}
            </h4>
            <p className="text-gray-400 mb-4">{t("footer.subscribeText")}</p>

            <form className="flex">
              <Input
                type="email"
                placeholder={t("footer.emailPlaceholder")}
                className="flex-grow px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-r-none"
              />
              <Button type="submit" className="rounded-l-none">
                <Send className="h-4 w-4" />
              </Button>
            </form>
            
            <div className="mt-6">
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-primary-400 transition duration-150">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-white hover:text-primary-400 transition duration-150">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-white hover:text-primary-400 transition duration-150">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-white hover:text-primary-400 transition duration-150">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} {t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
