import { motion } from "framer-motion";
import { Target, Users, TrendingUp, Heart } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              এই প্রকল্প সম্পর্কে
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              <span className="text-primary">স্মার্ট কৃষি</span> দিয়ে{" "}
              কৃষকদের ক্ষমতায়ন
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              কৃষি বাংলাদেশের অর্থনীতির মেরুদণ্ড, দেশের ৫০% এর বেশি মানুষ তাদের
              জীবিকার জন্য কৃষির উপর নির্ভরশীল। তবে, অনেক কৃষক এখনও সার প্রয়োগ
              এবং কীটনাশক ব্যবহারের সঠিক তথ্যের অভাবে সমস্যায় পড়েন।
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              আমাদের স্মার্ট সার ও কীটনাশক সুপারিশ ব্যবস্থা এই জ্ঞানের ঘাটতি পূরণ করতে
              তৈরি করা হয়েছে। ফসলের ধরন, মাটির প্রকার, জমির আকার এবং নির্দিষ্ট ফসলের
              রোগবালাই বিবেচনা করে আমরা কৃষকদের সঠিক ও ব্যক্তিগতকৃত সুপারিশ প্রদান করি।
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Target, title: "নির্ভুলতা", desc: "সঠিক সুপারিশ" },
                { icon: Users, title: "কৃষক-কেন্দ্রিক", desc: "সহজ ব্যবহার" },
                { icon: TrendingUp, title: "উৎপাদনশীলতা", desc: "বেশি ফলন" },
                { icon: Heart, title: "টেকসই", desc: "পরিবেশবান্ধব" },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-card rounded-xl"
                >
                  <div className="w-10 h-10 rounded-lg bg-leaf-light flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-primary/20 to-harvest/20 rounded-3xl p-8 md:p-12">
              <div className="absolute top-4 right-4 w-20 h-20 bg-harvest/30 rounded-full blur-2xl" />
              <div className="absolute bottom-8 left-8 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />

              <div className="relative space-y-6">
                <div className="bg-card rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <div className="w-3 h-3 rounded-full bg-harvest" />
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-muted rounded-full w-3/4" />
                    <div className="h-3 bg-muted rounded-full w-1/2" />
                    <div className="h-3 bg-primary/20 rounded-full w-2/3" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 bg-primary text-primary-foreground rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">৫০+</div>
                    <div className="text-sm opacity-80">ফসলের ধরন</div>
                  </div>
                  <div className="flex-1 bg-harvest text-accent-foreground rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">১০০%</div>
                    <div className="text-sm opacity-80">বিনামূল্যে</div>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-4 shadow-lg flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-leaf-light flex items-center justify-center">
                    <span className="text-2xl">🌾</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">শুরু করতে প্রস্তুত?</div>
                    <div className="text-sm text-muted-foreground">আজই আপনার যাত্রা শুরু করুন</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
