import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Mountain, Ruler, Bug, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import RecommendationResults from "./RecommendationResults";
import { getRecommendation } from "@/lib/gemini";

const cropTypes = [
  "ধান",
  "গম",
  "পাট",
  "আখ",
  "আলু",
  "টমেটো",
  "পেঁয়াজ",
  "রসুন",
  "মরিচ",
  "বেগুন",
  "আম",
  "কলা",
];

const soilTypes = [
  "এঁটেল মাটি",
  "বেলে মাটি",
  "দোআঁশ মাটি",
  "পলি মাটি",
  "পিট মাটি",
  "চুনা মাটি",
];

const cropDiseases = [
  "কোনো রোগ নেই (সুস্থ)",
  "পাতা পোড়া রোগ",
  "শিকড় পচা রোগ",
  "পাউডারি মিলডিউ",
  "ব্যাকটেরিয়াল উইল্ট",
  "জাব পোকার আক্রমণ",
  "মাজরা পোকা",
  "ছত্রাক সংক্রমণ",
];

interface FormData {
  cropType: string;
  soilType: string;
  landSize: string;
  cropDisease: string;
}

interface Recommendation {
  fertilizers: {
    name: string;
    quantity: string;
    application: string;
  }[];
  pesticides: {
    name: string;
    usage: string;
    precaution: string;
  }[];
  tips: string[];
}

const RecommendationForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    cropType: "",
    soilType: "",
    landSize: "",
    cropDisease: "",
  });
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cropType || !formData.soilType || !formData.landSize || !formData.cropDisease) {
      toast({
        title: "অসম্পূর্ণ তথ্য",
        description: "সুপারিশ পেতে অনুগ্রহ করে সকল তথ্য দিন।",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await getRecommendation(
        formData.cropType,
        formData.soilType,
        formData.landSize,
        formData.cropDisease
      );
      setRecommendation(result);
      toast({
        title: "সুপারিশ প্রস্তুত!",
        description: "আপনার কৃষি সুপারিশ দেখতে নিচে স্ক্রল করুন।",
      });
    } catch (error) {
      console.error("Gemini API error:", error);
      toast({
        title: "ত্রুটি হয়েছে",
        description: "সুপারিশ পেতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cropType: "",
      soilType: "",
      landSize: "",
      cropDisease: "",
    });
    setRecommendation(null);
  };

  return (
    <section id="recommendation" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 bg-harvest-light text-earth rounded-full text-sm font-medium mb-4">
            শুরু করুন
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            আপনার সুপারিশ নিন
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            নিচের তথ্যগুলো পূরণ করুন এবং আমাদের AI সিস্টেম আপনার জমির জন্য
            ব্যক্তিগতকৃত সার ও কীটনাশক সুপারিশ প্রদান করবে।
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onSubmit={handleSubmit}
            className="bg-card rounded-3xl p-8 shadow-card border border-border"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Crop Type */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sprout className="w-4 h-4 text-primary" />
                  ফসলের ধরন
                </label>
                <select
                  value={formData.cropType}
                  onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">ফসল নির্বাচন করুন</option>
                  {cropTypes.map((crop) => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>

              {/* Soil Type */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Mountain className="w-4 h-4 text-earth" />
                  মাটির ধরন
                </label>
                <select
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">মাটির ধরন নির্বাচন করুন</option>
                  {soilTypes.map((soil) => (
                    <option key={soil} value={soil}>{soil}</option>
                  ))}
                </select>
              </div>

              {/* Land Size */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Ruler className="w-4 h-4 text-sky" />
                  জমির আকার (বিঘা)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="জমির আকার লিখুন"
                  value={formData.landSize}
                  onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground"
                />
              </div>

              {/* Crop Disease */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Bug className="w-4 h-4 text-destructive" />
                  রোগবালাই/পোকামাকড়
                </label>
                <select
                  value={formData.cropDisease}
                  onChange={(e) => setFormData({ ...formData, cropDisease: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">রোগবালাই নির্বাচন করুন</option>
                  {cropDiseases.map((disease) => (
                    <option key={disease} value={disease}>{disease}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                type="submit"
                variant="default"
                size="lg"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    বিশ্লেষণ করা হচ্ছে...
                  </>
                ) : (
                  <>
                    সুপারিশ নিন
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
              {recommendation && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={resetForm}
                >
                  <RefreshCw className="w-5 h-5" />
                  রিসেট
                </Button>
              )}
            </div>
          </motion.form>

          {/* Results */}
          <AnimatePresence>
            {recommendation && (
              <RecommendationResults
                recommendation={recommendation}
                formData={formData}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default RecommendationForm;
