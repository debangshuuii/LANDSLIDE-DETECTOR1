// Full-site i18n: English + Hindi + Assamese + Bengali.
// Starter-quality translations — verify with native speakers before any
// official/field use. Place names, soil names and bulletin legal text stay
// in English. {v} is replaced with the runtime value.

export type Lang = 'en' | 'hi' | 'as' | 'bn';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'as', label: 'অসমীয়া' },
  { code: 'bn', label: 'বাংলা' },
];

const D: Record<string, Record<Lang, string>> = {
  // nav
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
  // topbar + search
  search: { en: 'Search', hi: 'खोजें', as: 'সন্ধান', bn: 'খুঁজুন' },
  go: { en: 'Go', hi: 'जाएँ', as: 'যাওক', bn: 'যান' },
  searchPh: { en: 'State / district / village / road — e.g. Shillong', hi: 'राज्य / जिला / गाँव / सड़क — जैसे शिलांग', as: 'ৰাজ্য / জিলা / গাঁও / পথ — যেনে শ্বিলং', bn: 'রাজ্য / জেলা / গ্রাম / সড়ক — যেমন শিলং' },
  typePlace: { en: 'Type a place — e.g. Shillong', hi: 'कोई स्थान लिखें — जैसे शिलांग', as: 'ঠাইৰ নাম লিখক — যেনে শ্বিলং', bn: 'জায়গার নাম লিখুন — যেমন শিলং' },
  noMatch: { en: 'No match for "{v}" — try a district like Aizawl or a road like NH-6', hi: '"{v}" नहीं मिला — आइजोल जैसा जिला या NH-6 जैसी सड़क लिखें', as: '"{v}" পোৱা নগল — আইজলৰ দৰে জিলা বা NH-6ৰ দৰে পথ লিখক', bn: '"{v}" পাওয়া যায়নি — আইজলের মতো জেলা বা NH-6-এর মতো সড়ক লিখুন' },
  liveRain: { en: '🌧 Use Live Rain', hi: '🌧 लाइव वर्षा', as: '🌧 লাইভ বৰষুণ', bn: '🌧 লাইভ বৃষ্টি' },
  demoData: { en: '☁ Use Demo Data', hi: '☁ डेमो डेटा', as: '☁ ডেমো তথ্য', bn: '☁ ডেমো তথ্য' },
  refresh: { en: '↻ Refresh rain', hi: '↻ वर्षा ताज़ा करें', as: '↻ বৰষুণ সতেজ কৰক', bn: '↻ বৃষ্টি রিফ্রেশ করুন' },
  heavyRain: { en: '▶ Demo: Heavy Rain', hi: '▶ डेमो: भारी वर्षा', as: '▶ ডেমো: ধাৰাসাৰ বৰষুণ', bn: '▶ ডেমো: ভারী বৃষ্টি' },
  resetSim: { en: 'Reset sim', hi: 'रीसेट', as: 'পুনৰ ছেট', bn: 'রিসেট' },
  simBadge: { en: 'SIMULATION DATA', hi: 'सिमुलेशन डेटा', as: 'অনুকৰণ তথ্য', bn: 'সিমুলেশন তথ্য' },
  liveBadge: { en: 'LIVE RAIN (Open-Meteo)', hi: 'लाइव वर्षा (Open-Meteo)', as: 'লাইভ বৰষুণ (Open-Meteo)', bn: 'লাইভ বৃষ্টি (Open-Meteo)' },
  fetching: { en: 'Fetching…', hi: 'ला रहे हैं…', as: 'আনিছে…', bn: 'আনছে…' },
  // disclaimer
  dRisk: { en: 'Risk estimates are decision-support information only and do not replace official DDMA/GSI field verification.', hi: 'जोखिम अनुमान केवल निर्णय-सहायता हेतु हैं; ये आधिकारिक DDMA/GSI सत्यापन का विकल्प नहीं हैं।', as: 'বিপদৰ অনুমান কেৱল সিদ্ধান্ত-সহায়ক তথ্য; এইবোৰ চৰকাৰী DDMA/GSI পৰীক্ষাৰ বিকল্প নহয়।', bn: 'ঝুঁকির অনুমান শুধু সিদ্ধান্ত-সহায়ক তথ্য; এগুলো সরকারি DDMA/GSI যাচাইয়ের বিকল্প নয়।' },
  dLive: { en: 'Rainfall is LIVE from Open-Meteo (free API, no key)', hi: 'वर्षा Open-Meteo से लाइव है (मुफ्त API)', as: 'বৰষুণ Open-Meteoৰ পৰা লাইভ (বিনামূলীয়া API)', bn: 'বৃষ্টি Open-Meteo থেকে লাইভ (বিনামূল্যে API)' },
  dEst: { en: 'soil moisture is estimated from rain, not a sensor.', hi: 'मृदा नमी वर्षा से अनुमानित है, सेंसर से नहीं।', as: 'মাটিৰ আৰ্দ্ৰতা বৰষুণৰ পৰা অনুমান কৰা, চেন্সৰৰ পৰা নহয়।', bn: 'মাটির আর্দ্রতা বৃষ্টি থেকে অনুমান করা, সেন্সর থেকে নয়।' },
  dDemo: { en: 'Rainfall, soil-moisture and model outputs are simulated demo data — press 🌧 Use Live Rain for real rain.', hi: 'वर्षा, मृदा नमी और मॉडल परिणाम सिमुलेटेड डेमो डेटा हैं — असली वर्षा हेतु 🌧 लाइव वर्षा दबाएँ।', as: 'বৰষুণ, মাটিৰ আৰ্দ্ৰতা আৰু মডেলৰ ফলাফল অনুকৰণমূলক ডেমো তথ্য — প্ৰকৃত বৰষুণৰ বাবে 🌧 লাইভ বৰষুণ টিপক।', bn: 'বৃষ্টি, মাটির আর্দ্রতা ও মডেলের ফলাফল সিমুলেটেড ডেমো তথ্য — আসল বৃষ্টির জন্য 🌧 লাইভ বৃষ্টি চাপুন।' },
  dHist: { en: 'Historical rows marked DEMO are synthetic placeholders.', hi: 'DEMO चिह्नित ऐतिहासिक पंक्तियाँ काल्पनिक हैं।', as: 'DEMO চিহ্নিত ঐতিহাসিক শাৰীবোৰ কাল্পনিক।', bn: 'DEMO চিহ্নিত ঐতিহাসিক সারিগুলো কাল্পনিক।' },
  fetched: { en: 'fetched {v}', hi: 'प्राप्त {v}', as: 'পোৱা {v}', bn: 'পাওয়া {v}' },
  // dashboard
  regRisk: { en: 'Current Regional Risk', hi: 'वर्तमान क्षेत्रीय जोखिम', as: 'বৰ্তমান আঞ্চলিক বিপদ', bn: 'বর্তমান আঞ্চলিক ঝুঁকি' },
  highest: { en: 'Highest zone', hi: 'सर्वाधिक जोखिम क्षेत्र', as: 'সৰ্বাধিক বিপদৰ অঞ্চল', bn: 'সর্বোচ্চ ঝুঁকির অঞ্চল' },
  recomputedLive: { en: 'LIVE rain + terrain', hi: 'लाइव वर्षा + भूभाग', as: 'লাইভ বৰষুণ + ভূ-ভাগ', bn: 'লাইভ বৃষ্টি + ভূমি' },
  recomputedSim: { en: 'simulated rainfall + terrain', hi: 'सिमुलेटेड वर्षा + भूभाग', as: 'অনুকৰণমূলক বৰষুণ + ভূ-ভাগ', bn: 'সিমুলেটেড বৃষ্টি + ভূমি' },
  lastUpd: { en: 'Last updated', hi: 'अंतिम अद्यतन', as: 'শেহতীয়া আপডেট', bn: 'সর্বশেষ হালনাগাদ' },
  areasMon: { en: 'Areas monitored', hi: 'निगरानी क्षेत्र', as: 'নিৰীক্ষণ কৰা অঞ্চল', bn: 'পর্যবেক্ষণাধীন এলাকা' },
  highCrit: { en: 'High + Critical zones', hi: 'उच्च + गंभीर क्षेत्र', as: 'উচ্চ + সংকটজনক অঞ্চল', bn: 'উচ্চ + সংকটজনক অঞ্চল' },
  activeWarn: { en: 'Active warnings', hi: 'सक्रिय चेतावनी', as: 'সক্ৰিয় সতৰ্কবাণী', bn: 'সক্রিয় সতর্কতা' },
  popExp: { en: 'Population potentially exposed', hi: 'संभावित प्रभावित जनसंख्या', as: 'সম্ভাৱ্য প্ৰভাৱিত জনসংখ্যা', bn: 'সম্ভাব্য ক্ষতিগ্রস্ত জনসংখ্যা' },
  topZones: { en: 'Top risk zones (click to inspect)', hi: 'शीर्ष जोखिम क्षेत्र (जाँच हेतु क्लिक करें)', as: 'শীৰ্ষ বিপদ অঞ্চল (চাবলৈ ক্লিক কৰক)', bn: 'শীর্ষ ঝুঁকির অঞ্চল (দেখতে ক্লিক করুন)' },
  thPlace: { en: 'Place', hi: 'स्थान', as: 'ঠাই', bn: 'জায়গা' },
  thRain: { en: 'Rain 24h', hi: 'वर्षा 24घं', as: 'বৰষুণ ২৪ঘণ্টা', bn: 'বৃষ্টি ২৪ঘণ্টা' },
  thScore: { en: 'Score', hi: 'स्कोर', as: 'স্ক’ৰ', bn: 'স্কোর' },
  thLevel: { en: 'Level', hi: 'स्तर', as: 'স্তৰ', bn: 'স্তর' },
  rainChart: { en: '24h rainfall vs {v}mm avg', hi: '24घं वर्षा बनाम {v}मिमी औसत', as: '২৪ঘণ্টাৰ বৰষুণ বনাম {v}মিমি গড়', bn: '২৪ঘণ্টার বৃষ্টি বনাম {v}মিমি গড়' },
  judgeDemo: { en: 'Judge demo storyline (MONITOR → RESPOND)', hi: 'डेमो कहानी (निगरानी → प्रतिक्रिया)', as: 'ডেমো কাহিনী (নিৰীক্ষণ → সঁহাৰি)', bn: 'ডেমো কাহিনী (পর্যবেক্ষণ → সাড়া)' },
  s1: { en: 'Open Risk Map, select Dima Hasao / Haflong — note the baseline risk.', hi: 'जोखिम मानचित्र खोलें, डिमा हसाओ / हाफलांग चुनें।', as: 'বিপদ মানচিত্ৰ খোলক, ডিমা হাছাও / হাফলং বাছক।', bn: 'ঝুঁকি মানচিত্র খুলুন, ডিমা হাসাও / হাফলং বেছে নিন।' },
  s2: { en: 'Press ▶ Demo: Heavy Rain — rainfall +80mm, AI re-scores.', hi: '▶ डेमो: भारी वर्षा दबाएँ — वर्षा +80मिमी, AI पुनः स्कोर करेगा।', as: '▶ ডেমো: ধাৰাসাৰ বৰষুণ টিপক — বৰষুণ +৮০মিমি, AI-এ পুনৰ স্ক’ৰ কৰিব।', bn: '▶ ডেমো: ভারী বৃষ্টি চাপুন — বৃষ্টি +৮০মিমি, AI পুনরায় স্কোর করবে।' },
  s3: { en: 'Marker turns ORANGE/RED; open Alerts — warning generated with reason + action.', hi: 'चिह्न नारंगी/लाल होगा; चेतावनी में कारण + कार्रवाई देखें।', as: 'চিহ্ন কমলা/ৰঙা হ’ব; সতৰ্কবাণীত কাৰণ + ব্যৱস্থা চাওক।', bn: 'চিহ্ন কমলা/লাল হবে; সতর্কতায় কারণ + ব্যবস্থা দেখুন।' },
  s4: { en: 'Open Infrastructure — exposed roads/rail appear.', hi: 'अवसंरचना खोलें — प्रभावित सड़क/रेल दिखेंगी।', as: 'আন্তঃগাঁথনি খোলক — প্ৰভাৱিত পথ/ৰেল দেখা যাব।', bn: 'অবকাঠামো খুলুন — ক্ষতিগ্রস্ত সড়ক/রেল দেখা যাবে।' },
  s5: { en: 'Open Community — submit a field report; verify it in Admin.', hi: 'समुदाय खोलें — रिपोर्ट भेजें; प्रशासन में सत्यापित करें।', as: 'সমাজ খোলক — প্ৰতিবেদন পঠাওক; প্ৰশাসনত সত্যাপন কৰক।', bn: 'কমিউনিটি খুলুন — রিপোর্ট পাঠান; অ্যাডমিনে যাচাই করুন।' },
  // map
  riskZones: { en: 'risk zones', hi: 'जोखिम क्षेत्र', as: 'বিপদ অঞ্চল', bn: 'ঝুঁকি অঞ্চল' },
  rainHalos: { en: 'rainfall halos', hi: 'वर्षा प्रभामंडल', as: 'বৰষুণৰ বৃত্ত', bn: 'বৃষ্টির বলয়' },
  historical: { en: 'historical', hi: 'ऐतिहासिक', as: 'ঐতিহাসিক', bn: 'ঐতিহাসিক' },
  infraLyr: { en: 'infrastructure', hi: 'अवसंरचना', as: 'আন্তঃগাঁথনি', bn: 'অবকাঠামো' },
  baseMap: { en: 'Base map', hi: 'आधार मानचित्र', as: 'মূল মানচিত্ৰ', bn: 'মূল মানচিত্র' },
  streets: { en: 'Streets', hi: 'सड़कें', as: 'ৰাস্তা', bn: 'রাস্তা' },
  topo: { en: 'Topo', hi: 'स्थलाकृति', as: 'ভূ-প্ৰকৃতি', bn: 'ভূ-প্রকৃতি' },
  satellite: { en: 'Satellite', hi: 'उपग्रह', as: 'উপগ্ৰহ', bn: 'স্যাটেলাইট' },
  locMe: { en: '📍 Locate Me', hi: '📍 मेरी स्थिति', as: '📍 মোৰ অৱস্থান', bn: '📍 আমার অবস্থান' },
  locating: { en: 'Locating…', hi: 'स्थिति खोज रहे हैं…', as: 'অৱস্থান বিচাৰি আছে…', bn: 'অবস্থান খুঁজছে…' },
  locBlocked: { en: 'Location blocked — allow GPS permission and retry.', hi: 'स्थान अवरुद्ध — GPS अनुमति दें और पुनः प्रयास करें।', as: 'অৱস্থান বন্ধ — GPS অনুমতি দি পুনৰ চেষ্টা কৰক।', bn: 'অবস্থান বন্ধ — GPS অনুমতি দিন ও আবার চেষ্টা করুন।' },
  noGeo: { en: 'Geolocation not supported on this device', hi: 'इस डिवाइस पर स्थान सुविधा नहीं है', as: 'এই যন্ত্ৰত অৱস্থান সুবিধা নাই', bn: 'এই ডিভাইসে অবস্থান সুবিধা নেই' },
  // detail
  locDetail: { en: 'Location detail', hi: 'स्थान विवरण', as: 'ঠাইৰ বিৱৰণ', bn: 'জায়গার বিবরণ' },
  estProb: { en: 'model prediction, not certainty', hi: 'मॉडल अनुमान, निश्चितता नहीं', as: 'মডেলৰ অনুমান, নিশ্চয়তা নহয়', bn: 'মডেলের অনুমান, নিশ্চয়তা নয়' },
  whyRisk: { en: 'Why is this area at risk?', hi: 'यह क्षेत्र जोखिम में क्यों है?', as: 'এই অঞ্চল বিপদত কিয়?', bn: 'এই এলাকা ঝুঁকিতে কেন?' },
  recAction: { en: 'Recommended action', hi: 'अनुशंसित कार्रवाई', as: 'পৰামৰ্শিত ব্যৱস্থা', bn: 'প্রস্তাবিত ব্যবস্থা' },
  dataStatus: { en: 'Data status', hi: 'डेटा स्थिति', as: 'তথ্যৰ অৱস্থা', bn: 'তথ্যের অবস্থা' },
  liveEst: { en: 'LIVE RAIN + estimated moisture', hi: 'लाइव वर्षा + अनुमानित नमी', as: 'লাইভ বৰষুণ + অনুমানিত আৰ্দ্ৰতা', bn: 'লাইভ বৃষ্টি + আনুমানিক আর্দ্রতা' },
  genWarn: { en: 'Generate warning', hi: 'चेतावनी बनाएँ', as: 'সতৰ্কবাণী সৃষ্টি কৰক', bn: 'সতর্কতা তৈরি করুন' },
  openSim: { en: 'Open What-If simulator', hi: 'What-If सिम्युलेटर खोलें', as: 'What-If অনুকৰণ খোলক', bn: 'What-If সিমুলেটর খুলুন' },
  terrainSchem: { en: 'Terrain transect (schematic, not surveyed)', hi: 'भू-भाग परिच्छेद (रेखाचित्र, सर्वेक्षित नहीं)', as: 'ভূ-ভাগৰ প্ৰস্থচ্ছেদ (আঁক, জৰীপ নহয়)', bn: 'ভূমির প্রস্থচ্ছেদ (পরিকল্পিত, জরিপ নয়)' },
  idCheck: { en: 'I-D check (Caine curve)', hi: 'I-D जाँच (Caine वक्र)', as: 'I-D পৰীক্ষা (Caine ৰেখা)', bn: 'I-D পরীক্ষা (Caine রেখা)' },
  exceeded: { en: 'EXCEEDED', hi: 'पार', as: 'অতিক্ৰম', bn: 'অতিক্রম' },
  okWord: { en: 'OK', hi: 'ठीक', as: 'ঠিক', bn: 'ঠিক' },
  // monitoring
  rainMon: { en: 'Rainfall monitoring', hi: 'वर्षा निगरानी', as: 'বৰষুণ নিৰীক্ষণ', bn: 'বৃষ্টি পর্যবেক্ষণ' },
  liveFeed: { en: 'LIVE FEED (Open-Meteo)', hi: 'लाइव फीड (Open-Meteo)', as: 'লাইভ ফিড (Open-Meteo)', bn: 'লাইভ ফিড (Open-Meteo)' },
  simFeed: { en: 'SIMULATED FEED', hi: 'सिमुलेटेड फीड', as: 'অনুকৰণমূলক ফিড', bn: 'সিমুলেটেড ফিড' },
  thZone: { en: 'Zone', hi: 'क्षेत्र', as: 'অঞ্চল', bn: 'অঞ্চল' },
  th24: { en: '24h', hi: '24घं', as: '২৪ঘণ্টা', bn: '২৪ঘণ্টা' },
  th7: { en: '7d', hi: '7दिन', as: '৭দিন', bn: '৭দিন' },
  thAnom: { en: 'Anomaly vs {v}mm', hi: '{v}मिमी से विचलन', as: '{v}মিমিৰ তুলনাত ব্যতিক্ৰম', bn: '{v}মিমির তুলনায় ব্যতিক্রম' },
  thMoist: { en: 'Soil moist.', hi: 'मृदा नमी', as: 'মাটিৰ আৰ্দ্ৰতা', bn: 'মাটির আর্দ্রতা' },
  // predictions
  trend24: { en: 'Next-24h risk trend', hi: 'अगले 24घं जोखिम प्रवृत्ति', as: 'পৰৱৰ্তী ২৪ঘণ্টাৰ বিপদৰ গতি', bn: 'পরবর্তী ২৪ঘণ্টার ঝুঁকির গতি' },
  modelPred: { en: 'MODEL PREDICTION', hi: 'मॉडल पूर्वानुमान', as: 'মডেল পূৰ্বানুমান', bn: 'মডেল পূর্বাভাস' },
  estTraj: { en: 'Estimated trajectory if rainfall persists. Not a guaranteed occurrence.', hi: 'वर्षा जारी रहे तो अनुमानित प्रवृत्ति। निश्चित घटना नहीं।', as: 'বৰষুণ চলি থাকিলে অনুমানিত গতি। নিশ্চিত ঘটনা নহয়।', bn: 'বৃষ্টি চলতে থাকলে আনুমানিক গতি। নিশ্চিত ঘটনা নয়।' },
  aiExplain: { en: 'AI explanation panel', hi: 'AI व्याख्या पैनल', as: 'AI ব্যাখ্যা পেনেল', bn: 'AI ব্যাখ্যা প্যানেল' },
  confidence: { en: 'Confidence: heuristic ensemble (weighted logistic, demo weights)', hi: 'विश्वास: अनुमानी समूह (भारित लॉजिस्टिक, डेमो भार)', as: 'আস্থা: অনুমানভিত্তিক গোট (ওজনযুক্ত লজিষ্টিক, ডেমো ওজন)', bn: 'আস্থা: অনুমানভিত্তিক সমষ্টি (ওজনযুক্ত লজিস্টিক, ডেমো ওজন)' },
  fcTitle: { en: '72h precipitation outlook', hi: '72घं वर्षा परिदृश्य', as: '৭২ঘণ্টীয়া বৰষুণৰ পূৰ্বাভাস', bn: '৭২ঘণ্টার বৃষ্টির পূর্বাভাস' },
  liveFc: { en: 'LIVE FORECAST', hi: 'लाइव पूर्वानुमान', as: 'লাইভ পূৰ্বাভাস', bn: 'লাইভ পূর্বাভাস' },
  fcLoading: { en: 'Loading forecast…', hi: 'पूर्वानुमान लोड हो रहा…', as: 'পূৰ্বাভাস আহি আছে…', bn: 'পূর্বাভাস আসছে…' },
  fcTotal: { en: '72h total ≈ {v} mm (Open-Meteo, 3h blocks). If this lands on saturated soil, expect the risk score to climb — re-check Monitoring.', hi: '72घं कुल ≈ {v} मिमी। गीली मिट्टी पर गिरे तो जोखिम बढ़ेगा — निगरानी पुनः देखें।', as: '৭২ঘণ্টাৰ মুঠ ≈ {v} মিমি। তিতা মাটিত পৰিলে বিপদ বাঢ়িব — নিৰীক্ষণ পুনৰ চাওক।', bn: '৭২ঘণ্টার মোট ≈ {v} মিমি। ভেজা মাটিতে পড়লে ঝুঁকি বাড়বে — পর্যবেক্ষণ আবার দেখুন।' },
  // alerts
  earlyWarn: { en: 'Early warnings (GREEN→YELLOW→ORANGE→RED)', hi: 'पूर्व चेतावनी (हरा→पीला→नारंगी→लाल)', as: 'আগতীয়া সতৰ্কবাণী (সেউজ→হালধীয়া→কমলা→ৰঙা)', bn: 'আগাম সতর্কতা (সবুজ→হলুদ→কমলা→লাল)' },
  genFor: { en: 'Generate for {v}', hi: '{v} हेतु बनाएँ', as: '{v}ৰ বাবে সৃষ্টি কৰক', bn: '{v}-এর জন্য তৈরি করুন' },
  noAlerts: { en: 'No alerts yet. Run the Heavy-Rain demo or generate one manually.', hi: 'अभी कोई चेतावनी नहीं। भारी-वर्षा डेमो चलाएँ या स्वयं बनाएँ।', as: 'এতিয়াও সতৰ্কবাণী নাই। ধাৰাসাৰ বৰষুণ ডেমো চলাওক বা নিজে সৃষ্টি কৰক।', bn: 'এখনও সতর্কতা নেই। ভারী-বৃষ্টি ডেমো চালান বা নিজে তৈরি করুন।' },
  ack: { en: 'Acknowledge', hi: 'स्वीकार करें', as: 'গ্ৰহণ কৰক', bn: 'গ্রহণ করুন' },
  unack: { en: 'Unack', hi: 'वापस लें', as: 'ঘূৰাওক', bn: 'ফেরত নিন' },
  clearAll: { en: '🗑 Clear all ({v})', hi: '🗑 सभी हटाएँ ({v})', as: '🗑 সকলো মচক ({v})', bn: '🗑 সব মুছুন ({v})' },
  clearConfirm: { en: 'Delete all {v} alerts? This cannot be undone.', hi: 'सभी {v} चेतावनियाँ हटाएँ? यह वापस नहीं होगा।', as: 'সকলো {v}টা সতৰ্কবাণী মচিবনে? এইটো ঘূৰাই পোৱা নাযাব।', bn: 'সব {v}টি সতর্কতা মুছবেন? এটি ফেরত পাওয়া যাবে না।' },
  // incidents
  histDb: { en: 'Historical landslide database', hi: 'ऐतिहासिक भूस्खलन डेटाबेस', as: 'ঐতিহাসিক ভূমিস্খলন তথ্যভঁৰাল', bn: 'ঐতিহাসিক ভূমিধস তথ্যভাণ্ডার' },
  thDate: { en: 'Date', hi: 'तिथि', as: 'তাৰিখ', bn: 'তারিখ' },
  thTrigger: { en: 'Trigger', hi: 'कारण', as: 'কাৰণ', bn: 'কারণ' },
  thSev: { en: 'Severity', hi: 'गंभीरता', as: 'গুৰুতৰতা', bn: 'তীব্রতা' },
  thImpact: { en: 'Impact', hi: 'प्रभाव', as: 'প্ৰভাৱ', bn: 'প্রভাব' },
  thSource: { en: 'Source', hi: 'स्रोत', as: 'উৎস', bn: 'উৎস' },
  // infra
  critInfra: { en: 'Critical infrastructure exposure', hi: 'महत्वपूर्ण अवसंरचना जोखिम', as: 'গুৰুত্বপূৰ্ণ আন্তঃগাঁথনিৰ বিপদ', bn: 'গুরুত্বপূর্ণ অবকাঠামোর ঝুঁকি' },
  potExp: { en: 'POTENTIALLY EXPOSED', hi: 'संभावित प्रभावित', as: 'সম্ভাৱ্য প্ৰভাৱিত', bn: 'সম্ভাব্য ক্ষতিগ্রস্ত' },
  thRisk: { en: 'Risk', hi: 'जोखिम', as: 'বিপদ', bn: 'ঝুঁকি' },
  thRoads: { en: 'Roads', hi: 'सड़कें', as: 'পথ', bn: 'সড়ক' },
  thInfra: { en: 'Infra', hi: 'अवसंरचना', as: 'আন্তঃগাঁথনি', bn: 'অবকাঠামো' },
  thPop: { en: 'Population', hi: 'जनसंख्या', as: 'জনসংখ্যা', bn: 'জনসংখ্যা' },
  roadNote: { en: 'Road risk: segments within ~300m of HIGH/CRITICAL zones flagged for increased monitoring. Do not claim damage unless field-verified.', hi: 'सड़क जोखिम: उच्च/गंभीर क्षेत्रों के ~300मी के खंड निगरानी हेतु चिह्नित। सत्यापन बिना क्षति का दावा न करें।', as: 'পথৰ বিপদ: উচ্চ/সংকটজনক অঞ্চলৰ ~৩০০মি খণ্ড নিৰীক্ষণৰ বাবে চিহ্নিত। পৰীক্ষা নকৰাকৈ ক্ষতিৰ দাবী নকৰিব।', bn: 'সড়ক ঝুঁকি: উচ্চ/সংকটজনক অঞ্চলের ~৩০০মি অংশ পর্যবেক্ষণের জন্য চিহ্নিত। যাচাই ছাড়া ক্ষতির দাবি করবেন না।' },
  // corridors
  corrTitle: { en: 'Highway Corridor Status', hi: 'राजमार्ग गलियारा स्थिति', as: 'ঘাইপথ কৰিডৰ অৱস্থা', bn: 'মহাসড়ক করিডোর অবস্থা' },
  demoRule: { en: 'DEMO RULE (worst zone risk)', hi: 'डेमो नियम (सर्वाधिक क्षेत्र जोखिम)', as: 'ডেমো নিয়ম (সৰ্বাধিক অঞ্চলৰ বিপদ)', bn: 'ডেমো নিয়ম (সর্বাধিক অঞ্চলের ঝুঁকি)' },
  thCorr: { en: 'Corridor', hi: 'गलियारा', as: 'কৰিডৰ', bn: 'করিডোর' },
  thSeg: { en: 'Segment', hi: 'खंड', as: 'খণ্ড', bn: 'খণ্ড' },
  thStatus: { en: 'Status', hi: 'स्थिति', as: 'অৱস্থা', bn: 'অবস্থা' },
  thBypass: { en: 'Bypass if cut', hi: 'कटने पर वैकल्पिक मार्ग', as: 'কটা গ’লে বিকল্প পথ', bn: 'কাটা গেলে বিকল্প পথ' },
  stOpen: { en: 'OPEN', hi: 'खुला', as: 'খোলা', bn: 'খোলা' },
  stRestr: { en: 'RESTRICTED', hi: 'प्रतिबंधित', as: 'সীমিত', bn: 'সীমিত' },
  stBlocked: { en: 'BLOCKED', hi: 'अवरुद्ध', as: 'বন্ধ', bn: 'বন্ধ' },
  // reports
  bulTitle: { en: 'Official disaster bulletin', hi: 'आधिकारिक आपदा बुलेटिन', as: 'চৰকাৰী দুৰ্যোগ বুলেটিন', bn: 'সরকারি দুর্যোগ বুলেটিন' },
  bulDesc: { en: 'Publication-grade A4 bulletin below. Print opens a clean PDF dialog; CSV is a 19-column audit register.', hi: 'नीचे प्रकाशन-स्तरीय A4 बुलेटिन। प्रिंट से साफ PDF खुलेगा; CSV 19-कॉलम ऑडिट रजिस्टर है।', as: 'তলত প্ৰকাশন মানৰ A4 বুলেটিন। প্ৰিণ্টত পৰিষ্কাৰ PDF খুলিব; CSV ১৯-স্তম্ভৰ অডিট ৰেজিষ্টাৰ।', bn: 'নীচে প্রকাশন-মানের A4 বুলেটিন। প্রিন্টে পরিষ্কার PDF খুলবে; CSV ১৯-কলামের অডিট রেজিস্টার।' },
  printPdf: { en: '🖨 Print / PDF bulletin (live)', hi: '🖨 प्रिंट / PDF बुलेटिन (लाइव)', as: '🖨 প্ৰিণ্ট / PDF বুলেটিন (লাইভ)', bn: '🖨 প্রিন্ট / PDF বুলেটিন (লাইভ)' },
  syncing: { en: 'Syncing live data…', hi: 'लाइव डेटा समन्वय…', as: 'লাইভ তথ্য মিলাই আছে…', bn: 'লাইভ তথ্য মিলাচ্ছে…' },
  auditCsv: { en: '⬇ Export audit CSV (19 cols)', hi: '⬇ ऑडिट CSV निर्यात (19 कॉलम)', as: '⬇ অডিট CSV ৰপ্তানি (১৯ স্তম্ভ)', bn: '⬇ অডিট CSV রপ্তানি (১৯ কলাম)' },
  fieldMode: { en: 'Field mode (mobile-first)', hi: 'फील्ड मोड (मोबाइल-प्रथम)', as: 'ক্ষেত্ৰ মোড (ম’বাইল-প্ৰথম)', bn: 'ফিল্ড মোড (মোবাইল-প্রথম)' },
  fieldDesc: { en: 'Current location → nearby risk → one-tap report → emergency contacts. Drafts queue offline; sync when online.', hi: 'वर्तमान स्थान → निकट जोखिम → एक-टैप रिपोर्ट → आपात संपर्क। ड्राफ्ट ऑफ़लाइन सहेजें।', as: 'বৰ্তমান অৱস্থান → ওচৰৰ বিপদ → এক-টেপ প্ৰতিবেদন → জৰুৰী যোগাযোগ। খচৰা অফলাইনত ৰ’ব।', bn: 'বর্তমান অবস্থান → কাছের ঝুঁকি → এক-ট্যাপ রিপোর্ট → জরুরি যোগাযোগ। খসড়া অফলাইনে থাকবে।' },
  nearby: { en: 'Nearby', hi: 'आस-पास', as: 'ওচৰত', bn: 'কাছে' },
  emergency: { en: 'Emergency: DDMA control room (add number) · NDRF 1078 · Police 112', hi: 'आपात: DDMA नियंत्रण कक्ष (नंबर जोड़ें) · NDRF 1078 · पुलिस 112', as: 'জৰুৰী: DDMA নিয়ন্ত্ৰণ কোঠা (নম্বৰ দিয়ক) · NDRF 1078 · আৰক্ষী 112', bn: 'জরুরি: DDMA নিয়ন্ত্রণ কক্ষ (নম্বর দিন) · NDRF 1078 · পুলিশ 112' },
  reportInc: { en: 'Report incident', hi: 'घटना रिपोर्ट करें', as: 'ঘটনাৰ প্ৰতিবেদন দিয়ক', bn: 'ঘটনার রিপোর্ট দিন' },
  // simulation
  riskSim: { en: 'Risk simulator (What-If)', hi: 'जोखिम सिम्युलेटर (What-If)', as: 'বিপদ অনুকৰণ (What-If)', bn: 'ঝুঁকি সিমুলেটর (What-If)' },
  simRain: { en: 'Rainfall 24h', hi: 'वर्षा 24घं', as: 'বৰষুণ ২৪ঘণ্টা', bn: 'বৃষ্টি ২৪ঘণ্টা' },
  simSlope: { en: 'Slope', hi: 'ढलान', as: 'ঢাল', bn: 'ঢাল' },
  simMoist: { en: 'Soil moisture', hi: 'मृदा नमी', as: 'মাটিৰ আৰ্দ্ৰতা', bn: 'মাটির আর্দ্রতা' },
  histRisk: { en: 'Historical risk', hi: 'ऐतिहासिक जोखिम', as: 'ঐতিহাসিক বিপদ', bn: 'ঐতিহাসিক ঝুঁকি' },
  optLow: { en: 'Low', hi: 'कम', as: 'কম', bn: 'কম' },
  optHigh: { en: 'High', hi: 'उच्च', as: 'উচ্চ', bn: 'উচ্চ' },
  result: { en: 'Result', hi: 'परिणाम', as: 'ফলাফল', bn: 'ফলাফল' },
  pushWarn: { en: 'Push as warning', hi: 'चेतावनी भेजें', as: 'সতৰ্কবাণী হিচাপে পঠাওক', bn: 'সতর্কতা হিসেবে পাঠান' },
  // community
  reportLs: { en: 'Report landslide (field / citizen)', hi: 'भूस्खलन रिपोर्ट (क्षेत्र / नागरिक)', as: 'ভূমিস্খলনৰ প্ৰতিবেদন (ক্ষেত্ৰ / নাগৰিক)', bn: 'ভূমিধসের রিপোর্ট (মাঠ / নাগরিক)' },
  useMyLoc: { en: '📍 Use my location', hi: '📍 मेरी स्थिति उपयोग करें', as: '📍 মোৰ অৱস্থান ব্যৱহাৰ কৰক', bn: '📍 আমার অবস্থান ব্যবহার করুন' },
  placeL: { en: 'Place', hi: 'स्थान', as: 'ঠাই', bn: 'জায়গা' },
  districtL: { en: 'District', hi: 'जिला', as: 'জিলা', bn: 'জেলা' },
  stateL: { en: 'State', hi: 'राज्य', as: 'ৰাজ্য', bn: 'রাজ্য' },
  sevL: { en: 'Severity', hi: 'गंभीरता', as: 'গুৰুতৰতা', bn: 'তীব্রতা' },
  minor: { en: 'Minor', hi: 'मामूली', as: 'সামান্য', bn: 'সামান্য' },
  moderate: { en: 'Moderate', hi: 'मध्यम', as: 'মধ্যমীয়া', bn: 'মাঝারি' },
  major: { en: 'Major', hi: 'भारी', as: 'ডাঙৰ', bn: 'বড়' },
  catastrophic: { en: 'Catastrophic', hi: 'विनाशकारी', as: 'ধ্বংসাত্মক', bn: 'বিধ্বংসী' },
  roadBlocked: { en: 'Road blocked?', hi: 'सड़क अवरुद्ध?', as: 'পথ বন্ধনে?', bn: 'সড়ক বন্ধ?' },
  descL: { en: 'Description', hi: 'विवरण', as: 'বিৱৰণ', bn: 'বিবরণ' },
  photoL: { en: 'Photo (camera or upload — AI preliminary note only)', hi: 'फोटो (कैमरा या अपलोड — केवल AI प्रारंभिक नोट)', as: 'ফটো (কেমেৰা বা আপলোড — কেৱল AI প্ৰাৰম্ভিক টোকা)', bn: 'ছবি (ক্যামেরা বা আপলোড — শুধু AI প্রাথমিক নোট)' },
  attached: { en: 'Attached', hi: 'संलग्न', as: 'সংলগ্ন', bn: 'সংযুক্ত' },
  submit: { en: 'Submit (saved locally, status NEW)', hi: 'जमा करें (स्थानीय सहेजा, स्थिति NEW)', as: 'দাখিল কৰক (স্থানীয়ভাৱে ৰ’ব, অৱস্থা NEW)', bn: 'জমা দিন (স্থানীয়ভাবে সংরক্ষিত, অবস্থা NEW)' },
  needPlace: { en: 'Add place + district', hi: 'स्थान + जिला जोड़ें', as: 'ঠাই + জিলা দিয়ক', bn: 'জায়গা + জেলা দিন' },
  offlineNote: { en: 'Offline-friendly: drafts persist in this browser; queue + sync when online.', hi: 'ऑफ़लाइन-मित्र: ड्राफ्ट इस ब्राउज़र में रहेंगे; ऑनलाइन होने पर सिंक करें।', as: 'অফলাইন-বন্ধু: খচৰা এই ব্ৰাউজাৰত থাকিব; অনলাইন হ’লে মিলাওক।', bn: 'অফলাইন-বান্ধব: খসড়া এই ব্রাউজারে থাকবে; অনলাইনে এলে সিঙ্ক করুন।' },
  submitted: { en: 'Submitted', hi: 'प्रस्तुत', as: 'দাখিল কৰা', bn: 'জমা দেওয়া' },
  // admin
  authDash: { en: 'Authority dashboard — verify reports & alerts', hi: 'प्राधिकरण डैशबोर्ड — रिपोर्ट व चेतावनी सत्यापित करें', as: 'কৰ্তৃপক্ষ ডেশ্বৰ্ড — প্ৰতিবেদন আৰু সতৰ্কবাণী সত্যাপন কৰক', bn: 'কর্তৃপক্ষ ড্যাশবোর্ড — রিপোর্ট ও সতর্কতা যাচাই করুন' },
  noReports: { en: 'No community reports yet.', hi: 'अभी कोई सामुदायिक रिपोर्ट नहीं।', as: 'এতিয়াও সমাজৰ প্ৰতিবেদন নাই।', bn: 'এখনও কমিউনিটি রিপোর্ট নেই।' },
  stNew: { en: 'NEW', hi: 'नया', as: 'নতুন', bn: 'নতুন' },
  stReview: { en: 'UNDER REVIEW', hi: 'जाँचाधीन', as: 'পৰীক্ষাধীন', bn: 'পর্যালোচনাধীন' },
  stVerified: { en: 'VERIFIED', hi: 'सत्यापित', as: 'সত্যাপিত', bn: 'যাচাইকৃত' },
  stRejected: { en: 'REJECTED', hi: 'अस्वीकृत', as: 'নাকচ', bn: 'বাতিল' },
  stResolved: { en: 'RESOLVED', hi: 'समाधानित', as: 'সমাধান', bn: 'সমাধান' },
  // footer + misc
  footer: { en: 'NER LandslideGuard · SIH26001 prototype · OpenStreetMap tiles, simulated IMD/GSI stand-ins · Auth/DB: localStorage mock · “Potentially exposed”, never “damaged”, unless verified.', hi: 'NER LandslideGuard · SIH26001 प्रोटोटाइप · OpenStreetMap टाइलें, सिमुलेटेड IMD/GSI · Auth/DB: स्थानीय मॉक · सत्यापन बिना “क्षतिग्रस्त” न कहें।', as: 'NER LandslideGuard · SIH26001 আৰ্হি · OpenStreetMap টাইল, অনুকৰণমূলক IMD/GSI · Auth/DB: স্থানীয় মক · পৰীক্ষা নকৰাকৈ “ক্ষতিগ্ৰস্ত” নক’ব।', bn: 'NER LandslideGuard · SIH26001 প্রোটোটাইপ · OpenStreetMap টাইল, সিমুলেটেড IMD/GSI · Auth/DB: স্থানীয় মক · যাচাই ছাড়া “ক্ষতিগ্রস্ত” বলবেন না।' },
  loadingMap: { en: 'Loading map…', hi: 'मानचित्र लोड हो रहा…', as: 'মানচিত্ৰ আহি আছে…', bn: 'মানচিত্র আসছে…' },
  noData: { en: 'No rainfall data.', hi: 'वर्षा डेटा नहीं।', as: 'বৰষুণৰ তথ্য নাই।', bn: 'বৃষ্টির তথ্য নেই।' },
  // levels + warning labels
  lvLow: { en: 'LOW', hi: 'कम', as: 'কম', bn: 'কম' },
  lvModerate: { en: 'MODERATE', hi: 'मध्यम', as: 'মধ্যমীয়া', bn: 'মাঝারি' },
  lvHigh: { en: 'HIGH', hi: 'उच्च', as: 'উচ্চ', bn: 'উচ্চ' },
  lvCritical: { en: 'CRITICAL', hi: 'गंभीर', as: 'সংকটজনক', bn: 'সংকটজনক' },
  wNormal: { en: 'Normal', hi: 'सामान्य', as: 'স্বাভাৱিক', bn: 'স্বাভাবিক' },
  wWatch: { en: 'Watch', hi: 'निगरानी', as: 'নিৰীক্ষণ', bn: 'নজরদারি' },
  wHighRisk: { en: 'High risk', hi: 'उच्च जोखिम', as: 'উচ্চ বিপদ', bn: 'উচ্চ ঝুঁকি' },
  wCritical: { en: 'Critical', hi: 'गंभीर', as: 'সংকটজনক', bn: 'সংকটজনক' },
  verifyPlace: { en: 'Verify place name before submit.', hi: 'जमा करने से पहले स्थान सत्यापित करें।', as: 'দাখিলৰ আগতে ঠাই সত্যাপন কৰক।', bn: 'জমা দেওয়ার আগে জায়গা যাচাই করুন।' },
  locFound: { en: 'Location found.', hi: 'स्थान मिल गया।', as: 'অৱস্থান পোৱা গ’ল।', bn: 'অবস্থান পাওয়া গেছে।' },
  noGpsTag: { en: 'No GPS tag in this photo — use "Use my location" or type the place.', hi: 'इस फोटो में GPS टैग नहीं — "मेरी स्थिति" उपयोग करें या स्थान लिखें।', as: 'এই ফটোত GPS টেগ নাই — "মোৰ অৱস্থান" ব্যৱহাৰ কৰক বা ঠাই লিখক।', bn: 'এই ছবিতে GPS ট্যাগ নেই — "আমার অবস্থান" ব্যবহার করুন বা জায়গা লিখুন।' },
  nearZone: { en: 'nearest monitored zone', hi: 'निकटतम निगरानी क्षेत्र', as: 'নিকটতম নিৰীক্ষণ অঞ্চল', bn: 'নিকটতম পর্যবেক্ষণ অঞ্চল' },
  aiPre: { en: 'AI-assisted preliminary note (DEMO, not a diagnosis)', hi: 'AI प्रारंभिक नोट (डेमो, निदान नहीं)', as: 'AI প্ৰাৰম্ভিক টোকা (ডেমো, ৰোগ নিৰ্ণয় নহয়)', bn: 'AI প্রাথমিক নোট (ডেমো, রোগ নির্ণয় নয়)' },
  aiDebris: { en: 'filename suggests visible debris/road feature', hi: 'फ़ाइल नाम में मलबा/सड़क संकेत', as: 'ফাইলৰ নামত ধ্বংসাৱশেষ/পথৰ ইংগিত', bn: 'ফাইলের নামে ধ্বংসাবশেষ/সড়কের ইঙ্গিত' },
  aiHiRes: { en: 'high-resolution image — debris texture checkable', hi: 'उच्च-रिज़ॉल्यूशन छवि — मलबा बनावट जाँच योग्य', as: 'উচ্চ ৰিজ’লিউচন ছবি — ধ্বংসাৱশেষ পৰীক্ষাযোগ্য', bn: 'উচ্চ-রেজোলিউশন ছবি — ধ্বংসাবশেষ পরীক্ষাযোগ্য' },
  aiLowRes: { en: 'low/medium resolution — request closer geotagged photo', hi: 'निम्न/मध्यम रिज़ॉल्यूशन — निकट जियोटैग फोटो माँगें', as: 'নিম্ন/মধ্যম ৰিজ’লিউচন — ওচৰৰ জিঅ’টেগ ফটো বিচাৰক', bn: 'নিম্ন/মাঝারি রেজোলিউশন — কাছের জিওট্যাগ ছবি চান' },
  aiVerify: { en: 'Needs field verification by DDMA engineer.', hi: 'DDMA अभियंता से क्षेत्र सत्यापन आवश्यक।', as: 'DDMA অভিযন্তাৰ ক্ষেত্ৰ সত্যাপন প্ৰয়োজন।', bn: 'DDMA প্রকৌশলীর মাঠ যাচাই প্রয়োজন।' },
  schemNote: { en: 'Illustrative profile around {v} m — shows why slope + elevation feed the model. Replace with SRTM/DEM cross-section for surveys.', hi: 'लगभग {v} मी का रेखाचित्र परिच्छेद — ढलान + ऊँचाई मॉडल में क्यों जाती है। सर्वेक्षण हेतु SRTM/DEM से बदलें।', as: 'প্ৰায় {v} মিৰ আঁক প্ৰস্থচ্ছেদ — ঢাল + উচ্চতা মডেলত কিয় যায়। জৰীপৰ বাবে SRTM/DEM ব্যৱহাৰ কৰক।', bn: 'প্রায় {v} মি-এর পরিকল্পিত প্রস্থচ্ছেদ — ঢাল + উচ্চতা মডেলে কেন যায়। জরিপের জন্য SRTM/DEM ব্যবহার করুন।' },
  srcDemo: { en: 'Source: demo bundle', hi: 'स्रोत: डेमो बंडल', as: 'উৎস: ডেমো বাণ্ডল', bn: 'উৎস: ডেমো বান্ডিল' },
  rainFetched: { en: 'Rain fetched {v}', hi: 'वर्षा प्राप्त {v}', as: 'বৰষুণ পোৱা {v}', bn: 'বৃষ্টি পাওয়া {v}' },
  probEst: { en: 'Est. probability {v}%', hi: 'अनुमानित संभावना {v}%', as: 'আনুমানিক সম্ভাৱনা {v}%', bn: 'আনুমানিক সম্ভাবনা {v}%' },
  inputsNote: { en: 'Train RandomForest/XGBoost on GSI+IMD data when available — see src/lib/riskEngine.ts.', hi: 'उपलब्ध होने पर GSI+IMD डेटा पर RandomForest/XGBoost प्रशिक्षित करें — src/lib/riskEngine.ts देखें।', as: 'উপলব্ধ হ’লে GSI+IMD তথ্যত RandomForest/XGBoost প্ৰশিক্ষণ দিয়ক — src/lib/riskEngine.ts চাওক।', bn: 'পাওয়া গেলে GSI+IMD তথ্যে RandomForest/XGBoost প্রশিক্ষণ দিন — src/lib/riskEngine.ts দেখুন।' },
  fcError: { en: 'Forecast unavailable — check connection.', hi: 'पूर्वानुमान उपलब्ध नहीं — कनेक्शन जाँचें।', as: 'পূৰ্বাভাস উপলব্ধ নহয় — সংযোগ চাওক।', bn: 'পূর্বাভাস পাওয়া যাচ্ছে না — সংযোগ দেখুন।' },
  chNote: { en: 'clearly mock; wire SMS/email gateway for production.', hi: 'स्पष्टतः मॉक; उत्पादन हेतु SMS/ईमेल गेटवे जोड़ें।', as: 'স্পষ্টভাৱে মক; উৎপাদনৰ বাবে SMS/ইমেইল গেটৱে লগাওক।', bn: 'স্পষ্টত মক; উৎপাদনের জন্য SMS/ইমেইল গেটওয়ে লাগান।' },
  histBadge: { en: '1 VERIFIED + DEMO ROWS', hi: '1 सत्यापित + डेमो पंक्तियाँ', as: '১ সত্যাপিত + ডেমো শাৰী', bn: '১ যাচাইকৃত + ডেমো সারি' },
  mapNote: { en: 'Topo/satellite help read ridges & valleys; risk math unchanged.', hi: 'टोपो/उपग्रह से पहाड़-घाटी पढ़ें; जोखिम गणना अपरिवर्तित।', as: 'টপো/উপগ্ৰহে শিখৰ-উপত্যকা বুজাত সহায় কৰে; বিপদৰ গণনা অপৰিৱৰ্তিত।', bn: 'টপো/স্যাটেলাইটে শৈলশিরা-উপত্যকা বুঝতে সাহায্য করে; ঝুঁকির গণনা অপরিবর্তিত।' },
  demoBoost: { en: 'Demo +80mm boost active.', hi: 'डेमो +80मिमी बूस्ट सक्रिय।', as: 'ডেমো +৮০মিমি বুষ্ট সক্ৰিয়।', bn: 'ডেমো +৮০মিমি বুস্ট সক্রিয়।' },
  mManual: { en: 'Manual warning: {p} scored {s} ({l}). {r} Action: {a}', hi: 'मैनुअल चेतावनी: {p} स्कोर {s} ({l})। {r} कार्रवाई: {a}', as: 'হস্তচালিত সতৰ্কবাণী: {p} স্ক’ৰ {s} ({l})। {r} ব্যৱস্থা: {a}', bn: 'ম্যানুয়াল সতর্কতা: {p} স্কোর {s} ({l})। {r} ব্যবস্থা: {a}' },
  mAuto: { en: 'Auto rule: {p} {s} ({l}) exceeds threshold.', hi: 'स्वतः नियम: {p} {s} ({l}) सीमा पार।', as: 'স্বয়ংক্ৰিয় নিয়ম: {p} {s} ({l}) সীমা অতিক্ৰম।', bn: 'স্বয়ংক্রিয় নিয়ম: {p} {s} ({l}) সীমা অতিক্রম।' },
  mSim: { en: 'SIMULATION: heavy rainfall +80mm → {p} re-scored {s} ({l}). Map + warning updated.', hi: 'सिमुलेशन: भारी वर्षा +80मिमी → {p} पुनः स्कोर {s} ({l})। मानचित्र + चेतावनी अद्यतन।', as: 'অনুকৰণ: ধাৰাসাৰ বৰষুণ +৮০মিমি → {p} পুনৰ স্ক’ৰ {s} ({l})। মানচিত্ৰ + সতৰ্কবাণী আপডেট।', bn: 'সিমুলেশন: ভারী বৃষ্টি +৮০মিমি → {p} পুনরায় স্কোর {s} ({l})। মানচিত্র + সতর্কতা হালনাগাদ।' },
  mWhatIf: { en: 'What-If sim @ {p}: rain {r}mm, slope {o}°, moisture {m}% → {s} ({l}).', hi: 'What-If सिम @ {p}: वर्षा {r}मिमी, ढलान {o}°, नमी {m}% → {s} ({l})।', as: 'What-If অনুকৰণ @ {p}: বৰষুণ {r}মিমি, ঢাল {o}°, আৰ্দ্ৰতা {m}% → {s} ({l})।', bn: 'What-If সিম @ {p}: বৃষ্টি {r}মিমি, ঢাল {o}°, আর্দ্রতা {m}% → {s} ({l})।' },
  fetchFail: { en: 'Live fetch failed — showing demo numbers.', hi: 'लाइव प्राप्ति विफल — डेमो अंक दिख रहे हैं।', as: 'লাইভ সংগ্ৰহ বিফল — ডেমো সংখ্যা দেখুওৱা হৈছে।', bn: 'লাইভ সংগ্রহ ব্যর্থ — ডেমো সংখ্যা দেখানো হচ্ছে।' },
  noNet: { en: 'No internet / API blocked — showing demo numbers.', hi: 'इंटरनेट नहीं / API अवरुद्ध — डेमो अंक दिख रहे हैं।', as: 'ইণ্টাৰনেট নাই / API বন্ধ — ডেমো সংখ্যা দেখুওৱা হৈছে।', bn: 'ইন্টারনেট নেই / API বন্ধ — ডেমো সংখ্যা দেখানো হচ্ছে।' },
  popBlocked: { en: 'Popup blocked — allow popups for this site, then retry Print / PDF.', hi: 'पॉपअप अवरुद्ध — इस साइट हेतु पॉपअप अनुमति दें, फिर पुनः प्रयास करें।', as: 'পপআপ বন্ধ — এই ছাইটৰ বাবে পপআপ অনুমতি দি পুনৰ চেষ্টা কৰক।', bn: 'পপআপ বন্ধ — এই সাইটের জন্য পপআপ অনুমতি দিন, তারপর আবার চেষ্টা করুন।' },
  liveTag: { en: 'LIVE', hi: 'लाइव', as: 'লাইভ', bn: 'লাইভ' },
  demoTag: { en: 'demo', hi: 'डेमो', as: 'ডেমো', bn: 'ডেমো' },
  monSrc: { en: 'Source: {s} · Last updated {u} · Soil moisture: {m} · Cache: 1 hour in browser.', hi: 'स्रोत: {s} · अंतिम अद्यतन {u} · मृदा नमी: {m} · कैश: ब्राउज़र में 1 घंटा।', as: 'উৎস: {s} · শেহতীয়া আপডেট {u} · মাটিৰ আৰ্দ্ৰতা: {m} · কেশ্ব: ব্ৰাউজাৰত ১ ঘণ্টা।', bn: 'উৎস: {s} · সর্বশেষ হালনাগাদ {u} · মাটির আর্দ্রতা: {m} · ক্যাশ: ব্রাউজারে ১ ঘণ্টা।' },
};

