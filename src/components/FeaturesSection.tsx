import { motion } from "framer-motion";
import { Leaf, FlaskConical, BarChart3, Globe, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "ফসল-ভিত্তিক পরামর্শ",
    description: "ধান থেকে সবজি পর্যন্ত আপনি যে ফসল চাষ করছেন তার উপর ভিত্তি করে বিশেষ সুপারিশ পান।",
  },
  {
    icon: FlaskConical,
    title: "মাটি বিশ্লেষণ",
    description: "আপনার মাটির ধরন অনুযায়ী সার সুপারিশ পান যা আপনার জমির জন্য সবচেয়ে উপযুক্ত।",
  },
  {
    icon: BarChart3,
    title: "সঠিক পরিমাণ",
    description: "আপনার জমির আকার অনুযায়ী প্রয়োজনীয় সারের সঠিক পরিমাণ গণনা করুন, অপচয় কমান।",
  },
  {
    icon: Globe,
    title: "স্থানীয় জ্ঞান",
    description: "বাংলাদেশের আবহাওয়া, ফসল এবং কৃষি পদ্ধতির জন্য বিশেষভাবে তৈরি সুপারিশ।",
  },
  {
    icon: Zap,
    title: "তাৎক্ষণিক ফলাফল",
    description: "মুহূর্তেই সুপারিশ পান। কোনো অপেক্ষা নেই, কোনো জটিল ফর্ম পূরণ নেই।",
  },
  {
    icon: Shield,
    title: "রোগবালাই প্রতিরোধ",
    description: "ফসলের রোগ চিহ্নিত করুন এবং আপনার ফসল রক্ষার জন্য সঠিক কীটনাশক সুপারিশ পান।",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 bg-leaf-light text-primary rounded-full text-sm font-medium mb-4">
            সুবিধাসমূহ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            আধুনিক কৃষির জন্য স্মার্ট টুলস
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            আমাদের বুদ্ধিমান সিস্টেম আপনাকে সার ও কীটনাশক ব্যবহারে
            সঠিক সিদ্ধান্ত নিতে সাহায্য করে, যা উন্নত ফলন এবং টেকসই কৃষি নিশ্চিত করে।
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-glow transition-all duration-300 border border-border hover:border-primary/30"
            >
              <div className="w-14 h-14 rounded-xl bg-leaf-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
