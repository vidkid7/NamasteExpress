"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { ZodiacIcon } from "@/lib/decorative-icons";
import { Sparkles, AlertTriangle } from "lucide-react";

const ZODIAC_SIGNS = [
  {
    id: "mesh", ne: "मेष", en: "Aries",
    symbol: "♈", dates_ne: "चैत १४ - बैशाख १३", dates_en: "Mar 21 – Apr 20",
    element_ne: "अग्नि", element_en: "Fire", ruling_ne: "मंगल", ruling_en: "Mars",
    color: "#e53935",
    daily_ne: "आज तपाईंको दिन सकारात्मक रहनेछ। नयाँ अवसरहरू आउँदैछन्। आर्थिक क्षेत्रमा लाभ हुनेछ। परिवारसँग समय बिताउनुस्।",
    daily_en: "Today looks positive for you. New opportunities are approaching. Financial gains are indicated. Spend time with family.",
    lucky_ne: "सोमबार", lucky_en: "Monday", lucky_num: "3, 7, 21", lucky_color_ne: "रातो", lucky_color_en: "Red",
  },
  {
    id: "brish", ne: "वृष", en: "Taurus",
    symbol: "♉", dates_ne: "बैशाख १४ - जेठ १४", dates_en: "Apr 21 – May 21",
    element_ne: "पृथ्वी", element_en: "Earth", ruling_ne: "शुक्र", ruling_en: "Venus",
    color: "#8d6e63",
    daily_ne: "काम-व्यवसायमा प्रगति हुनेछ। प्रेम सम्बन्धमा मिठास आउनेछ। स्वास्थ्यतर्फ सावधान रहनुस्।",
    daily_en: "Progress in work and business. Romance blossoms. Take care of health matters.",
    lucky_ne: "शुक्रबार", lucky_en: "Friday", lucky_num: "6, 14, 24", lucky_color_ne: "हरियो", lucky_color_en: "Green",
  },
  {
    id: "mithun", ne: "मिथुन", en: "Gemini",
    symbol: "♊", dates_ne: "जेठ १५ - असार १४", dates_en: "May 22 – Jun 21",
    element_ne: "वायु", element_en: "Air", ruling_ne: "बुध", ruling_en: "Mercury",
    color: "#f9a825",
    daily_ne: "बौद्धिक कार्यमा सफलता मिल्नेछ। यात्राको योग छ। नयाँ सम्बन्धहरू बन्नेछन्।",
    daily_en: "Success in intellectual pursuits. Travel is indicated. New connections will be made.",
    lucky_ne: "बुधबार", lucky_en: "Wednesday", lucky_num: "5, 14, 23", lucky_color_ne: "पहेँलो", lucky_color_en: "Yellow",
  },
  {
    id: "karkat", ne: "कर्कट", en: "Cancer",
    symbol: "♋", dates_ne: "असार १५ - श्रावण १५", dates_en: "Jun 22 – Jul 22",
    element_ne: "जल", element_en: "Water", ruling_ne: "चन्द्र", ruling_en: "Moon",
    color: "#1565c0",
    daily_ne: "गृहस्थ जीवनमा खुशी आउनेछ। आमाबुबासँग राम्रो समय बित्नेछ। आर्थिक स्थिति स्थिर छ।",
    daily_en: "Joy in domestic life. Good time with parents. Financial situation is stable.",
    lucky_ne: "आइतबार", lucky_en: "Sunday", lucky_num: "2, 7, 11", lucky_color_ne: "सेतो", lucky_color_en: "White",
  },
  {
    id: "singh", ne: "सिंह", en: "Leo",
    symbol: "♌", dates_ne: "श्रावण १६ - भदौ १५", dates_en: "Jul 23 – Aug 23",
    element_ne: "अग्नि", element_en: "Fire", ruling_ne: "सूर्य", ruling_en: "Sun",
    color: "#e65100",
    daily_ne: "नेतृत्व क्षमता उजागर हुनेछ। सामाजिक प्रतिष्ठा बढ्नेछ। रचनात्मक कार्यमा सफलता।",
    daily_en: "Leadership qualities shine. Social prestige increases. Success in creative work.",
    lucky_ne: "आइतबार", lucky_en: "Sunday", lucky_num: "1, 5, 9", lucky_color_ne: "सुनौलो", lucky_color_en: "Gold",
  },
  {
    id: "kanya", ne: "कन्या", en: "Virgo",
    symbol: "♍", dates_ne: "भदौ १६ - असोज १५", dates_en: "Aug 24 – Sep 23",
    element_ne: "पृथ्वी", element_en: "Earth", ruling_ne: "बुध", ruling_en: "Mercury",
    color: "#2e7d32",
    daily_ne: "विश्लेषण क्षमता उत्कृष्ट रहनेछ। स्वास्थ्य सुधार हुनेछ। काममा सटीकता देखाउनुस्।",
    daily_en: "Analytical abilities are at peak. Health improves. Show precision in work.",
    lucky_ne: "बुधबार", lucky_en: "Wednesday", lucky_num: "6, 15, 24", lucky_color_ne: "हरियो", lucky_color_en: "Green",
  },
  {
    id: "tula", ne: "तुला", en: "Libra",
    symbol: "♎", dates_ne: "असोज १६ - कार्तिक १५", dates_en: "Sep 24 – Oct 23",
    element_ne: "वायु", element_en: "Air", ruling_ne: "शुक्र", ruling_en: "Venus",
    color: "#7b1fa2",
    daily_ne: "सम्बन्धमा सुमधुरता आउनेछ। न्यायिक मामिलामा जित हुनेछ। साझेदारीमा लाभ।",
    daily_en: "Harmony in relationships. Victory in legal matters. Partnership brings profit.",
    lucky_ne: "शुक्रबार", lucky_en: "Friday", lucky_num: "6, 15, 24", lucky_color_ne: "नीलो", lucky_color_en: "Blue",
  },
  {
    id: "brischik", ne: "वृश्चिक", en: "Scorpio",
    symbol: "♏", dates_ne: "कार्तिक १६ - मंसिर १५", dates_en: "Oct 24 – Nov 22",
    element_ne: "जल", element_en: "Water", ruling_ne: "मंगल", ruling_en: "Mars",
    color: "#b71c1c",
    daily_ne: "गोप्य कुरा उजागर हुनेछन्। परिवर्तनको समय आएको छ। अनुसन्धानात्मक कार्यमा सफलता।",
    daily_en: "Secrets may be revealed. Time for transformation. Success in investigative work.",
    lucky_ne: "मंगलबार", lucky_en: "Tuesday", lucky_num: "9, 18, 27", lucky_color_ne: "गाढा रातो", lucky_color_en: "Dark Red",
  },
  {
    id: "dhanu", ne: "धनु", en: "Sagittarius",
    symbol: "♐", dates_ne: "मंसिर १६ - पुष १५", dates_en: "Nov 23 – Dec 21",
    element_ne: "अग्नि", element_en: "Fire", ruling_ne: "बृहस्पति", ruling_en: "Jupiter",
    color: "#f57f17",
    daily_ne: "ज्ञान र विद्यामा वृद्धि हुनेछ। विदेश यात्राको योग छ। दर्शन र धर्ममा रुचि बढ्नेछ।",
    daily_en: "Growth in knowledge and learning. Foreign travel indicated. Interest in philosophy grows.",
    lucky_ne: "बिहीबार", lucky_en: "Thursday", lucky_num: "3, 12, 21", lucky_color_ne: "बैजनी", lucky_color_en: "Purple",
  },
  {
    id: "makar", ne: "मकर", en: "Capricorn",
    symbol: "♑", dates_ne: "पुष १६ - माघ १४", dates_en: "Dec 22 – Jan 20",
    element_ne: "पृथ्वी", element_en: "Earth", ruling_ne: "शनि", ruling_en: "Saturn",
    color: "#37474f",
    daily_ne: "कठोर परिश्रमको फल मिल्नेछ। व्यवसायमा दीर्घकालीन योजना बनाउनुस्। अनुशासन मुख्य हतियार हो।",
    daily_en: "Hard work pays off. Make long-term plans for business. Discipline is your main weapon.",
    lucky_ne: "शनिबार", lucky_en: "Saturday", lucky_num: "8, 17, 26", lucky_color_ne: "खैरो", lucky_color_en: "Brown",
  },
  {
    id: "kumbha", ne: "कुम्भ", en: "Aquarius",
    symbol: "♒", dates_ne: "माघ १५ - फागुन १३", dates_en: "Jan 21 – Feb 19",
    element_ne: "वायु", element_en: "Air", ruling_ne: "शनि", ruling_en: "Saturn",
    color: "#0097a7",
    daily_ne: "नवाचार र प्रविधिमा सफलता। मानवसेवामा रुचि बढ्नेछ। सामाजिक सञ्जालमा सक्रिय रहनुस्।",
    daily_en: "Success in innovation and technology. Interest in humanitarian service. Stay active socially.",
    lucky_ne: "शनिबार", lucky_en: "Saturday", lucky_num: "4, 13, 22", lucky_color_ne: "आसमानी", lucky_color_en: "Sky Blue",
  },
  {
    id: "meen", ne: "मीन", en: "Pisces",
    symbol: "♓", dates_ne: "फागुन १४ - चैत १३", dates_en: "Feb 20 – Mar 20",
    element_ne: "जल", element_en: "Water", ruling_ne: "बृहस्पति", ruling_en: "Jupiter",
    color: "#1565c0",
    daily_ne: "कलात्मक कार्यमा प्रेरणा मिल्नेछ। आध्यात्मिक शान्ति अनुभव हुनेछ। सपनाहरू साकार हुँदैछन्।",
    daily_en: "Inspiration in artistic work. Experience spiritual peace. Dreams are coming true.",
    lucky_ne: "बिहीबार", lucky_en: "Thursday", lucky_num: "3, 7, 12", lucky_color_ne: "समुद्री", lucky_color_en: "Sea Green",
  },
];