export function t(lang: Lang, key: string): string {
  return D[key]?.[lang] ?? D[key]?.en ?? key;
}

export function tv(lang: Lang, key: string, v: string | number | Record<string, string | number>): string {
  let s = t(lang, key);
  if (v !== null && typeof v === 'object') {
    for (const [k, val] of Object.entries(v)) s = s.split(`{${k}}`).join(String(val));
    return s;
  }
  return s.replace('{v}', String(v));
}

export function levelName(lang: Lang, level: string): string {
  if (level === 'CRITICAL') return t(lang, 'lvCritical');
  if (level === 'HIGH') return t(lang, 'lvHigh');
  if (level === 'MODERATE') return t(lang, 'lvModerate');
  return t(lang, 'lvLow');
}

export function warnLabel(lang: Lang, level: string): string {
  if (level === 'CRITICAL') return t(lang, 'wCritical');
  if (level === 'HIGH') return t(lang, 'wHighRisk');
  if (level === 'MODERATE') return t(lang, 'wWatch');
  return t(lang, 'wNormal');
}

// ---- Risk-model text (reasons, factors, actions) in all 4 languages ----
export function actionText(lang: Lang, level: string): string {
  if (level === 'CRITICAL') return { en: 'Restrict movement on exposed roads; notify DDMA control room; prepare evacuation of toe settlements.', hi: 'प्रभावित सड़कों पर आवाजाही रोकें; DDMA नियंत्रण कक्ष को सूचित करें; निचली बस्तियों की निकासी तैयार करें।', as: 'প্ৰভাৱিত পথত চলাচল বন্ধ কৰক; DDMA নিয়ন্ত্ৰণ কোঠাক জনাওক; তলৰ বসতি খালী কৰাৰ প্ৰস্তুতি লওক।', bn: 'ক্ষতিগ্রস্ত সড়কে চলাচল বন্ধ করুন; DDMA নিয়ন্ত্রণ কক্ষকে জানান; নিচের বসতি সরানোর প্রস্তুতি নিন।' }[lang];
  if (level === 'HIGH') return { en: 'Increase monitoring of vulnerable roads/ridges; issue advisory to field teams.', hi: 'संवेदनशील सड़कों/पहाड़ियों की निगरानी बढ़ाएँ; फील्ड टीमों को परामर्श जारी करें।', as: 'স্পৰ্শকাতৰ পথ/শিখৰৰ নিৰীক্ষণ বঢ়াওক; ক্ষেত্ৰ দলক পৰামৰ্শ দিয়ক।', bn: 'ঝুঁকিপূর্ণ সড়ক/শৈলশিরার পর্যবেক্ষণ বাড়ান; মাঠ দলকে পরামর্শ দিন।' }[lang];
  if (level === 'MODERATE') return { en: 'Watch: re-check after next rainfall update.', hi: 'निगरानी: अगली वर्षा अद्यतन के बाद पुनः जाँचें।', as: 'নিৰীক্ষণ: পৰৱৰ্তী বৰষুণৰ আপডেটৰ পাছত পুনৰ চাওক।', bn: 'নজরদারি: পরের বৃষ্টির আপডেটের পর আবার দেখুন।' }[lang];
  return { en: 'Monitor routinely.', hi: 'नियमित निगरानी करें।', as: 'নিয়মীয়াকৈ নিৰীক্ষণ কৰক।', bn: 'নিয়মিত পর্যবেক্ষণ করুন।' }[lang];
}

