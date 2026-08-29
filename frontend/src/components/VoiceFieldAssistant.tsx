"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Languages,
  CheckCircle2,
  Loader2,
  Send,
  RefreshCw,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  lang: string;
  timestamp: Date;
}

interface Language {
  code: string;
  label: string;
  nativeName: string;
  bcp47: string;
  placeholder: string;
}

const LANGUAGES: Language[] = [
  { code: "en", label: "English", nativeName: "English", bcp47: "en-IN", placeholder: "Tap the mic and speak your hive query..." },
  { code: "hi", label: "Hindi", nativeName: "हिन्दी", bcp47: "hi-IN", placeholder: "माइक दबाएं और अपनी जानकारी बोलें..." },
  { code: "bn", label: "Bengali", nativeName: "বাংলা", bcp47: "bn-IN", placeholder: "মাইক চাপুন এবং আপনার প্রশ্ন বলুন..." },
  { code: "ta", label: "Tamil", nativeName: "தமிழ்", bcp47: "ta-IN", placeholder: "மைக்கை அழுத்தி உங்கள் கேள்வியை சொல்லுங்கள்..." },
  { code: "kn", label: "Kannada", nativeName: "ಕನ್ನಡ", bcp47: "kn-IN", placeholder: "ಮೈಕ್ ಒತ್ತಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಹೇಳಿ..." },
  { code: "mr", label: "Marathi", nativeName: "मराठी", bcp47: "mr-IN", placeholder: "मायक्रोफोन दाबा आणि तुमचा प्रश्न सांगा..." },
];

// ─── Intent Classification Engine ────────────────────────────────────────────
const classifyIntent = (text: string): string => {
  const t = text.toLowerCase();

  if (/swarm|झुंड|ঝাঁক|கூட்டம்|ಹಿಂಡು|थवा/.test(t))
    return "SWARM_WARNING";
  if (/varroa|mite|কীট|माइट|螨|ஒட்டுண்ணி|ಹುಳ/.test(t))
    return "VARROA_MITE";
  if (/honey|शहद|মধু|தேன்|ಜೇನು|मध/.test(t) && /price|rate|भाव|দাম|விலை|ಬೆಲೆ|किमत/.test(t))
    return "MARKET_PRICE";
  if (/weather|rain|monsoon|मौसम|বৃষ্টি|மழை|ಮಳೆ|पाऊस/.test(t))
    return "WEATHER_ALERT";
  if (/register|नाम|নাম|பதிவு|ನೋಂದಣಿ|नोंद/.test(t))
    return "REGISTER";
  if (/disease|बीमारी|রোগ|நோய்|ರೋಗ|आजार/.test(t))
    return "DISEASE";
  if (/ready|harvest|तैयार|ফসল|அறுவடை|ಕೊಯ್ಲು|कापणी/.test(t))
    return "HARVEST";
  if (/queen|रानी|রাণী|ராணி|ರಾಣಿ|राणी/.test(t))
    return "QUEEN_STATUS";
  if (/acid|oxalic|treatment|इलाज|চিকিৎসা|சிகிச்சை|ಚಿಕಿತ್ಸೆ|उपचार/.test(t))
    return "TREATMENT";
  return "GENERAL";
};

