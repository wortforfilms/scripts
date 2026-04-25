import fs from "node:fs";

const URL = "https://unicode.org/Public/UCD/latest/ucd/Scripts.txt";

type UnicodeRange = {
  start: string;
  end: string;
};

type GeneratedUnicodeScript = {
  name: string;
  slug: string;
  unicodeSupported: true;
  unicodeRanges: UnicodeRange[];
  systemType: "UNKNOWN";
  verificationStatus: "PARTIAL";
  origin: {
    place: null;
    region: null;
    approximateStart: null;
    parentScripts: string[];
    evidenceStatus: "UNKNOWN";
    sources: string[];
  };
  spread: {
    regions: string[];
    routes: string[];
    communities: string[];
    peakPeriod: null;
    evidenceStatus: "UNKNOWN";
  };
  devolution: {
    transformedInto: string[];
    declinedBecause: string[];
    currentStatus: "UNKNOWN";
  };
  books: string[];
  artifacts: string[];
  pitraPakshkaar: {
    ancestors: string[];
    patrons: string[];
    scholars: string[];
    revivalists: string[];
    evidenceStatus: "UNKNOWN";
  };
};

function slugifyUnicodeScript(name: string) {
  return name.toLowerCase().replaceAll("_", "-");
}

async function run() {
  const outputPath = process.argv[2] ?? "unicode-scripts-full.json";
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`Failed to fetch Unicode Scripts.txt: ${res.status} ${res.statusText}`);
  const text = await res.text();

  const map: Record<string, UnicodeRange[]> = {};

  text.split("\n").forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return;

    const [rangePart, scriptPart] = line.split(";");
    if (!scriptPart) return;

    const script = scriptPart.trim().split(/\s|#/)[0];
    const range = rangePart.trim();

    const [start, end] = range.includes("..") ? range.split("..") : [range, range];

    if (!map[script]) map[script] = [];

    map[script].push({
      start: start.toUpperCase(),
      end: end.toUpperCase()
    });
  });

  const result: GeneratedUnicodeScript[] = Object.entries(map).map(([name, ranges]) => ({
    name,
    slug: slugifyUnicodeScript(name),
    unicodeSupported: true,
    unicodeRanges: ranges,
    systemType: "UNKNOWN",
    verificationStatus: "PARTIAL",

    origin: {
      place: null,
      region: null,
      approximateStart: null,
      parentScripts: [],
      evidenceStatus: "UNKNOWN",
      sources: []
    },

    spread: {
      regions: [],
      routes: [],
      communities: [],
      peakPeriod: null,
      evidenceStatus: "UNKNOWN"
    },

    devolution: {
      transformedInto: [],
      declinedBecause: [],
      currentStatus: "UNKNOWN"
    },

    books: [],
    artifacts: [],

    pitraPakshkaar: {
      ancestors: [],
      patrons: [],
      scholars: [],
      revivalists: [],
      evidenceStatus: "UNKNOWN"
    }
  }));

  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);

  console.log(`Generated ${result.length} scripts`);
  console.log(`Wrote ${outputPath}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
