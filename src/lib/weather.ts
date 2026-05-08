// Free weather service using Open-Meteo (no API key needed)
// Geocoding: https://open-meteo.com/en/docs/geocoding-api
// Forecast: https://open-meteo.com/
// Archive:  https://open-meteo.com/en/docs/historical-weather-api

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;       // °C
  feelsLike: number;         // °C
  humidity: number;          // %
  windSpeed: number;         // km/h
  precipitation: number;     // mm (last 24h)
  weatherDescription: string;
  season: string;
  uvIndex: number;
}

export type WeatherPeriod = "7d" | "14d" | "30d";

export interface DailyRecord {
  date: string;          // YYYY-MM-DD
  tempMax: number;       // °C
  tempMin: number;       // °C
  tempMean: number;      // °C
  precipitation: number; // mm
  windSpeedMax: number;  // km/h
}

export interface HistoricalWeather {
  period: WeatherPeriod;
  periodLabel: string;           // "গত ৭ দিন"
  avgTempMax: number;
  avgTempMin: number;
  avgTempMean: number;
  totalPrecipitation: number;    // mm total
  avgPrecipitationPerDay: number;
  rainyDays: number;             // days with > 1mm rain
  dryDays: number;
  avgWindSpeed: number;
  maxTempRecorded: number;
  minTempRecorded: number;
  trend: string;                 // e.g. "বৃষ্টিবহুল" | "শুষ্ক" | "স্বাভাবিক"
  dailyRecords: DailyRecord[];
}

interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

// Map WMO weather code to description
function wmoToDescription(code: number): string {
  if (code === 0) return "পরিষ্কার আকাশ";
  if (code <= 3) return "আংশিক মেঘলা";
  if (code <= 9) return "কুয়াশাচ্ছন্ন";
  if (code <= 19) return "হালকা ঝড়বৃষ্টি";
  if (code <= 29) return "বজ্রঝড়";
  if (code <= 39) return "ধূলিঝড়";
  if (code <= 49) return "ঘন কুয়াশা";
  if (code <= 59) return "গুঁড়ি গুঁড়ি বৃষ্টি";
  if (code <= 69) return "বৃষ্টি";
  if (code <= 79) return "তুষারপাত";
  if (code <= 84) return "বৃষ্টিপাত";
  if (code <= 94) return "তুষার ঝড়";
  return "বজ্রঝড়";
}

// Determine season from month & hemisphere
function getSeason(month: number, isNorthern: boolean): string {
  if (isNorthern) {
    if (month >= 3 && month <= 5) return "বসন্ত";
    if (month >= 6 && month <= 8) return "গ্রীষ্ম";
    if (month >= 9 && month <= 11) return "শরৎ";
    return "শীত";
  } else {
    if (month >= 3 && month <= 5) return "শরৎ";
    if (month >= 6 && month <= 8) return "শীত";
    if (month >= 9 && month <= 11) return "বসন্ত";
    return "গ্রীষ্ম";
  }
}

function periodDays(period: WeatherPeriod): number {
  return period === "7d" ? 7 : period === "14d" ? 14 : 30;
}

export function periodLabel(period: WeatherPeriod): string {
  return period === "7d" ? "গত ৭ দিন" : period === "14d" ? "গত ১৪ দিন" : "গত ৩০ দিন";
}

// Format date as YYYY-MM-DD
function fmtDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
}

function classifyTrend(rainyDays: number, totalDays: number, avgTemp: number): string {
  const rainyRatio = rainyDays / totalDays;
  if (rainyRatio > 0.6) return "অতিবৃষ্টি";
  if (rainyRatio > 0.35) return "বৃষ্টিবহুল";
  if (rainyRatio < 0.1) return "অনাবৃষ্টি / শুষ্ক";
  if (avgTemp > 35) return "অতি গরম ও মাঝারি বৃষ্টি";
  if (avgTemp < 15) return "ঠান্ডা ও শুষ্ক";
  return "স্বাভাবিক";
}

