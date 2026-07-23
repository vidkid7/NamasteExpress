export type SupportedLanguage = "ne" | "en";

export interface TranslationStrings {
  [key: string]: string | TranslationStrings;
}

export interface SiteConfig {
  site_name: { ne: string; en: string };
  site_tagline: { ne: string; en: string };
  site_logo: string;
  site_favicon: string;
  primary_color: string;
  contact_phone: string;
  contact_email: string;
  contact_address: { ne: string; en: string };
  registration_number: string;
  social_facebook: string;
  social_twitter: string;
  social_youtube: string;
  social_instagram: string;
  social_tiktok: string;
  homepage_section_order: string[];
  features_comments: boolean;
  features_bookmarks: boolean;
  features_reels: boolean;
  features_galleries: boolean;
  copyright_text: { ne: string; en: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
