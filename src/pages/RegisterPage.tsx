import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout, Eye, EyeOff, UserPlus, Loader2, Camera,
  User, Phone, Lock, Globe, MapPin, ChevronRight, ChevronLeft,
} from "lucide-react";
import { useAuth, type RegisterData } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const COUNTRIES = [
  { code: "BD", name: "বাংলাদেশ",   en: "Bangladesh"    },
  { code: "IN", name: "ভারত",        en: "India"          },
  { code: "PK", name: "পাকিস্তান",  en: "Pakistan"       },
  { code: "CN", name: "চীন",         en: "China"          },
  { code: "US", name: "আমেরিকা",    en: "United States"  },
  { code: "BR", name: "ব্রাজিল",    en: "Brazil"         },
  { code: "NG", name: "নাইজেরিয়া", en: "Nigeria"        },
  { code: "ID", name: "ইন্দোনেশিয়া",en: "Indonesia"     },
  { code: "TH", name: "থাইল্যান্ড", en: "Thailand"       },
  { code: "EG", name: "মিশর",        en: "Egypt"          },
];

const STEPS = ["অ্যাকাউন্ট", "ঠিকানা", "অবস্থান"];

const inputClass =
  "w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<RegisterData>({
    name:        "",
    phone:       "",
    password:    "",
    country:     "Bangladesh",
    countryCode: "BD",
    city:        "",
    address:     "",
    profilePic:  null,
  });

  const set = (field: keyof RegisterData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, profilePic: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCountryChange = (code: string) => {
    const c = COUNTRIES.find((x) => x.code === code);
    if (c) setFormData((prev) => ({ ...prev, countryCode: code, country: c.en }));
  };

  const nextStep = () => {
    setError("");
    if (step === 0) {
      if (!formData.name || !formData.phone || !formData.password) {
        setError("নাম, ফোন নম্বর ও পাসওয়ার্ড পূরণ করুন");
        return;
      }
      if (formData.password.length < 6) {
        setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await register(formData);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-green-400/10 dark:bg-green-400/5"
            style={{ width: 180 + i * 90, height: 180 + i * 90, bottom: `${5 + i * 12}%`, right: `${5 + i * 12}%` }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 7 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg"
      >
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-3">
              <Sprout className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">নিবন্ধন করুন</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">কৃষিসাথীতে নতুন অ্যাকাউন্ট খুলুন</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${i <= step ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400"}`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i <= step ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 rounded transition-all ${i < step ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"}`} />}
              </div>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl p-3 mb-4 border border-red-200 dark:border-red-800"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
            <AnimatePresence mode="wait">

              {/* ── Step 0: Account ── */}
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  {/* Profile pic */}
                  <div className="flex flex-col items-center mb-2">
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="w-24 h-24 rounded-full border-4 border-dashed border-green-300 dark:border-green-700 flex items-center justify-center cursor-pointer hover:border-green-500 transition-colors overflow-hidden bg-green-50 dark:bg-green-900/20 relative group"
                    >
                      {previewUrl ? (
                        <img src={previewUrl} alt="profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Camera className="w-7 h-7 text-green-400 mx-auto" />
                          <p className="text-xs text-green-500 mt-1">ছবি যোগ করুন</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <p className="text-xs text-gray-400 mt-2">ঐচ্ছিক — প্রোফাইল ছবি</p>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"><User className="w-3.5 h-3.5" /> পূর্ণ নাম *</label>
                    <input id="reg-name" type="text" value={formData.name} onChange={(e) => set("name", e.target.value)} placeholder="আপনার পূর্ণ নাম" required className={inputClass} />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"><Phone className="w-3.5 h-3.5" /> ফোন নম্বর *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input id="reg-phone" type="tel" value={formData.phone} onChange={(e) => set("phone", e.target.value)} placeholder="যেমন: 01712345678" required className={inputClass + " pl-10"} />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"><Lock className="w-3.5 h-3.5" /> পাসওয়ার্ড *</label>
                    <div className="relative">
                      <input id="reg-password" type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => set("password", e.target.value)} placeholder="কমপক্ষে ৬ অক্ষর" required className={inputClass + " pr-12"} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 1: Address ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"><MapPin className="w-3.5 h-3.5" /> ঠিকানা</label>
                    <textarea
                      id="reg-address"
                      value={formData.address}
                      onChange={(e) => set("address", e.target.value)}
                      placeholder="গ্রাম / ওয়ার্ড / থানা / জেলা"
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-center">এটি ঐচ্ছিক — পরে যোগ করতে পারবেন</p>
                </motion.div>
              )}

              {/* ── Step 2: Location + summary ── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"><Globe className="w-3.5 h-3.5" /> দেশ</label>
                    <select id="reg-country" value={formData.countryCode} onChange={(e) => handleCountryChange(e.target.value)} className={inputClass}>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"><MapPin className="w-3.5 h-3.5" /> শহর / জেলা</label>
                    <input id="reg-city" type="text" value={formData.city} onChange={(e) => set("city", e.target.value)} placeholder="আপনার শহর বা জেলা লিখুন" className={inputClass} />
                  </div>

                  {/* Summary */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-sm space-y-1.5">
                    <p className="font-semibold text-green-700 dark:text-green-400 mb-2">✅ নিবন্ধন সারসংক্ষেপ</p>
                    <p className="text-gray-600 dark:text-gray-400"><span className="font-medium">নাম:</span> {formData.name}</p>
                    <p className="text-gray-600 dark:text-gray-400"><span className="font-medium">ফোন:</span> {formData.phone}</p>
                    <p className="text-gray-600 dark:text-gray-400"><span className="font-medium">দেশ:</span> {COUNTRIES.find(c => c.code === formData.countryCode)?.name}</p>
                    {formData.city    && <p className="text-gray-600 dark:text-gray-400"><span className="font-medium">শহর:</span> {formData.city}</p>}
                    {formData.address && <p className="text-gray-600 dark:text-gray-400"><span className="font-medium">ঠিকানা:</span> {formData.address.slice(0, 60)}{formData.address.length > 60 ? "…" : ""}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <motion.button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 h-12 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" /> পেছনে
                </motion.button>
              )}
              <motion.button
                id={step === 2 ? "register-submit-btn" : "register-next-btn"}
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> নিবন্ধন হচ্ছে...</>
                ) : step < 2 ? (
                  <>পরবর্তী <ChevronRight className="w-5 h-5" /></>
                ) : (
                  <><UserPlus className="w-5 h-5" /> নিবন্ধন করুন</>
                )}
              </motion.button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            আগেই অ্যাকাউন্ট আছে?{" "}
            <Link to="/login" className="text-green-600 dark:text-green-400 font-semibold hover:underline">লগইন করুন</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
