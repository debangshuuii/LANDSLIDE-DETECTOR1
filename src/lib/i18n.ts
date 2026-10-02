// Rapid i18n starter: English + Hindi + Assamese + Bengali.
// Covers UI chrome (nav, buttons, key headings). Detail sentences stay in
// English for now — extend per key as translations are verified by speakers.

export type Lang = 'en' | 'hi' | 'as' | 'bn';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'as', label: 'অসমীয়া' },
  { code: 'bn', label: 'বাংলা' },
];

const D: Record<string, Record<Lang, string>> = {
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड', as: 'ডেশ্বৰ্ড', bn: 'ড্যাশবোর্ড' },
  riskmap: { en: 'Risk Map', hi: 'जोखिम मानचित्र', as: 'বিপদ মানচিত্ৰ', bn: 'ঝুঁকি মানচিত্র' },
  monitoring: { en: 'Monitoring', hi: 'निगरानी', as: 'নিৰীক্ষণ', bn: 'পর্যবেক্ষণ' },
  predictions: { en: 'Predictions', hi: 'पूर्वानुमान', as: 'পূৰ্বানুমান', bn: 'পূর্বাভাস' },
  alerts: { en: 'Alerts', hi: 'चेतावनी', as: 'সতৰ্কবাণী', bn: 'সতর্কতা' },
  incidents: { en: 'Incidents', hi: 'घटनाएँ', as: 'ঘটনা', bn: 'ঘটনা' },
  infrastructure: { en: 'Infrastructure', hi: 'अवसंरचना', as: 'আন্তঃগাঁথনি', bn: 'অবকাঠামো' },
  reports: { en: 'Reports', hi: 'रिपोर्ट', as: 'প্ৰতিবেদন', bn: 'প্রতিবেদন' },
  simulation: { en: 'Simulation', hi: 'सिमुलेशन', as: 'অনুকৰণ', bn: 'সিমুলেশন' },
  community: { en: 'Community', hi: 'समुदाय', as: 'সমাজ', bn: 'কমিউনিটি' },
  admin: { en: 'Admin', hi: 'प्रशासन', as: 'প্ৰশাসন', bn: 'অ্যাডমিন' },
  search: { en: 'Search', hi: 'खोजें', as: 'সন্ধান', bn: 'খুঁজুন' },
  go: { en: 'Go', hi: 'जाएँ', as: 'যাওক', bn: 'যান' },
  liveRain: { en: '🌧 Use Live Rain', hi: '🌧 लाइव वर्षा', as: '🌧 লাইভ বৰষুণ', bn: '🌧 লাইভ বৃষ্টি' },
  demoData: { en: '☁ Use Demo Data', hi: '☁ डेमो डेटा', as: '☁ ডেমো তথ্য', bn: '☁ ডেমো তথ্য' },
  refresh: { en: '↻ Refresh rain', hi: '↻ वर्षा ताज़ा करें', as: '↻ বৰষুণ সতেজ', bn: '↻ বৃষ্টি রিফ্রেশ' },
  heavyRain: { en: '▶ Demo: Heavy Rain', hi: '▶ डेमो: भारी वर्षा', as: '▶ ডেমো: ধাৰাসাৰ বৰষুণ', bn: '▶ ডেমো: ভারী বৃষ্টি' },
  resetSim: { en: 'Reset sim', hi: 'रीसेट', as: 'পুনৰ ছেট', bn: 'রিসেট' },
  corridors: { en: 'Highway Corridor Status', hi: 'राजमार्ग गलियारा स्थिति', as: 'ঘাইপথ কৰিডৰ অৱস্থা', bn: 'মহাসড়ক করিডোর অবস্থা' },
  locateMe: { en: '📍 Locate Me', hi: '📍 मेरी स्थिति', as: '📍 মোৰ অৱস্থান', bn: '📍 আমার অবস্থান' },
  openBlocked: { en: 'OPEN', hi: 'खुला', as: 'খোলা', bn: 'খোলা' },
  restricted: { en: 'RESTRICTED', hi: 'प्रतिबंधित', as: 'সীমিত', bn: 'সীমিত' },
  blocked: { en: 'BLOCKED', hi: 'अवरुद्ध', as: 'বন্ধ', bn: 'বন্ধ' },
};

export function t(lang: Lang, key: string): string {
  return D[key]?.[lang] ?? D[key]?.en ?? key;
}
