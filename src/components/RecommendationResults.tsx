import { motion } from "framer-motion";
import { FlaskConical, Bug, Lightbulb, AlertTriangle, CheckCircle2 } from "lucide-react";

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

interface FormData {
  cropType: string;
  soilType: string;
  landSize: string;
  cropDisease: string;
}

interface Props {
  recommendation: Recommendation;
  formData: FormData;
}

const RecommendationResults = ({ recommendation, formData }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="mt-8 space-y-6"
    >
      {/* Summary Card */}
      <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
        <h3 className="text-lg font-bold text-foreground mb-3">
          সুপারিশের সারসংক্ষেপ
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">ফসল:</span>{" "}
            <span className="font-medium text-foreground">{formData.cropType}</span>
          </div>
          <div>
            <span className="text-muted-foreground">মাটি:</span>{" "}
            <span className="font-medium text-foreground">{formData.soilType}</span>
          </div>
          <div>
            <span className="text-muted-foreground">জমির আকার:</span>{" "}
            <span className="font-medium text-foreground">{formData.landSize} বিঘা</span>
          </div>
          <div>
            <span className="text-muted-foreground">অবস্থা:</span>{" "}
            <span className="font-medium text-foreground">{formData.cropDisease}</span>
          </div>
        </div>
      </div>

      {/* Fertilizer Recommendations */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl p-6 shadow-card border border-border"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-leaf-light flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">সার সুপারিশ</h3>
            <p className="text-sm text-muted-foreground">আপনার ফসল ও মাটির ধরন অনুযায়ী</p>
          </div>
        </div>

        <div className="space-y-4">
          {recommendation.fertilizers.map((fertilizer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-secondary/50 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-foreground">{fertilizer.name}</h4>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {fertilizer.quantity}
                </span>
              </div>
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {fertilizer.application}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pesticide Recommendations */}
      {recommendation.pesticides.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Bug className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">কীটনাশক সুপারিশ</h3>
              <p className="text-sm text-muted-foreground">{formData.cropDisease} এর জন্য</p>
            </div>
          </div>

          <div className="space-y-4">
            {recommendation.pesticides.map((pesticide, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-secondary/50 rounded-xl p-4"
              >
                <h4 className="font-semibold text-foreground mb-2">{pesticide.name}</h4>
                <p className="text-sm text-muted-foreground mb-2 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  {pesticide.usage}
                </p>
                <p className="text-sm text-destructive/80 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  {pesticide.precaution}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-harvest-light rounded-2xl p-6 border border-harvest/20"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-harvest/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-earth" />
          </div>
          <h3 className="text-lg font-bold text-foreground">কৃষি পরামর্শ</h3>
        </div>

        <ul className="space-y-2">
          {recommendation.tips.map((tip, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-start gap-2 text-sm text-foreground/80"
            >
              <span className="text-harvest font-bold">•</span>
              {tip}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default RecommendationResults;
