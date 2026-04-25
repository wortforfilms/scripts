import { LandingPageContent } from "../components/home/LandingPageContent";
import { HomeOnboardingFlow } from "../components/onboarding/HomeOnboardingFlow";
import { scriptDatasetStatus, verifiedScriptsSeed } from "../lib/script-data";

export default function HomePage() {
  const dataset = scriptDatasetStatus();
  const verifiedCount = verifiedScriptsSeed.filter((script) => script.verificationStatus === "VERIFIED").length;
  const partialCount = verifiedScriptsSeed.filter((script) => script.verificationStatus === "PARTIAL").length;

  return (
    <HomeOnboardingFlow>
      <LandingPageContent
        datasetCurrent={dataset.current}
        datasetTarget={dataset.target}
        partialCount={partialCount}
        verifiedCount={verifiedCount}
      />
    </HomeOnboardingFlow>
  );
}
