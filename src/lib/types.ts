export type Settings = {
  brand_name: string;
  person_name: string;
  tagline_en: string;
  tagline_hi: string;
  welcome_en: string;
  welcome_hi: string;
  hero_intro_en: string;
  hero_intro_hi: string;
  role_en: string;
  role_hi: string;
  about_heading_en: string;
  about_heading_hi: string;
  about_body_en: string;
  about_body_hi: string;
  journey_heading_en: string;
  journey_heading_hi: string;
  journey_body_en: string;
  journey_body_hi: string;
  journey_quote_en: string;
  journey_quote_hi: string;
  phone_display: string;
  whatsapp_e164: string;
  email: string;
  instagram_url: string;
  facebook_url: string;
  portrait_media_id: string;
  journey_media_id: string;
  contact_media_id: string;
  footer_blurb_en: string;
  footer_blurb_hi: string;
  seo_title_en: string;
  seo_title_hi: string;
  seo_description_en: string;
  seo_description_hi: string;
  wa_skill_en: string;
  wa_skill_hi: string;
  wa_business_en: string;
  wa_business_hi: string;
  wa_general_en: string;
  wa_general_hi: string;
  education_label_en: string;
  education_caption_en: string;
  education_label_hi: string;
  education_caption_hi: string;
  experience_label_en: string;
  experience_caption_en: string;
  experience_label_hi: string;
  experience_caption_hi: string;
  site_url: string;
};

export type Partner = {
  enabled: boolean;
  name: string;
  website_url: string;
  description_en: string;
  description_hi: string;
  logo_media_id: string;
  disclosure_en: string;
  disclosure_hi: string;
};

export type Program = {
  id: string;
  slug: string;
  kind: "skill" | "business" | "package";
  title_en: string;
  title_hi: string;
  summary_en: string;
  summary_hi: string;
  description_en: string;
  description_hi: string;
  benefits_en: string;
  benefits_hi: string;
  eligibility_en: string;
  eligibility_hi: string;
  duration_en: string;
  duration_hi: string;
  format_en: string;
  format_hi: string;
  conditions_en: string;
  conditions_hi: string;
  show_price: boolean;
  original_price: string;
  offer_price: string;
  offer_label: string;
  offer_expires: string;
  cta_en: string;
  cta_hi: string;
  image_media_id: string;
  published: boolean;
  sort_order: number;
};

export type Faq = {
  id: string;
  question_en: string;
  question_hi: string;
  answer_en: string;
  answer_hi: string;
  sort_order: number;
};

export type ArticleCard = {
  id: string;
  slug: string;
  title_en: string;
  title_hi: string;
  excerpt_en: string;
  excerpt_hi: string;
  category_id: string;
  category_en: string;
  category_hi: string;
  featured_media_id: string;
  published_on: string;
};

export type Article = ArticleCard & {
  body_en: string;
  body_hi: string;
  youtube_id: string;
  resource_media_id: string;
  resource_label_en: string;
  resource_label_hi: string;
  seo_title_en: string;
  seo_title_hi: string;
  seo_description_en: string;
  seo_description_hi: string;
  status: string;
  tags: string;
};

export type Category = { id: string; slug: string; name_en: string; name_hi: string };

export type Testimonial = {
  id: string;
  name: string;
  content_en: string;
  content_hi: string;
  date_label: string;
  image_media_id: string;
  approved: boolean;
  featured: boolean;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  date_label: string;
  category: string;
  image_media_id: string;
  visible: boolean;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  date_label: string;
  credential_url: string;
  image_media_id: string;
  visible: boolean;
};

export type Milestone = {
  id: string;
  title_en: string;
  title_hi: string;
  body_en: string;
  body_hi: string;
  date_label: string;
  image_media_id: string;
  sort_order: number;
  visible: boolean;
};

export type Shell = { settings: Settings; partner: Partner; origin: string };

export type HomeContent = {
  programs: Program[];
  articles: ArticleCard[];
  testimonials: Testimonial[];
  achievements: Achievement[];
  certifications: Certification[];
  milestones: Milestone[];
};
