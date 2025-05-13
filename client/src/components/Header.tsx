import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import LanguageToggle from "./LanguageToggle";
import { Menu, X } from "lucide-react";

const Header = () => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-600 h-8 w-8 mr-2"
              >
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
                <line x1="8" y1="16" x2="8" y2="16" />
                <line x1="16" y1="16" x2="16" y2="16" />
                <line x1="12" y1="16" x2="12" y2="16" />
              </svg>
              <span className="font-heading font-bold text-xl text-gray-900">
                {t("header.logo")}
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-6">
              <a
                href="#features"
                className="text-gray-600 hover:text-primary-600 transition duration-150"
              >
                {t("header.features")}
              </a>
              <a
                href="#use-cases"
                className="text-gray-600 hover:text-primary-600 transition duration-150"
              >
                {t("header.useCases")}
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-primary-600 transition duration-150"
              >
                {t("header.pricing")}
              </a>
              <a
                href="#contact"
                className="text-gray-600 hover:text-primary-600 transition duration-150"
              >
                {t("header.contact")}
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <Button asChild>
                <a href="#contact">{t("header.getStarted")}</a>
              </Button>
            </div>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`mobile-menu md:hidden py-4 ${mobileMenuOpen ? "" : "hidden"}`}>
          <nav className="flex flex-col space-y-4">
            <a
              href="#features"
              className="text-gray-600 hover:text-primary-600 transition duration-150"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("header.features")}
            </a>
            <a
              href="#use-cases"
              className="text-gray-600 hover:text-primary-600 transition duration-150"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("header.useCases")}
            </a>
            <a
              href="#pricing"
              className="text-gray-600 hover:text-primary-600 transition duration-150"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("header.pricing")}
            </a>
            <a
              href="#contact"
              className="text-gray-600 hover:text-primary-600 transition duration-150"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("header.contact")}
            </a>

            <div className="flex items-center space-x-2 pt-2">
              <span className="text-sm">{t("header.language")}:</span>
              <LanguageToggle />
            </div>

            <Button asChild className="mt-4 w-full">
              <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
                {t("header.getStarted")}
              </a>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
