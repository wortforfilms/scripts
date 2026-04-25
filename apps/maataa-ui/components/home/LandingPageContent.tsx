"use client";

import Link from "next/link";
import { useI18n, type LanguageCode } from "../providers/I18nProvider";

type LandingPageContentProps = {
  datasetCurrent: number;
  datasetTarget: number;
  verifiedCount: number;
  partialCount: number;
};

type Card = {
  title: string;
  description: string;
  href?: string;
  image?: string;
};

type LandingCopy = {
  heroKicker: string;
  heroTitleA: string;
  heroTitleB: string;
  heroBody: string;
  exploreAtlas: string;
  openTools: string;
  startOnboarding: string;
  scriptRecords: string;
  verifiedSamples: string;
  partialRecords: string;
  toolsKicker: string;
  toolsTitle: string;
  viewAllTools: string;
  whyKicker: string;
  whyTitle: string;
  whyBody: string;
  universeTitle: string;
  universeBody: string;
  explore: string;
  tools: Card[];
  usps: Card[];
  categories: Card[];
  trust: Card[];
};

const categoryImages = {
  books: "/landing/category-books.png",
  courses: "/landing/category-courses.png",
  fonts: "/landing/category-fonts.png",
  datasets: "/landing/category-datasets.png",
  ai: "/landing/category-ai-tools.png",
  media: "/landing/category-media.png",
  saas: "/landing/category-saas-tools.png"
};

const englishCopy: LandingCopy = {
  heroKicker: "World's first verification-first script intelligence platform",
  heroTitleA: "Preserve. Decode.",
  heroTitleB: "Understand. Share.",
  heroBody: "A production-gated knowledge universe for scripts, glyphs, Unicode data, research workflows, and paid digital releases.",
  exploreAtlas: "Explore Script Atlas",
  openTools: "Open Tools",
  startOnboarding: "Start Onboarding",
  scriptRecords: "script records",
  verifiedSamples: "verified samples",
  partialRecords: "partial records",
  toolsKicker: "Tools",
  toolsTitle: "Built for script work from source to marketplace",
  viewAllTools: "View all tools",
  whyKicker: "Why it matters",
  whyTitle: "A release-safe platform for scripts, not a gallery of guesses.",
  whyBody: "The platform can grow toward the full 426-script target while still keeping public surfaces honest about what is verified, partial, or blocked.",
  universeTitle: "Explore Script Knowledge Universe",
  universeBody: "Books, Courses, Fonts, Tools, Datasets & more",
  explore: "Explore",
  tools: [
    { title: "Script Atlas", description: "Browse Unicode-derived records, curated verification overlays, and safe glyph policy.", href: "/scripts" },
    { title: "Glyph QA", description: "Separate verified Unicode samples from placeholder assets that still need review.", href: "/admin/scripts/verification" },
    { title: "Dataset QA", description: "Track source coverage, verification status, and incomplete records before publication.", href: "/tools" },
    { title: "Maataa Spine", description: "Audit events, jobs, and release activity without exposing sensitive payment data.", href: "/admin/spine" },
    { title: "Proof Inspector", description: "Inspect verification artifacts and runtime evidence for research workflows.", href: "/proof-inspector" },
    { title: "Marketplace Guard", description: "Keep paid SKUs draft-only until approval, checkout, and access tests pass.", href: "/products" }
  ],
  usps: [
    { title: "Verification-first", description: "Every record carries explicit status, sources, and glyph rendering policy." },
    { title: "No fake glyphs", description: "Unverified scripts use verification-required assets instead of invented ancient characters." },
    { title: "Unicode anchored", description: "Phase 1 starts from Unicode Script property values and preserves standards-derived uncertainty." },
    { title: "Release gated", description: "Internal alpha, public preview, and paid marketplace readiness are tracked separately." }
  ],
  categories: [
    { title: "Books", description: "Research volumes, guides and more", image: categoryImages.books },
    { title: "Courses", description: "Learn scripts, writing, linguistics and more", image: categoryImages.courses },
    { title: "Fonts", description: "Unicode fonts, calligraphy and digital assets", image: categoryImages.fonts },
    { title: "Datasets", description: "Manuscripts, glyphs, OCR and linguistic data", image: categoryImages.datasets },
    { title: "AI Tools", description: "OCR, transliteration, models and APIs", image: categoryImages.ai },
    { title: "Media", description: "Posters, infographics, videos and more", image: categoryImages.media },
    { title: "SaaS Tools", description: "Converters, editors, timeline tools", image: categoryImages.saas }
  ],
  trust: [
    { title: "10,000 Years of History", description: "From ancient to modern scripts across time and civilizations." },
    { title: "Global Repository", description: "Script records from sourced regions and cultures." },
    { title: "Authentic & Verified", description: "Research-driven records with explicit verification status." },
    { title: "Community Driven", description: "Built for scholars, researchers, learners and creators." },
    { title: "PHKD Powered", description: "Part of Personal History & Knowledge Digitization mission." }
  ]
};

