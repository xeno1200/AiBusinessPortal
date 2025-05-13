import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const [isBulgarian, setIsBulgarian] = useState(i18n.language === "bg");

  useEffect(() => {
    // Update the toggle state when language changes externally
    setIsBulgarian(i18n.language === "bg");
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLang = isBulgarian ? "en" : "bg";
    i18n.changeLanguage(newLang);
    setIsBulgarian(!isBulgarian);
  };

  return (
    <div className="flex items-center space-x-1">
      <span className="text-xs font-medium text-gray-500">EN</span>
      <Switch 
        checked={isBulgarian} 
        onCheckedChange={toggleLanguage}
        className="data-[state=checked]:bg-primary-600 data-[state=unchecked]:bg-gray-300"
      />
      <span className="text-xs font-medium text-gray-500">BG</span>
    </div>
  );
};

export default LanguageToggle;
