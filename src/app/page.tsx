import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { UseCasesSection } from "@/components/landing/use-cases-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { Footer } from "@/components/landing/footer";
import { CTASection } from "@/components/landing/cta-section";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <UseCasesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