const landingCopy: Record<LanguageCode, LandingCopy> = {
  en: englishCopy,
  hi: {
    ...englishCopy,
    heroKicker: "दुनिया का पहला verification-first script intelligence platform",
    heroTitleA: "संरक्षित करें. डिकोड करें.",
    heroTitleB: "समझें. साझा करें.",
    heroBody: "लिपियों, glyphs, Unicode data, research workflows और paid digital releases के लिए production-gated knowledge universe.",
    exploreAtlas: "Script Atlas देखें",
    openTools: "Tools खोलें",
    startOnboarding: "Onboarding शुरू करें",
    scriptRecords: "script records",
    verifiedSamples: "verified samples",
    partialRecords: "partial records",
    toolsKicker: "उपकरण",
    toolsTitle: "Source से marketplace तक script work के लिए बनाया गया",
    viewAllTools: "सभी tools देखें",
    whyKicker: "यह क्यों ज़रूरी है",
    whyTitle: "Scripts के लिए release-safe platform, guesses की gallery नहीं.",
    whyBody: "Platform 426-script target तक बढ़ सकता है, while public surfaces verified, partial और blocked status को ईमानदारी से दिखाते हैं.",
    universeTitle: "Script Knowledge Universe देखें",
    universeBody: "Books, Courses, Fonts, Tools, Datasets और अधिक",
    explore: "देखें"
  },
  sa: {
    ...englishCopy,
    heroKicker: "प्रथमं verification-first script intelligence platform",
    heroTitleA: "रक्षतु. विवृणोतु.",
    heroTitleB: "बोधयतु. वितरतु.",
    heroBody: "लिपीनां, glyphs, Unicode data, अनुसन्धानकार्यप्रवाहानां च सुरक्षितं knowledge universe.",
    exploreAtlas: "Script Atlas पश्यतु",
    openTools: "साधनानि उद्घाटयतु",
    startOnboarding: "आरम्भं कुरुत",
    toolsKicker: "साधनानि",
    toolsTitle: "स्रोतसः आरभ्य marketplace पर्यन्तं लिपिकार्यार्थं निर्मितम्",
    viewAllTools: "सर्वाणि साधनानि",
    whyKicker: "किमर्थम्",
    whyTitle: "लिपीनां कृते release-safe platform, कल्पनासङ्ग्रहः न.",
    whyBody: "426-script लक्ष्यं प्रति वृद्धिः शक्या, तथापि public surfaces verified, partial, blocked इति स्पष्टं दर्शयन्ति.",
    universeTitle: "Script Knowledge Universe अन्वेषयतु",
    universeBody: "Books, Courses, Fonts, Tools, Datasets इत्यादि",
    explore: "अन्वेषयतु"
  },
  ta: {
    ...englishCopy,
    heroKicker: "உலகின் முதல் verification-first script intelligence platform",
    heroTitleA: "பாதுகாப்போம். குறியீடு புரிவோம்.",
    heroTitleB: "புரிந்துகொள்வோம். பகிர்வோம்.",
    heroBody: "எழுத்துமுறைகள், glyphs, Unicode data, research workflows மற்றும் paid digital releases க்கான production-gated knowledge universe.",
    exploreAtlas: "Script Atlas பார்க்க",
    openTools: "கருவிகள் திற",
    startOnboarding: "Onboarding தொடங்கு",
    scriptRecords: "script records",
    verifiedSamples: "verified samples",
    partialRecords: "partial records",
    toolsKicker: "கருவிகள்",
    toolsTitle: "Source முதல் marketplace வரை script work க்காக உருவாக்கப்பட்டது",
    viewAllTools: "அனைத்து கருவிகள்",
    whyKicker: "ஏன் முக்கியம்",
    whyTitle: "Scripts க்கான release-safe platform, ஊகங்களின் gallery அல்ல.",
    whyBody: "Platform 426-script target நோக்கி வளரலாம்; public surfaces verified, partial, blocked நிலைகளை நேர்மையாக காட்டும்.",
    universeTitle: "Script Knowledge Universe",
    universeBody: "Books, Courses, Fonts, Tools, Datasets மற்றும் மேலும்",
    explore: "பார்க்க"
  },
  bn: {
    ...englishCopy,
    heroKicker: "বিশ্বের প্রথম verification-first script intelligence platform",
    heroTitleA: "সংরক্ষণ. ডিকোড.",
    heroTitleB: "বোঝা. ভাগ করা.",
    heroBody: "লিপি, glyphs, Unicode data, research workflows এবং paid digital releases-এর জন্য production-gated knowledge universe.",
    exploreAtlas: "Script Atlas দেখুন",
    openTools: "Tools খুলুন",
    startOnboarding: "Onboarding শুরু করুন",
    scriptRecords: "script records",
    verifiedSamples: "verified samples",
    partialRecords: "partial records",
    toolsKicker: "টুলস",
    toolsTitle: "Source থেকে marketplace পর্যন্ত script work-এর জন্য তৈরি",
    viewAllTools: "সব টুলস দেখুন",
    whyKicker: "কেন জরুরি",
    whyTitle: "Scripts-এর জন্য release-safe platform, অনুমানের gallery নয়.",
    whyBody: "Platform 426-script target-এর দিকে বাড়তে পারে, while public surfaces verified, partial, blocked status সৎভাবে দেখায়.",
    universeTitle: "Script Knowledge Universe দেখুন",
    universeBody: "Books, Courses, Fonts, Tools, Datasets এবং আরও",
    explore: "দেখুন"
  },
  ar: {
    ...englishCopy,
    heroKicker: "أول منصة ذكاء للخطوط مبنية على التحقق أولًا",
    heroTitleA: "احفظ. فكّك.",
    heroTitleB: "افهم. شارك.",
    heroBody: "عالم معرفة مضبوط للإنتاج للخطوط والرموز وبيانات Unicode وسير العمل البحثي والإصدارات الرقمية المدفوعة.",
    exploreAtlas: "استكشف أطلس الخطوط",
    openTools: "افتح الأدوات",
    startOnboarding: "ابدأ التعريف",
    scriptRecords: "سجلات الخطوط",
    verifiedSamples: "عينات موثقة",
    partialRecords: "سجلات جزئية",
    toolsKicker: "الأدوات",
    toolsTitle: "مصمم لعمل الخطوط من المصدر إلى السوق",
    viewAllTools: "عرض كل الأدوات",
    whyKicker: "لماذا يهم",
    whyTitle: "منصة إصدار آمنة للخطوط، وليست معرضًا للتخمينات.",
    whyBody: "يمكن للمنصة النمو نحو هدف 426 خطًا مع إبقاء الواجهات العامة صادقة بشأن الموثق والجزئي والمحظور.",
    universeTitle: "استكشف عالم معرفة الخطوط",
    universeBody: "كتب، دورات، خطوط رقمية، أدوات، مجموعات بيانات والمزيد",
    explore: "استكشف"
  }
};

