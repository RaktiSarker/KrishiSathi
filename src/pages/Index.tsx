import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import RecommendationForm from "@/components/RecommendationForm";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import LiveCallButton from "@/components/LiveCallButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <RecommendationForm />
        <AboutSection />
      </main>
      <Footer />
      <LiveCallButton />
    </div>
  );
};

export default Index;
