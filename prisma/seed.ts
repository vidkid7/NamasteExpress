import { PrismaClient, UserRole, ArticleStatus, CommentStatus, MatchStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createSeedClock } from "./seed-data/seed-date";
import { validateSeedFixtures } from "./seed-data/validate-fixtures";
import { verifiedSnapshots } from "./seed-data/verified-snapshots";

const prisma = new PrismaClient();
const seedClock = createSeedClock(process.env.SEED_DATE);

function hoursAgo(h: number) { return seedClock.hoursAgo(h); }
function daysAgo(d: number) { return seedClock.daysAgo(d); }
let randomState = 0x9e3779b9;
function rand(min: number, max: number) {
  randomState = (randomState * 1664525 + 1013904223) >>> 0;
  return min + (randomState % (max - min + 1));
}
function pick<T>(arr: T[]): T { return arr[rand(0, arr.length - 1)]; }
function seedPassword(envName: string, devFallback: string) {
  const value = process.env[envName];
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${envName} must be set before seeding production data.`);
  }
  return devFallback;
}

async function main() {
  console.log("🌱 Seeding database...");
  validateSeedFixtures();

  // ─── Users ─────────────────────────────────────────
  const pw = (p: string) => bcrypt.hash(p, 10);
  const adminSeedPassword = seedPassword("SEED_ADMIN_PASSWORD", "Admin@12345");
  const editorSeedPassword = seedPassword("SEED_EDITOR_PASSWORD", "Editor@12345");
  const authorSeedPassword = seedPassword("SEED_AUTHOR_PASSWORD", "Author@12345");
  const adminPw = await pw(adminSeedPassword);
  const editorPw = await pw(editorSeedPassword);
  const authorPw = await pw(authorSeedPassword);

  const admin = await prisma.user.upsert({ where: { email: "admin@namastexpress.com" }, update: {}, create: { name: "राजेश शर्मा", email: "admin@namastexpress.com", password_hash: adminPw, role: UserRole.ADMIN, emailVerified: new Date() } });
  const editor = await prisma.user.upsert({ where: { email: "editor@namastexpress.com" }, update: {}, create: { name: "सुनिता पौडेल", email: "editor@namastexpress.com", password_hash: editorPw, role: UserRole.EDITOR, emailVerified: new Date() } });
  const a1 = await prisma.user.upsert({ where: { email: "author@namastexpress.com" }, update: {}, create: { name: "कमल अधिकारी", email: "author@namastexpress.com", password_hash: authorPw, role: UserRole.AUTHOR, emailVerified: new Date() } });
  const a2 = await prisma.user.upsert({ where: { email: "author2@namastexpress.com" }, update: {}, create: { name: "प्रतिभा गुरुङ", email: "author2@namastexpress.com", password_hash: authorPw, role: UserRole.AUTHOR, emailVerified: new Date() } });
  const a3 = await prisma.user.upsert({ where: { email: "author3@namastexpress.com" }, update: {}, create: { name: "विनोद थापा", email: "author3@namastexpress.com", password_hash: authorPw, role: UserRole.AUTHOR, emailVerified: new Date() } });
  const a4 = await prisma.user.upsert({ where: { email: "author4@namastexpress.com" }, update: {}, create: { name: "आस्था श्रेष्ठ", email: "author4@namastexpress.com", password_hash: authorPw, role: UserRole.AUTHOR, emailVerified: new Date() } });
  const a5 = await prisma.user.upsert({ where: { email: "author5@namastexpress.com" }, update: {}, create: { name: "रबिन्द्र बुढाथोकी", email: "author5@namastexpress.com", password_hash: authorPw, role: UserRole.AUTHOR, emailVerified: new Date() } });
  const authors = [admin, editor, a1, a2, a3, a4, a5];

  // Reader accounts for comments
  const r1 = await prisma.user.upsert({ where: { email: "reader1@namastexpress.com" }, update: {}, create: { name: "सुरेश केसी", email: "reader1@namastexpress.com", password_hash: authorPw, role: UserRole.READER, emailVerified: new Date() } });
  const r2 = await prisma.user.upsert({ where: { email: "reader2@namastexpress.com" }, update: {}, create: { name: "मीना राई", email: "reader2@namastexpress.com", password_hash: authorPw, role: UserRole.READER, emailVerified: new Date() } });
  const r3 = await prisma.user.upsert({ where: { email: "reader3@namastexpress.com" }, update: {}, create: { name: "दिपेन्द्र खड्का", email: "reader3@namastexpress.com", password_hash: authorPw, role: UserRole.READER, emailVerified: new Date() } });
  const r4 = await prisma.user.upsert({ where: { email: "reader4@namastexpress.com" }, update: {}, create: { name: "अनिता लामा", email: "reader4@namastexpress.com", password_hash: authorPw, role: UserRole.READER, emailVerified: new Date() } });
  const readers = [r1, r2, r3, r4];
  console.log("   ✅ Users seeded");

  // ─── Categories ────────────────────────────────────
  const catData = [
    { name: "समाचार",          name_en: "News",          slug: "samachar",       color: "#c62828", sort_order: 1  },
    { name: "राजनीति",         name_en: "Politics",      slug: "rajniti",        color: "#1565c0", sort_order: 2  },
    { name: "अर्थतन्त्र",      name_en: "Economy",       slug: "arthatantra",    color: "#2e7d32", sort_order: 3  },
    { name: "खेलकुद",          name_en: "Sports",        slug: "khelkud",        color: "#e65100", sort_order: 4  },
    { name: "प्रविधि",         name_en: "Technology",    slug: "prabidhi",       color: "#6a1b9a", sort_order: 5  },
    { name: "विचार",           name_en: "Opinion",       slug: "bichar",         color: "#00838f", sort_order: 6  },
    { name: "अन्तर्वार्ता",    name_en: "Interview",     slug: "antarvaarta",    color: "#4e342e", sort_order: 7  },
    { name: "फिचर",            name_en: "Feature",       slug: "feature",        color: "#ad1457", sort_order: 8  },
    { name: "कभर स्टोरी",      name_en: "Cover Story",   slug: "cover-story",    color: "#bf360c", sort_order: 9  },
    { name: "सप्ताहान्त",      name_en: "Weekend",       slug: "saptaahanta",    color: "#558b2f", sort_order: 10 },
    { name: "अन्तर्राष्ट्रिय", name_en: "International", slug: "antarrashtriya", color: "#283593", sort_order: 11 },
    { name: "साहित्य",         name_en: "Literature",    slug: "sahitya",        color: "#6d4c41", sort_order: 12 },
    { name: "विचित्र संसार",   name_en: "Weird World",   slug: "bichitra",       color: "#f57f17", sort_order: 13 },
    { name: "भिडियो",          name_en: "Video",         slug: "video",          color: "#d50000", sort_order: 14 },
    { name: "फोटो ग्यालेरी",   name_en: "Photo Gallery", slug: "photo-gallery",  color: "#0097a7", sort_order: 15 },
    { name: "स्वास्थ्य",       name_en: "Health",        slug: "swasthya",       color: "#00695c", sort_order: 16 },
    { name: "शिक्षा",          name_en: "Education",     slug: "shiksha",        color: "#1976d2", sort_order: 17 },
  ];
  const cats: Record<string, { id: string }> = {};
  for (const c of catData) {
    cats[c.slug] = await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  console.log("   ✅ Categories seeded");

  // ─── Tags ──────────────────────────────────────────
  const tagSlugs = ["breaking","trending","exclusive","analysis","nepal","politics","economy","sports","tech","health","education","international","culture","environment","climate"];
  const tagData: Record<string,{ne:string,en:string}> = {
    breaking:      { ne: "ब्रेकिङ",       en: "Breaking"      },
    trending:      { ne: "ट्रेन्डिङ",     en: "Trending"      },
    exclusive:     { ne: "एक्सक्लुसिभ",   en: "Exclusive"     },
    analysis:      { ne: "विश्लेषण",       en: "Analysis"      },
    nepal:         { ne: "नेपाल",          en: "Nepal"         },
    politics:      { ne: "राजनीति",        en: "Politics"      },
    economy:       { ne: "अर्थतन्त्र",     en: "Economy"       },
    sports:        { ne: "खेलकुद",         en: "Sports"        },
    tech:          { ne: "प्रविधि",        en: "Technology"    },
    health:        { ne: "स्वास्थ्य",      en: "Health"        },
    education:     { ne: "शिक्षा",         en: "Education"     },
    international: { ne: "अन्तर्राष्ट्रिय",en: "International" },
    culture:       { ne: "संस्कृति",       en: "Culture"       },
    environment:   { ne: "वातावरण",        en: "Environment"   },
    climate:       { ne: "जलवायु",         en: "Climate"       },
  };
  const tags: Record<string, { id: string }> = {};
  for (const s of tagSlugs) {
    const d = tagData[s];
    tags[s] = await prisma.tag.upsert({ where: { slug: s }, update: {}, create: { name: d.ne, name_en: d.en, slug: s } });
  }
  console.log("   ✅ Tags seeded");

  // ─── Articles ──────────────────────────────────────
  type ArticleSeed = {
    title: string; title_en: string; slug: string;
    excerpt: string; excerpt_en: string;
    content: string; content_en?: string;
    cat: string; featured: boolean;
    hours: number; views: number;
  };

  const articleSeed: ArticleSeed[] = [
    // ── समाचार ──────────────────────────────────────────
    { title: "प्रधानमन्त्रीले नयाँ विकास नीति सार्वजनिक गरे", title_en: "PM Unveils New Development Policy", slug: "pm-new-development-policy", excerpt: "प्रधानमन्त्रीले आज नयाँ विकास नीति सार्वजनिक गरेका छन्।", excerpt_en: "The Prime Minister unveiled a new development policy today.", content: "<p>प्रधानमन्त्रीले आज एक विशेष कार्यक्रमको आयोजना गरी नयाँ विकास नीति सार्वजनिक गरेका छन्। यो नीतिले आगामी पाँच वर्षको विकास खाका प्रस्तुत गर्दछ।</p><h2>नीतिका मुख्य बुँदाहरू</h2><p>पूर्वाधार विकास, डिजिटल रूपान्तरण र हरित ऊर्जामा विशेष जोड दिइएको छ। शिक्षा र स्वास्थ्य क्षेत्रमा बजेट बढाइने प्रतिबद्धता जनाइएको छ।</p><h2>विपक्षी दलको प्रतिक्रिया</h2><p>विपक्षी दलले नीतिलाई अव्यावहारिक भन्दै आलोचना गरेका छन्। नेकपाका प्रमुख नेताले भने यो नीति लागू हुन सम्भव नरहेको बताए।</p>", content_en: "<p>The Prime Minister unveiled a new development policy at a special event today, outlining the five-year development blueprint for the nation.</p>", cat: "samachar", featured: true,  hours: 1,  views: 4560 },
    { title: "काठमाडौं उपत्यकामा वायु प्रदूषण उच्च", title_en: "Air Pollution Reaches Alarming Levels in Kathmandu Valley", slug: "kathmandu-air-pollution-high", excerpt: "काठमाडौं उपत्यकामा वायु गुणस्तर सूचकांक खतरनाक स्तरमा पुगेको छ।", excerpt_en: "Air quality index has reached dangerous levels in Kathmandu Valley.", content: "<p>काठमाडौं उपत्यकामा वायु गुणस्तर सूचकांक (AQI) २५० नाघेको छ जुन 'अस्वस्थकर' श्रेणीमा पर्छ।</p><h2>कारणहरू</h2><p>सवारी धुवाँ, निर्माण कार्य र ढुसीले वायु प्रदूषण बढाएको छ।</p><h2>स्वास्थ्यमा प्रभाव</h2><p>डाक्टरहरूले सर्वसाधारणलाई घरभित्रै बस्न र मास्क लगाउन सल्लाह दिएका छन्।</p>", cat: "samachar", featured: true,  hours: 2,  views: 3890 },
    { title: "नेपाल–भारत सीमा विवाद पुनः चर्चामा", title_en: "Nepal-India Border Dispute Resurfaces", slug: "nepal-india-border-dispute", excerpt: "लिपुलेक, कालापानी र लिम्पियाधुराको विषय फेरि चर्चामा आएको छ।", excerpt_en: "Lipulekh, Kalapani and Limpiyadhura issue resurfaces.", content: "<p>नेपाल र भारतबीचको सीमा विवादको विषयले पुनः राजनीतिक र कूटनीतिक क्षेत्रमा ध्यान तानेको छ। परराष्ट्र मन्त्रालयले यस विषयमा आधिकारिक प्रतिक्रिया जनाउन समय नलागेको बताएको छ।</p>", cat: "samachar", featured: false, hours: 3,  views: 5200 },
    { title: "स्थानीय निर्वाचन : तयारी तीव्र", title_en: "Local Elections: Preparations Intensify", slug: "local-elections-prep", excerpt: "आगामी स्थानीय निर्वाचनको तयारी तीव्र गतिमा अघि बढिरहेको छ।", excerpt_en: "Preparations for upcoming local elections are intensifying.", content: "<p>निर्वाचन आयोगले स्थानीय निर्वाचनको तयारी तीव्र पारेको छ। मतदाता नामावली अद्यावधिक गरिँदैछ। देशभरका ७५३ स्थानीय तहमा एकै दिन निर्वाचन गर्ने तयारी छ।</p>", cat: "samachar", featured: false, hours: 4,  views: 1980 },
    { title: "सगरमाथामा यो सिजनमा ४५० आरोहण अनुमति", title_en: "450 Everest Climbing Permits This Season", slug: "everest-450-permits", excerpt: "सगरमाथा आरोहण सिजनमा ४५० जनालाई अनुमति दिइएको छ।", excerpt_en: "450 people have been given permits for Everest climbing season.", content: "<p>पर्यटन विभागले यो वसन्त सिजनमा ४५० जनालाई सगरमाथा आरोहण अनुमति दिएको छ। यो सङ्ख्या अघिल्लो वर्षभन्दा ३० बढी हो।</p><h2>आरोहण दस्तुर</h2><p>प्रति व्यक्ति ११,००० अमेरिकी डलर आरोहण दस्तुर तोकिएको छ।</p>", cat: "samachar", featured: false, hours: 16, views: 2340 },
    { title: "पर्यटन वर्ष: लक्ष्य र चुनौती", title_en: "Tourism Year: Goals and Challenges", slug: "tourism-year-goals", excerpt: "पर्यटन वर्षको लक्ष्य हासिल गर्न चुनौती देखिएको छ।", excerpt_en: "Challenges appear in achieving tourism year targets.", content: "<p>सरकारले घोषणा गरेको पर्यटन वर्षमा लक्ष्य अनुसार पर्यटक भित्र्याउन चुनौती देखिएको छ। जलवायु परिवर्तन, सडक पूर्वाधार र प्रचारको अभावले लक्ष्य हासिल गर्न कठिन भइरहेको छ।</p>", cat: "samachar", featured: false, hours: 13, views: 1100 },
    { title: "बिजुलीको दरमा वृद्धि प्रस्ताव", title_en: "Electricity Tariff Hike Proposed", slug: "electricity-tariff-hike", excerpt: "नेपाल विद्युत प्राधिकरणले बिजुलीको दरमा वृद्धि प्रस्ताव गरेको छ।", excerpt_en: "Nepal Electricity Authority proposes tariff hike.", content: "<p>नेपाल विद्युत प्राधिकरणले बिजुलीको दरमा १५ प्रतिशत वृद्धि प्रस्ताव गरेको छ। आगामी आर्थिक वर्षदेखि नयाँ दर लागू हुने सम्भावना छ।</p>", cat: "samachar", featured: false, hours: 5,  views: 1890 },
    { title: "मनसुन यस वर्ष समयमै आउने", title_en: "Monsoon Expected on Time This Year", slug: "monsoon-on-time", excerpt: "मौसम विभागले यस वर्ष मनसुन समयमै आउने जनाएको छ।", excerpt_en: "The meteorology department says monsoon will arrive on time this year.", content: "<p>राष्ट्रिय मौसम पूर्वानुमान विभागले यस वर्ष मनसुन जुन महिनाको दोस्रो साताभित्र नेपाल प्रवेश गर्ने पूर्वानुमान जारी गरेको छ।</p>", cat: "samachar", featured: false, hours: 6,  views: 1540 },
    { title: "राष्ट्रिय जनगणना: नतिजा सार्वजनिक", title_en: "National Census: Results Published", slug: "national-census-results", excerpt: "राष्ट्रिय जनगणना २०७८ को अन्तिम नतिजा सार्वजनिक भएको छ।", excerpt_en: "Final results of National Census 2078 published.", content: "<p>केन्द्रीय तथ्याङ्क विभागले राष्ट्रिय जनगणना २०७८ को अन्तिम नतिजा सार्वजनिक गरेको छ। देशको कुल जनसंख्या २ करोड ९१ लाख ९२ हजार पुगेको छ।</p><h2>प्रमुख तथ्यहरू</h2><p>जनसंख्या वृद्धि दर ०.९२ प्रतिशत रहेको छ। साक्षरता दर ७६.३ प्रतिशत पुगेको छ।</p>", cat: "samachar", featured: false, hours: 24, views: 3200 },
    { title: "काठमाडौंमा नयाँ मेट्रो परियोजना घोषणा", title_en: "New Metro Project Announced for Kathmandu", slug: "kathmandu-metro-project", excerpt: "काठमाडौंमा ३२ किमी लम्बाइको मेट्रो रेल परियोजना घोषणा गरिएको छ।", excerpt_en: "A 32 km metro rail project announced for Kathmandu.", content: "<p>सरकारले काठमाडौं उपत्यकामा भूमिगत मेट्रो रेल परियोजना निर्माण गर्ने निर्णय गरेको छ। जापानको सहयोगमा यो परियोजना कार्यान्वयनमा आउने छ।</p>", cat: "samachar", featured: true,  hours: 8,  views: 6780 },
    { title: "भूकम्पको जोखिम: नेपालको तयारी कस्तो?", title_en: "Earthquake Risk: How Prepared Is Nepal?", slug: "earthquake-risk-nepal-preparation", excerpt: "नेपाल विश्वका सर्वाधिक भूकम्प जोखिमपूर्ण देशहरूमध्येको एक हो।", excerpt_en: "Nepal is one of the most earthquake-prone countries in the world.", content: "<p>२०१५ को विनाशकारी भूकम्पको एक दशकपछि नेपालको भूकम्प तयारीको अवस्था के छ?</p><h2>तयारीको अवस्था</h2><p>भूकम्प जोखिम न्यूनीकरण राष्ट्रिय समाजले देशभर ४,५०० भवनको मूल्यांकन गरेको छ।</p>", cat: "samachar", featured: false, hours: 36, views: 2890 },

    // ── राजनीति ──────────────────────────────────────────
    { title: "संसदमा बजेट अधिवेशन सुरु", title_en: "Budget Session Begins in Parliament", slug: "parliament-budget-session", excerpt: "संघीय संसदमा बजेट अधिवेशन आजदेखि सुरु भएको छ।", excerpt_en: "The federal parliament budget session began today.", content: "<p>संघीय संसदको बजेट अधिवेशन आजदेखि सुरु भएको छ। अर्थमन्त्रीले आगामी हप्ता बजेट प्रस्तुत गर्ने तयारी गरिरहेका छन्।</p><h2>मुख्य एजेन्डा</h2><p>बजेट प्रस्तुति, सरकारी नीति तथा कार्यक्रम र विनियोजन विधेयक प्रमुख एजेन्डा रहेका छन्।</p>", cat: "rajniti", featured: true,  hours: 5,  views: 3560 },
    { title: "सत्तारुढ गठबन्धनमा असहमति", title_en: "Disagreement in Ruling Coalition", slug: "ruling-coalition-disagreement", excerpt: "सत्तारुढ गठबन्धनका दलहरूबीच मन्त्रालय बाँडफाँडमा असहमति देखिएको छ।", excerpt_en: "Ruling coalition parties show disagreement over ministry allocation.", content: "<p>सत्तारुढ गठबन्धनभित्र मन्त्रालय बाँडफाँडलाई लिएर विवाद बढेको छ। आन्तरिक बैठकमा तीखो बहस भएको स्रोतहरूले जानकारी दिएका छन्।</p>", cat: "rajniti", featured: false, hours: 6,  views: 2100 },
    { title: "विपक्षी दलको संसद अवरोध", title_en: "Opposition Blocks Parliament", slug: "opposition-blocks-parliament", excerpt: "प्रमुख विपक्षी दलले संसद अवरोध गरेका छन्।", excerpt_en: "Main opposition party blocks parliament proceedings.", content: "<p>प्रमुख विपक्षी दलले महँगी र भ्रष्टाचारको मुद्दा उठाउँदै संसद अवरोध गरेका छन्। सत्तापक्षले अवरोध गैरसंवैधानिक भनेको छ।</p>", cat: "rajniti", featured: false, hours: 8,  views: 1340 },
    { title: "राष्ट्रपतिले सभामुखसँग भेट गरे", title_en: "President Meets Speaker", slug: "president-meets-speaker", excerpt: "राष्ट्रपतिले आज सभामुखसँग महत्वपूर्ण भेटवार्ता गरेका छन्।", excerpt_en: "President held an important meeting with the Speaker today.", content: "<p>राष्ट्रपतिले सभामुखसँग संसदको आगामी सत्रको तयारीबारे विस्तृत छलफल गरेका छन्।</p>", cat: "rajniti", featured: false, hours: 7,  views: 890 },
    { title: "नयाँ राजनीतिक दल दर्ता: निर्वाचन आयोगले स्वीकृति दियो", title_en: "New Political Party Registered", slug: "new-party-registered", excerpt: "निर्वाचन आयोगले नयाँ राजनीतिक दललाई दर्ता स्वीकृति दिएको छ।", excerpt_en: "Election Commission approves registration of new political party.", content: "<p>नेपालमा अर्को नयाँ राजनीतिक दल दर्ता भएको छ। यो दललाई युवाहरूको साथ रहेको बताइएको छ।</p>", cat: "rajniti", featured: false, hours: 18, views: 780 },
    { title: "भ्रष्टाचार अनुसन्धान: ३ मन्त्रीमाथि छानबिन", title_en: "Corruption Probe: 3 Ministers Under Investigation", slug: "corruption-probe-ministers", excerpt: "अख्तियार दुरुपयोग अनुसन्धान आयोगले तीन मन्त्रीमाथि छानबिन थालेको छ।", excerpt_en: "CIAA begins investigation against three ministers.", content: "<p>अख्तियार दुरुपयोग अनुसन्धान आयोगले तीन मन्त्रीको सम्पत्ति विवरण खरिदार गरी छानबिन थालेको छ।</p>", cat: "rajniti", featured: false, hours: 14, views: 4500 },
    { title: "प्रदेश सभाको विशेष बैठक आह्वान", title_en: "Special Provincial Assembly Session Called", slug: "provincial-assembly-special-session", excerpt: "लुम्बिनी प्रदेशमा विशेष बैठक आह्वान गरिएको छ।", excerpt_en: "Special session called in Lumbini Province.", content: "<p>लुम्बिनी प्रदेश सभाको विशेष बैठक अर्को हप्ता बस्ने भएको छ। प्रदेश सरकारको विश्वासमत प्रमुख एजेन्डा रहेको छ।</p>", cat: "rajniti", featured: false, hours: 20, views: 560 },
    { title: "संविधान दिवस: राष्ट्रिय कार्यक्रम सम्पन्न", title_en: "Constitution Day: National Program Concluded", slug: "constitution-day-celebration", excerpt: "संविधान दिवसको अवसरमा देशभर विभिन्न कार्यक्रम आयोजना गरियो।", excerpt_en: "Various programs held across the country on Constitution Day.", content: "<p>संविधान दिवसको अवसरमा राजधानी काठमाडौंसहित देशभरका प्रमुख स्थानमा कार्यक्रम आयोजना गरियो।</p>", cat: "rajniti", featured: false, hours: 48, views: 1230 },

    // ── अर्थतन्त्र ──────────────────────────────────────────
    { title: "नेपाल राष्ट्र बैंकले ब्याजदर घटायो", title_en: "Nepal Rastra Bank Cuts Interest Rate", slug: "nrb-interest-rate-cut", excerpt: "नेपाल राष्ट्र बैंकले नीतिगत ब्याजदर ०.५ प्रतिशतले घटाएको छ।", excerpt_en: "Nepal Rastra Bank reduced the policy rate by 0.5 percent.", content: "<p>नेपाल राष्ट्र बैंकले मौद्रिक नीति समीक्षा गर्दै नीतिगत ब्याजदर ५.५ प्रतिशतबाट ५ प्रतिशतमा झारेको छ।</p><h2>प्रभाव</h2><p>यसले कर्जा सस्तो हुने र आर्थिक गतिविधिमा तीव्रता आउने अपेक्षा गरिएको छ।</p><h2>बैंकहरूको प्रतिक्रिया</h2><p>व्यापारिक बैंकहरूले ब्याजदर घटाउन सकारात्मक प्रतिक्रिया जनाएका छन्।</p>", cat: "arthatantra", featured: true,  hours: 3,  views: 3780 },
    { title: "रेमिट्यान्समा २० प्रतिशत वृद्धि", title_en: "Remittance Increases by 20 Percent", slug: "remittance-20-percent-increase", excerpt: "गत आर्थिक वर्षमा रेमिट्यान्स आप्रवाहमा उल्लेखनीय वृद्धि भएको छ।", excerpt_en: "Remittance inflows saw a significant increase last fiscal year.", content: "<p>गत आर्थिक वर्षमा रेमिट्यान्स आप्रवाह ११ खर्ब ४५ अर्ब रुपैयाँ पुगेको छ जुन अघिल्लो वर्षको तुलनामा २० प्रतिशत बढी हो।</p>", cat: "arthatantra", featured: false, hours: 7,  views: 1890 },
    { title: "सुनको मूल्य नयाँ उचाइमा", title_en: "Gold Price Hits New High", slug: "gold-price-new-high", excerpt: "सुनको मूल्यले नयाँ रेकर्ड कायम गरेको छ।", excerpt_en: "Gold price sets a new record.", content: "<p>अन्तर्राष्ट्रिय बजारमा सुनको मूल्य प्रतिऔंस २,५०० डलर नाघेसँगै नेपालमा पनि तोलाको मूल्य १ लाख ४५ हजार पुगेको छ।</p><h2>कारण</h2><p>डलर कमजोर हुँदा र भूराजनीतिक तनावले लगानीकर्ताहरू सुनतर्फ आकर्षित भएका छन्।</p>", cat: "arthatantra", featured: false, hours: 1,  views: 4500 },
    { title: "शेयर बजारमा तीव्र उतार-चढाव", title_en: "Stock Market Sees Sharp Volatility", slug: "stock-market-volatility", excerpt: "नेप्सेमा आज भारी उतार-चढाव देखियो।", excerpt_en: "NEPSE witnessed heavy volatility today.", content: "<p>नेपाल स्टक एक्सचेन्जमा आज ३ प्रतिशतभन्दा बढी उतार-चढाव देखियो। बैंकिङ क्षेत्रका शेयर सबैभन्दा बढी प्रभावित भए।</p>", cat: "arthatantra", featured: false, hours: 9,  views: 2670 },
    { title: "नगद अभाव: बैंकहरू चिन्तित", title_en: "Cash Shortage: Banks Worried", slug: "cash-shortage-banks", excerpt: "बैंकिङ प्रणालीमा नगद अभावले चिन्ता बढाएको छ।", excerpt_en: "Cash shortage in banking system raises concerns.", content: "<p>बैंकहरूमा नगद अभावको समस्या बढ्दै गएको छ। NRB ले छिट्टै समाधान खोज्ने बताएको छ।</p>", cat: "arthatantra", featured: false, hours: 14, views: 1290 },
    { title: "विदेशी लगानी: नेपालमा नयाँ परियोजनाहरू", title_en: "Foreign Investment: New Projects in Nepal", slug: "foreign-investment-new-projects", excerpt: "नेपालमा विदेशी प्रत्यक्ष लगानीमा उल्लेखनीय वृद्धि भएको छ।", excerpt_en: "Significant increase in foreign direct investment in Nepal.", content: "<p>नेपालमा चालू आर्थिक वर्षमा विदेशी प्रत्यक्ष लगानी (FDI) ले नयाँ उचाइ छोएको छ। चीन, भारत र दक्षिण कोरियाका कम्पनीहरू नयाँ परियोजनामा लगानी गर्न इच्छुक छन्।</p>", cat: "arthatantra", featured: false, hours: 22, views: 1120 },
    { title: "कृषि उत्पादनमा रेकर्ड वृद्धि", title_en: "Record Growth in Agricultural Production", slug: "agriculture-record-growth", excerpt: "यस वर्ष धान, मकै र गहुँको उत्पादन रेकर्ड स्तरमा पुगेको छ।", excerpt_en: "Production of rice, maize and wheat reaches record levels this year.", content: "<p>कृषि विभागले यस वर्षको कृषि उत्पादनको प्रारम्भिक तथ्याङ्क सार्वजनिक गरेको छ। धानको उत्पादन ५६ लाख मेट्रिक टन पुगेको छ।</p>", cat: "arthatantra", featured: false, hours: 30, views: 890 },

    // ── खेलकुद ──────────────────────────────────────────
    { title: "नेपाली क्रिकेट टोलीले ऐतिहासिक जित हात पार्यो", title_en: "Nepal Cricket Team Secures Historic Victory", slug: "nepal-cricket-historic-victory", excerpt: "नेपालले एक दिवसीय अन्तर्राष्ट्रिय (ODI) खेलमा ऐतिहासिक जित हासिल गरेको छ।", excerpt_en: "Nepal secured a historic victory in an ODI match.", content: "<p>नेपालले आज भएको एक दिवसीय अन्तर्राष्ट्रिय खेलमा ६ विकेटले जित हासिल गरेको छ। यो नेपाली क्रिकेटको इतिहासमा ऐतिहासिक क्षण हो।</p><h2>खेलको सारांश</h2><p>पहिले ब्याटिङ गरेको प्रतिद्वन्द्वी टोलीले २२३ रन बनायो। नेपालले ४४ ओभरमा लक्ष्य भेट्टायो। रोहित पौडेलले शानदार शतक लगाए।</p>", cat: "khelkud", featured: true,  hours: 2,  views: 7600 },
    { title: "साफ च्याम्पियनसिप: नेपाल फाइनलमा", title_en: "SAFF Championship: Nepal in Finals", slug: "saff-championship-nepal-finals", excerpt: "नेपालले सेमिफाइनल जित्दै फाइनलमा प्रवेश गरेको छ।", excerpt_en: "Nepal enters finals after winning the semifinal.", content: "<p>नेपालले आज भएको सेमिफाइनलमा बंगलादेशलाई २-१ गोलले हराउँदै फाइनलमा स्थान पक्का गरेको छ। गोलकिपर किरण चेमजोङले उत्कृष्ट प्रदर्शन गरे।</p>", cat: "khelkud", featured: false, hours: 4,  views: 5200 },
    { title: "IPL मा नेपाली खेलाडीको चर्चा", title_en: "Nepali Player Creates Buzz in IPL", slug: "nepali-player-ipl-buzz", excerpt: "IPL मा सन्दीप लामिछानेको प्रदर्शनले चर्चा मच्चाएको छ।", excerpt_en: "Sandeep Lamichhane's performance creates buzz in IPL.", content: "<p>सन्दीप लामिछानेले IPL मा शानदार प्रदर्शन गर्दै ४ विकेट लिएका छन्। उनको लेग स्पिन बलिङ विश्वका सर्वश्रेष्ठ ब्याट्सम्यानहरूलाई पनि चुनौतीपूर्ण भएको छ।</p>", cat: "khelkud", featured: false, hours: 10, views: 4800 },
    { title: "महिला फुटबल टोलीले स्वर्ण जित्यो", title_en: "Women's Football Team Wins Gold", slug: "womens-football-gold", excerpt: "नेपाली महिला फुटबल टोलीले दक्षिण एसियाली खेलकुदमा स्वर्ण पदक जितेको छ।", excerpt_en: "Nepal women's football team wins gold at South Asian Games.", content: "<p>नेपाली महिला फुटबल टोलीले दक्षिण एसियाली खेलकुदमा स्वर्ण पदक हासिल गरेको छ। फाइनलमा भारतलाई ३-१ ले हराइयो।</p>", cat: "khelkud", featured: false, hours: 7,  views: 4100 },
    { title: "ओलम्पिक तयारी: नेपाली खेलाडीको अभ्यास तीव्र", title_en: "Olympic Prep: Nepali Athletes Intensify Training", slug: "olympic-prep-nepal", excerpt: "ओलम्पिकका लागि नेपाली खेलाडीहरूको तयारी तीव्र बनेको छ।", excerpt_en: "Nepali athletes intensify training for the Olympics.", content: "<p>पेरिस ओलम्पिकका लागि छनोट भएका नेपाली खेलाडीहरूले तयारी तीव्र पारेका छन्। ताइक्वान्दो, बक्सिङ र वेटलिफ्टिङमा नेपालले सहभागिता जनाउने छ।</p>", cat: "khelkud", featured: false, hours: 15, views: 2450 },
    { title: "नेपाल भर्सेस अफगानिस्तान: क्रिकेट सिरिज घोषणा", title_en: "Nepal vs Afghanistan Cricket Series Announced", slug: "nepal-afghanistan-cricket-series", excerpt: "नेपाल र अफगानिस्तानबीच तीन खेलको ODI सिरिज घोषणा भएको छ।", excerpt_en: "Three-match ODI series between Nepal and Afghanistan announced.", content: "<p>क्रिकेट संघ नेपाल (CAN) ले अफगानिस्तानसँग गृह श्रृंखला खेल्ने घोषणा गरेको छ। यो सिरिज त्रिभुवन विश्वविद्यालय मैदानमा हुनेछ।</p>", cat: "khelkud", featured: false, hours: 28, views: 1890 },
    { title: "काठमाडौं म्याराथन: विश्व कीर्तिमान", title_en: "Kathmandu Marathon: World Record Set", slug: "kathmandu-marathon-record", excerpt: "काठमाडौं म्याराथनमा ३२ देशका धावकले सहभागिता जनाए।", excerpt_en: "Runners from 32 countries participated in the Kathmandu Marathon.", content: "<p>वार्षिक काठमाडौं म्याराथनमा यस वर्ष ३२ देशका ४,५०० भन्दा बढी धावक सहभागी भए। इथियोपियाका एक धावकले नयाँ कीर्तिमान स्थापित गरे।</p>", cat: "khelkud", featured: false, hours: 40, views: 1670 },

    // ── प्रविधि ──────────────────────────────────────────
    { title: "नेपालमा 5G सेवा सुरु हुँदै", title_en: "5G Service Launching in Nepal", slug: "5g-service-nepal", excerpt: "नेपालमा 5G मोबाइल सेवा छिट्टै सुरु हुने भएको छ।", excerpt_en: "5G mobile service is set to launch soon in Nepal.", content: "<p>नेपाल दूरसञ्चार प्राधिकरणले 5G सेवा सञ्चालनका लागि नीतिगत तयारी अन्तिम चरणमा पुगेको जानकारी दिएको छ।</p><h2>प्रभाव</h2><p>5G ले इन्टरनेट गतिमा क्रान्तिकारी सुधार ल्याउने विज्ञहरू बताउँछन्।</p>", cat: "prabidhi", featured: true,  hours: 5,  views: 3340 },
    { title: "AI ले नेपाली भाषामा अनुवाद गर्न सक्ने भयो", title_en: "AI Can Now Translate in Nepali Language", slug: "ai-nepali-translation", excerpt: "कृत्रिम बुद्धिमत्ताले अब नेपाली भाषामा सटीक अनुवाद गर्न सक्ने भएको छ।", excerpt_en: "Artificial Intelligence can now accurately translate in Nepali.", content: "<p>नयाँ AI मोडेलले नेपाली भाषामा ९५ प्रतिशत भन्दा बढी सटीकताका साथ अनुवाद गर्न सक्ने भएको छ। यो उपलब्धिले नेपाली भाषाको डिजिटल विस्तारमा मदत गर्नेछ।</p>", cat: "prabidhi", featured: false, hours: 6,  views: 2560 },
    { title: "डिजिटल वालेट प्रयोगकर्ता ५० लाख नाघ्यो", title_en: "Digital Wallet Users Cross 5 Million", slug: "digital-wallet-5-million", excerpt: "नेपालमा डिजिटल वालेटका प्रयोगकर्ता ५० लाख पुगेका छन्।", excerpt_en: "Digital wallet users in Nepal have crossed 5 million.", content: "<p>eSewa, Khalti र IME Pay जस्ता डिजिटल वालेटका कुल प्रयोगकर्ता संख्या ५० लाख नाघेको छ। यसले नेपालको डिजिटल भुक्तानी क्षेत्रमा क्रान्ति ल्याएको छ।</p>", cat: "prabidhi", featured: false, hours: 11, views: 1780 },
    { title: "स्मार्ट सिटी: काठमाडौंको सपना", title_en: "Smart City: Kathmandu's Dream", slug: "smart-city-kathmandu", excerpt: "काठमाडौंलाई स्मार्ट सिटी बनाउने योजनाबारे।", excerpt_en: "Plans to make Kathmandu a smart city.", content: "<p>काठमाडौं महानगरपालिकाले शहरलाई स्मार्ट सिटी बनाउने महत्वाकांक्षी योजना ल्याएको छ। ट्राफिक व्यवस्थापन, फोहोर प्रशोधन र सार्वजनिक WiFi यसमा समावेश छ।</p>", cat: "prabidhi", featured: false, hours: 20, views: 1670 },
    { title: "नेपालमा इलेक्ट्रिक गाडीको बढ्दो माग", title_en: "Growing Demand for Electric Vehicles in Nepal", slug: "electric-vehicles-nepal", excerpt: "नेपालमा इलेक्ट्रिक गाडीको आयात र बिक्रीमा उल्लेखनीय वृद्धि भएको छ।", excerpt_en: "Significant increase in import and sales of electric vehicles in Nepal.", content: "<p>नेपालमा पछिल्लो एक वर्षमा इलेक्ट्रिक गाडीको बिक्री ४० प्रतिशतले बढेको छ। सरकारको कर छुट नीतिले यसलाई प्रोत्साहन दिएको विश्लेषकहरू बताउँछन्।</p>", cat: "prabidhi", featured: false, hours: 22, views: 1340 },
    { title: "साइबर सुरक्षा: नेपालमा बढ्दो खतरा", title_en: "Cyber Security: Growing Threat in Nepal", slug: "cyber-security-nepal-threat", excerpt: "नेपालमा साइबर आक्रमण र डिजिटल धोखाधडीका घटना बढिरहेका छन्।", excerpt_en: "Cyber attacks and digital fraud increasing in Nepal.", content: "<p>राष्ट्रिय साइबर सुरक्षा केन्द्रले यस वर्ष ५,००० भन्दा बढी साइबर घटना दर्ता गरेको छ। बैंक र सरकारी प्रणालीमा आक्रमण बढ्दो छ।</p>", cat: "prabidhi", featured: false, hours: 30, views: 2100 },

    // ── अन्तर्वार्ता ──────────────────────────────────────────
    { title: "अर्थमन्त्रीसँग अन्तर्वार्ता: आर्थिक नीतिबारे", title_en: "Interview with Finance Minister: Economic Policy", slug: "finance-minister-interview", excerpt: "अर्थमन्त्रीसँग नेपालको आर्थिक नीति र भविष्यका योजनाबारे विशेष कुराकानी।", excerpt_en: "Special conversation with Finance Minister about economic policy and future plans.", content: "<p><strong>प्रश्न:</strong> नेपालको आर्थिक वृद्धिदर बढाउन के-के उपाय छन्?</p><p><strong>उत्तर:</strong> हामीले पूर्वाधार विकास, पर्यटन र कृषि क्षेत्रमा विशेष ध्यान दिइरहेका छौं।</p><p><strong>प्रश्न:</strong> विदेशी लगानी भित्र्याउन के गरिँदैछ?</p><p><strong>उत्तर:</strong> एकल विन्डो प्रणाली र नियामक सुधारमार्फत लगानी वातावरण सुधार गर्दैछौं।</p>", cat: "antarvaarta", featured: true,  hours: 12, views: 2890 },
    { title: "नेपालका सफल उद्यमीसँग कुराकानी", title_en: "Conversation with Nepal's Successful Entrepreneur", slug: "nepali-entrepreneur-interview", excerpt: "शून्यबाट अर्बपति बनेका एक नेपाली उद्यमीसँग प्रेरणादायक कुराकानी।", excerpt_en: "Inspiring conversation with a Nepali entrepreneur who became a billionaire from scratch.", content: "<p>काठमाडौंका एक युवाले सानो स्टार्टअपबाट शुरु गरी अहिले करोडौंको व्यवसाय चलाउन सफल भएका छन्।</p>", cat: "antarvaarta", featured: false, hours: 24, views: 1780 },
    { title: "खेलकुद मन्त्रीसँग कुराकानी: नेपाली खेलकुदको भविष्य", title_en: "Sports Minister Interview: Future of Nepali Sports", slug: "sports-minister-interview", excerpt: "खेलकुद मन्त्रीले नेपाली खेलाडीहरूको भविष्यबारे महत्वपूर्ण कुरा गरेका छन्।", excerpt_en: "Sports Minister talks about the future of Nepali athletes.", content: "<p>खेलकुद मन्त्रीले नेपाली खेलाडीहरूलाई अन्तर्राष्ट्रिय स्तरमा प्रतिस्पर्धी बनाउन विभिन्न कार्यक्रम ल्याउने बताएका छन्।</p>", cat: "antarvaarta", featured: false, hours: 36, views: 980 },

    // ── फिचर ──────────────────────────────────────────
    { title: "हिमालयको कुखुरामा बस्ने जनजाति: रारा ताल परिक्रमा", title_en: "Journey Around Rara Lake", slug: "rara-lake-journey", excerpt: "रारा तालको सुन्दरता र वरपरका जनजातीय समुदायको जीवनशैलीबारे विशेष रिपोर्ट।", excerpt_en: "Special report on Rara Lake's beauty and surrounding tribal communities.", content: "<p>नेपालको सबैभन्दा ठूलो ताल रारा, मुगु जिल्लामा अवस्थित छ। यो ताल समुद्र सतहबाट २,९९० मिटरको उचाइमा छ।</p><h2>स्थानीय जीवनशैली</h2><p>रारा तालको वरपर बस्ने ठकुरी र मगर समुदायको जीवनशैली अत्यन्तै रोचक छ।</p>", cat: "feature", featured: true,  hours: 12, views: 3450 },
    { title: "नेपालका लोपोन्मुख भाषाहरू", title_en: "Endangered Languages of Nepal", slug: "endangered-languages-nepal", excerpt: "नेपालमा १२३ भाषा बोलिन्छ तर धेरै लोपोन्मुख अवस्थामा छन्।", excerpt_en: "123 languages are spoken in Nepal but many are endangered.", content: "<p>नेपालमा बोलिने १२३ भाषामध्ये ३० भन्दा बढी लोपोन्मुख अवस्थामा रहेका छन्। युवा पुस्ताले आफ्नो मातृभाषा बोल्न छोडेपछि यो संकट आएको छ।</p>", cat: "feature", featured: false, hours: 18, views: 1230 },
    { title: "नेपाली कामदारको विदेशमा दुर्दशा", title_en: "Plight of Nepali Workers Abroad", slug: "nepali-workers-abroad-plight", excerpt: "विदेशमा नेपाली कामदारले सामना गरिरहेका समस्याहरू।", excerpt_en: "Problems faced by Nepali workers abroad.", content: "<p>लाखौं नेपाली कामदार विदेशमा कठिन परिस्थितिमा काम गरिरहेका छन्। कतार, यूएई र मलेसियामा नेपाली श्रमिकको अवस्था विशेष चिन्ताजनक रहेको छ।</p>", cat: "feature", featured: false, hours: 26, views: 1890 },
    { title: "पोखरामा एडभेन्चर टुरिज्मको बढ्दो आकर्षण", title_en: "Adventure Tourism Growing in Pokhara", slug: "pokhara-adventure-tourism", excerpt: "पोखरामा प्यारागलाइडिङ, बन्जी जम्प र जिपलाइनको लोकप्रियता बढ्दो छ।", excerpt_en: "Paragliding, bungee jumping and ziplining growing in Pokhara.", content: "<p>पोखरा एडभेन्चर टुरिज्मको हब बन्दै गइरहेको छ। फेवाताल र अन्नपूर्णको पृष्ठभूमिमा प्यारागलाइडिङ गर्ने विदेशी पर्यटकको संख्या ह्वात्तै बढेको छ।</p>", cat: "feature", featured: false, hours: 30, views: 1120 },
    { title: "धार्मिक पर्यटन: लुम्बिनीमा पर्यटक बढ्दो", title_en: "Religious Tourism Growing in Lumbini", slug: "lumbini-tourists-increasing", excerpt: "लुम्बिनीमा अन्तर्राष्ट्रिय पर्यटकको संख्या बढ्दो छ।", excerpt_en: "International tourist numbers increasing in Lumbini.", content: "<p>भगवान बुद्धको जन्मस्थल लुम्बिनीमा पर्यटकको संख्यामा ३५ प्रतिशतको वृद्धि भएको छ।</p>", cat: "feature", featured: false, hours: 32, views: 980 },

    // ── कभर स्टोरी ──────────────────────────────────────────
    { title: "नेपालको शिक्षा प्रणाली: चुनौती र समाधान", title_en: "Nepal's Education System: Challenges and Solutions", slug: "nepal-education-challenges", excerpt: "नेपालको शिक्षा प्रणालीमा रहेका प्रमुख चुनौतीहरू र सम्भावित समाधानहरूबारे विस्तृत विश्लेषण।", excerpt_en: "Detailed analysis of major challenges in Nepal's education system.", content: "<p>नेपालको शिक्षा प्रणालीले विगत दशकमा उल्लेखनीय प्रगति गरेको छ। तर अझै पनि गुणस्तर, पहुँच र समतामा ठूला चुनौतीहरू रहेका छन्।</p><h2>प्रमुख चुनौतीहरू</h2><p>शिक्षकको अभाव, पुरानो पाठ्यक्रम, र डिजिटल खाडलले शिक्षालाई प्रभावित पारिरहेको छ।</p><h2>समाधानका उपायहरू</h2><p>डिजिटल शिक्षा, शिक्षक तालिम र पाठ्यक्रम सुधार गर्नुपर्ने विज्ञहरू बताउँछन्।</p>", cat: "cover-story", featured: true,  hours: 10, views: 3800 },
    { title: "नेपालको स्वास्थ्य क्षेत्र: कहाँ पुग्यौं, कहाँ जाने?", title_en: "Nepal's Health Sector: Where We Are, Where We Go", slug: "nepal-health-sector-review", excerpt: "नेपालको स्वास्थ्य क्षेत्रको वर्तमान अवस्था र भविष्यको रोडम्याप।", excerpt_en: "Current state of Nepal's health sector and roadmap for the future.", content: "<p>नेपालको स्वास्थ्य सेवा पछिल्लो दुई दशकमा उल्लेखनीय रूपमा विस्तार भएको छ। तर दुर्गम क्षेत्रमा अझै पनि पहुँचको समस्या विद्यमान छ।</p>", cat: "cover-story", featured: false, hours: 48, views: 2100 },

    // ── सप्ताहान्त ──────────────────────────────────────────
    { title: "काठमाडौंका उत्कृष्ट ५ क्याफेहरू", title_en: "Top 5 Cafes in Kathmandu", slug: "top-5-cafes-kathmandu", excerpt: "काठमाडौंमा घुम्न लायक उत्कृष्ट क्याफेहरूको सूची।", excerpt_en: "List of the best cafes to visit in Kathmandu.", content: "<p>काठमाडौंमा क्याफे संस्कृति तीव्र गतिमा बढिरहेको छ।</p><h2>१. Himalayan Java</h2><p>थमेलमा अवस्थित यो क्याफे पर्यटक र स्थानीय दुवैमा लोकप्रिय छ। कफीको स्वाद अतुलनीय छ।</p><h2>२. Café de Temple</h2><p>पाटनमा अवस्थित यो क्याफे ऐतिहासिक वातावरणका लागि प्रसिद्ध छ।</p>", cat: "saptaahanta", featured: false, hours: 24, views: 1670 },
    { title: "मुस्ताङमा घुम्ने ५ आदर्श ठाउँहरू", title_en: "5 Must-Visit Places in Mustang", slug: "mustang-must-visit", excerpt: "मुस्ताङको प्राकृतिक र सांस्कृतिक सम्पदाहरू।", excerpt_en: "Natural and cultural heritage sites of Mustang.", content: "<p>मुस्ताङ नेपालको सबैभन्दा रोमाञ्चक पर्यटकीय गन्तव्यमध्येको एक हो। यहाँका प्राचीन गुफाचित्र, बौद्ध गुम्बाहरू र विशिष्ट भूगोल पर्यटकलाई आकर्षित गर्छन्।</p>", cat: "saptaahanta", featured: false, hours: 36, views: 1450 },
    { title: "घरमै बनाउन सकिने ५ नेपाली परिकारहरू", title_en: "5 Nepali Dishes You Can Make at Home", slug: "5-nepali-dishes-home", excerpt: "सजिलोसँग घरमै बनाउन सकिने परम्परागत नेपाली परिकारहरू।", excerpt_en: "Traditional Nepali dishes you can easily make at home.", content: "<p>नेपाली खाना आफ्नै विशेषताले भरिपूर्ण छ। यहाँ छन् घरमा सजिलै बन्ने ५ परिकारहरू।</p><h2>१. दाल-भात-तरकारी</h2><p>नेपाली खानाको प्रमुख परिकार। यसमा दाल, भात र हरियो सब्जी हुन्छ।</p>", cat: "saptaahanta", featured: false, hours: 48, views: 2340 },

    // ── अन्तर्राष्ट्रिय ──────────────────────────────────────────
    { title: "संयुक्त राष्ट्रसंघमा जलवायु परिवर्तन शिखर सम्मेलन", title_en: "Climate Change Summit at United Nations", slug: "un-climate-change-summit", excerpt: "संयुक्त राष्ट्रसंघमा जलवायु परिवर्तनविरुद्धको शिखर सम्मेलन सुरु भएको छ।", excerpt_en: "Climate change summit begins at the United Nations.", content: "<p>संयुक्त राष्ट्रसंघको मुख्यालय न्युयोर्कमा जलवायु परिवर्तन शिखर सम्मेलन सुरु भएको छ। १९३ सदस्य राष्ट्रका प्रतिनिधिहरू सहभागी छन्।</p><h2>मुख्य एजेन्डा</h2><p>कार्बन उत्सर्जन घटाउने र नवीकरणीय ऊर्जामा लगानी बढाउने विषयमा छलफल हुनेछ।</p>", cat: "antarrashtriya", featured: true,  hours: 4,  views: 2560 },
    { title: "चीनमा नयाँ आर्थिक सुधार योजना", title_en: "China Announces New Economic Reform Plan", slug: "china-economic-reform", excerpt: "चीनले ठूलो आर्थिक सुधार योजना घोषणा गरेको छ।", excerpt_en: "China announces a major economic reform plan.", content: "<p>चीनको राज्य परिषद्ले नयाँ आर्थिक सुधार योजना घोषणा गरेको छ जसले अर्थतन्त्रलाई उपभोक्ता-केन्द्रित बनाउने लक्ष्य राखेको छ।</p>", cat: "antarrashtriya", featured: false, hours: 6,  views: 1290 },
    { title: "जापानमा भूकम्प: नेपालीहरू सुरक्षित", title_en: "Earthquake in Japan: Nepalis Safe", slug: "japan-earthquake-nepalis-safe", excerpt: "जापानमा ७.१ म्याग्निच्युडको भूकम्प गएको छ।", excerpt_en: "7.1 magnitude earthquake hits Japan.", content: "<p>जापानको होक्काइडोमा ७.१ म्याग्निच्युडको भूकम्प गएको छ। त्यहाँ रहेका नेपालीहरू सुरक्षित रहेका छन्।</p>", cat: "antarrashtriya", featured: false, hours: 3,  views: 3100 },
    { title: "कोरोना नयाँ भेरिएन्ट: के चिन्ता गर्नुपर्छ?", title_en: "New COVID Variant: Should We Be Worried?", slug: "new-covid-variant-worry", excerpt: "कोरोनाको नयाँ भेरिएन्ट पत्ता लागेको छ।", excerpt_en: "A new COVID variant has been detected.", content: "<p>विश्व स्वास्थ्य संगठनले कोरोना भाइरसको नयाँ भेरिएन्ट पत्ता लागेको जानकारी दिएको छ। विशेषज्ञहरूले तत्काल चिन्ता नगर्न भने पनि सतर्कता अपनाउन सल्लाह दिएका छन्।</p>", cat: "antarrashtriya", featured: false, hours: 9,  views: 4400 },
    { title: "अमेरिकाको नयाँ विदेश नीति: एसियामा असर", title_en: "US New Foreign Policy: Impact on Asia", slug: "us-foreign-policy-asia-impact", excerpt: "अमेरिकाको नयाँ विदेश नीतिले एसियामा महत्वपूर्ण असर पार्नेछ।", excerpt_en: "US new foreign policy will have significant impact in Asia.", content: "<p>अमेरिकाले घोषणा गरेको नयाँ इन्डो-प्यासिफिक रणनीतिले नेपालसहित दक्षिण एसियाका देशहरूमा महत्वपूर्ण भूराजनीतिक असर पार्ने विश्लेषकहरू बताउँछन्।</p>", cat: "antarrashtriya", featured: false, hours: 18, views: 1560 },

    // ── साहित्य ──────────────────────────────────────────
    { title: "लक्ष्मीप्रसाद देवकोटाको काव्य यात्रा", title_en: "Literary Journey of Laxmi Prasad Devkota", slug: "devkota-literary-journey", excerpt: "महाकवि लक्ष्मीप्रसाद देवकोटाको साहित्यिक योगदानबारे विस्तृत लेख।", excerpt_en: "Detailed article about Devkota's literary contributions.", content: "<p>महाकवि लक्ष्मीप्रसाद देवकोटा नेपाली साहित्यका सबैभन्दा प्रभावशाली कविमध्ये एक हुन्।</p><h2>प्रमुख कृतिहरू</h2><p>मुना मदन, शाकुन्तल, सुलोचना र बनमानुसको उपन्यास उनका प्रमुख कृतिहरू हुन्।</p>", cat: "sahitya", featured: false, hours: 20, views: 670 },
    { title: "कविता: हिमालको छायाँमा", title_en: "Poem: In the Shadow of the Himalayas", slug: "poem-himalaya-shadow", excerpt: "प्रसिद्ध कवि रामेश्वर प्रसाईंको नयाँ कविता।", excerpt_en: "New poem by renowned poet Rameshwor Prasain.", content: "<p>हिमालको छायाँमा बसेर<br/>सपना बुन्छु म<br/>कहिले पूर्वको उज्यालो<br/>कहिले पश्चिमको सन्ध्या।<br/><br/>नदीको किनारमा<br/>जीवनको गीत गाउँछु<br/>पानीको धारासँगै<br/>भविष्यतर्फ दौड्छु।</p>", cat: "sahitya", featured: false, hours: 36, views: 340 },
    { title: "समकालीन नेपाली उपन्यास: एक समीक्षा", title_en: "Contemporary Nepali Novels: A Review", slug: "contemporary-nepali-novels-review", excerpt: "पछिल्ला वर्षहरूमा प्रकाशित महत्वपूर्ण नेपाली उपन्यासहरूको समीक्षा।", excerpt_en: "Review of important Nepali novels published in recent years.", content: "<p>पछिल्ला वर्षहरूमा नेपाली उपन्यास साहित्यमा नयाँ लहर आएको छ। युवा लेखकहरूले ताजा विषयवस्तु र शैलीमा रचना गर्दैछन्।</p>", cat: "sahitya", featured: false, hours: 48, views: 450 },

    // ── विचित्र संसार ──────────────────────────────────────────
    { title: "ऑस्ट्रेलियामा हजारौं माउसको आक्रमण", title_en: "Thousands of Mice Invade Australian Town", slug: "australia-mice-invasion", excerpt: "ऑस्ट्रेलियाको एउटा शहरमा हजारौं माउसले आक्रमण गरेका छन्।", excerpt_en: "Thousands of mice have invaded an Australian town.", content: "<p>ऑस्ट्रेलियाको क्वीन्सल्यान्ड राज्यको एउटा शहरमा माउसको भयावह आक्रमण भएको छ। खेतमा अन्नढड्यान्डो भएको कारण माउसको संख्या एकदमै बढेको छ।</p>", cat: "bichitra", featured: false, hours: 8,  views: 5500 },
    { title: "१०० वर्ष पुरानो बोतलमा सन्देश भेटियो", title_en: "Message Found in 100-Year-Old Bottle", slug: "100-year-old-bottle-message", excerpt: "समुद्रमा १०० वर्ष पुरानो बोतलभित्र सन्देश भेटिएको छ।", excerpt_en: "A message was found in a 100-year-old bottle in the ocean.", content: "<p>ऑस्ट्रेलियाको तटमा एक जना माछामार्नेले १०० वर्ष पुरानो बोतल भेट्टाएका छन्। भित्र एक प्रेम पत्र रहेको थियो।</p>", cat: "bichitra", featured: false, hours: 15, views: 6200 },
    { title: "बिरालोले ७ वर्षसम्म डाक्टरको काम गर्यो", title_en: "Cat Served as Doctor for 7 Years", slug: "cat-doctor-seven-years", excerpt: "अमेरिकाको एउटा क्लिनिकमा बिरालोले वर्षौंसम्म बिरामीलाई सान्त्वना दिन मद्दत गरेको थियो।", excerpt_en: "A cat in a US clinic helped comfort patients for years.", content: "<p>अमेरिकाको रोड आइल्यान्डमा एउटा नर्सिङ होममा बस्ने बिरालो 'ओस्कर'ले कुनै बिरामी चाँडै मर्ने हुँदा पहिले नै थाहा पाइदिन्थ्यो।</p>", cat: "bichitra", featured: false, hours: 20, views: 4500 },

    // ── विचार ──────────────────────────────────────────
    { title: "संघीयताको एक दशक: कहाँ पुग्यौं?", title_en: "A Decade of Federalism: Where Are We?", slug: "federalism-decade-review", excerpt: "संघीयता लागू भएको एक दशक पूरा हुँदै गर्दा यसको मूल्यांकन गर्ने बेला आएको छ।", excerpt_en: "As federalism completes a decade, it's time to evaluate.", content: "<p>नेपालमा संघीय शासन प्रणाली लागू भएको एक दशक पूरा हुन लागेको छ।</p><h2>उपलब्धिहरू</h2><p>स्थानीय सरकारको गठन, सेवा प्रवाहमा सुधार र जनसहभागिता बढेको छ।</p><h2>चुनौतीहरू</h2><p>समन्वयको अभाव, वित्तीय अनुशासनको कमी र राजनीतिक हस्तक्षेप प्रमुख समस्याका रूपमा देखिएका छन्।</p>", cat: "bichar", featured: false, hours: 16, views: 1450 },
    { title: "प्रदेश सरकारको कार्यसम्पादन: विश्लेषण", title_en: "Provincial Government Performance: Analysis", slug: "provincial-govt-performance", excerpt: "सात प्रदेश सरकारको कार्यसम्पादनको तुलनात्मक विश्लेषण।", excerpt_en: "Comparative analysis of seven provincial governments' performance.", content: "<p>संघीयताअन्तर्गत सात प्रदेश सरकारको गठन भएको पाँच वर्ष बितिसक्दा कुन प्रदेशले कत्तिको काम गर्यो?</p>", cat: "bichar", featured: false, hours: 28, views: 1120 },
    { title: "युवा पलायन: नेपालको सबैभन्दा ठूलो संकट", title_en: "Youth Migration: Nepal's Biggest Crisis", slug: "youth-migration-nepal-crisis", excerpt: "प्रतिभाशाली युवाहरूको विदेश पलायनले नेपालमा दीर्घकालीन संकट निम्त्याउनसक्ने चेतावनी।", excerpt_en: "Warning that migration of talented youth could cause long-term crisis in Nepal.", content: "<p>हरेक वर्ष ५ लाखभन्दा बढी नेपाली युवा विदेश जाने क्रम जारी छ। यो प्रवृत्तिले देशको आर्थिक र सामाजिक विकासमा गम्भीर असर पारिरहेको छ।</p>", cat: "bichar", featured: false, hours: 40, views: 3450 },

    // ── स्वास्थ्य ──────────────────────────────────────────
    { title: "डेंगु बुखार: काठमाडौंमा सतर्कता जरुरी", title_en: "Dengue Fever: Alert Needed in Kathmandu", slug: "dengue-fever-kathmandu-alert", excerpt: "काठमाडौंमा डेंगु बुखारका बिरामी बढिरहेका छन्।", excerpt_en: "Dengue fever cases increasing in Kathmandu.", content: "<p>काठमाडौं उपत्यकामा डेंगु बुखारको प्रकोप बढ्दो छ। स्वास्थ्य कार्यालयले नागरिकलाई सतर्क रहन आग्रह गरेको छ।</p><h2>लक्षणहरू</h2><p>तीव्र ज्वरो, टाउको दुखाइ, जोर्नी दुखाइ र छाला मा दाग डेंगुका मुख्य लक्षण हुन्।</p>", cat: "swasthya", featured: false, hours: 8,  views: 2890 },
    { title: "मानसिक स्वास्थ्य: नेपालमा बढ्दो चेतना", title_en: "Mental Health: Growing Awareness in Nepal", slug: "mental-health-awareness-nepal", excerpt: "नेपालमा मानसिक स्वास्थ्यप्रति जनचेतना बढिरहेको छ।", excerpt_en: "Mental health awareness is growing in Nepal.", content: "<p>पहिले लुकाइएर राखिने मानसिक स्वास्थ्य समस्यालाई अब खुलेर बोल्न थालिएको छ।</p>", cat: "swasthya", featured: false, hours: 24, views: 1560 },
    { title: "मधुमेह र हृदय रोग: नेपालमा बढ्दो समस्या", title_en: "Diabetes and Heart Disease: Growing Problem in Nepal", slug: "diabetes-heart-disease-nepal", excerpt: "गैरसंक्रामक रोगहरूको प्रसार नेपालमा तीव्र गतिमा बढिरहेको छ।", excerpt_en: "Non-communicable diseases spreading rapidly in Nepal.", content: "<p>नेपालमा गैरसंक्रामक रोगहरू (मधुमेह, उच्च रक्तचाप, हृदय रोग) को बोझ बढ्दो छ। जीवनशैलीमा परिवर्तन मुख्य कारण बताइएको छ।</p>", cat: "swasthya", featured: false, hours: 40, views: 1890 },

    // ── शिक्षा ──────────────────────────────────────────
    { title: "एसईई परीक्षाफल: यस वर्ष उत्तीर्ण दर बढ्यो", title_en: "SEE Exam Results: Pass Rate Increases This Year", slug: "see-exam-results-2082", excerpt: "SEE परीक्षाफलमा यस वर्ष उत्तीर्ण दर उल्लेखनीय रूपमा बढेको छ।", excerpt_en: "SEE exam pass rate has significantly increased this year.", content: "<p>राष्ट्रिय परीक्षा बोर्डले SEE परीक्षाफल सार्वजनिक गरेको छ। यस वर्ष उत्तीर्ण दर ९२ प्रतिशत रहेको छ।</p>", cat: "shiksha", featured: false, hours: 6,  views: 4500 },
    { title: "विश्वविद्यालय प्रवेश परीक्षा: नयाँ नियम", title_en: "University Entrance Exam: New Rules", slug: "university-entrance-exam-new-rules", excerpt: "त्रिभुवन विश्वविद्यालयले प्रवेश परीक्षामा नयाँ नियम लागू गर्ने भएको छ।", excerpt_en: "Tribhuvan University to implement new rules for entrance exams.", content: "<p>त्रिभुवन विश्वविद्यालयले आगामी शैक्षिक सत्रदेखि प्रवेश परीक्षामा नयाँ नियम लागू गर्ने घोषणा गरेको छ।</p>", cat: "shiksha", featured: false, hours: 18, views: 2100 },
    { title: "नेपालमा अनलाइन शिक्षाको विस्तार", title_en: "Expansion of Online Education in Nepal", slug: "online-education-expansion-nepal", excerpt: "कोरोना महामारी पछि अनलाइन शिक्षाको प्रचलन नेपालमा बढेको छ।", excerpt_en: "Online education has expanded in Nepal after the COVID pandemic.", content: "<p>कोरोना महामारीले डिजिटल शिक्षाको आवश्यकता बढायो। अहिले नेपालका सयौं विद्यालय र महाविद्यालयले अनलाइन कक्षा सञ्चालन गर्दैछन्।</p>", cat: "shiksha", featured: false, hours: 48, views: 1340 },

    // ── भिडियो (Video) ──────────────────────────────────
    { title: "नेपाली क्रिकेट टोलीको ऐतिहासिक जित: भिडियो हाइलाइट्स", title_en: "Nepal Cricket Historic Victory: Video Highlights", slug: "nepal-cricket-victory-video-highlights", excerpt: "नेपाली क्रिकेट टोलीको ऐतिहासिक जितको भिडियो हाइलाइट्स।", excerpt_en: "Video highlights of Nepal cricket team's historic victory.", content: "<p>नेपाली क्रिकेट टोलीले अन्तर्राष्ट्रिय मैदानमा ऐतिहासिक जित हासिल गरेको छ। यो भिडियोमा खेलका मुख्य क्षणहरू समेटिएका छन्।</p>", cat: "video", featured: true, hours: 3, views: 12500 },
    { title: "सगरमाथा शिखरमा पहिलो पटक ड्रोन उडान", title_en: "First Drone Flight at Everest Summit", slug: "everest-summit-drone-flight-video", excerpt: "सगरमाथाको शिखरमा पहिलो पटक ड्रोन उडाइयो।", excerpt_en: "First drone flight at the summit of Mount Everest.", content: "<p>सगरमाथाको शिखरमा पहिलो पटक ड्रोन उडानमा सफलता हासिल भएको छ। यो ऐतिहासिक क्षणको भिडियो सार्वजनिक गरिएको छ।</p>", cat: "video", featured: false, hours: 8, views: 8900 },
    { title: "काठमाडौंको पुरानो शहर: ड्रोन भ्रमण", title_en: "Old Kathmandu City: Drone Tour", slug: "kathmandu-old-city-drone-tour", excerpt: "काठमाडौंको ऐतिहासिक शहरको ड्रोन भ्रमण।", excerpt_en: "Drone tour of historic Kathmandu city.", content: "<p>काठमाडौंको पुरानो शहरमा रहेका मन्दिर, दरबार र गल्लीहरूको ड्रोनबाट खिचिएको भिडियो।</p>", cat: "video", featured: false, hours: 14, views: 6200 },
    { title: "नेपाली सेनाको उच्च हिमाल अभियान", title_en: "Nepal Army High Altitude Expedition", slug: "nepal-army-high-altitude-expedition-video", excerpt: "नेपाली सेनाको उच्च हिमाल अभियानको भिडियो।", excerpt_en: "Video of Nepal Army's high altitude expedition.", content: "<p>नेपाली सेनाले सञ्चालन गरेको उच्च हिमाल अभियानको रोमाञ्चक भिडियो सार्वजनिक भएको छ।</p>", cat: "video", featured: false, hours: 20, views: 5400 },
    { title: "लुम्बिनी: बुद्धको जन्मभूमि — भ्रमण गाइड", title_en: "Lumbini: Birthplace of Buddha — Travel Guide", slug: "lumbini-travel-guide-video", excerpt: "लुम्बिनी भ्रमणको सम्पूर्ण गाइड भिडियो।", excerpt_en: "Complete travel guide video of Lumbini.", content: "<p>भगवान बुद्धको जन्मभूमि लुम्बिनीको विस्तृत भ्रमण गाइड भिडियो। मायादेवी मन्दिरदेखि विश्व शान्ति स्तूपसम्मको यात्रा।</p>", cat: "video", featured: false, hours: 30, views: 4100 },

    // ── फोटो ग्यालेरी (Photo Gallery) ────────────────────
    { title: "दसैंको रौनक: देशभरका तस्बिरहरू", title_en: "Dashain Festivities: Photos from Across Nepal", slug: "dashain-festivities-photo-gallery", excerpt: "नेपालको सबैभन्दा ठूलो चाड दसैंको देशभरका रमाइला तस्बिरहरू।", excerpt_en: "Vibrant photos from Nepal's biggest festival Dashain.", content: "<p>दसैं नेपालीहरूको सबैभन्दा ठूलो चाड हो। देशभरका विभिन्न ठाउँबाट संकलित तस्बिरहरू।</p>", cat: "photo-gallery", featured: true, hours: 5, views: 7800 },
    { title: "हिमालय श्रृंखलाका अद्भुत दृश्यहरू", title_en: "Stunning Views of the Himalayan Range", slug: "himalayan-range-stunning-views-gallery", excerpt: "नेपालका हिमालय श्रृंखलाका मनमोहक दृश्यहरू।", excerpt_en: "Breathtaking views of Nepal's Himalayan range.", content: "<p>नेपालका विभिन्न हिमालय श्रृंखलाबाट लिइएका अद्भुत फोटोहरूको संग्रह।</p>", cat: "photo-gallery", featured: false, hours: 12, views: 5600 },
    { title: "इन्द्रजात्रा: काठमाडौंको ऐतिहासिक उत्सव", title_en: "Indra Jatra: Historic Festival of Kathmandu", slug: "indra-jatra-historic-festival-gallery", excerpt: "काठमाडौंको ऐतिहासिक इन्द्रजात्रा उत्सवका तस्बिरहरू।", excerpt_en: "Photos from Kathmandu's historic Indra Jatra festival.", content: "<p>इन्द्रजात्रा काठमाडौं उपत्यकाको सबैभन्दा पुरानो चाडमध्ये एक हो। कुमारी जात्रा र लाखे नाचका विशेष तस्बिरहरू।</p>", cat: "photo-gallery", featured: false, hours: 18, views: 4300 },
    { title: "नेपाली हस्तकलाको सुन्दर संसार", title_en: "Beautiful World of Nepali Handicrafts", slug: "nepali-handicrafts-beautiful-world-gallery", excerpt: "नेपालका परम्परागत हस्तकलाका सुन्दर तस्बिरहरू।", excerpt_en: "Beautiful photos of traditional Nepali handicrafts.", content: "<p>नेपालका विभिन्न क्षेत्रमा बनाइने परम्परागत हस्तकला उत्पादनहरूको फोटो संग्रह।</p>", cat: "photo-gallery", featured: false, hours: 24, views: 3200 },
    { title: "पोखराको फेवातालमा सूर्यास्त", title_en: "Sunset at Pokhara's Fewa Lake", slug: "pokhara-fewa-lake-sunset-gallery", excerpt: "पोखराको फेवातालबाट सूर्यास्तका मनमोहक तस्बिरहरू।", excerpt_en: "Stunning sunset photos from Pokhara's Fewa Lake.", content: "<p>पोखराको फेवातालमा सूर्यास्तका क्षणहरूमा खिचिएका मनमोहक तस्बिरहरूको संग्रह।</p>", cat: "photo-gallery", featured: false, hours: 36, views: 2800 },
  ];

  const articleIds: Record<string, string> = {};
  for (let i = 0; i < articleSeed.length; i++) {
    const a = articleSeed[i];
    const auth = pick(authors);
    // Use seed-based picsum to avoid broken IDs
    const img = `https://picsum.photos/seed/article-${a.slug.slice(0, 12)}/800/450`;
    const wc = a.content.split(/\s+/).length;
    const created = await prisma.article.upsert({
      where: { slug: a.slug },
      update: { featured_image: img, view_count: a.views, is_featured: a.featured },
      create: {
        title: a.title, title_en: a.title_en, slug: a.slug,
        excerpt: a.excerpt, excerpt_en: a.excerpt_en,
        content: a.content, content_en: a.content_en ?? null,
        featured_image: img,
        category_id: cats[a.cat]?.id ?? cats["samachar"].id,
        author_id: auth.id,
        status: ArticleStatus.PUBLISHED,
        is_featured: a.featured,
        reading_time: Math.max(1, Math.ceil(wc / 200)),
        word_count: wc,
        published_at: hoursAgo(a.hours),
        view_count: a.views,
        comment_count: rand(0, 40),
      },
    });
    articleIds[a.slug] = created.id;
  }
  console.log(`   ✅ ${articleSeed.length} articles seeded`);

  // ─── Comments ──────────────────────────────────────
  const commentTexts = [
    "राम्रो समाचार! धन्यवाद।",
    "यो विषयमा थप जानकारी चाहियो।",
    "सरकारले यो विषयमा ध्यान दिनु पर्छ।",
    "नेपालका लागि यो गर्वको कुरा हो।",
    "यस्तो खबर पढेर मन दुखेको छ।",
    "खेलाडीलाई हार्दिक बधाई!",
    "सबैले सचेत हुनु आवश्यक छ।",
    "यो समस्याको दीर्घकालीन समाधान खोजिनुपर्छ।",
    "लेखकलाई धन्यवाद यस्तो विस्तृत जानकारी दिनुभएकोमा।",
    "यो खबर पढेर आँखा ओसिलो भयो।",
    "नेपाल सरकारसँग अपेक्षा छ।",
    "विश्वका कुना-कुनाबाट नेपाललाई हेरिँदैछ।",
    "हाम्रो देशका युवाले राम्रो काम गर्दैछन्।",
    "यो अवस्था सुधार्न सबैको सहयोग चाहिन्छ।",
    "Very informative article. Keep it up!",
    "Great news for Nepal!",
    "This is a serious issue that needs attention.",
    "Proud to be Nepali!",
    "The government should take immediate action.",
    "Thank you for this detailed report.",
  ];

  // Add comments to top articles
  const topSlugs = ["pm-new-development-policy","nepal-cricket-historic-victory","kathmandu-air-pollution-high","saff-championship-nepal-finals","gold-price-new-high","5g-service-nepal","nepal-india-border-dispute","nrb-interest-rate-cut","see-exam-results-2082","dengue-fever-kathmandu-alert"];
  for (const slug of topSlugs) {
    const artId = articleIds[slug];
    if (!artId) continue;
    for (let c = 0; c < 8; c++) {
      const commentId = `seed-article-comment-${slug}-${c + 1}`;
      const user = readers[(c + slug.length) % readers.length];
      const content = commentTexts[(c + slug.length) % commentTexts.length];
      await prisma.comment.upsert({
        where: { id: commentId },
        update: { content, status: CommentStatus.APPROVED, article_id: artId, user_id: user.id, like_count: c + 1, dislike_count: c % 3 },
        create: { id: commentId, content, status: CommentStatus.APPROVED, article_id: artId, user_id: user.id, like_count: c + 1, dislike_count: c % 3, created_at: hoursAgo(c + 1) },
      });
    }
  }
  console.log("   ✅ Comments seeded");

  // ─── Breaking News ─────────────────────────────────
  const breakingItems = [
    { id: "bn-1", title: "सुनको मूल्यले नयाँ रेकर्ड: तोला रु. १,४५,००० पुग्यो", title_en: "Gold price hits new record: Rs 1,45,000 per tola" },
    { id: "bn-2", title: "प्रधानमन्त्रीले नयाँ विकास नीति सार्वजनिक गरे", title_en: "PM unveils new development policy" },
    { id: "bn-3", title: "नेपाली क्रिकेट टोलीले ऐतिहासिक जित हात पार्यो", title_en: "Nepal cricket team secures historic victory" },
    { id: "bn-4", title: "काठमाडौंमा AQI २५० नाघ्यो — मास्क लगाउन आग्रह", title_en: "Kathmandu AQI crosses 250 — mask advised" },
    { id: "bn-5", title: "नेप्से आज ४५ अंकले वृद्धि भयो", title_en: "NEPSE rises by 45 points today" },
    { id: "bn-6", title: "साफ च्याम्पियनसिप: नेपाल फाइनलमा प्रवेश", title_en: "SAFF: Nepal enters final" },
  ];
  for (const bn of breakingItems) {
    await prisma.breakingNews.upsert({
      where: { id: bn.id },
      update: {},
      create: { id: bn.id, title: bn.title, title_en: bn.title_en, is_active: true, expires_at: new Date(Date.now() + 24 * 3600000) },
    });
  }
  console.log("   ✅ Breaking news seeded");

  // ─── Reels ─────────────────────────────────────────
  const reelData = [
    { title: "सगरमाथाको अद्भुत दृश्य", title_en: "Amazing View of Everest", slug: "everest-amazing-view", description: "ड्रोनबाट खिचिएको सगरमाथाको अविश्वसनीय दृश्य।", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "काठमाडौंको रात्रिकालीन सुन्दरता", title_en: "Kathmandu Night Beauty", slug: "kathmandu-night-beauty", description: "काठमाडौं शहरको रातको टाइमल्याप्स।", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "नेपाली खानाको स्वाद", title_en: "Taste of Nepali Food", slug: "nepali-food-taste", description: "नेपालका प्रसिद्ध परम्परागत खानाहरू।", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "पोखराको फेवातालमा सूर्योदय", title_en: "Sunrise at Phewa Lake", slug: "pokhara-sunrise", description: "फेवातालमा सूर्योदयको मनमोहक दृश्य।", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "चितवन जंगल सफारी", title_en: "Chitwan Jungle Safari", slug: "chitwan-safari", description: "चितवन राष्ट्रिय निकुञ्जमा जंगल सफारीको अनुभव।", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "नेपाली क्रिकेटको जित", title_en: "Nepal Cricket Victory", slug: "nepal-cricket-victory-reel", description: "नेपाली क्रिकेट टोलीको ऐतिहासिक जितको झलकहरू।", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "बुद्ध जन्मभूमि लुम्बिनी", title_en: "Lumbini — Birthplace of Buddha", slug: "lumbini-birthplace-buddha", description: "भगवान बुद्धको जन्मस्थल लुम्बिनीको विशेष भ्रमण।", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "मुस्ताङको रहस्यमय संसार", title_en: "Mysterious World of Mustang", slug: "mustang-mysterious-world", description: "मुस्ताङका प्राचीन गुफाहरू र विशिष्ट संस्कृति।", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "तिहार: दीपावलीको उत्सव", title_en: "Tihar: Festival of Lights", slug: "tihar-festival-lights", description: "नेपालको सुन्दर दीपावली उत्सवको झलकहरू।", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "हिमाली गाउँको जीवन", title_en: "Life in a Himalayan Village", slug: "himalayan-village-life", description: "नेपालको दुर्गम हिमाली गाउँमा एक दिन।", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  ];
  for (let ri = 0; ri < reelData.length; ri++) {
    const r = reelData[ri];
    await prisma.reel.upsert({ where: { slug: r.slug }, update: {}, create: { ...r, thumbnail: `https://picsum.photos/seed/reel-${r.slug.slice(0, 12)}/400/700`, is_active: true, view_count: rand(1000, 50000) } });
  }
  console.log("   ✅ Reels seeded");

  // ─── Galleries ─────────────────────────────────────
  const galleryData = [
    { id: "g1", title: "नेपालको प्राकृतिक सौन्दर्य", title_en: "Natural Beauty of Nepal", slug: "nepal-natural-beauty", description: "नेपालका विभिन्न ठाउँका प्राकृतिक दृश्यहरू।", images: ["nature-1","nature-2","nature-3","nature-4","nature-5","nature-6"] },
    { id: "g2", title: "काठमाडौं दरबार स्क्वायर", title_en: "Kathmandu Durbar Square", slug: "kathmandu-durbar-square", description: "ऐतिहासिक काठमाडौं दरबार स्क्वायरका तस्बिरहरू।", images: ["durbar-1","durbar-2","durbar-3","durbar-4","durbar-5"] },
    { id: "g3", title: "दसैंको रौनक", title_en: "Dashain Celebrations", slug: "dashain-celebrations", description: "नेपालको सबैभन्दा ठूलो चाड दसैंका तस्बिरहरू।", images: ["dashain-1","dashain-2","dashain-3","dashain-4","dashain-5","dashain-6"] },
    { id: "g4", title: "नेपाली लोक संस्कृति", title_en: "Nepali Folk Culture", slug: "nepali-folk-culture", description: "नेपालका विभिन्न जातजातिका सांस्कृतिक पोशाक र नृत्यहरू।", images: ["culture-1","culture-2","culture-3","culture-4","culture-5"] },
    { id: "g5", title: "हिमालयको काखमा", title_en: "In the Lap of the Himalayas", slug: "himalaya-lap", description: "नेपालका हिमशिखरहरूको मनमोहक दृश्यहरू।", images: ["himalaya-1","himalaya-2","himalaya-3","himalaya-4","himalaya-5","himalaya-6","himalaya-7"] },
    { id: "g6", title: "नेपाली क्रिकेट: ऐतिहासिक क्षणहरू", title_en: "Nepal Cricket: Historic Moments", slug: "nepal-cricket-moments", description: "नेपाली क्रिकेटका यादगार क्षणहरू।", images: ["cricket-1","cricket-2","cricket-3","cricket-4","cricket-5"] },
  ];
  for (const g of galleryData) {
    const gallery = await prisma.gallery.upsert({
      where: { slug: g.slug },
      update: {},
      create: { id: g.id, title: g.title, title_en: g.title_en, slug: g.slug, description: g.description, cover_image: `https://picsum.photos/seed/gallery-${g.slug}/800/450`, is_active: true },
    });
    // Add images
    for (let ii = 0; ii < g.images.length; ii++) {
      await prisma.galleryImage.upsert({
        where: { id: `${g.id}-img-${ii}` },
        update: {},
        create: { id: `${g.id}-img-${ii}`, gallery_id: gallery.id, url: `https://picsum.photos/seed/${g.id}-${g.images[ii]}/800/600`, sort_order: ii, caption: `तस्बिर ${ii + 1}`, caption_en: `Image ${ii + 1}` },
      });
    }
  }
  console.log("   ✅ Galleries seeded");

  // ─── Sports ────────────────────────────────────────
  const t1 = await prisma.tournament.upsert({ where: { id: "saff-2026" }, update: {}, create: { id: "saff-2026", name: "SAFF च्याम्पियनसिप २०२६", name_en: "SAFF Championship 2026", slug: "saff-2026", sport_type: "football", is_active: true, start_date: daysAgo(10), end_date: new Date(Date.now() + 5 * 86400000) } });
  const t2 = await prisma.tournament.upsert({ where: { id: "icc-cwc-2026" }, update: {}, create: { id: "icc-cwc-2026", name: "ICC विश्वकप क्वालिफायर", name_en: "ICC World Cup Qualifier", slug: "icc-cwc-2026", sport_type: "cricket", is_active: true, start_date: daysAgo(5), end_date: new Date(Date.now() + 10 * 86400000) } });
  const t3 = await prisma.tournament.upsert({ where: { id: "sa-games-2026" }, update: {}, create: { id: "sa-games-2026", name: "दक्षिण एसियाली खेलकुद २०२६", name_en: "South Asian Games 2026", slug: "sa-games-2026", sport_type: "multi", is_active: true, start_date: daysAgo(2), end_date: new Date(Date.now() + 15 * 86400000) } });

  const teamDefs = [
    { id: "team-nepal",       name: "नेपाल",      name_en: "Nepal"       },
    { id: "team-bangladesh",  name: "बंगलादेश",   name_en: "Bangladesh"  },
    { id: "team-india",       name: "भारत",       name_en: "India"       },
    { id: "team-pakistan",    name: "पाकिस्तान",  name_en: "Pakistan"    },
    { id: "team-srilanka",    name: "श्रीलंका",   name_en: "Sri Lanka"   },
    { id: "team-bhutan",      name: "भुटान",      name_en: "Bhutan"      },
    { id: "team-maldives",    name: "माल्दिभ्स",  name_en: "Maldives"    },
    { id: "team-afghanistan", name: "अफगानिस्तान",name_en: "Afghanistan" },
  ];
  const teams: Record<string, { id: string }> = {};
  for (const td of teamDefs) {
    teams[td.id] = await prisma.team.upsert({ where: { id: td.id }, update: {}, create: td });
  }

  const matchDefs = [
    { id: "m1", tid: t1.id, home: "team-nepal",    away: "team-bangladesh",  hs: 2, as: 1, st: MatchStatus.COMPLETED, dh: 4,   venue: "दशरथ रंगशाला, काठमाडौं" },
    { id: "m2", tid: t2.id, home: "team-nepal",    away: "team-india",       hs: 0, as: 0, st: MatchStatus.LIVE,      dh: 0,   venue: "त्रिभुवन विश्वविद्यालय मैदान" },
    { id: "m3", tid: t1.id, home: "team-india",    away: "team-pakistan",    hs: 3, as: 2, st: MatchStatus.COMPLETED, dh: 24,  venue: "दशरथ रंगशाला, काठमाडौं" },
    { id: "m4", tid: t2.id, home: "team-nepal",    away: "team-afghanistan", hs: null, as: null, st: MatchStatus.UPCOMING, dh: -24, venue: "त्रिभुवन विश्वविद्यालय मैदान" },
    { id: "m5", tid: t1.id, home: "team-bhutan",   away: "team-maldives",    hs: 1, as: 1, st: MatchStatus.COMPLETED, dh: 48,  venue: "दशरथ रंगशाला, काठमाडौं" },
    { id: "m6", tid: t3.id, home: "team-nepal",    away: "team-srilanka",    hs: 3, as: 0, st: MatchStatus.COMPLETED, dh: 8,   venue: "त्रिभुवन विश्वविद्यालय मैदान" },
    { id: "m7", tid: t3.id, home: "team-india",    away: "team-bangladesh",  hs: null, as: null, st: MatchStatus.UPCOMING, dh: -48, venue: "बीरगञ्ज स्टेडियम" },
  ];
  for (const m of matchDefs) {
    await prisma.match.upsert({
      where: { id: m.id }, update: {},
      create: { id: m.id, tournament_id: m.tid, home_team_id: teams[m.home].id, away_team_id: teams[m.away].id, home_score: m.hs, away_score: m.as, status: m.st, match_date: m.dh < 0 ? new Date(Date.now() + Math.abs(m.dh) * 3600000) : hoursAgo(m.dh), venue: m.venue },
    });
  }
  console.log("   ✅ Sports seeded");

  // ─── Ads ───────────────────────────────────────────
  const adPositions = ["header","sidebar","in-article","footer","between-sections"];
  const adSizes: Record<string,{w:number;h:number}> = { header:{w:728,h:90}, sidebar:{w:300,h:250}, "in-article":{w:728,h:90}, footer:{w:728,h:90}, "between-sections":{w:970,h:90} };
  for (const pos of adPositions) {
    const sz = adSizes[pos] || { w: 728, h: 90 };
    const p = await prisma.adPosition.upsert({ where: { name: pos }, update: {}, create: { name: pos, type: pos.toUpperCase().replace("-","_") as "HEADER"|"SIDEBAR"|"IN_ARTICLE"|"FOOTER"|"BETWEEN_SECTIONS", width: sz.w, height: sz.h, is_active: true } });
    await prisma.advertisement.upsert({ where: { id: `ad-${pos}` }, update: { image_url: `https://picsum.photos/seed/ad-${pos}/${sz.w}/${sz.h}` }, create: { id: `ad-${pos}`, title: `${pos} Ad`, image_url: `https://picsum.photos/seed/ad-${pos}/${sz.w}/${sz.h}`, target_url: "https://example.com", position_id: p.id, is_active: true, start_date: new Date(), end_date: new Date(Date.now() + 90 * 86400000), impressions: rand(5000,50000), clicks: rand(100,2000) } });
  }

  // ─── Site Settings ─────────────────────────────────
  const settings: Record<string,unknown> = {
    site_name: { ne: "नमस्ते एक्सप्रेस", en: "NamasteExpress" },
    site_tagline: { ne: "नेपालको विश्वसनीय अनलाइन समाचार सेवा", en: "Nepal's Trusted Online News Service" },
    site_logo: "/icons/logo.jpeg",
    site_favicon: "/favicon.ico",
    primary_color: "#c62828",
    contact_phone: "+977-1-4234567",
    contact_email: "info@namastexpress.com",
    contact_address: { ne: "काठमाडौं, बागमती प्रदेश, नेपाल", en: "Kathmandu, Bagmati Province, Nepal" },
    registration_number: "१२३-४५६-७८९०",
    social_facebook:  "https://facebook.com/namasteexpress",
    social_twitter:   "https://twitter.com/namasteexpress",
    social_youtube:   "https://youtube.com/@namasteexpress",
    social_instagram: "https://instagram.com/namasteexpress",
    social_tiktok:    "https://tiktok.com/@namasteexpress",
    homepage_section_order: ["breaking","hero","samachar","reels","feature","cover-story","saptaahanta","prabidhi","antarvaarta","khelkud","sahitya","antarrashtriya","video","bichitra","photo-gallery"],
    features_comments: true,
    features_bookmarks: true,
    features_reels: true,
    features_galleries: true,
    copyright_text: { ne: "© {year} नमस्ते एक्सप्रेस। सर्वाधिकार सुरक्षित।", en: "© {year} NamasteExpress. All rights reserved." },
  };
  for (const [k, v] of Object.entries(settings)) {
    await prisma.siteSettings.upsert({ where: { key: k }, update: { value: v as object }, create: { key: k, value: v as object } });
  }
  console.log("   ✅ Site settings seeded");

  // ─── Holidays (BS 2082) ─────────────────────────────
  const holidayData = [
    { title: "प्रजातन्त्र दिवस", title_en: "Democracy Day", bs_year: 2082, bs_month: 11, bs_day: 7, ad_date: "2026-02-19", type: "public", is_public: true },
    { title: "महाशिवरात्रि", title_en: "Maha Shivaratri", bs_year: 2082, bs_month: 11, bs_day: 15, ad_date: "2026-02-27", type: "public", is_public: true },
    { title: "फागु पूर्णिमा (होली)", title_en: "Fagu Purnima (Holi)", bs_year: 2082, bs_month: 11, bs_day: 29, ad_date: "2026-03-13", type: "public", is_public: true },
    { title: "घोडेजात्रा", title_en: "Ghode Jatra", bs_year: 2082, bs_month: 12, bs_day: 8, ad_date: "2026-03-22", type: "public", is_public: true },
    { title: "चैते दसैं", title_en: "Chaite Dashain", bs_year: 2082, bs_month: 12, bs_day: 16, ad_date: "2026-03-30", type: "cultural", is_public: false },
    { title: "नयाँ वर्ष (बि.सं. २०८३)", title_en: "New Year (BS 2083)", bs_year: 2082, bs_month: 12, bs_day: 31, ad_date: "2026-04-14", type: "public", is_public: true },
    { title: "नेपाली नयाँ वर्ष", title_en: "Nepali New Year", bs_year: 2083, bs_month: 1, bs_day: 1, ad_date: "2026-04-14", type: "public", is_public: true },
    { title: "अन्तर्राष्ट्रिय श्रमिक दिवस", title_en: "International Labour Day", bs_year: 2083, bs_month: 1, bs_day: 18, ad_date: "2026-05-01", type: "public", is_public: true },
    { title: "बुद्ध जयन्ती", title_en: "Buddha Jayanti", bs_year: 2083, bs_month: 2, bs_day: 1, ad_date: "2026-05-14", type: "public", is_public: true },
    { title: "गणतन्त्र दिवस", title_en: "Republic Day", bs_year: 2083, bs_month: 2, bs_day: 15, ad_date: "2026-05-28", type: "public", is_public: true },
    { title: "हरि शयनी एकादशी", title_en: "Hari Sayani Ekadashi", bs_year: 2083, bs_month: 3, bs_day: 17, ad_date: "2026-07-02", type: "cultural", is_public: false },
    { title: "श्रावण सोमवार (पहिलो)", title_en: "Shrawan Sombar (First)", bs_year: 2083, bs_month: 4, bs_day: 4, ad_date: "2026-07-20", type: "cultural", is_public: false },
    { title: "नाग पञ्चमी", title_en: "Nag Panchami", bs_year: 2083, bs_month: 4, bs_day: 22, ad_date: "2026-08-07", type: "public", is_public: true },
    { title: "रक्षाबन्धन (जनैपूर्णिमा)", title_en: "Raksha Bandhan (Janai Purnima)", bs_year: 2083, bs_month: 4, bs_day: 28, ad_date: "2026-08-13", type: "public", is_public: true },
    { title: "गाईजात्रा", title_en: "Gaijatra", bs_year: 2083, bs_month: 4, bs_day: 29, ad_date: "2026-08-14", type: "public", is_public: true },
    { title: "कृष्ण जन्माष्टमी", title_en: "Krishna Janmashtami", bs_year: 2083, bs_month: 5, bs_day: 5, ad_date: "2026-08-21", type: "public", is_public: true },
    { title: "तिज", title_en: "Teej", bs_year: 2083, bs_month: 5, bs_day: 17, ad_date: "2026-09-02", type: "public", is_public: true },
    { title: "ऋषि पञ्चमी", title_en: "Rishi Panchami", bs_year: 2083, bs_month: 5, bs_day: 19, ad_date: "2026-09-04", type: "cultural", is_public: false },
    { title: "इन्द्रजात्रा", title_en: "Indra Jatra", bs_year: 2083, bs_month: 5, bs_day: 28, ad_date: "2026-09-13", type: "public", is_public: true },
    { title: "संविधान दिवस", title_en: "Constitution Day", bs_year: 2083, bs_month: 6, bs_day: 3, ad_date: "2026-09-19", type: "public", is_public: true },
    { title: "घटस्थापना (दसैं)", title_en: "Ghatasthapana (Dashain)", bs_year: 2083, bs_month: 6, bs_day: 17, ad_date: "2026-10-03", type: "public", is_public: true },
    { title: "फूलपाती", title_en: "Fulpati", bs_year: 2083, bs_month: 6, bs_day: 23, ad_date: "2026-10-09", type: "public", is_public: true },
    { title: "महाअष्टमी", title_en: "Maha Ashtami", bs_year: 2083, bs_month: 6, bs_day: 24, ad_date: "2026-10-10", type: "public", is_public: true },
    { title: "महानवमी", title_en: "Maha Navami", bs_year: 2083, bs_month: 6, bs_day: 25, ad_date: "2026-10-11", type: "public", is_public: true },
    { title: "विजया दशमी", title_en: "Vijaya Dashami", bs_year: 2083, bs_month: 6, bs_day: 26, ad_date: "2026-10-12", type: "public", is_public: true },
    { title: "एकादशी", title_en: "Ekadashi", bs_year: 2083, bs_month: 6, bs_day: 27, ad_date: "2026-10-13", type: "public", is_public: true },
    { title: "द्वादशी", title_en: "Dwadashi", bs_year: 2083, bs_month: 6, bs_day: 28, ad_date: "2026-10-14", type: "public", is_public: true },
    { title: "कोजाग्रत पूर्णिमा", title_en: "Kojagrat Purnima", bs_year: 2083, bs_month: 6, bs_day: 30, ad_date: "2026-10-16", type: "public", is_public: true },
    { title: "लक्ष्मी पूजा (तिहार)", title_en: "Laxmi Puja (Tihar)", bs_year: 2083, bs_month: 7, bs_day: 13, ad_date: "2026-10-29", type: "public", is_public: true },
    { title: "गोवर्धन पूजा", title_en: "Govardhan Puja", bs_year: 2083, bs_month: 7, bs_day: 14, ad_date: "2026-10-30", type: "public", is_public: true },
    { title: "भाइटीका", title_en: "Bhai Tika", bs_year: 2083, bs_month: 7, bs_day: 15, ad_date: "2026-10-31", type: "public", is_public: true },
    { title: "छठ पर्व", title_en: "Chhath Parva", bs_year: 2083, bs_month: 7, bs_day: 20, ad_date: "2026-11-05", type: "public", is_public: true },
    { title: "तमु ल्होसार", title_en: "Tamu Lhosar", bs_year: 2083, bs_month: 9, bs_day: 15, ad_date: "2026-12-30", type: "public", is_public: true },
    { title: "माघे सङ्क्रान्ति", title_en: "Maghe Sankranti", bs_year: 2083, bs_month: 10, bs_day: 1, ad_date: "2027-01-14", type: "public", is_public: true },
    { title: "सोनम ल्होसार", title_en: "Sonam Lhosar", bs_year: 2083, bs_month: 10, bs_day: 15, ad_date: "2027-01-28", type: "public", is_public: true },
    { title: "श्री पञ्चमी (सरस्वती पूजा)", title_en: "Shri Panchami (Saraswati Puja)", bs_year: 2083, bs_month: 10, bs_day: 22, ad_date: "2027-02-04", type: "public", is_public: true },
    { title: "ग्याल्पो ल्होसार", title_en: "Gyalpo Lhosar", bs_year: 2083, bs_month: 11, bs_day: 3, ad_date: "2027-02-14", type: "public", is_public: true },
  ];
  for (const h of holidayData) {
    await prisma.holiday.upsert({
      where: { bs_year_bs_month_bs_day_title: { bs_year: h.bs_year, bs_month: h.bs_month, bs_day: h.bs_day, title: h.title } },
      update: {},
      create: { ...h, ad_date: new Date(h.ad_date) },
    });
  }
  console.log("   ✅ Holidays seeded");

  // ─── Gold/Silver Prices (verified FENEGOSIDA snapshot) ─
  const goldDate = new Date(`${verifiedSnapshots.goldSilver.asOf}T00:00:00.000Z`);
  await prisma.goldSilverPrice.upsert({
    where: { date: goldDate },
    update: {
      fine_gold: verifiedSnapshots.goldSilver.fineGoldPerTola,
      tejabi_gold: verifiedSnapshots.goldSilver.fineGoldPerTola,
      silver: verifiedSnapshots.goldSilver.silverPerTola,
      source: verifiedSnapshots.goldSilver.sourceUrl,
    },
    create: {
      date: goldDate,
      fine_gold: verifiedSnapshots.goldSilver.fineGoldPerTola,
      tejabi_gold: verifiedSnapshots.goldSilver.fineGoldPerTola,
      silver: verifiedSnapshots.goldSilver.silverPerTola,
      source: verifiedSnapshots.goldSilver.sourceUrl,
    },
  });
  console.log("   ✅ Gold/Silver prices seeded");

  // ─── Forex Rates (today) ──────────────────────────
  const today = seedClock.day;
  for (const f of verifiedSnapshots.forex.rates) {
    await prisma.forexRate.upsert({
      where: { date_currency: { date: today, currency: f.currency } },
      update: { ...f, source: verifiedSnapshots.forex.sourceUrl },
      create: { date: today, ...f, source: verifiedSnapshots.forex.sourceUrl },
    });
  }
  console.log("   ✅ Forex rates seeded");

  // ─── Rashifal (today) ─────────────────────────────
  const rashiSigns = [
    { sign: "mesh", sign_ne: "मेष", pred: "आज तपाईंको दिन शुभ रहनेछ। आर्थिक लाभको सम्भावना छ।", pred_en: "Today will be a fortunate day. Financial gains possible." },
    { sign: "brish", sign_ne: "वृष", pred: "काममा सफलता मिल्नेछ। परिवारसँगको सम्बन्ध राम्रो रहनेछ।", pred_en: "Success at work. Family relations will be good." },
    { sign: "mithun", sign_ne: "मिथुन", pred: "स्वास्थ्यमा ध्यान दिनुहोस्। यात्रामा सावधान रहनुहोस्।", pred_en: "Pay attention to health. Be careful while traveling." },
    { sign: "karkat", sign_ne: "कर्कट", pred: "नयाँ अवसर प्राप्त हुनसक्छ। सामाजिक सम्बन्ध बलियो हुनेछ।", pred_en: "New opportunities may arise. Social relationships strengthen." },
    { sign: "simha", sign_ne: "सिंह", pred: "आत्मविश्वास बढ्नेछ। सरकारी कामकाजमा सफलता मिल्नेछ।", pred_en: "Confidence will increase. Success in government affairs." },
    { sign: "kanya", sign_ne: "कन्या", pred: "बौद्धिक कार्यमा सफलता। अध्ययनमा रुचि बढ्नेछ।", pred_en: "Success in intellectual pursuits. Interest in studies increases." },
    { sign: "tula", sign_ne: "तुला", pred: "आर्थिक अवस्था सुधारिनेछ। साझेदारीमा लाभ हुनेछ।", pred_en: "Financial condition improves. Partnerships bring benefit." },
    { sign: "brishchik", sign_ne: "वृश्चिक", pred: "सावधानी अपनाउनुहोस्। आवेगमा नआउनुहोस्।", pred_en: "Exercise caution. Don't be impulsive." },
    { sign: "dhanu", sign_ne: "धनु", pred: "यात्रा लाभदायक हुनेछ। शिक्षामा प्रगति हुनेछ।", pred_en: "Travel will be beneficial. Progress in education." },
    { sign: "makar", sign_ne: "मकर", pred: "कार्यक्षेत्रमा प्रगति हुनेछ। नेतृत्व गुण देखाउनुहोस्।", pred_en: "Progress at workplace. Show leadership qualities." },
    { sign: "kumbha", sign_ne: "कुम्भ", pred: "मित्रताबाट लाभ हुनेछ। सामाजिक कार्यमा सक्रिय रहनुहोस्।", pred_en: "Benefit from friendships. Stay active in social causes." },
    { sign: "meen", sign_ne: "मीन", pred: "आध्यात्मिक रुचि बढ्नेछ। मानसिक शान्ति प्राप्त हुनेछ।", pred_en: "Spiritual interest increases. Mental peace achieved." },
  ];
  for (const r of rashiSigns) {
    await prisma.rashifal.upsert({
      where: { bs_year_bs_month_bs_day_sign: { bs_year: 2083, bs_month: 4, bs_day: 7, sign: r.sign } },
      update: { ad_date: today, prediction: r.pred, prediction_en: r.pred_en },
      create: {
        bs_year: 2083, bs_month: 4, bs_day: 7,
        ad_date: today,
        sign: r.sign, sign_ne: r.sign_ne,
        prediction: r.pred, prediction_en: r.pred_en,
        rating: rand(2, 5),
      },
    });
  }
  console.log("   ✅ Rashifal seeded");

  // ─── Relationships, media, stories, and analytics ───
  const mediaDefs = [
    { id: "seed-media-hero", filename: "seed-hero.jpg", original_name: "seed-hero.jpg", mime_type: "image/jpeg", size: 245000, url: "https://picsum.photos/seed/namaste-hero/1600/900", alt_text: "Demo editorial hero image", width: 1600, height: 900 },
    { id: "seed-media-nepal", filename: "seed-nepal.jpg", original_name: "seed-nepal.jpg", mime_type: "image/jpeg", size: 180000, url: "https://picsum.photos/seed/namaste-nepal/1200/800", alt_text: "Demo Nepal landscape image", width: 1200, height: 800 },
    { id: "seed-media-sports", filename: "seed-sports.jpg", original_name: "seed-sports.jpg", mime_type: "image/jpeg", size: 195000, url: "https://picsum.photos/seed/namaste-sports/1200/800", alt_text: "Demo sports image", width: 1200, height: 800 },
    { id: "seed-media-tech", filename: "seed-tech.jpg", original_name: "seed-tech.jpg", mime_type: "image/jpeg", size: 165000, url: "https://picsum.photos/seed/namaste-tech/1200/800", alt_text: "Demo technology image", width: 1200, height: 800 },
  ];
  for (const media of mediaDefs) {
    await prisma.mediaFile.upsert({
      where: { id: media.id },
      update: { ...media, uploaded_by: admin.id },
      create: { ...media, uploaded_by: admin.id },
    });
  }

  const articleList = Object.entries(articleIds);
  for (let index = 0; index < articleList.length; index++) {
    const [slug, articleId] = articleList[index];
    const tag = tags[tagSlugs[index % tagSlugs.length]];
    if (!tag) continue;
    await prisma.articleTag.upsert({
      where: { article_id_tag_id: { article_id: articleId, tag_id: tag.id } },
      update: {},
      create: { article_id: articleId, tag_id: tag.id },
    });
    if (index % 3 === 0) {
      const secondTag = tags[tagSlugs[(index + 3) % tagSlugs.length]];
      await prisma.articleTag.upsert({
        where: { article_id_tag_id: { article_id: articleId, tag_id: secondTag.id } },
        update: {},
        create: { article_id: articleId, tag_id: secondTag.id },
      });
    }
    void slug;
  }

  const webStories = [
    { id: "seed-story-1", title: "डेमो: नेपालको मनसुन यात्रा", slug: "demo-nepal-monsoon", slides: [{ title: "पहिलो स्लाइड", image: "https://picsum.photos/seed/story-monsoon-1/900/1600" }, { title: "दोस्रो स्लाइड", image: "https://picsum.photos/seed/story-monsoon-2/900/1600" }], category_id: cats["feature"].id },
    { id: "seed-story-2", title: "Demo: Kathmandu technology week", slug: "demo-kathmandu-tech-week", slides: [{ title: "Innovation", image: "https://picsum.photos/seed/story-tech-1/900/1600" }, { title: "Community", image: "https://picsum.photos/seed/story-tech-2/900/1600" }], category_id: cats["prabidhi"].id },
    { id: "seed-story-3", title: "डेमो: नेपाली खेलकुदका क्षण", slug: "demo-nepal-sports-moments", slides: [{ title: "खेलकुद", image: "https://picsum.photos/seed/story-sports-1/900/1600" }, { title: "टिमवर्क", image: "https://picsum.photos/seed/story-sports-2/900/1600" }], category_id: cats["khelkud"].id },
  ];
  for (const story of webStories) {
    await prisma.webStory.upsert({
      where: { id: story.id },
      update: { ...story, is_active: true },
      create: { ...story, is_active: true },
    });
  }

  const seedCommentData = [
    ["seed-comment-1", "डेमो प्रतिक्रिया: यो सामग्री उपयोगी लाग्यो।", articleList[0]?.[1]],
    ["seed-comment-2", "Demo comment: Clear explanation and helpful context.", articleList[1]?.[1]],
    ["seed-comment-3", "डेमो प्रतिक्रिया: थप तथ्यसहितको शृङ्खला चाहिन्छ।", articleList[2]?.[1]],
    ["seed-comment-4", "डेमो प्रतिक्रिया: स्थानीय दृष्टिकोण राम्रो छ।", articleList[3]?.[1]],
    ["seed-comment-5", "Demo reply: I agree with this perspective.", articleList[4]?.[1]],
    ["seed-comment-6", "डेमो प्रतिक्रिया: स्रोतहरू पनि हेर्न चाहन्छौं।", articleList[5]?.[1]],
  ] as const;
  const seededComments = [];
  for (let index = 0; index < seedCommentData.length; index++) {
    const [id, content, article_id] = seedCommentData[index];
    if (!article_id) continue;
    const comment = await prisma.comment.upsert({
      where: { id },
      update: { content, status: CommentStatus.APPROVED, article_id, user_id: readers[index % readers.length].id, like_count: index + 2, dislike_count: index % 2 },
      create: { id, content, status: CommentStatus.APPROVED, article_id, user_id: readers[index % readers.length].id, like_count: index + 2, dislike_count: index % 2, created_at: hoursAgo(index + 1) },
    });
    seededComments.push(comment);
  }
  for (let index = 0; index < seededComments.length; index++) {
    const comment = seededComments[index];
    const voter = readers[(index + 1) % readers.length];
    await prisma.commentVote.upsert({
      where: { comment_id_user_id: { comment_id: comment.id, user_id: voter.id } },
      update: { is_like: index % 2 === 0 },
      create: { id: `seed-vote-${index + 1}`, comment_id: comment.id, user_id: voter.id, is_like: index % 2 === 0 },
    });
  }
  for (let index = 0; index < Math.min(4, articleList.length); index++) {
    await prisma.bookmark.upsert({
      where: { user_id_article_id: { user_id: readers[index % readers.length].id, article_id: articleList[index][1] } },
      update: {},
      create: { id: `seed-bookmark-${index + 1}`, user_id: readers[index % readers.length].id, article_id: articleList[index][1] },
    });
  }

  for (let index = 0; index < 40; index++) {
    await prisma.pageView.upsert({
      where: { id: `seed-page-view-${index + 1}` },
      update: { page_url: index % 2 ? "/" : `/articles/${articleList[index % articleList.length][0]}`, article_id: articleList[index % articleList.length][1], created_at: hoursAgo(index % 48) },
      create: { id: `seed-page-view-${index + 1}`, page_url: index % 2 ? "/" : `/articles/${articleList[index % articleList.length][0]}`, article_id: articleList[index % articleList.length][1], ip_address: `192.0.2.${index + 1}`, user_agent: "NamasteXpress seed browser", created_at: hoursAgo(index % 48) },
    });
  }
  const newsletterEmails = ["demo.reader1@example.com", "demo.reader2@example.com", "demo.reader3@example.com", "demo.reader4@example.com"];
  for (const email of newsletterEmails) {
    await prisma.newsletterSubscription.upsert({
      where: { email },
      update: { is_active: true, source: "seed" },
      create: { email, language: "ne", source: "seed", is_active: true },
    });
  }
  await prisma.auditLog.upsert({
    where: { id: "seed-audit-1" },
    update: { action: "SEED_REFRESH", entity: "seed", new_value: { seed_date: seedClock.isoDate } },
    create: { id: "seed-audit-1", admin_id: admin.id, action: "SEED_REFRESH", entity: "seed", new_value: { seed_date: seedClock.isoDate }, ip_address: "127.0.0.1" },
  });

  const panchang = {
    bs_year: 2083,
    bs_month: 4,
    bs_day: 7,
    ad_date: today,
    tithi: "कृष्ण चतुर्दशी",
    nakshatra: "पुष्य",
    yoga: "व्यतिपात",
    karana: "शकुनी",
    sunrise: "05:19",
    sunset: "19:02",
    moonrise: "03:58",
    rahukaal: "13:30–15:10",
  };
  await prisma.panchangData.upsert({
    where: { bs_year_bs_month_bs_day: { bs_year: panchang.bs_year, bs_month: panchang.bs_month, bs_day: panchang.bs_day } },
    update: panchang,
    create: panchang,
  });

  await prisma.siteSettings.upsert({
    where: { key: "seed_dataset_info" },
    update: { value: { mode: "development", seed_date: seedClock.isoDate, verified_sources: [verifiedSnapshots.forex.sourceUrl, verifiedSnapshots.goldSilver.sourceUrl, verifiedSnapshots.holidays.sourceUrl], editorial_content: "DEMO" } },
    create: { key: "seed_dataset_info", value: { mode: "development", seed_date: seedClock.isoDate, verified_sources: [verifiedSnapshots.forex.sourceUrl, verifiedSnapshots.goldSilver.sourceUrl, verifiedSnapshots.holidays.sourceUrl], editorial_content: "DEMO" } },
  });
  console.log("   ✅ Relationships, media, stories, and analytics seeded");

  console.log("\n✅ All done!");
  if (process.env.NODE_ENV !== "production") {
    console.log("   Seed accounts: admin@namastexpress.com, editor@namastexpress.com, author@namastexpress.com");
    console.log("   Passwords are supplied through SEED_*_PASSWORD or development defaults.");
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