export async function geocodeCity(city: string, country: string): Promise<GeoResult | null> {
  const query = `${city}, ${country}`;
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;
  return data.results[0] as GeoResult;
}

export async function fetchWeather(city: string, country: string): Promise<WeatherData | null> {
  try {
    const geo = await geocodeCity(city, country);
    if (!geo) return null;

    const { latitude, longitude } = geo;
    const url = [
      `https://api.open-meteo.com/v1/forecast`,
      `?latitude=${latitude}&longitude=${longitude}`,
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,uv_index`,
      `&daily=precipitation_sum`,
      `&timezone=auto&forecast_days=1`,
    ].join("");

    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const current = data.current;
    const month = new Date().getMonth() + 1;

    return {
      city: geo.name,
      country: geo.country,
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      precipitation: data.daily?.precipitation_sum?.[0] ?? 0,
      weatherDescription: wmoToDescription(current.weather_code),
      season: getSeason(month, latitude >= 0),
      uvIndex: Math.round(current.uv_index ?? 0),
    };
  } catch {
    return null;
  }
}

export async function fetchHistoricalWeather(
  city: string,
  country: string,
  period: WeatherPeriod,
  cachedGeo?: { latitude: number; longitude: number; name: string; country: string } | null
): Promise<HistoricalWeather | null> {
  try {
    const geo = cachedGeo ?? await geocodeCity(city, country);
    if (!geo) return null;

    const days = periodDays(period);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // yesterday (archive ends yesterday)
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (days - 1));

    const url = [
      `https://archive-api.open-meteo.com/v1/archive`,
      `?latitude=${geo.latitude}&longitude=${geo.longitude}`,
      `&start_date=${fmtDate(startDate)}&end_date=${fmtDate(endDate)}`,
      `&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,wind_speed_10m_max`,
      `&timezone=auto`,
    ].join("");

    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    const daily = data.daily;
    const dates: string[] = daily.time ?? [];
    const tempMaxArr: number[] = daily.temperature_2m_max ?? [];
    const tempMinArr: number[] = daily.temperature_2m_min ?? [];
    const tempMeanArr: number[] = daily.temperature_2m_mean ?? [];
    const precipArr: number[] = daily.precipitation_sum ?? [];
    const windArr: number[] = daily.wind_speed_10m_max ?? [];

    const dailyRecords: DailyRecord[] = dates.map((date, i) => ({
      date,
      tempMax: Math.round(tempMaxArr[i] ?? 0),
      tempMin: Math.round(tempMinArr[i] ?? 0),
      tempMean: Math.round(tempMeanArr[i] ?? 0),
      precipitation: Math.round((precipArr[i] ?? 0) * 10) / 10,
      windSpeedMax: Math.round(windArr[i] ?? 0),
    }));

    const rainyDays = precipArr.filter((p) => p > 1).length;
    const totalPrecipitation = Math.round(precipArr.reduce((a, b) => a + b, 0) * 10) / 10;
    const avgMean = avg(tempMeanArr.filter((v) => v != null));

    return {
      period,
      periodLabel: periodLabel(period),
      avgTempMax: avg(tempMaxArr.filter((v) => v != null)),
      avgTempMin: avg(tempMinArr.filter((v) => v != null)),
      avgTempMean: avgMean,
      totalPrecipitation,
      avgPrecipitationPerDay: Math.round((totalPrecipitation / (dates.length || 1)) * 10) / 10,
      rainyDays,
      dryDays: dates.length - rainyDays,
      avgWindSpeed: avg(windArr.filter((v) => v != null)),
      maxTempRecorded: Math.round(Math.max(...tempMaxArr.filter((v) => v != null))),
      minTempRecorded: Math.round(Math.min(...tempMinArr.filter((v) => v != null))),
      trend: classifyTrend(rainyDays, dates.length, avgMean),
      dailyRecords,
    };
  } catch {
    return null;
  }
}
