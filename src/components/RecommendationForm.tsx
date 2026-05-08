import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Mountain, Ruler, Bug, ArrowRight, RefreshCw, Globe, MapPin, Cloud, Thermometer, Droplets, Wind, Calendar, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import RecommendationResults from "./RecommendationResults";
import { getRecommendation } from "@/lib/gemini";
import { fetchWeather, fetchHistoricalWeather, periodLabel, type WeatherData, type HistoricalWeather, type WeatherPeriod } from "@/lib/weather";

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

// Popular countries with major farming regions
const countries = [
  { code: "BD", name: "বাংলাদেশ", en: "Bangladesh" },
  { code: "IN", name: "ভারত", en: "India" },
  { code: "PK", name: "পাকিস্তান", en: "Pakistan" },
  { code: "CN", name: "চীন", en: "China" },
  { code: "US", name: "আমেরিকা", en: "United States" },
  { code: "BR", name: "ব্রাজিল", en: "Brazil" },
  { code: "NG", name: "নাইজেরিয়া", en: "Nigeria" },
  { code: "ID", name: "ইন্দোনেশিয়া", en: "Indonesia" },
  { code: "TH", name: "থাইল্যান্ড", en: "Thailand" },
  { code: "MM", name: "মিয়ানমার", en: "Myanmar" },
  { code: "VN", name: "ভিয়েতনাম", en: "Vietnam" },
  { code: "EG", name: "মিশর", en: "Egypt" },
];

// Major cities by country code
const citiesByCountry: Record<string, { name: string; en: string }[]> = {
  BD: [
    { name: "ঢাকা", en: "Dhaka" },
    { name: "চট্টগ্রাম", en: "Chittagong" },
    { name: "রাজশাহী", en: "Rajshahi" },
    { name: "খুলনা", en: "Khulna" },
    { name: "সিলেট", en: "Sylhet" },
    { name: "বরিশাল", en: "Barisal" },
    { name: "রংপুর", en: "Rangpur" },
    { name: "ময়মনসিংহ", en: "Mymensingh" },
    { name: "কুমিল্লা", en: "Comilla" },
    { name: "গাজীপুর", en: "Gazipur" },
  ],
  IN: [
    { name: "নয়াদিল্লি", en: "New Delhi" },
    { name: "মুম্বাই", en: "Mumbai" },
    { name: "কলকাতা", en: "Kolkata" },
    { name: "পুনে", en: "Pune" },
    { name: "লখনউ", en: "Lucknow" },
    { name: "পাটনা", en: "Patna" },
    { name: "ভোপাল", en: "Bhopal" },
    { name: "জয়পুর", en: "Jaipur" },
    { name: "চেন্নাই", en: "Chennai" },
    { name: "হায়দ্রাবাদ", en: "Hyderabad" },
  ],
  PK: [
    { name: "করাচি", en: "Karachi" },
    { name: "লাহোর", en: "Lahore" },
    { name: "ইসলামাবাদ", en: "Islamabad" },
    { name: "ফয়সালাবাদ", en: "Faisalabad" },
    { name: "রাওয়ালপিন্ডি", en: "Rawalpindi" },
  ],
  CN: [
    { name: "বেইজিং", en: "Beijing" },
    { name: "সাংহাই", en: "Shanghai" },
    { name: "চেংডু", en: "Chengdu" },
    { name: "উহান", en: "Wuhan" },
    { name: "গুয়াংজু", en: "Guangzhou" },
  ],
  US: [
    { name: "নিউ ইয়র্ক", en: "New York" },
    { name: "লস অ্যাঞ্জেলেস", en: "Los Angeles" },
    { name: "শিকাগো", en: "Chicago" },
    { name: "হিউস্টন", en: "Houston" },
    { name: "ফিনিক্স", en: "Phoenix" },
  ],
  BR: [
    { name: "সাও পাওলো", en: "Sao Paulo" },
    { name: "রিও ডি জেনেইরো", en: "Rio de Janeiro" },
    { name: "ব্রাসিলিয়া", en: "Brasilia" },
    { name: "সালভাদোর", en: "Salvador" },
    { name: "মানাউস", en: "Manaus" },
  ],
  NG: [
    { name: "লাগোস", en: "Lagos" },
    { name: "আবুজা", en: "Abuja" },
    { name: "কানো", en: "Kano" },
    { name: "ইবাদান", en: "Ibadan" },
    { name: "পোর্ট হার্কোর্ট", en: "Port Harcourt" },
  ],
  ID: [
    { name: "জাকার্তা", en: "Jakarta" },
    { name: "সুরাবায়া", en: "Surabaya" },
    { name: "বান্দুং", en: "Bandung" },
    { name: "মেদান", en: "Medan" },
    { name: "যোগ্যাকার্তা", en: "Yogyakarta" },
  ],
  TH: [
    { name: "ব্যাংকক", en: "Bangkok" },
    { name: "চিয়াং মাই", en: "Chiang Mai" },
    { name: "পাত্তায়া", en: "Pattaya" },
    { name: "খোন কায়েন", en: "Khon Kaen" },
    { name: "উডন থানি", en: "Udon Thani" },
  ],
  MM: [
    { name: "ইয়াঙ্গুন", en: "Yangon" },
    { name: "মান্দালয়", en: "Mandalay" },
    { name: "নায়পিদাও", en: "Naypyidaw" },
    { name: "মওলামাইন", en: "Mawlamyine" },
    { name: "বাগো", en: "Bago" },
  ],
  VN: [
    { name: "হ্যানয়", en: "Hanoi" },
    { name: "হো চি মিন সিটি", en: "Ho Chi Minh City" },
    { name: "দা নাং", en: "Da Nang" },
    { name: "হাই ফং", en: "Hai Phong" },
    { name: "ক্যান থো", en: "Can Tho" },
  ],
  EG: [
    { name: "কায়রো", en: "Cairo" },
    { name: "আলেকজান্দ্রিয়া", en: "Alexandria" },
    { name: "গিজা", en: "Giza" },
    { name: "আসওয়ান", en: "Aswan" },
    { name: "লাক্সর", en: "Luxor" },
  ],
};

