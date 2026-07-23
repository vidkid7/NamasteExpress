import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sign = searchParams.get("sign") ?? undefined;

    const latest = await prisma.rashifal.findFirst({
      orderBy: { ad_date: "desc" },
      select: { ad_date: true },
    });

    if (!latest) {
      return NextResponse.json({ success: false, error: "No rashifal data" }, { status: 404 });
    }

    const where: Record<string, unknown> = { ad_date: latest.ad_date };
    if (sign) where.sign = sign;

    const data = await prisma.rashifal.findMany({
      where,
      orderBy: { sign: "asc" },
    });

    return NextResponse.json({
      success: true,
      data,
      date: latest.ad_date,
      source: "db",
    }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800" }
    });
  } catch {
    // Fall through to date-based rotation
  }

  // ─── Fallback: date-seeded rotating predictions ───────────
  const PREDICTIONS: Record<string, { prediction: string; prediction_en: string }[]> = {
    mesh: [
      { prediction: "आज तपाईंको दिन सकारात्मक रहनेछ। नयाँ अवसरहरू आउँदैछन्। आर्थिक क्षेत्रमा लाभ हुनेछ।", prediction_en: "Today looks positive. New opportunities approach. Financial gains are indicated." },
      { prediction: "व्यापारमा महत्वपूर्ण निर्णय लिने समय आएको छ। विश्वासिलो साथीको सल्लाह लिनुस्।", prediction_en: "Time to make important business decisions. Seek advice from a trusted friend." },
      { prediction: "ऊर्जा उच्च छ तर आवेगमा निर्णय नगर्नुस्। शान्त मनले काम गर्नुस्।", prediction_en: "Energy is high but avoid impulsive decisions. Work with a calm mind." },
      { prediction: "परिवारसँग समय बिताउनुस् र उनीहरूको कुरा सुन्नुस्। सम्बन्ध सुदृढ हुनेछ।", prediction_en: "Spend time with family and listen to them. Relationships will strengthen." },
      { prediction: "स्वास्थ्यमा विशेष ध्यान दिनुस्। व्यायाम र सन्तुलित आहारले लाभ हुनेछ।", prediction_en: "Pay special attention to health. Exercise and balanced diet will benefit you." },
      { prediction: "नयाँ सीप सिक्ने राम्रो दिन हो। शिक्षा र प्रशिक्षणमा लगानी गर्नुस्।", prediction_en: "A good day to learn new skills. Invest in education and training." },
      { prediction: "साझेदारी र टोली कार्यमा सफलता मिल्नेछ। मिलेर काम गर्नुस्।", prediction_en: "Success in partnerships and teamwork. Work together for best results." },
    ],
    brish: [
      { prediction: "काम-व्यवसायमा प्रगति हुनेछ। धैर्यता र दृढताले सफलता दिलाउनेछ।", prediction_en: "Progress in work and business. Patience and determination bring success." },
      { prediction: "घर परिवारमा खुशी र शान्ति रहनेछ। साझा गतिविधिमा भाग लिनुस्।", prediction_en: "Happiness and peace at home. Participate in shared activities." },
      { prediction: "वित्तीय योजनामा समझदारी देखाउनुस्। दीर्घकालीन बचत गर्नुस्।", prediction_en: "Show wisdom in financial planning. Save for the long term." },
      { prediction: "प्रकृतिसँग समय बिताउनाले तपाईंलाई ताजगी दिनेछ। बाहिर जानुस्।", prediction_en: "Spending time with nature will refresh you. Go outside." },
      { prediction: "व्यावसायिक सम्बन्ध सुधार हुनेछ। नेटवर्किङमा ध्यान दिनुस्।", prediction_en: "Professional relationships will improve. Focus on networking." },
      { prediction: "खानपान र स्वास्थ्यमा ध्यान दिनुस्। सरल जीवनशैली अपनाउनुस्।", prediction_en: "Pay attention to diet and health. Adopt a simple lifestyle." },
      { prediction: "कलात्मक र सिर्जनात्मक कार्यमा उत्कृष्ट परिणाम आउनेछ।", prediction_en: "Excellent results in artistic and creative work." },
    ],
    mithun: [
      { prediction: "बौद्धिक कार्यमा सफलता मिल्नेछ। तर्क र विश्लेषण शक्ति बढ्नेछ।", prediction_en: "Success in intellectual work. Reasoning and analytical power will increase." },
      { prediction: "सञ्चार र लेखनमा उत्कृष्ट दिन छ। आफ्ना विचार साझा गर्नुस्।", prediction_en: "An excellent day for communication and writing. Share your thoughts." },
      { prediction: "एकैपटक धेरै काम गर्ने क्षमताको उपयोग गर्नुस्।", prediction_en: "Use your ability to multitask effectively." },
      { prediction: "नयाँ मान्छेहरूसँग भेट हुनेछ। खुला मनले गफ गर्नुस्।", prediction_en: "You'll meet new people. Converse with an open mind." },
      { prediction: "यात्राको योग छ। छोटो यात्राले मनलाई ताजगी दिनेछ।", prediction_en: "Travel is indicated. A short trip will refresh the mind." },
      { prediction: "जिज्ञासा अनुसार नयाँ विषयहरू अन्वेषण गर्नुस्। ज्ञान बढ्नेछ।", prediction_en: "Explore new subjects per your curiosity. Knowledge will grow." },
      { prediction: "व्यापारिक वार्तालापमा चतुरता देखाउनुस्। अनुकूल सम्झौता हुनेछ।", prediction_en: "Show cleverness in business negotiations. Favorable agreements ahead." },
    ],
    karkat: [
      { prediction: "गृहस्थ जीवनमा खुशी आउनेछ। घरको वातावरण सुखद रहनेछ।", prediction_en: "Joy in domestic life. Home atmosphere will be pleasant." },
      { prediction: "आमाबुबासँग राम्रो समय बित्नेछ। वडाबुढाको आशीर्वाद लिनुस्।", prediction_en: "Good time with parents. Seek elders' blessings." },
      { prediction: "संवेदनशीलता र सहानुभूतिले अरूलाई मदत गर्नेछ।", prediction_en: "Sensitivity and empathy will help others." },
      { prediction: "पैसाको सदुपयोग गर्नुस्। फजुल खर्च घटाउनुस्।", prediction_en: "Make good use of money. Reduce unnecessary expenses." },
      { prediction: "कलात्मक र सिर्जनात्मक काममा मन लाग्नेछ।", prediction_en: "You'll feel drawn to artistic and creative work." },
      { prediction: "साथीभाइको सहयोग गर्नुस्। बदलामा तपाईंलाई पनि सहयोग मिल्नेछ।", prediction_en: "Help friends. In return, you will also receive support." },
      { prediction: "ध्यानमग्न वा योगले मानसिक शान्ति मिल्नेछ।", prediction_en: "Meditation or yoga will bring mental peace." },
    ],
    simha: [
      { prediction: "नेतृत्व क्षमता उजागर हुनेछ। अरूलाई अगुवाई गर्नुस्।", prediction_en: "Leadership qualities shine. Lead others." },
      { prediction: "सामाजिक प्रतिष्ठा बढ्नेछ। सार्वजनिक कार्यमा भाग लिनुस्।", prediction_en: "Social prestige increases. Participate in public activities." },
      { prediction: "रचनात्मक कार्यमा उत्कृष्ट परिणाम आउनेछ।", prediction_en: "Excellent results in creative work." },
      { prediction: "आत्मविश्वास बढाउनुस्। आफ्नो शक्ति र क्षमतालाई विश्वास गर्नुस्।", prediction_en: "Boost self-confidence. Trust your strength and abilities." },
      { prediction: "मनोरञ्जन र खुशीको लागि समय निकाल्नुस्।", prediction_en: "Take time for entertainment and joy." },
      { prediction: "जोखिम उठाउने समय हो। साहसी कदम उठाउनुस्।", prediction_en: "Time to take risks. Take a brave step." },
      { prediction: "अहंकारलाई नियन्त्रण गर्नुस्। विनम्रता शक्ति हो।", prediction_en: "Control ego. Humility is strength." },
    ],
    kanya: [
      { prediction: "विश्लेषण क्षमता उत्कृष्ट रहनेछ। विस्तृत कामहरू गर्न उत्तम दिन।", prediction_en: "Analytical abilities are at peak. An excellent day for detailed work." },
      { prediction: "स्वास्थ्य सुधार हुनेछ। नियमित दिनचर्या पालना गर्नुस्।", prediction_en: "Health will improve. Follow a regular routine." },
      { prediction: "सेवा र मदत गर्ने भावना बढ्नेछ। अरूको काम लाग्नुस्।", prediction_en: "Desire to serve and help will grow. Be useful to others." },
      { prediction: "काममा सटीकता र परिश्रमले राम्रो नतिजा आउनेछ।", prediction_en: "Precision and hard work will bring good results." },
      { prediction: "व्यावहारिक योजना बनाउनुस् र कार्यान्वयन गर्नुस्।", prediction_en: "Make practical plans and implement them." },
      { prediction: "सिक्ने र सिकाउने दुवैमा आनन्द मिल्नेछ।", prediction_en: "Joy will come in both learning and teaching." },
      { prediction: "वातावरण र प्रकृतिप्रति चासो राख्नुस्।", prediction_en: "Show care for the environment and nature." },
    ],
    tula: [
      { prediction: "सम्बन्धमा सुमधुरता आउनेछ। सम्झौता र सहयोगमा सफलता।", prediction_en: "Harmony in relationships. Success in compromise and cooperation." },
      { prediction: "न्याय र सन्तुलनको पक्षमा उभिनुस्। सहीको साथ दिनुस्।", prediction_en: "Stand for justice and balance. Support what is right." },
      { prediction: "कलात्मक र सौन्दर्यसम्बन्धी कार्यमा आनन्द मिल्नेछ।", prediction_en: "Joy in artistic and aesthetic activities." },
      { prediction: "साझेदारीमा लाभ हुनेछ। मिलेर काम गर्नाले दोब्बर सफलता।", prediction_en: "Gains in partnerships. Working together brings double success." },
      { prediction: "फैसला गर्न कठिन लागे पनि समयमै निर्णय गर्नुस्।", prediction_en: "Even if decisions seem hard, decide in time." },
      { prediction: "प्रेम र मित्रताको सम्बन्ध गहिरो हुनेछ।", prediction_en: "Love and friendship bonds will deepen." },
      { prediction: "आर्थिक योजनामा विचार पुर्‍याउनुस्। अनावश्यक खर्च घटाउनुस्।", prediction_en: "Be thoughtful in financial planning. Reduce unnecessary expenses." },
    ],
    brishchik: [
      { prediction: "परिवर्तनको समय आएको छ। पुरानोलाई छोडेर नयाँ स्वागत गर्नुस्।", prediction_en: "Time for transformation. Let go of the old and welcome the new." },
      { prediction: "गहन अनुसन्धान र खोजमा सफलता मिल्नेछ।", prediction_en: "Success in deep research and investigation." },
      { prediction: "अन्तर्मनको आवाज सुन्नुस्। सहजज्ञानमा विश्वास गर्नुस्।", prediction_en: "Listen to your inner voice. Trust your intuition." },
      { prediction: "कठिन परिस्थितिमा पनि धैर्य राख्नुस्।", prediction_en: "Maintain patience even in difficult situations." },
      { prediction: "शक्तिशाली व्यक्तित्व र दृढताले लक्ष्य हासिल गर्नुस्।", prediction_en: "Achieve goals through powerful personality and determination." },
      { prediction: "पुरानो घाउहरू निको पार्ने समय आएको छ। माफ गर्नुस्।", prediction_en: "Time to heal old wounds. Forgive." },
      { prediction: "गहिरो सम्बन्ध र घनिष्ठ मित्रतामा आनन्द मिल्नेछ।", prediction_en: "Joy in deep relationships and close friendships." },
    ],
    dhanu: [
      { prediction: "ज्ञान र विद्यामा वृद्धि हुनेछ। पुस्तक पढ्न वा कोर्समा भर्ना हुनुस्।", prediction_en: "Growth in knowledge. Read books or enroll in a course." },
      { prediction: "विदेश यात्राको योग छ। अन्तर्राष्ट्रिय सम्बन्ध विस्तार गर्नुस्।", prediction_en: "Foreign travel is indicated. Expand international connections." },
      { prediction: "दर्शन र धर्ममा रुचि बढ्नेछ। आध्यात्मिक चिन्तनमा समय दिनुस्।", prediction_en: "Interest in philosophy and religion grows. Spend time in spiritual contemplation." },
      { prediction: "साहसिक गतिविधिमा भाग लिनुस्।", prediction_en: "Participate in adventurous activities." },
      { prediction: "उदार स्वभावले अरूको मन जित्नेछ।", prediction_en: "Generous nature will win others' hearts." },
      { prediction: "दीर्घकालीन योजनाहरू बनाउने राम्रो दिन हो।", prediction_en: "A good day to make long-term plans." },
      { prediction: "आशावादी दृष्टिकोणले जीवनलाई सुन्दर बनाउनेछ।", prediction_en: "An optimistic outlook will make life beautiful." },
    ],
    makar: [
      { prediction: "कठोर परिश्रमको फल मिल्नेछ। धैर्य र लगनले काम गर्नुस्।", prediction_en: "Hard work pays off. Work with patience and dedication." },
      { prediction: "व्यवसायमा दीर्घकालीन योजना बनाउनुस्। आधार मजबुत गर्नुस्।", prediction_en: "Make long-term business plans. Strengthen the foundation." },
      { prediction: "अनुशासन र समय व्यवस्थापन मुख्य हतियार हो।", prediction_en: "Discipline and time management are your main tools." },
      { prediction: "करियरमा महत्वपूर्ण अवसर आउन सक्छ। तयार रहनुस्।", prediction_en: "An important career opportunity may come. Be ready." },
      { prediction: "वडाबुढाको सल्लाह र मार्गदर्शन लिनुस्।", prediction_en: "Seek advice and guidance from elders." },
      { prediction: "व्यावहारिक दृष्टिकोणले समस्या सुल्झाउनुस्।", prediction_en: "Solve problems with a practical approach." },
      { prediction: "साना कदमहरूले ठूलो सफलता दिलाउनेछ।", prediction_en: "Small steps will lead to great success." },
    ],
    kumbha: [
      { prediction: "नवाचार र नयाँ विचारहरूमा सफलता मिल्नेछ।", prediction_en: "Success in innovation and new ideas." },
      { prediction: "सामाजिक परिवर्तनको लागि काम गर्नुस्। समाजसेवामा आनन्द मिल्नेछ।", prediction_en: "Work for social change. Joy in community service." },
      { prediction: "टेक्नोलोजी र विज्ञानमा रुचि बढ्नेछ।", prediction_en: "Interest in technology and science will grow." },
      { prediction: "मित्रता र सामाजिक सम्बन्धले जीवन समृद्ध बनाउनेछ।", prediction_en: "Friendship and social relationships will enrich life." },
      { prediction: "स्वतन्त्र सोच र मौलिकता तपाईंको शक्ति हो।", prediction_en: "Independent thinking and originality are your strengths." },
      { prediction: "नयाँ प्रविधि र तरिकाहरू अपनाउनाले काम सजिलो हुनेछ।", prediction_en: "Adopting new technology and methods will make work easier." },
      { prediction: "विश्वव्यापी दृष्टिकोणले तपाईंलाई अगाडि पुर्‍याउनेछ।", prediction_en: "A global perspective will take you forward." },
    ],
    meen: [
      { prediction: "कलात्मक र आध्यात्मिक कार्यमा उत्कृष्ट दिन हो।", prediction_en: "An excellent day for artistic and spiritual work." },
      { prediction: "सहानुभूति र करुणाले अरूलाई सहयोग गर्नुस्।", prediction_en: "Help others with empathy and compassion." },
      { prediction: "स्वप्न र कल्पनाशक्तिलाई वास्तवमा रूपान्तरण गर्नुस्।", prediction_en: "Transform dreams and imagination into reality." },
      { prediction: "एकान्त र ध्यानमग्नताले आन्तरिक शान्ति मिल्नेछ।", prediction_en: "Solitude and meditation will bring inner peace." },
      { prediction: "संगीत, कविता वा कलामा मन लाग्नेछ।", prediction_en: "You'll feel drawn to music, poetry or art." },
      { prediction: "अन्तर्मनको संकेतहरू बुझ्नुस् र अनुसरण गर्नुस्।", prediction_en: "Understand and follow the signals of your inner mind." },
      { prediction: "प्रेम र मैत्रीमा गहिराइ आउनेछ। भावनाहरू महत्वपूर्ण छन्।", prediction_en: "Depth will come in love and friendship. Emotions are important." },
    ],
  };

  const utcDay = Math.floor(Date.now() / 86400000);
  const today2 = new Date().toISOString().split("T")[0];

  const fallbackData = Object.entries(PREDICTIONS).map(([sign, pool]) => ({
    sign,
    prediction: pool[utcDay % pool.length].prediction,
    prediction_en: pool[utcDay % pool.length].prediction_en,
    rating: 3,
  }));

  return NextResponse.json({
    success: true,
    data: fallbackData,
    date: today2,
    source: "generated",
  }, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800" }
  });
}
