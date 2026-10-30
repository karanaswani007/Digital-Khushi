import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "hi";

const dict = {
  en: {
    home: "Home",
    about: "About",
    programs: "Programs",
    partner: "Partner",
    knowledge: "Knowledge Hub",
    contact: "Contact",
    letsConnect: "Let's Connect",
    welcome: "Welcome to Digital Khushi",
    line1: "Learn Skills.",
    line2a: "Build",
    line2b: "Confidence.",
    line3a: "Create",
    line3b: "Opportunities.",
    ctaWa: "Let's Connect on WhatsApp",
    ctaPrograms: "Explore Programs",
    focusSkill: "Skill Development Programs",
    focusBusiness: "Online Business Opportunities",
    focusGuide: "Personal Guidance & Support",
    aboutKicker: "About me",
    knowJourney: "Know My Complete Journey",
    story: "My Story",
    journeyKicker: "My journey",
    offerKicker: "What I offer",
    offerTitle: "Programs to Help You Grow",
    offerSub: "Explore skill development programs and online business opportunities through my trusted partner.",
    exploreSkill: "Explore Skill Programs",
    exploreBusiness: "Explore Business Opportunities",
    partnerKicker: "Our learning partner",
    visitSite: "Visit LeadsGuru Website",
    viewPrograms: "View Programs",
    packages: "Popular Packages",
    enquire: "Enquire for Pricing",
    knowledgeKicker: "Knowledge Hub",
    knowledgeTitle: "Latest Articles & Insights",
    knowledgeSub: "Learn, stay updated and get practical tips on digital skills, online opportunities and personal growth.",
    viewAll: "View All Articles",
    readMore: "Read More",
    contactKicker: "Let's connect",
    contactTitle: "Have a Question? Let's Talk!",
    contactSub: "Tell me what you're interested in, and I'll get back to you.",
    formTitle: "Send Me an Enquiry",
    fullName: "Full Name",
    whatsappNo: "WhatsApp Number",
    email: "Email",
    city: "City",
    interested: "Interested in",
    message: "Message",
    optional: "Optional",
    skillOpt: "Skill Development",
    businessOpt: "Online Business",
    submit: "Submit Enquiry",
    submitting: "Sending…",
    success: "Thank you for reaching out! Your enquiry has been received. Khushi will connect with you soon.",
    dataNotice: "Your details are used only to respond to this enquiry. They are not sold or shown publicly.",
    waAfter: "You can also message me on WhatsApp",
    namePh: "Enter your name",
    mobilePh: "Enter your WhatsApp number",
    emailPh: "Enter your email",
    cityPh: "Enter your city",
    messagePh: "Your message",
    choose: "Select an option",
    errName: "Please enter your full name.",
    errMobile: "Enter a valid 10-digit Indian mobile number.",
    errEmail: "Enter a valid email, or leave it blank.",
    errInterest: "Please choose what you are interested in.",
    errRate: "Please wait a little before sending another enquiry.",
    errGeneric: "Something went wrong. Please try again.",
    rights: "All rights reserved.",
    disclosure: "Programs are shared with LeadsGuru EdTech Private Limited. Learning takes effort, and income or job outcomes are not guaranteed.",
    search: "Search articles",
    allTopics: "All topics",
    related: "Related reading",
    noArticles: "No articles in this view yet.",
    backKnowledge: "Back to Knowledge Hub",
    menu: "Open menu",
    close: "Close menu",
    waFloat: "Chat on WhatsApp",
    allow: "Allow",
    decline: "No thanks",
    consent: "This site keeps a private count of visits and button clicks so I can see what is useful. It does not build an advertising profile.",
    faqs: "Questions",
    details: "Program details",
    duration: "Duration",
    format: "Format",
    eligibility: "Who it is for",
    conditions: "Please note",
    enquireWa: "Enquire on WhatsApp",
    milestones: "Moments along the way",
    certifications: "Certifications",
    nothingExtra: "More milestones will appear here when they are added.",
    photoAlt: "A calm desk set up for digital learning",
    portraitAlt: "Portrait of Khushi Aswani",
    journeyAlt: "A quiet sunrise, seen from behind",
    sameLearning: "Same learning. Bigger opportunities.",
    sideWords: "Learn\nGrow\nCreate\nBe Independent\nMake an Impact",
    roleFallback: "Digital Marketing Enthusiast & Opportunity Guide",
    logoTag: "Learn · Grow · Create Opportunities",
    onThisPage: "On this page",
    partnerIntro: "I collaborate with an established learning partner so you can review programs in one place and ask questions before you decide.",
  },
  hi: {
    home: "होम",
    about: "परिचय",
    programs: "प्रोग्राम",
    partner: "पार्टनर",
    knowledge: "नॉलेज हब",
    contact: "संपर्क",
    letsConnect: "बात करें",
    welcome: "डिजिटल खुशी में आपका स्वागत है",
    line1: "कौशल सीखें।",
    line2a: "आत्मविश्वास",
    line2b: "बनाएँ।",
    line3a: "अवसर",
    line3b: "बनाएँ।",
    ctaWa: "व्हाट्सऐप पर बात करें",
    ctaPrograms: "प्रोग्राम देखें",
    focusSkill: "कौशल विकास प्रोग्राम",
    focusBusiness: "ऑनलाइन बिज़नेस के अवसर",
    focusGuide: "व्यक्तिगत मार्गदर्शन और सहयोग",
    aboutKicker: "मेरे बारे में",
    knowJourney: "मेरी पूरी यात्रा जानें",
    story: "मेरी कहानी",
    journeyKicker: "मेरी यात्रा",
    offerKicker: "मैं क्या साझा करती हूँ",
    offerTitle: "आपकी बढ़त के लिए प्रोग्राम",
    offerSub: "मेरे लर्निंग पार्टनर के साथ कौशल विकास प्रोग्राम और ऑनलाइन बिज़नेस के अवसर समझें।",
    exploreSkill: "कौशल प्रोग्राम देखें",
    exploreBusiness: "बिज़नेस अवसर देखें",
    partnerKicker: "हमारा लर्निंग पार्टनर",
    visitSite: "LeadsGuru वेबसाइट खोलें",
    viewPrograms: "प्रोग्राम देखें",
    packages: "लोकप्रिय पैकेज",
    enquire: "कीमत के लिए पूछें",
    knowledgeKicker: "नॉलेज हब",
    knowledgeTitle: "नए लेख और व्यावहारिक बातें",
    knowledgeSub: "डिजिटल कौशल, ऑनलाइन अवसर और व्यक्तिगत विकास पर सरल और उपयोगी बातें पढ़ें।",
    viewAll: "सभी लेख देखें",
    readMore: "और पढ़ें",
    contactKicker: "संपर्क करें",
    contactTitle: "कोई सवाल है? बात करते हैं।",
    contactSub: "बताइए आप किसमें रुचि रखते हैं। मैं जल्द आपसे जुड़ूँगी।",
    formTitle: "अपनी पूछताछ भेजें",
    fullName: "पूरा नाम",
    whatsappNo: "व्हाट्सऐप नंबर",
    email: "ईमेल",
    city: "शहर",
    interested: "रुचि",
    message: "संदेश",
    optional: "वैकल्पिक",
    skillOpt: "कौशल विकास",
    businessOpt: "ऑनलाइन बिज़नेस",
    submit: "पूछताछ भेजें",
    submitting: "भेजा जा रहा है…",
    success: "धन्यवाद! आपकी पूछताछ मिल गई है। खुशी जल्द आपसे संपर्क करेंगी।",
    dataNotice: "यह जानकारी केवल आपकी पूछताछ का जवाब देने के लिए रखी जाती है। इसे बेचा या सार्वजनिक नहीं किया जाता।",
    waAfter: "आप सीधे व्हाट्सऐप पर भी संदेश भेज सकते हैं",
    namePh: "अपना नाम लिखें",
    mobilePh: "अपना व्हाट्सऐप नंबर लिखें",
    emailPh: "अपना ईमेल लिखें",
    cityPh: "अपना शहर लिखें",
    messagePh: "आपका संदेश",
    choose: "एक विकल्प चुनें",
    errName: "कृपया अपना पूरा नाम लिखें।",
    errMobile: "कृपया 10 अंकों का सही भारतीय मोबाइल नंबर लिखें।",
    errEmail: "सही ईमेल लिखें, या इसे खाली छोड़ दें।",
    errInterest: "कृपया बताएँ कि आपकी रुचि किसमें है।",
    errRate: "कृपया दोबारा भेजने से पहले थोड़ा इंतज़ार करें।",
    errGeneric: "कुछ गड़बड़ हो गई। कृपया फिर कोशिश करें।",
    rights: "सर्वाधिकार सुरक्षित।",
    disclosure: "प्रोग्राम LeadsGuru EdTech Private Limited के साथ साझा किए जाते हैं। सीखने में मेहनत लगती है। आय या नौकरी की कोई गारंटी नहीं है।",
    search: "लेख खोजें",
    allTopics: "सभी विषय",
    related: "और पढ़ें",
    noArticles: "इस दृश्य में अभी कोई लेख नहीं है।",
    backKnowledge: "नॉलेज हब पर वापस जाएँ",
    menu: "मेनू खोलें",
    close: "मेनू बंद करें",
    waFloat: "व्हाट्सऐप पर चैट करें",
    allow: "अनुमति दें",
    decline: "नहीं",
    consent: "यह साइट विज़िट और बटन क्लिक की एक निजी गिनती रखती है, ताकि मैं समझ सकूँ क्या उपयोगी है। इससे कोई विज्ञापन प्रोफ़ाइल नहीं बनती।",
    faqs: "सवाल",
    details: "प्रोग्राम की जानकारी",
    duration: "अवधि",
    format: "सीखने का तरीका",
    eligibility: "यह किसके लिए है",
    conditions: "ध्यान दें",
    enquireWa: "व्हाट्सऐप पर पूछें",
    milestones: "रास्ते के पड़ाव",
    certifications: "प्रमाणपत्र",
    nothingExtra: "जब नए पड़ाव जोड़े जाएँगे, वे यहाँ दिखेंगे।",
    photoAlt: "डिजिटल सीखने के लिए सजा एक शांत डेस्क",
    portraitAlt: "खुशी असवानी का चित्र",
    journeyAlt: "पीछे से दिखता एक शांत सूर्योदय",
    sameLearning: "वही सीखना। बड़े अवसर।",
    sideWords: "सीखें\nबढ़ें\nबनाएँ\nस्वतंत्र बनें\nअसर डालें",
    roleFallback: "डिजिटल मार्केटिंग उत्साही और अवसर मार्गदर्शक",
    logoTag: "सीखें · बढ़ें · अवसर बनाएँ",
    onThisPage: "इस पृष्ठ पर",
    partnerIntro: "मैं एक स्थापित लर्निंग पार्टनर के साथ काम करती हूँ, ताकि आप प्रोग्राम एक जगह देख सकें और तय करने से पहले सवाल पूछ सकें।",
  },
} as const;

export type CopyKey = keyof typeof dict.en;

type Ctx = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: CopyKey) => string;
  pick: (en: string, hi: string) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("dk-lang");
    if (saved === "hi" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "hi" ? "hi" : "en";
  }, [lang]);

  const value = useMemo<Ctx>(() => {
    const setLang = (next: Lang) => {
      setLangState(next);
      window.localStorage.setItem("dk-lang", next);
      document.cookie = `dk_lang=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    };
    return {
      lang,
      setLang,
      t: (key) => dict[lang][key],
      pick: (en, hi) => (lang === "hi" && hi.trim() ? hi : en),
    };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("Language missing");
  return ctx;
}