export function reasonText(lang: Lang, key: string, v: string | number): string {
  const T: Record<string, Record<Lang, string>> = {
    rHeavy: { en: `Heavy rainfall in last 24h (${v} mm)`, hi: `पिछले 24घं में भारी वर्षा (${v} मिमी)`, as: `যোৱা ২৪ঘণ্টাত ধাৰাসাৰ বৰষুণ (${v} মিমি)`, bn: `গত ২৪ঘণ্টায় ভারী বৃষ্টি (${v} মিমি)` },
    rElev: { en: `Elevated 24h rainfall (${v} mm)`, hi: `24घं वर्षा अधिक (${v} मिमी)`, as: `২৪ঘণ্টীয়া বৰষুণ বেছি (${v} মিমি)`, bn: `২৪ঘণ্টার বৃষ্টি বেশি (${v} মিমি)` },
    rWeek: { en: `Saturated antecedent week (${v} mm / 7d)`, hi: `सप्ताह भर संतृप्त भूमि (${v} मिमी / 7दिन)`, as: `যোৱা সপ্তাহত মাটি তিতি আছে (${v} মিমি / ৭দিন)`, bn: `গত সপ্তাহে মাটি ভেজা (${v} মিমি / ৭দিন)` },
    rVSteep: { en: `Very steep slope (${v}°) prone to failure`, hi: `अत्यंत खड़ी ढलान (${v}°) — धँसने की आशंका`, as: `অতি ঠিয় ঢাল (${v}°) — খহাৰ আশংকা`, bn: `অতি খাড়া ঢাল (${v}°) — ধসের আশঙ্কা` },
    rSteep: { en: `Steep slope (${v}°)`, hi: `खड़ी ढलान (${v}°)`, as: `ঠিয় ঢাল (${v}°)`, bn: `খাড়া ঢাল (${v}°)` },
    rMoist: { en: `High soil moisture (${v}%) — low residual strength`, hi: `उच्च मृदा नमी (${v}%) — मिट्टी कमजोर`, as: `অধিক মাটিৰ আৰ্দ্ৰতা (${v}%) — মাটি দুৰ্বল`, bn: `বেশি মাটির আর্দ্রতা (${v}%) — মাটি দুর্বল` },
    rHist: { en: `Repeat slide history (${v} in 5y)`, hi: `बार-बार भूस्खलन इतिहास (${v} / 5वर्ष)`, as: `বাৰে বাৰে খহাৰ ইতিহাস (${v} / ৫বছৰ)`, bn: `বারবার ধসের ইতিহাস (${v} / ৫বছর)` },
    rToe: { en: `Toe erosion risk — close to drainage (${v} m)`, hi: `तलहटी कटाव जोखिम — नाले के निकट (${v} मी)`, as: `তলি খহনীয়াৰ বিপদ — নলাৰ ওচৰত (${v} মি)`, bn: `গোড়া ক্ষয়ের ঝুঁকি — নালার কাছে (${v} মি)` },
    rBase: { en: 'No dominant trigger — baseline terrain susceptibility only', hi: 'कोई प्रमुख कारण नहीं — केवल आधारभूत भू-संवेदनशीलता', as: 'কোনো প্ৰধান কাৰণ নাই — কেৱল মূল ভূ-সংবেদনশীলতা', bn: 'কোনো প্রধান কারণ নেই — শুধু মূল ভূ-সংবেদনশীলতা' },
    idHit: { en: `I-D threshold EXCEEDED: ${v} — rainfall alone can trigger slides`, hi: `I-D सीमा पार: ${v} — केवल वर्षा से भूस्खलन संभव`, as: `I-D সীমা অতিক্ৰম: ${v} — কেৱল বৰষুণতে খহিব পাৰে`, bn: `I-D সীমা অতিক্রম: ${v} — শুধু বৃষ্টিতেই ধস হতে পারে` },
    idOk: { en: `I-D threshold ok: ${v}`, hi: `I-D सीमा ठीक: ${v}`, as: `I-D সীমা ঠিক: ${v}`, bn: `I-D সীমা ঠিক: ${v}` },
  };
  return T[key]?.[lang] ?? T[key]?.en ?? String(v);
}