type ApiPrediction = {
  sign: string;
  prediction: string;
  prediction_en?: string;
  rating?: number;
};

export default function RashifalPage() {
  const { language } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);
  const [today, setToday] = useState("");
  const [tab, setTab] = useState<"daily" | "weekly" | "monthly">("daily");
  const [apiPredictions, setApiPredictions] = useState<Record<string, ApiPrediction>>({});

  useEffect(() => {
    fetch("/api/v1/rashifal")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const map: Record<string, ApiPrediction> = {};
          for (const item of json.data as ApiPrediction[]) {
            map[item.sign] = item;
          }
          setApiPredictions(map);
        }
      })
      .catch(() => {/* keep static fallback */});
  }, []);

  useEffect(() => {
    const d = new Date();
    setToday(d.toLocaleDateString(language === "ne" ? "ne-NP" : "en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }));
  }, [language]);

  const selectedSign = ZODIAC_SIGNS.find((s) => s.id === selected);

  const TABS = [
    { key: "daily",   ne: "दैनिक",   en: "Daily"   },
    { key: "weekly",  ne: "साप्ताहिक", en: "Weekly"  },
    { key: "monthly", ne: "मासिक",   en: "Monthly" },
  ] as const;

  const getReading = (sign: typeof ZODIAC_SIGNS[0]) => {
    const apiItem = apiPredictions[sign.id];
    const dailyNe = apiItem?.prediction ?? sign.daily_ne;
    const dailyEn = (apiItem?.prediction_en ?? sign.daily_en) || sign.daily_en;

    if (tab === "weekly") {
      return language === "ne"
        ? `यस सप्ताह ${sign.ne} राशिका जातकहरूका लागि व्यावसायिक क्षेत्रमा उन्नति र आर्थिक सुधारको संकेत छ। परिवारसँग मिलेर काम गर्नुहोस्। मध्य सप्ताहमा केही अप्रत्याशित समाचार आउन सक्छ। सकारात्मक सोच राख्नुस्। ${dailyNe}`
        : `This week shows professional advancement and financial improvement for ${sign.en}. Work collaboratively with family. Mid-week may bring unexpected news. Stay positive. ${dailyEn}`;
    }
    if (tab === "monthly") {
      return language === "ne"
        ? `यस महिना ${sign.ne} राशिका जातकहरूका लागि नयाँ अवसरको द्वार खुल्नेछ। स्वास्थ्य राम्रो रहनेछ। आर्थिक योजनाहरू क्रियान्वयन गर्नका लागि यो उपयुक्त महिना हो। विशेषगरी महिनाको अन्त्यमा शुभ समाचार आउनेछ। ${dailyNe}`
        : `This month opens new doors of opportunity for ${sign.en}. Health will be good. An ideal month for executing financial plans. Especially good news expected toward month-end. ${dailyEn}`;
    }
    return language === "ne" ? dailyNe : dailyEn;
  };

  return (
    <>
      <Header />
      <div style={{ background: "var(--background)", minHeight: "100vh" }}>
        {/* Hero */}
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #4a148c, #7b1fa2, #9c27b0)" }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #fff 0%, transparent 60%)" }} />
          <div className="mx-auto max-w-7xl px-4 py-10 text-center text-white relative">
            <div className="flex justify-center mb-3"><Sparkles className="h-12 w-12" /></div>
            <h1 className="text-3xl font-black mb-2" style={{ fontFamily: "var(--font-nepali-serif)" }}>
              {language === "ne" ? "दैनिक राशिफल" : "Daily Horoscope"}
            </h1>
            <p className="text-sm opacity-80">{today}</p>
            <p className="mt-2 text-sm opacity-70">
              {language === "ne"
                ? "आफ्नो राशि छान्नुहोस् र आजको भाग्य जान्नुहोस्"
                : "Select your zodiac sign and discover today's fortune"}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Tab Bar */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl w-fit"
            style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: tab === t.key ? "var(--primary)" : "transparent",
                  color: tab === t.key ? "#fff" : "var(--muted)",
                }}>
                {language === "ne" ? t.ne : t.en}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 mb-8">
            {ZODIAC_SIGNS.map((sign) => (
              <button
                key={sign.id}
                onClick={() => setSelected(selected === sign.id ? null : sign.id)}
                className="rounded-xl p-4 text-center transition-all cursor-pointer"
                style={{
                  background: selected === sign.id ? sign.color : "var(--surface)",
                  border: `2px solid ${selected === sign.id ? sign.color : "var(--border)"}`,
                  color: selected === sign.id ? "#fff" : "var(--foreground)",
                  transform: selected === sign.id ? "scale(1.05)" : "scale(1)",
                  boxShadow: selected === sign.id ? `0 4px 16px ${sign.color}40` : "none",
                }}
              >
                <div className="flex justify-center mb-1"><ZodiacIcon sign={sign.id} className="h-7 w-7" /></div>
                <div className="text-lg font-bold">{sign.symbol}</div>
                <div className="text-xs font-semibold mt-1">
                  {language === "ne" ? sign.ne : sign.en}
                </div>
                <div className="text-[10px] sm:text-xs opacity-70 mt-0.5 hidden sm:block truncate">
                  {language === "ne" ? sign.dates_ne : sign.dates_en}
                </div>
              </button>
            ))}
          </div>

          {/* Selected sign detail */}
          {selectedSign && (
            <div className="rounded-2xl overflow-hidden mb-8 animate-fadeIn"
              style={{ border: `2px solid ${selectedSign.color}40`, background: "var(--surface)" }}>
              <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${selectedSign.color}, ${selectedSign.color}cc)` }}>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex items-center"><ZodiacIcon sign={selectedSign.id} className="h-12 w-12 sm:h-14 sm:w-14" /></div>
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-black" style={{ fontFamily: "var(--font-nepali-serif)" }}>
                      {language === "ne" ? selectedSign.ne : selectedSign.en}
                    </h2>
                    <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm opacity-80 mt-1">
                      <span>{language === "ne" ? selectedSign.dates_ne : selectedSign.dates_en}</span>
                      <span>|</span>
                      <span>{language === "ne" ? `तत्व: ${selectedSign.element_ne}` : `Element: ${selectedSign.element_en}`}</span>
                      <span>|</span>
                      <span>{language === "ne" ? `स्वामी: ${selectedSign.ruling_ne}` : `Ruling: ${selectedSign.ruling_en}`}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: selectedSign.color }}>
                  <Sparkles className="h-4 w-4" />
                  {language === "ne"
                    ? (tab === "daily" ? "आजको राशिफल" : tab === "weekly" ? "साप्ताहिक राशिफल" : "मासिक राशिफल")
                    : (tab === "daily" ? "Today's Horoscope" : tab === "weekly" ? "Weekly Horoscope" : "Monthly Horoscope")}
                </h3>
                <p className="leading-relaxed mb-6" style={{ color: "var(--foreground)" }}>
                  {getReading(selectedSign)}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label_ne: "शुभ दिन", label_en: "Lucky Day", value_ne: selectedSign.lucky_ne, value_en: selectedSign.lucky_en },
                    { label_ne: "शुभ अङ्क", label_en: "Lucky Numbers", value_ne: selectedSign.lucky_num, value_en: selectedSign.lucky_num },
                    { label_ne: "शुभ रंग", label_en: "Lucky Color", value_ne: selectedSign.lucky_color_ne, value_en: selectedSign.lucky_color_en },
                  ].map((item, i) => (
                    <div key={i} className="rounded-lg p-3 text-center"
                      style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                      <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>
                        {language === "ne" ? item.label_ne : item.label_en}
                      </p>
                      <p className="font-bold text-sm" style={{ color: selectedSign.color }}>
                        {language === "ne" ? item.value_ne : item.value_en}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* All signs summary */}
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="px-6 py-4" style={{ background: "linear-gradient(135deg, #4a148c, #7b1fa2)", color: "#fff" }}>
              <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-nepali-serif)" }}>
                {language === "ne" ? "सबै राशिको संक्षिप्त दैनिक भाग्य" : "All Signs — Brief Daily Fortune"}
              </h2>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {ZODIAC_SIGNS.map((sign) => (
                <div key={sign.id}
                  className="flex items-start gap-4 px-6 py-4 cursor-pointer transition-colors"
                  style={{ background: selected === sign.id ? `${sign.color}08` : "transparent" }}
                  onClick={() => { setSelected(selected === sign.id ? null : sign.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 text-white font-bold"
                    style={{ background: sign.color }}>
                    {sign.symbol}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm" style={{ color: sign.color }}>
                        {language === "ne" ? sign.ne : sign.en}
                      </span>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        {language === "ne" ? sign.dates_ne : sign.dates_en}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                      {getReading(sign).substring(0, 80) + "..."}
                    </p>
                  </div>
                  <div className="text-xs px-2 py-1 rounded shrink-0"
                    style={{ background: `${sign.color}20`, color: sign.color }}>
                    {language === "ne" ? "विस्तार" : "Detail"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl p-4 flex items-center justify-center gap-2 text-center text-sm"
            style={{ background: "var(--surface-alt)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {language === "ne"
              ? "यो राशिफल ज्योतिषशास्त्रमा आधारित छ। यसलाई मनोरञ्जन मात्रका रूपमा लिनुहोस्।"
              : "This horoscope is based on astrology and is for entertainment purposes only."}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
