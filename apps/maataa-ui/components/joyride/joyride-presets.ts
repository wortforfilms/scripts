export type JoyrideStep = {
  target: string;
  title: string;
  body: string;
};

export type JoyridePreset = {
  id: string;
  label: string;
  steps: JoyrideStep[];
};

const commonStart: JoyrideStep = {
  target: "page-main",
  title: "Page overview",
  body: "This tour highlights the main workflow on the current page and points out the safest next actions."
};

const settingsStep: JoyrideStep = {
  target: "settings",
  title: "Display and accessibility settings",
  body: "Open settings for language, theme, font, type size, high contrast, density, and reduced motion."
};

export const accessibilityPreset: JoyridePreset = {
  id: "accessibility",
  label: "Accessibility joyride",
  steps: [
    {
      target: "overview",
      title: "Accessibility overview",
      body: "This page gathers Divyaang-friendly support in one place: vision, hearing, keyboard, language, captions, and readable text."
    },
    {
      target: "image",
      title: "Accessible visual asset",
      body: "The illustration has descriptive alt text. Decorative images elsewhere are hidden from assistive technology."
    },
    {
      target: "vision",
      title: "Vision support",
      body: "Users can switch to high contrast, increase text size, and choose calmer surfaces from display settings."
    },
    {
      target: "keyboard",
      title: "Keyboard access",
      body: "Links, forms, and settings use semantic controls and visible focus states for keyboard navigation."
    },
    settingsStep
  ]
};

export const joyrideDirectory = [
  { title: "Accessibility", href: "/accessibility?joyride=start", body: "Divyaang access, image alt text, vision support, keyboard access, and settings." },
  { title: "Home", href: "/?joyride=start", body: "Navigation, landing content, partner ecosystem, and display personalization." },
  { title: "Scripts", href: "/scripts?joyride=start", body: "Script explorer, verification statuses, glyph policy, and settings." },
  { title: "Tools", href: "/tools?joyride=start", body: "MVP tools, locked rollout phases, feature gates, and upgrade path." },
  { title: "Investors", href: "/investors?joyride=start", body: "Investor intake, admin review, split rules, and Divyaang access." },
  { title: "Sponsors", href: "/sponsors?joyride=start", body: "Script sponsorship, dataset support, attribution review, and preservation impact." },
  { title: "Creators", href: "/creators?joyride=start", body: "Product publishing, draft SKUs, approval, checkout, and revenue ledger." },
  { title: "Partners", href: "/partners?joyride=start", body: "Partner inquiry, role types, admin review, and no automatic transfers." },
  { title: "Checkout", href: "/checkout?joyride=start", body: "Legal acceptance, Razorpay order, and webhook-only access unlock." },
  { title: "Admin Finance", href: "/admin/finance?joyride=start", body: "Orders, payments, webhook idempotency, revenue splits, and transfer approval locks." },
  { title: "Dataset QA", href: "/admin/dataset-qa?joyride=start", body: "Sources, verification status, system type, Unicode ranges, and public preview gate." },
  { title: "Glyph QA", href: "/admin/glyph-qa?joyride=start", body: "Verified glyphs, fallback assets, font QA, and review requirements." },
  { title: "Feature Flags", href: "/admin/features?joyride=start", body: "MVP, Phase 2, Phase 3, roles, plans, and rollout controls." }
];

