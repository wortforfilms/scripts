import type { FeatureKey } from "../access/types";
import type { ReleasePhase } from "../features/phase-config";

export type ToolCategory =
  | "Script Intelligence"
  | "Glyph & Unicode"
  | "Language & Phonetics"
  | "Dhwani → Granth"
  | "Maataa AI"
  | "Spine Runtime"
  | "Marketplace"
  | "Admin";

export type ToolDefinition = {
  id: string;
  name: string;
  category: ToolCategory;
  phase: ReleasePhase;
  route: string;
  featureKey: FeatureKey;
  description: string;
};

export const toolRegistry = [
  {
    id: "scriptAtlas",
    name: "Script Atlas",
    category: "Script Intelligence",
    phase: "MVP",
    route: "/scripts",
    featureKey: "scriptCatalog",
    description: "Browse sourced script records, verification status, families, regions, and safe glyph policy."
  },
  {
    id: "scriptTree",
    name: "Script Tree",
    category: "Script Intelligence",
    phase: "MVP",
    route: "/tree",
    featureKey: "scriptTree",
    description: "Explore script relationships and verification chains."
  },
  {
    id: "timeline",
    name: "Timeline",
    category: "Script Intelligence",
    phase: "MVP",
    route: "/timeline",
    featureKey: "learningTimeline",
    description: "Study script chronology and learning milestones."
  },
  {
    id: "unicodeVisualizer",
    name: "Unicode Visualizer",
    category: "Glyph & Unicode",
    phase: "MVP",
    route: "/unicode",
    featureKey: "unicodeVisualizer",
    description: "Inspect Unicode-derived script records without inventing glyph samples."
  },
  {
    id: "glyphInspector",
    name: "Glyph Inspector",
    category: "Glyph & Unicode",
    phase: "MVP",
    route: "/glyph",
    featureKey: "glyphInspector",
    description: "Review verified glyph rendering and verification-required placeholders."
  },
  {
    id: "glyphQa",
    name: "Glyph QA",
    category: "Glyph & Unicode",
    phase: "MVP",
    route: "/glyph/qa",
    featureKey: "glyphQa",
    description: "Check public glyph surfaces for safe rendering policy."
  },
  {
    id: "fontQa",
    name: "Font QA",
    category: "Glyph & Unicode",
    phase: "PHASE2",
    route: "/font-qa",
    featureKey: "fontQa",
    description: "Validate font coverage and script-specific typography."
  },
  {
    id: "datasetQa",
    name: "Dataset QA",
    category: "Glyph & Unicode",
    phase: "MVP",
    route: "/dataset-qa",
    featureKey: "datasetQa",
    description: "Audit source coverage, statuses, and incomplete script records."
  },
  {
    id: "ipaMesh",
    name: "IPA Mesh",
    category: "Language & Phonetics",
    phase: "PHASE2",
    route: "/ipa-mesh",
    featureKey: "ipaMesh",
    description: "Map phonetics, IPA relationships, and pronunciation meshes."
  },
  {
    id: "phoneticsLab",
    name: "Phonetics Lab",
    category: "Language & Phonetics",
    phase: "PHASE2",
    route: "/phonetics",
    featureKey: "phoneticsLab",
    description: "Research phonetic features and language sound systems."
  },
  {
    id: "transliterationLab",
    name: "Transliteration Lab",
    category: "Language & Phonetics",
    phase: "PHASE2",
    route: "/transliteration",
    featureKey: "transliterationLab",
    description: "Compare transliteration rules after source review."
  },
  {
    id: "dhwaniGranth",
    name: "Dhwani → Granth",
    category: "Dhwani → Granth",
    phase: "PHASE2",
    route: "/dhwani-granth",
    featureKey: "dhwaniGranth",
    description: "Convert voice and sound study workflows into structured text artifacts."
  },
  {
    id: "granthReader",
    name: "Granth Reader",
    category: "Dhwani → Granth",
    phase: "PHASE2",
    route: "/granth-reader",
    featureKey: "granthReader",
    description: "Read reviewed manuscripts and text packages."
  },
  {
    id: "audioArchive",
    name: "Audio Archive",
    category: "Dhwani → Granth",
    phase: "PHASE3",
    route: "/audio-archive",
    featureKey: "audioArchive",
    description: "Curate speech, recitation, and oral history assets."
  },
  {
    id: "maataaAi",
    name: "Maataa AI",
    category: "Maataa AI",
    phase: "PHASE2",
    route: "/maataa",
    featureKey: "maataaAi",
    description: "AI workbench for reviewed script intelligence tasks."
  },
  {
    id: "aiRjKnowledge",
    name: "AI RJ Knowledge",
    category: "Maataa AI",
    phase: "PHASE2",
    route: "/ai-rj-knowledge",
    featureKey: "aiRjKnowledge",
    description: "Knowledge runtime and feedback workflows for AI RJ."
  },
  {
    id: "ocrWorkbench",
    name: "OCR Workbench",
    category: "Maataa AI",
    phase: "PHASE3",
    route: "/ocr",
    featureKey: "ocrWorkbench",
    description: "OCR experiments after dataset and glyph QA are mature."
  },
  {
    id: "runtimeStatus",
    name: "Runtime Status",
    category: "Spine Runtime",
    phase: "MVP",
    route: "/runtime",
    featureKey: "runtimeStatus",
    description: "Monitor runtime status and production readiness signals."
  },
  {
    id: "spineRuntime",
    name: "Maataa Spine",
    category: "Spine Runtime",
    phase: "MVP",
    route: "/spine",
    featureKey: "spineEvents",
    description: "Stream audit events and runtime activity without sensitive payment data."
  },
  {
    id: "merkleExplorer",
    name: "Merkle Explorer",
    category: "Spine Runtime",
    phase: "MVP",
    route: "/merkle",
    featureKey: "merkleExplorer",
    description: "Inspect proof chains and verifiable event structures."
  },
  {
    id: "marketplace",
    name: "Marketplace",
    category: "Marketplace",
    phase: "MVP",
    route: "/marketplace",
    featureKey: "marketplace",
    description: "Preview approved products while paid launch remains gated."
  },
  {
    id: "checkout",
    name: "Checkout",
    category: "Marketplace",
    phase: "MVP",
    route: "/checkout",
    featureKey: "checkout",
    description: "Create orders and unlock access only from verified payment webhooks."
  },
  {
    id: "userAccess",
    name: "My Access",
    category: "Marketplace",
    phase: "MVP",
    route: "/access",
    featureKey: "userAccess",
    description: "Review paid access grants and entitlements."
  },
  {
    id: "adminCatalog",
    name: "Admin Catalog",
    category: "Admin",
    phase: "MVP",
    route: "/admin/catalog",
    featureKey: "adminCatalog",
    description: "Manage catalog drafts and approval state."
  },
  {
    id: "adminSkuReview",
    name: "SKU Review",
    category: "Admin",
    phase: "MVP",
    route: "/admin/skus/review",
    featureKey: "adminSkuReview",
    description: "Review generated SKUs before approval and publication."
  },
  {
    id: "adminScriptVerification",
    name: "Script Verification",
    category: "Admin",
    phase: "MVP",
    route: "/admin/scripts/verification",
    featureKey: "adminScriptVerification",
    description: "Verify script records and glyph policy."
  },
  {
    id: "adminDatasetQa",
    name: "Dataset QA",
    category: "Admin",
    phase: "MVP",
    route: "/admin/dataset-qa",
    featureKey: "adminDatasetQa",
    description: "Block public preview when records miss sources, statuses, system type, or Unicode metadata."
  },
  {
    id: "adminGlyphQa",
    name: "Glyph QA",
    category: "Admin",
    phase: "MVP",
    route: "/admin/glyph-qa",
    featureKey: "adminGlyphQa",
    description: "Run glyph and font QA and queue review when rendering policy fails."
  },
  {
    id: "adminUnicodeHeatmap",
    name: "Unicode Heatmap",
    category: "Admin",
    phase: "MVP",
    route: "/admin/unicode-heatmap",
    featureKey: "adminUnicodeHeatmap",
    description: "Review Unicode coverage, pass counts, and fail counts for launch gates."
  },
  {
    id: "adminUnicode",
    name: "Unicode Admin",
    category: "Admin",
    phase: "PHASE2",
    route: "/admin/unicode",
    featureKey: "adminUnicode",
    description: "Administer Unicode import and QA batches."
  },
  {
    id: "adminOrders",
    name: "Orders",
    category: "Admin",
    phase: "MVP",
    route: "/admin/orders",
    featureKey: "adminOrders",
    description: "Audit orders and payment verification status."
  },
  {
    id: "adminFinance",
    name: "Finance Ledger",
    category: "Admin",
    phase: "MVP",
    route: "/admin/finance",
    featureKey: "adminFinance",
    description: "Review paid orders, verified payments, webhook idempotency, access unlocks, and split ledger status."
  },
  {
    id: "adminPartnerships",
    name: "Partnerships",
    category: "Admin",
    phase: "MVP",
    route: "/admin/partnerships",
    featureKey: "adminPartnerships",
    description: "Review investor, sponsor, creator, and affiliate intake from public journeys."
  },
  {
    id: "adminSpine",
    name: "Admin Spine",
    category: "Admin",
    phase: "MVP",
    route: "/admin/spine",
    featureKey: "adminSpine",
    description: "Run and inspect Spine jobs and audit events."
  },
  {
    id: "adminFeatures",
    name: "Feature Flags",
    category: "Admin",
    phase: "MVP",
    route: "/admin/features",
    featureKey: "adminFeatures",
    description: "Review rollout phase, roles, plans, and enabled state."
  }
] as const satisfies ToolDefinition[];