function getCopy(language: LanguageCode) {
  return landingCopy[language] ?? englishCopy;
}

export function LandingPageContent({ datasetCurrent, datasetTarget, partialCount, verifiedCount }: LandingPageContentProps) {
  const { language } = useI18n();
  const copy = getCopy(language);

  return (
    <main>
      <section className="relative overflow-hidden bg-[#071018] px-6 py-14">
        <img
          src="/landing/hero-manuscript.png"
          alt=""
          className="absolute inset-y-0 right-0 h-full w-full object-cover opacity-80 md:w-[72%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#071018_0%,rgba(7,16,24,0.92)_30%,rgba(7,16,24,0.45)_64%,rgba(7,16,24,0.12)_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 xl:grid-cols-[1fr_22rem] xl:items-end">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">{copy.heroKicker}</p>
            <h1 className="mt-5 text-5xl font-semibold leading-tight text-white md:text-7xl">
              {copy.heroTitleA}
              <span className="block text-amber-300">{copy.heroTitleB}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">{copy.heroBody}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/scripts" className="rounded bg-amber-300 px-7 py-3 font-semibold text-black">
                {copy.exploreAtlas}
              </Link>
              <Link href="/tools" className="rounded border border-amber-300 px-7 py-3 font-semibold text-white">
                {copy.openTools}
              </Link>
              <Link href="/signup" className="rounded border border-white/20 px-7 py-3 font-semibold text-white/85">
                {copy.startOnboarding}
              </Link>
            </div>
            <div className="mt-10 grid max-w-3xl gap-5 sm:grid-cols-3">
              <div className="rounded border border-white/10 bg-black/25 p-4">
                <p className="text-3xl font-semibold text-white">{datasetCurrent} / {datasetTarget}</p>
                <p className="mt-1 text-sm text-white/75">{copy.scriptRecords}</p>
              </div>
              <div className="rounded border border-white/10 bg-black/25 p-4">
                <p className="text-3xl font-semibold text-white">{verifiedCount}</p>
                <p className="mt-1 text-sm text-white/75">{copy.verifiedSamples}</p>
              </div>
              <div className="rounded border border-white/10 bg-black/25 p-4">
                <p className="text-3xl font-semibold text-white">{partialCount}</p>
                <p className="mt-1 text-sm text-white/75">{copy.partialRecords}</p>
              </div>
            </div>
          </div>
          <img
            src="/landing/quote-card.png"
            alt="Every script is a civilization's memory. Every character, a bridge to the past."
            className="hidden self-end rounded shadow-2xl xl:block"
          />
        </div>
      </section>

      <section className="bg-[#101820] px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-300">{copy.toolsKicker}</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">{copy.toolsTitle}</h2>
            </div>
            <Link href="/tools" className="rounded border border-white/15 px-4 py-2 text-sm font-semibold text-white/80">
              {copy.viewAllTools}
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {copy.tools.map((tool) => (
              <Link key={tool.title} href={tool.href ?? "/tools"} className="rounded border border-white/10 bg-white/[0.04] p-5 transition hover:border-amber-300/70 hover:bg-white/[0.08]">
                <h3 className="text-xl font-semibold text-white">{tool.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/65">{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#071018] px-6 py-12">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-300">{copy.whyKicker}</p>
            <h2 className="mt-2 text-4xl font-semibold text-white">{copy.whyTitle}</h2>
            <p className="mt-4 text-white/68">{copy.whyBody}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {copy.usps.map((usp) => (
              <div key={usp.title} className="rounded border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-lg font-semibold text-white">{usp.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/65">{usp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f2efeb] px-6 py-5 text-[#171717]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">{copy.universeTitle}</h2>
            <div className="mx-auto mt-2 h-0.5 w-5 bg-amber-500" />
            <p className="mt-2 text-sm text-neutral-700">{copy.universeBody}</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {copy.categories.map((card) => (
              <Link
                key={card.title}
                href="/scripts"
                className="rounded border border-neutral-300 bg-white/50 px-4 py-4 text-center shadow-sm transition hover:border-amber-500 hover:bg-white"
              >
                <img src={card.image} alt="" className="mx-auto h-20 w-24 object-contain" />
                <h3 className="mt-2 text-xl font-semibold">{card.title}</h3>
                <p className="mt-1 min-h-10 text-sm leading-5 text-neutral-700">{card.description}</p>
                <span className="mt-3 inline-flex text-sm font-medium text-blue-900">{copy.explore} <span className="ml-2 text-amber-600">→</span></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#071018] px-6 py-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-5">
          {copy.trust.map((item) => (
            <div key={item.title} className="border-white/15 md:border-r md:pr-6 last:border-r-0">
              <h3 className="font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