export function factorName(lang: Lang, i: number): string {
  const N: Record<number, Record<Lang, string>> = {
    0: { en: 'Rainfall (24h)', hi: 'वर्षा (24घं)', as: 'বৰষুণ (২৪ঘণ্টা)', bn: 'বৃষ্টি (২৪ঘণ্টা)' },
    1: { en: 'Rainfall (7d)', hi: 'वर्षा (7दिन)', as: 'বৰষুণ (৭দিন)', bn: 'বৃষ্টি (৭দিন)' },
    2: { en: 'Slope', hi: 'ढलान', as: 'ঢাল', bn: 'ঢাল' },
    3: { en: 'Soil saturation', hi: 'मृदा संतृप्ति', as: 'মাটিৰ সম্পৃক্তি', bn: 'মাটির সম্পৃক্তি' },
    4: { en: 'Terrain / Elevation', hi: 'भू-भाग / ऊँचाई', as: 'ভূ-ভাগ / উচ্চতা', bn: 'ভূমি / উচ্চতা' },
    5: { en: 'Historical activity', hi: 'ऐतिहासिक सक्रियता', as: 'ঐতিহাসিক সক্ৰিয়তা', bn: 'ঐতিহাসিক সক্রিয়তা' },
    6: { en: 'River proximity', hi: 'नदी निकटता', as: 'নদীৰ নৈকট্য', bn: 'নদীর নৈকট্য' },
  };
  return N[i]?.[lang] ?? N[i]?.en ?? '';
}

