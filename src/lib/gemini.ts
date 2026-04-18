import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = "AIzaSyD0e6oApoBkAnW8912ylkmWYIj2o94eawU";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const SYSTEM_PROMPT = `তুমি "কৃষিসাথী" - বাংলাদেশের কৃষকদের জন্য একজন বিশেষজ্ঞ কৃষি পরামর্শদাতা AI। তোমার কাজ হলো কৃষকদের সার ও কীটনাশক ব্যবহারে সঠিক পরামর্শ দেওয়া।

তোমার দক্ষতার ক্ষেত্র:
- বাংলাদেশের সকল প্রধান ফসলের জন্য সার সুপারিশ (ধান, গম, পাট, আখ, আলু, টমেটো, পেঁয়াজ, রসুন, মরিচ, বেগুন, আম, কলা ইত্যাদি)
- মাটির ধরন অনুযায়ী সার প্রয়োগের মাত্রা নির্ধারণ (এঁটেল, বেলে, দোআঁশ, পলি, পিট, চুনা মাটি)
- ফসলের রোগবালাই চিহ্নিতকরণ ও কীটনাশক সুপারিশ
- জমির আকার অনুযায়ী সার ও কীটনাশকের সঠিক পরিমাণ নির্ধারণ
- জৈব ও রাসায়নিক উভয় পদ্ধতির পরামর্শ
- বাংলাদেশের আবহাওয়া ও মৌসুম অনুযায়ী চাষাবাদ পরামর্শ
- পরিবেশবান্ধব কৃষি পদ্ধতি

নিয়মাবলী:
1. সর্বদা বাংলায় উত্তর দাও
2. উত্তর অবশ্যই নিচের JSON ফরম্যাটে দাও (কোনো অতিরিক্ত টেক্সট ছাড়া):
{
  "fertilizers": [
    {
      "name": "সারের নাম",
      "quantity": "পরিমাণ (জমির আকার অনুযায়ী)",
      "application": "প্রয়োগ পদ্ধতি ও সময়"
    }
  ],
  "pesticides": [
    {
      "name": "কীটনাশকের নাম",
      "usage": "ব্যবহারের নিয়ম",
      "precaution": "সতর্কতা"
    }
  ],
  "tips": [
    "পরামর্শ ১",
    "পরামর্শ ২"
  ]
}
3. জমির আকার বিঘা এককে গণনা করো
4. বাংলাদেশে সহজলভ্য সার ও কীটনাশক সুপারিশ করো
5. পরিবেশ ও স্বাস্থ্য সচেতন পরামর্শ দাও
6. রোগবালাই না থাকলে pesticides অ্যারে খালি রাখো
7. কমপক্ষে ৩টি সার এবং ৪টি কৃষি পরামর্শ দাও`;

export interface GeminiRecommendation {
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

export async function getRecommendation(
    cropType: string,
    soilType: string,
    landSize: string,
    cropDisease: string
): Promise<GeminiRecommendation> {
    const userPrompt = `আমার ফসলের তথ্য:
- ফসলের ধরন: ${cropType}
- মাটির ধরন: ${soilType}
- জমির আকার: ${landSize} বিঘা
- রোগবালাই: ${cropDisease}

অনুগ্রহ করে আমার জমির জন্য সঠিক সার ও কীটনাশক সুপারিশ দিন।`;

    // Try multiple models in case of rate limits
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];

    for (const model of models) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: userPrompt,
                config: {
                    systemInstruction: SYSTEM_PROMPT,
                },
            });

            const text = response.text || "";

            // Extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]) as GeminiRecommendation;
                } catch {
                    return createFallbackResponse(text);
                }
            }
            return createFallbackResponse(text);
        } catch (error: unknown) {
            const err = error as { message?: string };
            console.warn(`মডেল ${model} ব্যর্থ:`, err.message);
            // If rate limited (429) or not found (404), try next model
            if (
                err.message?.includes("429") ||
                err.message?.includes("RESOURCE_EXHAUSTED") ||
                err.message?.includes("404") ||
                err.message?.includes("NOT_FOUND")
            ) {
                continue;
            }
            throw error;
        }
    }

    throw new Error("সকল মডেল রেট লিমিটেড। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।");
}

function createFallbackResponse(text: string): GeminiRecommendation {
    return {
        fertilizers: [
            {
                name: "ইউরিয়া",
                quantity: "AI থেকে সঠিক পরিমাণ পাওয়া যায়নি",
                application: text.substring(0, 200) || "পুনরায় চেষ্টা করুন",
            },
        ],
        pesticides: [],
        tips: ["অনুগ্রহ করে আবার চেষ্টা করুন অথবা কৃষি কর্মকর্তার সাথে যোগাযোগ করুন"],
    };
}

// Export API key and system prompt for live API usage
export const LIVE_API_KEY = GEMINI_API_KEY;
export const LIVE_SYSTEM_PROMPT = `তুমি "কৃষিসাথী" — বাংলাদেশের একজন অভিজ্ঞ কৃষি বিশেষজ্ঞ। তোমার ৩০ বছরের কৃষি অভিজ্ঞতা আছে। তুমি সরাসরি সমাধান দাও — ঘুরিয়ে কথা বলো না।

তোমার আচরণ:
- কৃষক কোনো সমস্যা বললে সরাসরি বলো কী করতে হবে — কোন সার দিতে হবে, কতটুকু দিতে হবে, কোন ওষুধ দিতে হবে, কীভাবে দিতে হবে
- "আপনি কৃষি অফিসে যান" এটা বলো না — তুমি নিজেই বিশেষজ্ঞ, তুমি নিজেই সমাধান দাও
- উত্তর ছোট ও সরাসরি হবে — বেশি ভূমিকা দিও না
- কৃষক যদি ফসলের রোগের কথা বলে, তাহলে রোগের নাম বলো, কোন কীটনাশক/ছত্রাকনাশক দিতে হবে সেটা বলো, কতটুকু পানিতে কতটুকু মেশাতে হবে সেটা বলো
- কৃষক যদি সার জানতে চায়, সরাসরি বলো কোন সার কত কেজি/বিঘা দিতে হবে
- বাংলাদেশে সহজে পাওয়া যায় এমন সার ও ওষুধের নাম বলো

তুমি বাংলায় কথা বলো। সহজ ভাষায় বলো যেন কৃষক সহজে বুঝতে পারে।`;