interface FormData {
  cropType: string;
  soilType: string;
  landSize: string;
  cropDisease: string;
  countryCode: string;
  cityEn: string;
  weatherPeriod: WeatherPeriod;
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

const inputClass =
  "w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all";

const RecommendationForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    cropType: "",
    soilType: "",
    landSize: "",
    cropDisease: "",
    countryCode: "BD",
    cityEn: "",
    weatherPeriod: "7d",
  });
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [historical, setHistorical] = useState<HistoricalWeather | null>(null);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  const currentCities = citiesByCountry[formData.countryCode] ?? [];
  const currentCountry = countries.find((c) => c.code === formData.countryCode);

  const handleCountryChange = (code: string) => {
    setFormData({ ...formData, countryCode: code, cityEn: "" });
    setWeather(null);
    setHistorical(null);
  };

  const handleCityChange = (cityEn: string) => {
    setFormData({ ...formData, cityEn });
    setWeather(null);
    setHistorical(null);
  };

  const handlePeriodChange = (period: WeatherPeriod) => {
    setFormData({ ...formData, weatherPeriod: period });
    setHistorical(null);
  };

  const handleFetchWeather = async () => {
    if (!formData.cityEn || !currentCountry) return;
    setIsFetchingWeather(true);
    setIsFetchingHistory(true);
    setHistorical(null);
    try {
      const [data, hist] = await Promise.all([
        fetchWeather(formData.cityEn, currentCountry.en),
        fetchHistoricalWeather(formData.cityEn, currentCountry.en, formData.weatherPeriod),
      ]);
      if (data) {
        setWeather(data);
      }
      if (hist) {
        setHistorical(hist);
      }
      if (data || hist) {
        toast({ title: "✅ আবহাওয়া তথ্য পাওয়া গেছে!", description: `${data?.city ?? formData.cityEn}, ${currentCountry.en}` });
      } else {
        toast({ title: "আবহাওয়া পাওয়া যায়নি", description: "সঠিক শহরের নাম নির্বাচন করুন।", variant: "destructive" });
      }
    } finally {
      setIsFetchingWeather(false);
      setIsFetchingHistory(false);
    }
  };

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

    let weatherData = weather;
    let historicalData = historical;
    if (formData.cityEn && currentCountry) {
      if (!weatherData || !historicalData) {
        setIsFetchingWeather(true);
        setIsFetchingHistory(true);
        const [wd, hd] = await Promise.all([
          !weatherData ? fetchWeather(formData.cityEn, currentCountry.en) : Promise.resolve(weatherData),
          !historicalData ? fetchHistoricalWeather(formData.cityEn, currentCountry.en, formData.weatherPeriod) : Promise.resolve(historicalData),
        ]);
        weatherData = wd;
        historicalData = hd;
        setWeather(wd);
        setHistorical(hd);
        setIsFetchingWeather(false);
        setIsFetchingHistory(false);
      }
    }

    try {
      const result = await getRecommendation(
        formData.cropType,
        formData.soilType,
        formData.landSize,
        formData.cropDisease,
        weatherData,
        historicalData
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
    setFormData({ cropType: "", soilType: "", landSize: "", cropDisease: "", countryCode: "BD", cityEn: "", weatherPeriod: "7d" });
    setRecommendation(null);
    setWeather(null);
    setHistorical(null);
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
            {/* ── Location Section ── */}
            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                <Globe className="w-4 h-4 text-primary" />
                আবহাওয়া তথ্য (ঐচ্ছিক)
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Country */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Globe className="w-4 h-4 text-primary" />
                    দেশ
                  </label>
                  <select
                    id="country-select"
                    value={formData.countryCode}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className={inputClass}
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* City + Period row */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    শহর / জেলা
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="city-select"
                      value={formData.cityEn}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">শহর নির্বাচন করুন</option>
                      {currentCities.map((city) => (
                        <option key={city.en} value={city.en}>{city.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      id="fetch-weather-btn"
                      onClick={handleFetchWeather}
                      disabled={!formData.cityEn || isFetchingWeather || isFetchingHistory}
                      className="h-12 px-3 rounded-xl border border-primary bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium whitespace-nowrap"
                    >
                      {(isFetchingWeather || isFetchingHistory) ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Cloud className="w-4 h-4" />
                      )}
                      আবহাওয়া
                    </button>
                  </div>
                </div>
              </div>

              {/* Period Selector */}
              <div className="mt-4">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  ঐতিহাসিক তথ্যের সময়কাল
                </label>
                <div className="flex gap-2">
                  {(["7d", "14d", "30d"] as WeatherPeriod[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePeriodChange(p)}
                      className={`flex-1 h-10 rounded-xl border text-sm font-medium transition-all ${
                        formData.weatherPeriod === p
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background text-foreground hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      {periodLabel(p)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Historical Weather Card */}
              <AnimatePresence>
                {historical && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart2 className="w-5 h-5 text-violet-500" />
                        <span className="font-semibold text-foreground text-sm">
                          {historical.periodLabel} — আবহাওয়ার প্রবণতা: <span className="text-violet-600 dark:text-violet-400">{historical.trend}</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white/60 dark:bg-white/5 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-1">গড় তাপমাত্রা</p>
                          <p className="font-bold text-foreground">{historical.avgTempMean}°C</p>
                          <p className="text-xs text-muted-foreground">{historical.avgTempMin}° – {historical.avgTempMax}°</p>
                        </div>
                        <div className="bg-white/60 dark:bg-white/5 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-1">মোট বৃষ্টি</p>
                          <p className="font-bold text-foreground">{historical.totalPrecipitation} mm</p>
                          <p className="text-xs text-muted-foreground">গড় {historical.avgPrecipitationPerDay} mm/দিন</p>
                        </div>
                        <div className="bg-white/60 dark:bg-white/5 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-1">বৃষ্টির দিন</p>
                          <p className="font-bold text-green-600">{historical.rainyDays} দিন</p>
                          <p className="text-xs text-muted-foreground">শুষ্ক: {historical.dryDays} দিন</p>
                        </div>
                        <div className="bg-white/60 dark:bg-white/5 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-1">তাপমাত্রা রেকর্ড</p>
                          <p className="font-bold text-orange-600">{historical.maxTempRecorded}°C</p>
                          <p className="text-xs text-muted-foreground">সর্বনিম্ন: {historical.minTempRecorded}°C</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Current Weather Card */}
              <AnimatePresence>
                {weather && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border border-sky-200 dark:border-sky-800 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Cloud className="w-5 h-5 text-sky-500" />
                        <span className="font-semibold text-foreground text-sm">
                          {weather.city}, {weather.country} — {weather.weatherDescription}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground bg-sky-100 dark:bg-sky-800/50 px-2 py-0.5 rounded-full">
                          {weather.season}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Thermometer className="w-4 h-4 text-orange-500 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">তাপমাত্রা</p>
                            <p className="font-semibold text-foreground">{weather.temperature}°C</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Droplets className="w-4 h-4 text-blue-500 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">আর্দ্রতা</p>
                            <p className="font-semibold text-foreground">{weather.humidity}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Wind className="w-4 h-4 text-teal-500 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">বায়ু</p>
                            <p className="font-semibold text-foreground">{weather.windSpeed} km/h</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Cloud className="w-4 h-4 text-indigo-500 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">বৃষ্টি</p>
                            <p className="font-semibold text-foreground">{weather.precipitation} mm</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <hr className="border-border mb-6" />

            {/* ── Farm Details Section ── */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Crop Type */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sprout className="w-4 h-4 text-primary" />
                  ফসলের ধরন
                </label>
                <select
                  id="crop-type-select"
                  value={formData.cropType}
                  onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                  className={inputClass}
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
                  id="soil-type-select"
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  className={inputClass}
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
                  id="land-size-input"
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="জমির আকার লিখুন"
                  value={formData.landSize}
                  onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                  className={`${inputClass} placeholder:text-muted-foreground`}
                />
              </div>

              {/* Crop Disease */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Bug className="w-4 h-4 text-destructive" />
                  রোগবালাই/পোকামাকড়
                </label>
                <select
                  id="crop-disease-select"
                  value={formData.cropDisease}
                  onChange={(e) => setFormData({ ...formData, cropDisease: e.target.value })}
                  className={inputClass}
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
                id="submit-recommendation-btn"
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
