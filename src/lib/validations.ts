import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "नाम कम्तीमा २ अक्षरको हुनुपर्छ").max(120),
  email: z.string().trim().toLowerCase().email("मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्").max(254),
  password: z
    .string()
    .min(8, "पासवर्ड कम्तीमा ८ अक्षरको हुनुपर्छ")
    .max(128, "पासवर्ड १२८ अक्षरभन्दा लामो हुनु हुँदैन")
    .regex(/[A-Z]/, "कम्तीमा एउटा ठूलो अक्षर चाहिन्छ")
    .regex(/[a-z]/, "कम्तीमा एउटा सानो अक्षर चाहिन्छ")
    .regex(/[0-9]/, "कम्तीमा एउटा अंक चाहिन्छ")
    .regex(/[^A-Za-z0-9]/, "कम्तीमा एउटा विशेष चिन्ह चाहिन्छ"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्").max(254),
  password: z.string().min(1, "पासवर्ड आवश्यक छ").max(128),
});

export const articleSchema = z.object({
  title: z.string().min(1, "शीर्षक आवश्यक छ"),
  title_en: z.string().optional(),
  slug: z.string().min(1, "स्लग आवश्यक छ"),
  excerpt: z.string().optional(),
  excerpt_en: z.string().optional(),
  content: z.string().min(1, "सामग्री आवश्यक छ"),
  content_en: z.string().optional(),
  category_id: z.string().min(1, "वर्ग आवश्यक छ"),
  featured_image: z.string().optional(),
  ai_summary: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  is_featured: z.boolean().default(false),
  tag_ids: z.array(z.string()).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "नाम आवश्यक छ"),
  name_en: z.string().optional(),
  slug: z.string().min(1, "स्लग आवश्यक छ"),
  description: z.string().optional(),
  color: z.string().default("#c62828"),
  sort_order: z.number().default(0),
  parent_id: z.string().nullable().optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1, "टिप्पणी खाली हुन सक्दैन").max(2000),
  article_id: z.string().min(1),
  parent_id: z.string().nullable().optional(),
});

export const passwordResetSchema = z.object({
  password: z
    .string()
    .min(8, "पासवर्ड कम्तीमा ८ अक्षरको हुनुपर्छ")
    .max(128, "पासवर्ड १२८ अक्षरभन्दा लामो हुनु हुँदैन")
    .regex(/[A-Z]/, "कम्तीमा एउटा ठूलो अक्षर चाहिन्छ")
    .regex(/[a-z]/, "कम्तीमा एउटा सानो अक्षर चाहिन्छ")
    .regex(/[0-9]/, "कम्तीमा एउटा अंक चाहिन्छ")
    .regex(/[^A-Za-z0-9]/, "कम्तीमा एउटा विशेष चिन्ह चाहिन्छ"),
  token: z.string().regex(/^[a-f0-9]{64}$/i, "अमान्य टोकन"),
});

export const rashifalSchema = z.object({
  sign: z.string().min(1, "राशि आवश्यक छ"),
  sign_ne: z.string().optional(),
  bs_year: z.number().int().min(2000).max(2100),
  bs_month: z.number().int().min(1).max(12),
  bs_day: z.number().int().min(1).max(32),
  ad_date: z.string().min(1, "मिति आवश्यक छ"),
  prediction: z.string().min(1, "भविष्यवाणी आवश्यक छ"),
  prediction_en: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

export const holidaySchema = z.object({
  title: z.string().min(1, "शीर्षक आवश्यक छ"),
  title_en: z.string().optional(),
  bs_year: z.number().int().min(2000).max(2100),
  bs_month: z.number().int().min(1).max(12),
  bs_day: z.number().int().min(1).max(32),
  ad_date: z.string().min(1, "मिति आवश्यक छ"),
  type: z.string().default("public"),
  is_public: z.boolean().default(true),
  description: z.string().optional(),
  description_en: z.string().optional(),
});

export const goldSilverSchema = z.object({
  date: z.string().min(1, "मिति आवश्यक छ"),
  fine_gold: z.number().positive().optional().nullable(),
  tejabi_gold: z.number().positive().optional().nullable(),
  silver: z.number().positive().optional().nullable(),
  source: z.string().optional(),
});

export const forexSchema = z.object({
  date: z.string().min(1, "मिति आवश्यक छ"),
  currency: z.string().min(1, "मुद्रा आवश्यक छ"),
  currency_name: z.string().optional(),
  unit: z.number().int().positive().default(1),
  buy: z.number().optional().nullable(),
  sell: z.number().optional().nullable(),
});

const optionalNullableId = z.string().trim().min(1).max(191).nullable().optional();
const optionalNullableDateTime = z.string().datetime({ offset: true }).nullable().optional();

export const breakingNewsCreateSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(300),
    title_en: z.string().trim().max(300).nullable().optional(),
    article_id: optionalNullableId,
    expires_at: optionalNullableDateTime,
  })
  .strict();

export const breakingNewsUpdateSchema = breakingNewsCreateSchema
  .partial()
  .extend({ is_active: z.boolean().optional() })
  .refine((data) => Object.keys(data).length > 0, "At least one field is required");

export const mediaUpdateSchema = z
  .object({
    alt_text: z.string().trim().max(500).nullable(),
  })
  .strict();

export const matchUpdateSchema = z
  .object({
    home_score: z.coerce.number().int().min(0).max(999).optional(),
    away_score: z.coerce.number().int().min(0).max(999).optional(),
    status: z.enum(["UPCOMING", "LIVE", "COMPLETED", "CANCELLED"]).optional(),
    venue: z.string().trim().max(300).nullable().optional(),
    match_date: z.string().datetime({ offset: true }).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, "At least one field is required");