const presets: Array<{ match: (pathname: string) => boolean; preset: JoyridePreset }> = [
  {
    match: (pathname) => pathname === "/",
    preset: {
      id: "home",
      label: "Home joyride",
      steps: [
        { target: "public-nav", title: "Main navigation", body: "Use the top navigation to move between scripts, products, courses, tools, partners, and timeline." },
        { target: "page-main", title: "Landing experience", body: "The home page introduces verified scripts, tools, marketplace paths, and partner journeys." },
        { target: "settings", title: "Personalize display", body: settingsStep.body }
      ]
    }
  },
  {
    match: (pathname) => pathname.startsWith("/scripts/"),
    preset: {
      id: "script-detail",
      label: "Script detail joyride",
      steps: [
        commonStart,
        { target: "page-main", title: "Verification record", body: "Check status, source policy, Unicode sample, fallback glyph policy, direction, region, family, and era." },
        settingsStep
      ]
    }
  },
  {
    match: (pathname) => pathname.startsWith("/scripts"),
    preset: {
      id: "scripts",
      label: "Script explorer joyride",
      steps: [
        commonStart,
        { target: "script-catalog-browser", title: "Searchable script catalog", body: "Use search, filters, sort, page size, and Unicode-only mode to inspect script records without exposing unverified glyphs." },
        settingsStep
      ]
    }
  },
  {
    match: (pathname) => pathname.startsWith("/tools"),
    preset: {
      id: "tools",
      label: "Tools joyride",
      steps: [
        commonStart,
        { target: "page-main", title: "Feature-gated tools", body: "MVP tools are available now; Phase 2 and Phase 3 tools stay locked until rollout flags allow them." },
        settingsStep
      ]
    }
  },
  {
    match: (pathname) => pathname.startsWith("/checkout"),
    preset: {
      id: "checkout",
      label: "Checkout joyride",
      steps: [
        commonStart,
        { target: "page-main", title: "Webhook-only trust", body: "The client callback is informational. Access unlocks only after a verified Razorpay webhook." },
        settingsStep
      ]
    }
  },
  {
    match: (pathname) => pathname.startsWith("/investors"),
    preset: {
      id: "investors",
      label: "Investor joyride",
      steps: [
        commonStart,
        { target: "page-main", title: "Investor intake", body: "Investor inquiries go to admin review. Split rules and external transfers are never automatic." },
        { target: "overview", title: "Divyaang access", body: "Accessibility is part of the investment story: display, language, keyboard, caption, and readable-text support." },
        settingsStep
      ]
    }
  },
  {
    match: (pathname) => pathname.startsWith("/sponsors"),
    preset: {
      id: "sponsors",
      label: "Sponsor joyride",
      steps: [
        commonStart,
        { target: "page-main", title: "Sponsor path", body: "Sponsors can support scripts, datasets, glyph QA, courses, and preservation work after review." },
        settingsStep
      ]
    }
  },
  {
    match: (pathname) => pathname.startsWith("/creators"),
    preset: {
      id: "creators",
      label: "Creator joyride",
      steps: [
        commonStart,
        { target: "page-main", title: "Creator path", body: "Creator products flow through draft catalog, SKU approval, publish rules, checkout, access, and ledger review." },
        settingsStep
      ]
    }
  },
  {
    match: (pathname) => pathname.startsWith("/partners"),
    preset: {
      id: "partners",
      label: "Partner joyride",
      steps: [
        commonStart,
        { target: "page-main", title: "Partner portal", body: "Investor, sponsor, creator, affiliate, and partner inquiries land in admin review before any contract or split." },
        settingsStep
      ]
    }
  },
  {
    match: (pathname) => pathname.startsWith("/admin/finance"),
    preset: {
      id: "admin-finance",
      label: "Admin finance joyride",
      steps: [
        commonStart,
        { target: "page-main", title: "Finance controls", body: "Review orders, verified payments, webhook idempotency, revenue splits, and transfer approval locks." },
        settingsStep
      ]
    }
  },
  {
    match: (pathname) => pathname.startsWith("/admin/dataset-qa"),
    preset: {
      id: "dataset-qa",
      label: "Dataset QA joyride",
      steps: [
        commonStart,
        { target: "page-main", title: "Public preview gate", body: "Dataset QA checks sources, verification status, system type, and Unicode range coverage." },
        settingsStep
      ]
    }
  },
  {
    match: (pathname) => pathname.startsWith("/admin/glyph-qa"),
    preset: {
      id: "glyph-qa",
      label: "Glyph QA joyride",
      steps: [
        commonStart,
        { target: "page-main", title: "Glyph safety", body: "Glyph QA separates verified Unicode samples from verification-required placeholders." },
        settingsStep
      ]
    }
  },
  {
    match: (pathname) => pathname.startsWith("/admin/features"),
    preset: {
      id: "feature-flags",
      label: "Feature flags joyride",
      steps: [
        commonStart,
        { target: "page-main", title: "Rollout controls", body: "Review MVP, Phase 2, Phase 3, roles, plans, and enabled states." },
        settingsStep
      ]
    }
  }
];

export function getJoyridePreset(pathname: string): JoyridePreset {
  return presets.find((item) => item.match(pathname))?.preset ?? {
    id: "generic",
    label: "Page joyride",
    steps: [commonStart, settingsStep]
  };
}