// ─── Multilingual response knowledge base ─────────────────────────────────────
const RESPONSES: Record<string, Record<string, string>> = {
  SWARM_WARNING: {
    en: "🚨 Swarm Alert! Add 2 empty wax foundation frames immediately. Install a swarm trap box 20m from the hive. Clip the old queen's wing if possible. Check queen cells — if present, split the colony into a nuc before swarming occurs.",
    hi: "🚨 झुंड की चेतावनी! तुरंत 2 खाली मोम के फ्रेम डालें। छत्ते से 20 मीटर दूर एक स्वार्म ट्रैप बॉक्स लगाएं। पुरानी रानी मक्खी के पंख काटें। रानी कोशिकाओं की जांच करें — यदि मिलें, तो झुंड से पहले कॉलोनी को विभाजित करें।",
    bn: "🚨 ঝাঁক সতর্কতা! অবিলম্বে ২টি খালি মোমের ফ্রেম যোগ করুন। মৌচাক থেকে ২০ মিটার দূরে একটি স্বার্ম ট্র্যাপ বক্স স্থাপন করুন। পুরনো রানীর ডানা কাটুন। রানী কোষ পরীক্ষা করুন।",
    ta: "🚨 கூட்டம் எச்சரிக்கை! உடனடியாக 2 காலி மெழுகு சட்டங்கள் சேர்க்கவும். தேன்கூட்டிலிருந்து 20 மீ தூரத்தில் swarm trap வைக்கவும். பழைய ராணியின் இறக்கை வெட்டவும். ராணி செல்களை ஆய்வு செய்யவும்.",
    kn: "🚨 ಹಿಂಡು ಎಚ್ಚರಿಕೆ! ತಕ್ಷಣ 2 ಖಾಲಿ ಮೇಣದ ಚೌಕಟ್ಟುಗಳನ್ನು ಸೇರಿಸಿ. 20 ಮೀ ದೂರದಲ್ಲಿ swarm trap ಇಡಿ. ಹಳೆಯ ರಾಣಿಯ ರೆಕ್ಕೆ ಕತ್ತರಿಸಿ.",
    mr: "🚨 थवा इशारा! ताबडतोब 2 रिक्त मेणाचे फ्रेम घाला. पोळ्यापासून 20 मीटर दूर swarm trap बसवा. जुन्या राणीचे पंख कापा. राणी पेशी तपासा.",
  },
  VARROA_MITE: {
    en: "🔬 Varroa Mite Treatment: Apply organic oxalic acid vapor (3g oxalic acid per colony) during broodless period. Place sticky boards under hive for 72-hour mite drop count. If >100 mites/day, treat with Api-Life VAR strips between frames. Rotate treatment to prevent resistance.",
    hi: "🔬 वेरोआ माइट उपचार: ब्रूड रहित अवधि में 3 ग्राम ऑक्जेलिक एसिड वाष्प प्रति कॉलोनी दें। 72 घंटे के लिए स्टिकी बोर्ड लगाएं। यदि 100 माइट/दिन से अधिक हों, तो Api-Life VAR पट्टी का उपयोग करें।",
    bn: "🔬 ভ্যারোয়া মাইট চিকিৎসা: ব্রুড-মুক্ত সময়ে প্রতি কলোনিতে 3g অক্সালিক এসিড বাষ্প দিন। 72 ঘণ্টার জন্য স্টিকি বোর্ড রাখুন।",
    ta: "🔬 Varroa சிகிச்சை: குஞ்சு இல்லாத காலத்தில் 3g oxalic acid நீராவி தெளிக்கவும். 72 மணி நேரம் sticky board வைக்கவும்.",
    kn: "🔬 Varroa ಚಿಕಿತ್ಸೆ: ಮರಿ ಇಲ್ಲದ ಸಮಯದಲ್ಲಿ 3g oxalic acid ಹಬೆ ಕೊಡಿ. 72 ಗಂಟೆ sticky board ಇಡಿ.",
    mr: "🔬 वेरोआ माइट उपचार: ब्रूड-मुक्त काळात 3g ऑक्सॅलिक ॲसिड वाफ द्या. 72 तास sticky board ठेवा.",
  },
  MARKET_PRICE: {
    en: "📈 Current KVIC Honey MSP Rates (2026 season): Himalayan Acacia GI — ₹ 830/kg | Sundarbans Mangrove — ₹ 660/kg | Shahi Litchi — ₹ 740/kg | Mustard — ₹ 380/kg | Mixed Flora — ₹ 310/kg. Contact your nearest Khadi Gramodyog Bhavan for direct procurement.",
    hi: "📈 KVIC शहद MSP दरें (2026): हिमालयी बबूल GI — ₹ 830/किग्रा | सुंदरबन मैंग्रोव — ₹ 660/किग्रा | शाही लीची — ₹ 740/किग्रा | सरसों — ₹ 380/किग्रा | मिश्रित फूल — ₹ 310/किग्रा",
    bn: "📈 KVIC মধু MSP দর (2026): হিমালয় আকাশমণি — ₹ 830/কেজি | সুন্দরবন ম্যানগ্রোভ — ₹ 660/কেজি | শাহী লিচু — ₹ 740/কেজি",
    ta: "📈 KVIC தேன் MSP விலை (2026): இமயமலை Acacia — ₹ 830/கிலோ | சுந்தர்பன் — ₹ 660/கிலோ | Litchi — ₹ 740/கிலோ",
    kn: "📈 KVIC ಜೇನು MSP ದರ (2026): ಹಿಮಾಲಯ Acacia — ₹ 830/ಕೆಜಿ | Sundarbans — ₹ 660/ಕೆಜಿ | Litchi — ₹ 740/ಕೆಜಿ",
    mr: "📈 KVIC मध MSP दर (2026): हिमालयी बबूल — ₹ 830/किलो | सुंदरबन — ₹ 660/किलो | शाही लीची — ₹ 740/किलो",
  },
  WEATHER_ALERT: {
    en: "🌦️ Weather Advisory: During heavy monsoon periods, reduce hive entrance to 2 cm to prevent robbing and damping. Tilt hive 3° forward for rainwater drainage. Apply vaseline barrier at hive stand legs against ants. Monitor humidity — keep below 68% inside hive.",
    hi: "🌦️ मौसम सलाह: भारी मानसून में छत्ते का प्रवेश द्वार 2 सेमी तक कम करें। छत्ते को 3° आगे झुकाएं। चींटियों से बचाव के लिए वैसलीन लगाएं। आर्द्रता 68% से कम रखें।",
    bn: "🌦️ আবহাওয়া পরামর্শ: ভারী বর্ষায় মৌচাকের প্রবেশ 2 সেমি করুন। 3° সামনে হেলান দিন। আর্দ্রতা 68% এর নিচে রাখুন।",
    ta: "🌦️ வானிலை ஆலோசனை: கனமழையில் தேன்கூட்டு நுழைவை 2 செ.மீ. ஆக்கவும். 3° முன்னோக்கி சாய்க்கவும். ஈரப்பதம் 68% க்கு கீழ் வைக்கவும்.",
    kn: "🌦️ ಹವಾಮಾನ ಸಲಹೆ: ಭಾರಿ ಮಳೆಯಲ್ಲಿ ತುಂಬು ಪ್ರವೇಶ 2 ಸೆಂ.ಮೀ ಮಾಡಿ. 3° ಮುಂದೆ ವಾಲಿಸಿ. ತೇವ 68% ಕೆಳಗೆ ಇಡಿ.",
    mr: "🌦️ हवामान सल्ला: जड पावसात पोळ्याचे प्रवेशद्वार 2 सेमी करा. 3° पुढे झुकवा. आर्द्रता 68% च्या खाली ठेवा.",
  },
  HARVEST: {
    en: "🍯 Harvest Readiness Check: Honey is ready when 80% of comb cells are capped with white wax. Test with refractometer — moisture must be ≤ 20% for FSSAI IS 4941:2020 compliance. Extract using uncapping fork + radial extractor. Immediately filter and fill in sterilized food-grade containers.",
    hi: "🍯 फसल जांच: जब 80% कोशिकाएं सफेद मोम से बंद हों तो शहद तैयार है। रिफ्रैक्टोमीटर से जांचें — नमी ≤ 20% होनी चाहिए। अनकैपिंग फोर्क से निकालें और फूड-ग्रेड डिब्बे में भरें।",
    bn: "🍯 ফসল প্রস্তুতি: 80% কোষ সাদা মোম দিয়ে ঢাকা হলে মধু তৈরি। রিফ্র্যাক্টোমিটারে আর্দ্রতা ≤ 20% হওয়া চাই।",
    ta: "🍯 அறுவடை தயார்நிலை: 80% கலங்கள் மெழுகால் மூடியிருக்க வேண்டும். Refractometer — ஈரப்பதம் ≤ 20%.",
    kn: "🍯 ಕೊಯ್ಲು ಸಿದ್ಧತೆ: 80% ಜೇನುಗೂಡು ಮೇಣದಿಂದ ಮುಚ್ಚಿದ್ದರೆ ಸಿದ್ಧ. Refractometer — ತೇವ ≤ 20%.",
    mr: "🍯 कापणी तयारी: 80% पेशी पांढऱ्या मेणाने बंद असल्यास मध तयार. रिफ्रॅक्टोमीटर — आर्द्रता ≤ 20%.",
  },
  DISEASE: {
    en: "🔴 Common Hive Diseases: 1) American Foulbrood (AFB) — coffee-brown slimy larvae, destroy & burn colony. 2) Chalkbrood — white chalky mummies, improve ventilation & replace queen. 3) Nosema — dysentery brown stains on hive front, feed fumagillin syrup. Contact KVIC District Office for disease laboratory confirmation.",
    hi: "🔴 सामान्य बीमारियां: 1) AFB — भूरे चिपचिपे लार्वा, कॉलोनी नष्ट करें। 2) Chalkbrood — सफेद ममी, वेंटिलेशन सुधारें। 3) नोजेमा — दस्त के धब्बे, फ्यूमागिलिन दें।",
    bn: "🔴 সাধারণ রোগ: 1) AFB — বাদামি লার্ভা, কলোনি ধ্বংস করুন। 2) Chalkbrood — সাদা মাম্মি। 3) Nosema — পাতলা পায়খানার দাগ।",
    ta: "🔴 பொதுவான நோய்கள்: 1) AFB — பழுப்பு நிற லார்வா, கலனியை அழிக்கவும். 2) Chalkbrood — வெள்ளை மம்மி. 3) Nosema.",
    kn: "🔴 ಸಾಮಾನ್ಯ ರೋಗಗಳು: 1) AFB — ಕಂದು ಲಾರ್ವಾ, ಕಲೋನಿ ನಾಶ. 2) Chalkbrood — ಬಿಳಿ ಗೊಂಬೆ. 3) Nosema.",
    mr: "🔴 सामान्य आजार: 1) AFB — तपकिरी लार्वा, वसाहत नष्ट. 2) Chalkbrood — पांढरी ममी. 3) Nosema.",
  },
  QUEEN_STATUS: {
    en: "👑 Queen Status Guide: Healthy queen lays 1,200–1,500 eggs/day in tight brood pattern. Signs of queenlessness: no eggs for 2+ days, emergency queen cells on worker comb, increased aggressive fanning. Requeen with a mated caged queen from KVIC certified apiary. Give 3 days acceptance before releasing.",
    hi: "👑 रानी स्थिति: स्वस्थ रानी प्रतिदिन 1,200–1,500 अंडे देती है। रानी रहित होने के संकेत: 2+ दिन कोई अंडा नहीं, इमरजेंसी रानी कोशिकाएं। KVIC प्रमाणित नर्सरी से नई रानी लें।",
    bn: "👑 রানী অবস্থা: সুস্থ রানী প্রতিদিন 1,500 ডিম দেয়। রানীহীনতার লক্ষণ: 2+ দিন ডিম নেই।",
    ta: "👑 ராணி நிலை: ஆரோக்கியமான ராணி நாளொன்றுக்கு 1,500 முட்டை இடுகிறாள்.",
    kn: "👑 ರಾಣಿ ಸ್ಥಿತಿ: ಆರೋಗ್ಯ ರಾಣಿ ದಿನಕ್ಕೆ 1,500 ಮೊಟ್ಟೆ ಇಡುತ್ತಾಳೆ.",
    mr: "👑 राणी स्थिती: निरोगी राणी दररोज 1,500 अंडी घालते.",
  },
  TREATMENT: {
    en: "💊 Treatment Schedule: Oxalic acid vapor — 3g/colony, winter broodless period only. Api-Life VAR thymol strips — place 2 between top frames, replace after 7 days for 3 cycles. Apivar amitraz strips — 2 strips for 6 weeks in spring/autumn. Always record all treatments on HoneyChain platform for traceability.",
    hi: "💊 उपचार कार्यक्रम: ऑक्जेलिक एसिड वाष्प — 3ग्रा/कॉलोनी, केवल ब्रूड रहित सर्दी में। Apivar पट्टी — 6 सप्ताह। सभी उपचार HoneyChain पर दर्ज करें।",
    bn: "💊 চিকিৎসা সূচি: Oxalic acid বাষ্প — 3g/কলোনি, শীতকালীন ব্রুড-মুক্ত সময়ে। Apivar স্ট্রিপ — 6 সপ্তাহ।",
    ta: "💊 சிகிச்சை அட்டவணை: Oxalic acid — 3g/கலனி, குஞ்சு இல்லாத காலம். Apivar — 6 வாரங்கள்.",
    kn: "💊 ಚಿಕಿತ್ಸೆ ವೇಳಾಪಟ್ಟಿ: Oxalic acid — 3g/ಕಲೋನಿ, ಮರಿ-ಇಲ್ಲದ ಶೀತ ಕಾಲ. Apivar — 6 ವಾರ.",
    mr: "💊 उपचार वेळापत्रक: Oxalic acid — 3g/वसाहत, ब्रूड-मुक्त हिवाळा. Apivar — 6 आठवडे.",
  },
  GENERAL: {
    en: "🐝 Hello! I'm your KVIC Apiculture Field Assistant. I can help with: swarm control, disease identification, market prices, harvest timing, queen management, Varroa treatment, and weather advisories — in your preferred language. Ask me anything!",
    hi: "🐝 नमस्ते! मैं आपका KVIC मधुमक्खी पालन सहायक हूं। मैं मदद कर सकता हूं: झुंड नियंत्रण, बीमारी, बाज़ार भाव, फसल, रानी प्रबंधन, माइट उपचार। अपना सवाल पूछें!",
    bn: "🐝 নমস্কার! আমি আপনার KVIC মৌমাছি পালন সহায়ক। ঝাঁক নিয়ন্ত্রণ, রোগ, বাজার দর, ফসল — সব বিষয়ে সাহায্য করতে পারি।",
    ta: "🐝 வணக்கம்! நான் உங்கள் KVIC தேனீ வளர்ப்பு உதவியாளர். கூட்டம், நோய், விலை, அறுவடை — எல்லாவற்றிலும் உதவுவேன்.",
    kn: "🐝 ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ KVIC ಜೇನು ಕೃಷಿ ಸಹಾಯಕ. ಹಿಂಡು, ರೋಗ, ಮಾರುಕಟ್ಟೆ ದರ, ಕೊಯ್ಲು — ಎಲ್ಲಾ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.",
    mr: "🐝 नमस्कार! मी तुमचा KVIC मधुमाशी पालन सहाय्यक. थवा, रोग, बाज़ार, कापणी — सर्व बाबींमध्ये मदत करतो.",
  },
  REGISTER: {
    en: "📋 Beekeeper Registration: Go to Dashboard → Register Beekeeper. Required: Aadhaar card, KVIC Cooperative Code, GPS coordinates of apiary, number of boxes, bee species (Apis mellifera / Apis cerana), and a photo of your apiary. Registration is free and entitles you to MSP, training, and insurance under PMFBY.",
    hi: "📋 मधुमक्खी पालक पंजीकरण: डैशबोर्ड → बीकीपर रजिस्टर करें। आधार, KVIC कोड, GPS, बॉक्स संख्या, मधुमक्खी प्रजाति और फोटो चाहिए। पंजीकरण निःशुल्क है।",
    bn: "📋 মৌমাছি পালক নিবন্ধন: Dashboard → Register Beekeeper। আধার, KVIC কোড, GPS, বাক্স সংখ্যা, প্রজাতি এবং ছবি প্রয়োজন।",
    ta: "📋 தேனீ வளர்ப்பாளர் பதிவு: Dashboard → Register Beekeeper. ஆதார், KVIC குறியீடு, GPS, பெட்டி எண்ணிக்கை, இனம், புகைப்படம்.",
    kn: "📋 ಜೇನು ಕೃಷಿಕ ನೋಂದಣಿ: Dashboard → Register Beekeeper. ಆಧಾರ್, KVIC ಕೋಡ್, GPS, ಪೆಟ್ಟಿಗೆ ಸಂಖ್ಯೆ, ಫೋಟೋ.",
    mr: "📋 मधुमाशी पालक नोंदणी: Dashboard → Register Beekeeper. आधार, KVIC कोड, GPS, पेटी संख्या, जात, फोटो.",
  },
};

