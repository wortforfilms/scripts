"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LanguageCode = "en" | "hi" | "sa" | "ta" | "bn" | "ar";

export type LanguageOption = {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  dir: "ltr" | "rtl";
};

export const languageOptions: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", dir: "ltr" },
  { code: "sa", label: "Sanskrit", nativeLabel: "संस्कृतम्", dir: "ltr" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", dir: "ltr" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা", dir: "ltr" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" }
];

type TranslationKey =
  | "home"
  | "scripts"
  | "products"
  | "courses"
  | "tools"
  | "partners"
  | "timeline"
  | "about"
  | "cart"
  | "signUp"
  | "signIn"
  | "displaySettings"
  | "theme"
  | "density"
  | "reduceMotion"
  | "chooseLanguage"
  | "welcome"
  | "continueWithoutSaving";

const translations: Record<LanguageCode, Record<TranslationKey, string>> = {
  en: {
    home: "Home",
    scripts: "Scripts",
    products: "Products",
    courses: "Courses",
    tools: "Tools",
    partners: "Partners",
    timeline: "Timeline",
    about: "About",
    cart: "Cart",
    signUp: "Sign Up",
    signIn: "Sign In",
    displaySettings: "Display Settings",
    theme: "Theme",
    density: "Density",
    reduceMotion: "Reduce motion",
    chooseLanguage: "Choose your language",
    welcome: "Welcome",
    continueWithoutSaving: "Continue without saving"
  },
  hi: {
    home: "होम",
    scripts: "लिपियाँ",
    products: "उत्पाद",
    courses: "पाठ्यक्रम",
    tools: "उपकरण",
    partners: "साझेदार",
    timeline: "समयरेखा",
    about: "परिचय",
    cart: "कार्ट",
    signUp: "साइन अप",
    signIn: "साइन इन",
    displaySettings: "प्रदर्शन सेटिंग्स",
    theme: "थीम",
    density: "घनत्व",
    reduceMotion: "मोशन घटाएँ",
    chooseLanguage: "अपनी भाषा चुनें",
    welcome: "स्वागत",
    continueWithoutSaving: "बिना सहेजे जारी रखें"
  },
  sa: {
    home: "गृहम्",
    scripts: "लिपयः",
    products: "उत्पादाः",
    courses: "पाठाः",
    tools: "साधनानि",
    partners: "भागिनः",
    timeline: "कालरेखा",
    about: "परिचयः",
    cart: "कार्ट",
    signUp: "पञ्जीकरणम्",
    signIn: "प्रवेशः",
    displaySettings: "दर्शन-विन्यासः",
    theme: "वर्णरूपम्",
    density: "सघनता",
    reduceMotion: "गतिं न्यूनीकुरु",
    chooseLanguage: "भाषां चिनुत",
    welcome: "स्वागतम्",
    continueWithoutSaving: "असञ्चित्य अग्रे गच्छतु"
  },
  ta: {
    home: "முகப்பு",
    scripts: "எழுத்துமுறைகள்",
    products: "தயாரிப்புகள்",
    courses: "பாடங்கள்",
    tools: "கருவிகள்",
    partners: "கூட்டாளர்கள்",
    timeline: "காலவரிசை",
    about: "அறிமுகம்",
    cart: "கார்ட்",
    signUp: "பதிவு",
    signIn: "உள்நுழை",
    displaySettings: "காட்சி அமைப்புகள்",
    theme: "தீம்",
    density: "அடர்த்தி",
    reduceMotion: "இயக்கத்தை குறை",
    chooseLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    welcome: "வரவேற்பு",
    continueWithoutSaving: "சேமிக்காமல் தொடரவும்"
  },
  bn: {
    home: "হোম",
    scripts: "লিপি",
    products: "পণ্য",
    courses: "কোর্স",
    tools: "টুলস",
    partners: "পার্টনার",
    timeline: "টাইমলাইন",
    about: "পরিচিতি",
    cart: "কার্ট",
    signUp: "সাইন আপ",
    signIn: "সাইন ইন",
    displaySettings: "ডিসপ্লে সেটিংস",
    theme: "থিম",
    density: "ঘনত্ব",
    reduceMotion: "মোশন কমান",
    chooseLanguage: "আপনার ভাষা বেছে নিন",
    welcome: "স্বাগতম",
    continueWithoutSaving: "সেভ না করে চালিয়ে যান"
  },
  ar: {
    home: "الرئيسية",
    scripts: "الخطوط",
    products: "المنتجات",
    courses: "الدورات",
    tools: "الأدوات",
    partners: "الشركاء",
    timeline: "الخط الزمني",
    about: "حول",
    cart: "السلة",
    signUp: "إنشاء حساب",
    signIn: "تسجيل الدخول",
    displaySettings: "إعدادات العرض",
    theme: "السمة",
    density: "الكثافة",
    reduceMotion: "تقليل الحركة",
    chooseLanguage: "اختر لغتك",
    welcome: "مرحبًا",
    continueWithoutSaving: "المتابعة دون حفظ"
  }
};

type I18nContextValue = {
  language: LanguageCode;
  languageOption: LanguageOption;
  languageOptions: LanguageOption[];
  setLanguage: (language: LanguageCode) => void;
  resetLanguage: () => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function isLanguageCode(value: string | null): value is LanguageCode {
  return Boolean(value && languageOptions.some((option) => option.code === value));
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("maataa-language");
    if (isLanguageCode(savedLanguage)) setLanguageState(savedLanguage);
  }, []);

  useEffect(() => {
    const option = languageOptions.find((item) => item.code === language) ?? languageOptions[0];
    document.documentElement.lang = language;
    document.documentElement.dir = option.dir;
  }, [language]);

  const value = useMemo<I18nContextValue>(() => {
    const languageOption = languageOptions.find((option) => option.code === language) ?? languageOptions[0];
    return {
      language,
      languageOption,
      languageOptions,
      setLanguage: (nextLanguage) => {
        localStorage.setItem("maataa-language", nextLanguage);
        setLanguageState(nextLanguage);
      },
      resetLanguage: () => {
        localStorage.removeItem("maataa-language");
        setLanguageState("en");
      },
      t: (key) => translations[language][key] ?? translations.en[key]
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