export function factorDetail(lang: Lang, i: number, v: string): string {
  const F: Record<number, Record<Lang, string>> = {
    0: { en: `${v} mm in last 24h`, hi: `पिछले 24घं में ${v} मिमी`, as: `যোৱা ২৪ঘণ্টাত ${v} মিমি`, bn: `গত ২৪ঘণ্টায় ${v} মিমি` },
    1: { en: `${v} mm cumulative 7-day`, hi: `${v} मिमी संचयी 7-दिन`, as: `${v} মিমি মুঠ ৭দিন`, bn: `${v} মিমি মোট ৭দিন` },
    2: { en: `${v}° slope angle`, hi: `${v}° ढलान कोण`, as: `${v}° ঢালৰ কোণ`, bn: `${v}° ঢালের কোণ` },
    3: { en: `${v}% soil moisture`, hi: `${v}% मृदा नमी`, as: `${v}% মাটিৰ আৰ্দ্ৰতা`, bn: `${v}% মাটির আর্দ্রতা` },
    4: { en: v, hi: v, as: v, bn: v },
    5: { en: `${v} incidents / 5y`, hi: `${v} घटनाएँ / 5वर्ष`, as: `${v} ঘটনা / ৫বছৰ`, bn: `${v} ঘটনা / ৫বছর` },
    6: { en: `${v} m from drainage`, hi: `नाले से ${v} मी`, as: `নলাৰ পৰা ${v} মি`, bn: `নালা থেকে ${v} মি` },
  };
  return F[i]?.[lang] ?? F[i]?.en ?? v;
}