// ─── Main Voice Assistant Component ──────────────────────────────────────────
export default function VoiceFieldAssistant() {
  const [selectedLang, setSelectedLang] = useState<Language>(LANGUAGES[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSpeechSupported("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Greet on language change
  useEffect(() => {
    const greeting = RESPONSES.GENERAL[selectedLang.code] || RESPONSES.GENERAL.en;
    setMessages([{ id: "greeting", role: "assistant", text: greeting, lang: selectedLang.code, timestamp: new Date() }]);
  }, [selectedLang]);

  const processQuery = (query: string) => {
    if (!query.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: query, lang: selectedLang.code, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    setTimeout(() => {
      const intent = classifyIntent(query);
      const responses = RESPONSES[intent] || RESPONSES.GENERAL;
      const response = responses[selectedLang.code] || responses.en;
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", text: response, lang: selectedLang.code, timestamp: new Date() };
      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);

      // Speak the response via Web Speech Synthesis
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(response.replace(/[🚨🔬📈🌦️🍯🔴👑💊🐝📋]/g, ""));
        utterance.lang = selectedLang.bcp47;
        utterance.rate = 0.9;
        utterance.pitch = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const voiceForLang = voices.find((v) => v.lang.startsWith(selectedLang.bcp47.split("-")[0]));
        if (voiceForLang) utterance.voice = voiceForLang;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    }, 900);
  };

  const startListening = () => {
    if (!speechSupported) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang.bcp47;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => { setIsListening(true); setTranscript(""); };
    recognition.onresult = (e: any) => {
      const t = Array.from(e.results as any).map((r: any) => r[0].transcript).join("");
      setTranscript(t);
    };
    recognition.onend = () => {
      setIsListening(false);
      if (transcript) processQuery(transcript);
      setTranscript("");
    };
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleTextSend = () => {
    processQuery(textInput);
    setTextInput("");
  };

  return (
    <div className="border-2 border-charcoal/20 bg-white shadow-luxury-card overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-charcoal text-alabaster border-b border-charcoal flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-gold bg-[#121212] rounded-xl flex items-center justify-center text-gold text-lg">
            🐝
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-ultra text-gold font-mono font-bold">
                KVIC Apiculture AI
              </span>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[8px] font-mono uppercase font-bold">
                6 Languages
              </span>
            </div>
            <h2 className="text-xl serif text-alabaster font-normal">
              Multilingual Voice Beekeeper Field Assistant
            </h2>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none self-start md:self-auto">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang)}
              className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest border shrink-0 transition-all ${
                selectedLang.code === lang.code
                  ? "bg-gold text-charcoal border-gold"
                  : "bg-transparent text-warm-grey border-charcoal/40 hover:border-gold hover:text-gold"
              }`}
            >
              {lang.nativeName}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="h-72 overflow-y-auto bg-[#F9F8F6] p-4 sm:p-5 space-y-3 sm:space-y-4 flex flex-col">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[90%] sm:max-w-[85%] p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-charcoal text-alabaster"
                  : "bg-white border-2 border-charcoal/15 text-charcoal shadow-xs"
              }`}
            >
              {msg.text}
              <p className={`text-[9px] font-mono mt-1.5 ${msg.role === "user" ? "text-warm-grey/60" : "text-warm-grey/80"}`}>
                {msg.timestamp.toLocaleTimeString("en-IN")}
              </p>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-charcoal/15 p-4 flex items-center gap-2 text-warm-grey text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-gold" />
              <span className="font-mono">Identifying intent & preparing response...</span>
            </div>
          </div>
        )}

        {transcript && (
          <div className="flex justify-end">
            <div className="bg-gold/10 border border-gold px-4 py-2 text-xs font-mono text-charcoal italic">
              🎤 {transcript}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t-2 border-charcoal/15 flex items-center gap-3">
        {/* Mic Button */}
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={!speechSupported}
          title={speechSupported ? "Hold to speak" : "Speech not supported in this browser"}
          className={`w-12 h-12 flex-shrink-0 flex items-center justify-center border-2 transition-all ${
            isListening
              ? "bg-rose-600 text-white border-rose-700 animate-pulse shadow-lg scale-110"
              : speechSupported
              ? "bg-charcoal text-gold border-charcoal hover:bg-gold hover:text-charcoal"
              : "bg-charcoal/20 text-warm-grey border-charcoal/20 cursor-not-allowed"
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTextSend()}
          placeholder={selectedLang.placeholder}
          className="flex-1 border-2 border-charcoal/20 bg-alabaster px-4 py-2.5 text-sm font-sans text-charcoal focus:border-gold focus:outline-none transition-colors placeholder:text-warm-grey/60"
        />

        <button
          onClick={handleTextSend}
          disabled={!textInput.trim()}
          className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gold text-charcoal hover:bg-gold/90 border-2 border-gold disabled:opacity-40 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Status Bar */}
      <div className="px-5 py-2 bg-alabaster border-t border-charcoal/10 flex justify-between text-[9px] font-mono text-warm-grey">
        <span className="flex items-center gap-1.5">
          <Languages className="w-3 h-3 text-gold" />
          Active: {selectedLang.label} ({selectedLang.nativeName}) — {selectedLang.bcp47}
        </span>
        <span>{speechSupported ? "✓ Web Speech API Active" : "⚠ Type-only mode (no mic)"}</span>
      </div>
    </div>
  );
}
