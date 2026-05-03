import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PresentationSection from "@/components/PresentationSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <PresentationSection />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
