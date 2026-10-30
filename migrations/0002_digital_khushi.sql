create table if not exists admin_users (
  id text primary key,
  email text not null unique,
  name text not null,
  password_hash text not null,
  recovery_hash text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists admin_sessions (
  id text primary key,
  admin_id text not null references admin_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists login_attempts (
  id bigserial primary key,
  ip_hash text not null,
  success boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists login_attempts_ip_idx on login_attempts (ip_hash, created_at);

create table if not exists website_settings (
  id integer primary key default 1,
  brand_name text not null,
  person_name text not null,
  tagline_en text not null,
  tagline_hi text not null,
  welcome_en text not null,
  welcome_hi text not null,
  hero_intro_en text not null,
  hero_intro_hi text not null,
  role_en text not null,
  role_hi text not null,
  about_heading_en text not null,
  about_heading_hi text not null,
  about_body_en text not null,
  about_body_hi text not null,
  journey_heading_en text not null,
  journey_heading_hi text not null,
  journey_body_en text not null,
  journey_body_hi text not null,
  journey_quote_en text not null,
  journey_quote_hi text not null,
  phone_display text not null,
  whatsapp_e164 text not null,
  email text not null,
  instagram_url text not null default '',
  facebook_url text not null default '',
  portrait_media_id text not null default '',
  journey_media_id text not null default '',
  contact_media_id text not null default '',
  footer_blurb_en text not null,
  footer_blurb_hi text not null,
  seo_title_en text not null,
  seo_title_hi text not null,
  seo_description_en text not null,
  seo_description_hi text not null,
  wa_skill_en text not null,
  wa_skill_hi text not null,
  wa_business_en text not null,
  wa_business_hi text not null,
  wa_general_en text not null,
  wa_general_hi text not null,
  education_label_en text not null,
  education_caption_en text not null,
  education_label_hi text not null,
  education_caption_hi text not null,
  experience_label_en text not null,
  experience_caption_en text not null,
  experience_label_hi text not null,
  experience_caption_hi text not null,
  site_url text not null default '',
  constraint website_settings_one check (id = 1)
);

create table if not exists partner_settings (
  id integer primary key default 1,
  enabled boolean not null default true,
  name text not null,
  website_url text not null,
  description_en text not null,
  description_hi text not null,
  logo_media_id text not null default '',
  disclosure_en text not null,
  disclosure_hi text not null,
  constraint partner_settings_one check (id = 1)
);

create table if not exists programs (
  id text primary key,
  slug text not null unique,
  kind text not null check (kind in ('skill', 'business', 'package')),
  title_en text not null,
  title_hi text not null,
  summary_en text not null default '',
  summary_hi text not null default '',
  description_en text not null default '',
  description_hi text not null default '',
  benefits_en text not null default '',
  benefits_hi text not null default '',
  eligibility_en text not null default '',
  eligibility_hi text not null default '',
  duration_en text not null default '',
  duration_hi text not null default '',
  format_en text not null default '',
  format_hi text not null default '',
  conditions_en text not null default '',
  conditions_hi text not null default '',
  show_price boolean not null default false,
  original_price text not null default '',
  offer_price text not null default '',
  offer_label text not null default '',
  offer_expires text not null default '',
  cta_en text not null default '',
  cta_hi text not null default '',
  image_media_id text not null default '',
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists program_faqs (
  id text primary key,
  program_id text not null references programs(id) on delete cascade,
  question_en text not null,
  question_hi text not null default '',
  answer_en text not null,
  answer_hi text not null default '',
  sort_order integer not null default 0
);

create table if not exists article_categories (
  id text primary key,
  slug text not null unique,
  name_en text not null,
  name_hi text not null,
  sort_order integer not null default 0
);

create table if not exists articles (
  id text primary key,
  slug text not null unique,
  title_en text not null,
  title_hi text not null default '',
  excerpt_en text not null default '',
  excerpt_hi text not null default '',
  body_en text not null default '',
  body_hi text not null default '',
  category_id text not null references article_categories(id),
  featured_media_id text not null default '',
  youtube_id text not null default '',
  resource_media_id text not null default '',
  resource_label_en text not null default '',
  resource_label_hi text not null default '',
  seo_title_en text not null default '',
  seo_title_hi text not null default '',
  seo_description_en text not null default '',
  seo_description_hi text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists articles_status_idx on articles (status, published_at);

create table if not exists article_tags (
  id text primary key,
  slug text not null unique,
  name_en text not null,
  name_hi text not null default ''
);

create table if not exists article_tag_links (
  article_id text not null references articles(id) on delete cascade,
  tag_id text not null references article_tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

create table if not exists testimonials (
  id text primary key,
  name text not null,
  content_en text not null,
  content_hi text not null default '',
  date_label text not null default '',
  image_media_id text not null default '',
  approved boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists achievements (
  id text primary key,
  title text not null,
  description text not null default '',
  date_label text not null default '',
  category text not null default '',
  image_media_id text not null default '',
  visible boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists certifications (
  id text primary key,
  name text not null,
  issuer text not null default '',
  date_label text not null default '',
  credential_url text not null default '',
  image_media_id text not null default '',
  visible boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists journey_milestones (
  id text primary key,
  title_en text not null,
  title_hi text not null default '',
  body_en text not null default '',
  body_hi text not null default '',
  date_label text not null default '',
  image_media_id text not null default '',
  sort_order integer not null default 0,
  visible boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists media_assets (
  id text primary key,
  filename text not null,
  mime text not null,
  data_base64 text not null,
  alt text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id text primary key,
  full_name text not null,
  mobile text not null,
  email text not null default '',
  city text not null default '',
  interest text not null check (interest in ('skill', 'business')),
  message text not null default '',
  source text not null default '',
  landing_page text not null default '',
  utm_source text not null default '',
  utm_medium text not null default '',
  utm_campaign text not null default '',
  ip_hash text not null default '',
  status text not null default 'new' check (status in ('new', 'contacted', 'interested', 'converted', 'not_interested')),
  next_followup_on text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists leads_created_idx on leads (created_at desc);
create index if not exists leads_status_idx on leads (status);
create index if not exists leads_mobile_idx on leads (mobile);

create table if not exists lead_notes (
  id text primary key,
  lead_id text not null references leads(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists lead_followups (
  id text primary key,
  lead_id text not null references leads(id) on delete cascade,
  note text not null default '',
  due_on text not null default '',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists lead_followups_due_idx on lead_followups (due_on);

create table if not exists analytics_events (
  id bigserial primary key,
  session_id text not null,
  event_name text not null,
  path text not null default '',
  referrer_host text not null default '',
  utm_source text not null default '',
  utm_medium text not null default '',
  utm_campaign text not null default '',
  device text not null default '',
  meta text not null default '',
  ip_hash text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists analytics_created_idx on analytics_events (created_at);
create index if not exists analytics_event_idx on analytics_events (event_name);

create table if not exists email_logs (
  id text primary key,
  lead_id text not null,
  status text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);

insert into website_settings (
  id, brand_name, person_name, tagline_en, tagline_hi, welcome_en, welcome_hi,
  hero_intro_en, hero_intro_hi, role_en, role_hi,
  about_heading_en, about_heading_hi, about_body_en, about_body_hi,
  journey_heading_en, journey_heading_hi, journey_body_en, journey_body_hi,
  journey_quote_en, journey_quote_hi,
  phone_display, whatsapp_e164, email,
  footer_blurb_en, footer_blurb_hi,
  seo_title_en, seo_title_hi, seo_description_en, seo_description_hi,
  wa_skill_en, wa_skill_hi, wa_business_en, wa_business_hi, wa_general_en, wa_general_hi,
  education_label_en, education_caption_en, education_label_hi, education_caption_hi,
  experience_label_en, experience_caption_en, experience_label_hi, experience_caption_hi
) values (
  1, 'Digital Khushi', 'Khushi Aswani',
  $t$Learn Skills. Build Confidence. Create Opportunities.$t$,
  $t$कौशल सीखें। आत्मविश्वास बनाएँ। अवसर बनाएँ।$t$,
  $t$Welcome to Digital Khushi$t$,
  $t$डिजिटल खुशी में आपका स्वागत है$t$,
  $t$Hello, I'm Khushi Aswani. I help students, professionals and homemakers learn digital skills and explore new opportunities for a better future.$t$,
  $t$नमस्ते, मैं खुशी असवानी हूँ। मैं छात्रों, प्रोफेशनल्स और गृहिणियों को डिजिटल कौशल सीखने और बेहतर भविष्य के नए अवसर समझने में मदद करती हूँ।$t$,
  $t$Digital Marketing Enthusiast & Opportunity Guide$t$,
  $t$डिजिटल मार्केटिंग उत्साही और अवसर मार्गदर्शक$t$,
  $t$Hi, I'm Khushi Aswani$t$,
  $t$नमस्ते, मैं खुशी असवानी हूँ$t$,
  $t$I have completed my B.Com and have 2 years of experience in Digital Marketing. Through Digital Khushi, I help people learn in-demand skills and explore genuine online business opportunities. My goal is to make learning simple, practical and accessible — whether you are a student, a working professional or a homemaker.$t$,
  $t$मैंने बी.कॉम पूरा किया है और डिजिटल मार्केटिंग में 2 साल का अनुभव है। डिजिटल खुशी के ज़रिए मैं लोगों को ज़रूरी कौशल सीखने और सच्चे ऑनलाइन बिज़नेस अवसरों को समझने में मदद करती हूँ। मेरा लक्ष्य सीखना सरल, व्यावहारिक और सबके लिए सुलभ बनाना है — चाहे आप छात्र हों, कामकाजी प्रोफेशनल हों या गृहिणी।$t$,
  $t$From Learning to Helping Others Grow$t$,
  $t$सीखने से लेकर दूसरों की बढ़त तक$t$,
  $t$I started with a strong interest in digital marketing and online opportunities. Over the past 2 years I have learned, practised and begun helping others understand the same path. With the right skills and clear guidance, a person can explore new possibilities and build a more confident future. Nothing here is a promise of income or a job — it is an invitation to learn properly and ask questions.$t$,
  $t$मेरी शुरुआत डिजिटल मार्केटिंग और ऑनलाइन अवसरों में गहरी दिलचस्पी से हुई। पिछले 2 सालों में मैंने खुद सीखा, अभ्यास किया और अब दूसरों को भी यही रास्ता समझने में मदद करती हूँ। सही कौशल और साफ़ मार्गदर्शन से कोई भी व्यक्ति नए अवसर देख सकता है और ज़्यादा आत्मविश्वास के साथ आगे बढ़ सकता है। यहाँ आय या नौकरी का कोई वादा नहीं है — यह ठीक से सीखने और सवाल पूछने का निमंत्रण है।$t$,
  $t$A small step in learning today can create a bigger tomorrow.$t$,
  $t$आज सीखने का एक छोटा कदम, कल एक बड़ा अवसर बन सकता है।$t$,
  '9834236930', '919834236930', 'khushiaswani9834@gmail.com',
  $t$A personal brand for digital learning, confidence and genuine opportunities.$t$,
  $t$डिजिटल सीखने, आत्मविश्वास और सच्चे अवसरों के लिए एक व्यक्तिगत ब्रांड।$t$,
  $t$Digital Khushi | Khushi Aswani — Learn Skills. Build Confidence. Create Opportunities.$t$,
  $t$डिजिटल खुशी | खुशी असवानी — कौशल सीखें। आत्मविश्वास बनाएँ। अवसर बनाएँ।$t$,
  $t$Khushi Aswani helps students, professionals and homemakers in India understand digital skills and online business opportunities.$t$,
  $t$खुशी असवानी छात्रों, प्रोफेशनल्स और गृहिणियों को डिजिटल कौशल और ऑनलाइन बिज़नेस अवसर सरल भाषा में समझाती हैं।$t$,
  $t$Hello Khushi, I visited your Digital Khushi website and would like to know more about Skill Development programs.$t$,
  $t$नमस्ते खुशी, मैंने आपकी डिजिटल खुशी वेबसाइट देखी है और कौशल विकास प्रोग्राम के बारे में जानना चाहती/चाहता हूँ।$t$,
  $t$Hello Khushi, I am interested in understanding the Online Business opportunities. Please share more information.$t$,
  $t$नमस्ते खुशी, मैं ऑनलाइन बिज़नेस के अवसरों को समझना चाहती/चाहता हूँ। कृपया और जानकारी साझा करें।$t$,
  $t$Hello Khushi, I visited your Digital Khushi website and would like to connect.$t$,
  $t$नमस्ते खुशी, मैंने आपकी डिजिटल खुशी वेबसाइट देखी है और आपसे बात करना चाहती/चाहता हूँ।$t$,
  'B.Com', 'Educational Qualification', 'बी.कॉम', 'शैक्षणिक योग्यता',
  '2+ Years', 'Digital Marketing Experience', '2+ वर्ष', 'डिजिटल मार्केटिंग अनुभव'
);

insert into partner_settings (
  id, enabled, name, website_url, description_en, description_hi, disclosure_en, disclosure_hi
) values (
  1, true, 'LeadsGuru EdTech Private Limited', 'https://leadsguru.in',
  $t$I collaborate with LeadsGuru EdTech Private Limited to help interested learners explore skill development programs and online business opportunities.$t$,
  $t$मैं LeadsGuru EdTech Private Limited के साथ मिलकर रुचि रखने वाले लोगों को कौशल विकास प्रोग्राम और ऑनलाइन बिज़नेस के अवसर समझने में मदद करती हूँ।$t$,
  $t$Digital Khushi shares these programs through LeadsGuru EdTech Private Limited. Please review details yourself. Earnings, placement and business results are not guaranteed.$t$,
  $t$डिजिटल खुशी ये प्रोग्राम LeadsGuru EdTech Private Limited के माध्यम से साझा करती है। कृपया विवरण स्वयं देखें। कमाई, प्लेसमेंट या बिज़नेस परिणाम की कोई गारंटी नहीं है।$t$
);

insert into programs (
  id, slug, kind, title_en, title_hi, summary_en, summary_hi, description_en, description_hi,
  benefits_en, benefits_hi, conditions_en, conditions_hi, cta_en, cta_hi, published, sort_order
) values
(
  'skill-development', 'skill-development', 'skill',
  'Skill Development Programs', 'कौशल विकास प्रोग्राम',
  $t$Explore learning programs designed to help you develop useful digital and professional skills.$t$,
  $t$ऐसे लर्निंग प्रोग्राम देखें जो उपयोगी डिजिटल और प्रोफेशनल कौशल विकसित करने में मदद करें।$t$,
  $t$These programs are for beginners who want a clearer path into digital skills. Pricing and full inclusions are confirmed with you directly, or shown here only after they are added in the admin dashboard.$t$,
  $t$ये प्रोग्राम उन beginners के लिए हैं जो डिजिटल कौशल की साफ़ शुरुआत चाहते हैं। कीमत और पूरी जानकारी तभी दिखाई जाती है जब वह एडमिन में जोड़ी जाए, वरना आप सीधे पूछ सकते हैं।$t$,
  $t$Learn in-demand digital skills
Improve your career opportunities
Suitable for students, professionals and homemakers$t$,
  $t$माँग वाले डिजिटल कौशल सीखें
करियर के अवसर बेहतर समझें
छात्रों, प्रोफेशनल्स और गृहिणियों के लिए उपयुक्त$t$,
  $t$This is education, not a job offer. Completion depends on your practice. No income is guaranteed.$t$,
  $t$यह शिक्षा है, नौकरी का प्रस्ताव नहीं। नतीजा आपकी मेहनत पर निर्भर है। आय की कोई गारंटी नहीं है।$t$,
  'Explore Skill Programs', 'कौशल प्रोग्राम देखें', true, 1
),
(
  'online-business', 'online-business', 'business',
  'Online Business Opportunities', 'ऑनलाइन बिज़नेस के अवसर',
  $t$Discover online business concepts and opportunities, and understand how digital platforms and affiliate marketing work.$t$,
  $t$ऑनलाइन बिज़नेस के विचार और अवसर समझें, और जानें कि डिजिटल प्लेटफ़ॉर्म तथा एफिलिएट मार्केटिंग कैसे काम करते हैं।$t$,
  $t$This introduction explains how an online business opportunity is structured. It is not a promise that you will earn, and it is separate from pure skill-learning programs.$t$,
  $t$यह परिचय बताता है कि एक ऑनलाइन बिज़नेस अवसर कैसे बना होता है। यह कमाई का वादा नहीं है, और यह केवल कौशल सीखने वाले प्रोग्राम से अलग है।$t$,
  $t$Work from home concepts
Flexible and part-time options to understand
Step-by-step guidance and support
Learn before you decide$t$,
  $t$घर से काम करने के विचार
लचीले और पार्ट-टाइम विकल्पों को समझना
क्रमवार मार्गदर्शन और सहयोग
तय करने से पहले सीखें$t$,
  $t$Online business opportunities involve real effort, cost and risk. Digital Khushi does not guarantee earnings, clients or employment.$t$,
  $t$ऑनलाइन बिज़नेस में मेहनत, खर्च और जोखिम होता है। डिजिटल खुशी कमाई, ग्राहक या नौकरी की गारंटी नहीं देती।$t$,
  'Explore Business Opportunities', 'बिज़नेस अवसर देखें', true, 2
),
('pkg-bronze', 'bronze', 'package', 'Bronze', 'Bronze', 'Basic learning programs', 'बुनियादी लर्निंग प्रोग्राम', '', '', '', '', '', '', 'Enquire on WhatsApp', 'व्हाट्सऐप पर पूछें', true, 10),
('pkg-silver', 'silver', 'package', 'Silver', 'Silver', 'Skill enhancement programs', 'कौशल निखारने वाले प्रोग्राम', '', '', '', '', '', '', 'Enquire on WhatsApp', 'व्हाट्सऐप पर पूछें', true, 11),
('pkg-gold', 'gold', 'package', 'Gold', 'Gold', 'Advanced learning programs', 'उन्नत लर्निंग प्रोग्राम', '', '', '', '', '', '', 'Enquire on WhatsApp', 'व्हाट्सऐप पर पूछें', true, 12),
('pkg-platinum', 'platinum', 'package', 'Platinum', 'Platinum', 'Professional growth programs', 'प्रोफेशनल ग्रोथ प्रोग्राम', '', '', '', '', '', '', 'Enquire on WhatsApp', 'व्हाट्सऐप पर पूछें', true, 13),
('pkg-diamond', 'diamond', 'package', 'Diamond', 'Diamond', 'Complete learning bundle', 'पूरा लर्निंग बंडल', '', '', '', '', '', '', 'Enquire on WhatsApp', 'व्हाट्सऐप पर पूछें', true, 14),
('pkg-startup', 'startup', 'package', 'Startup', 'Startup', 'Online business opportunity', 'ऑनलाइन बिज़नेस अवसर', '', '', '', '', '', '', 'Enquire on WhatsApp', 'व्हाट्सऐप पर पूछें', true, 15);

insert into program_faqs (id, program_id, question_en, question_hi, answer_en, answer_hi, sort_order) values
(
  'faq-earn', 'skill-development',
  'Are earnings or a job guaranteed?',
  'क्या कमाई या नौकरी की गारंटी है?',
  'No. Digital Khushi does not guarantee income, placement or business results. Programs are for learning and for understanding an opportunity before you decide.',
  'नहीं। डिजिटल खुशी आय, प्लेसमेंट या बिज़नेस परिणाम की गारंटी नहीं देती। प्रोग्राम सीखने और तय करने से पहले अवसर समझने के लिए हैं।',
  1
),
(
  'faq-partner', 'skill-development',
  'Who provides the programs?',
  'प्रोग्राम कौन देता है?',
  'Khushi Aswani guides the conversation. The learning programs are offered with LeadsGuru EdTech Private Limited. You can review their website at leadsguru.in.',
  'बातचीत में खुशी असवानी मार्गदर्शन करती हैं। लर्निंग प्रोग्राम LeadsGuru EdTech Private Limited के साथ उपलब्ध हैं। उनकी वेबसाइट leadsguru.in पर देखी जा सकती है।',
  2
),
(
  'faq-earn-b', 'online-business',
  'Will I earn a fixed income?',
  'क्या मुझे तय आय मिलेगी?',
  'No fixed income is promised. An online business depends on your effort, costs and the platform terms. Ask questions before you enrol.',
  'किसी तय आय का वादा नहीं है। ऑनलाइन बिज़नेस आपकी मेहनत, खर्च और प्लेटफ़ॉर्म की शर्तों पर निर्भर करता है। जुड़ने से पहले सवाल पूछें।',
  1
);

insert into article_categories (id, slug, name_en, name_hi, sort_order) values
('cat-dm', 'digital-marketing', 'Digital Marketing', 'डिजिटल मार्केटिंग', 1),
('cat-skill', 'skill-development', 'Skill Development', 'कौशल विकास', 2),
('cat-ob', 'online-business', 'Online Business', 'ऑनलाइन बिज़नेस', 3),
('cat-aff', 'affiliate-marketing', 'Affiliate Marketing', 'एफिलिएट मार्केटिंग', 4),
('cat-women', 'women-empowerment', 'Women Empowerment', 'महिला सशक्तिकरण', 5),
('cat-fin', 'financial-awareness', 'Financial Awareness', 'वित्तीय जागरूकता', 6),
('cat-growth', 'personal-growth', 'Personal Growth', 'व्यक्तिगत विकास', 7),
('cat-ent', 'digital-entrepreneurship', 'Digital Entrepreneurship', 'डिजिटल उद्यमिता', 8);

insert into articles (
  id, slug, title_en, title_hi, excerpt_en, excerpt_hi, body_en, body_hi, category_id,
  seo_title_en, seo_title_hi, seo_description_en, seo_description_hi, status, published_at
) values
(
  'article-dm', 'what-is-digital-marketing',
  'What is Digital Marketing and Why is it Important?',
  'डिजिटल मार्केटिंग क्या है और यह क्यों ज़रूरी है?',
  'A plain-language introduction for beginners who want to understand how people find businesses online.',
  'शुरुआत करने वालों के लिए सरल भाषा में परिचय — ऑनलाइन लोगों तक बात कैसे पहुँचती है।',
  $t$Digital marketing is the work of reaching people through the internet — search, social media, content and email. In India, so much shopping, learning and communication now happens on a phone that these skills are useful for students, homemakers and working professionals alike.

You do not need a technical degree to begin. The basics are simple: know who you are speaking to, say one clear thing, and learn how a platform actually works before you spend money on it.

A practical start can be small. Write a caption. Explain a product in three lines. Notice which posts your own friends stop to read. Skill grows from repetition, not from collecting words you cannot explain.

This article is an introduction, not a promise of income or a job. If you want a guided path, you can explore the skill programs Digital Khushi shares with its learning partner — and ask what is included before you enrol.$t$,
  $t$डिजिटल मार्केटिंग का मतलब है इंटरनेट के ज़रिए लोगों तक पहुँचना — सर्च, सोशल मीडिया, कंटेंट और ईमेल। भारत में खरीदारी, पढ़ाई और बातचीत का बड़ा हिस्सा अब फ़ोन पर होता है, इसलिए यह कौशल छात्रों, गृहिणियों और कामकाजी लोगों, सबके लिए उपयोगी हो सकता है।

शुरुआत के लिए तकनीकी डिग्री ज़रूरी नहीं। आधार सरल है: जानें आप किससे बात कर रहे हैं, एक बात साफ़ कहें, और पैसे खर्च करने से पहले समझें कि प्लेटफ़ॉर्म सच में कैसे चलता है।

अभ्यास छोटा हो सकता है। एक कैप्शन लिखें। किसी चीज़ को तीन पंक्तियों में समझाएँ। देखें कि आपके अपने लोग किस पोस्ट पर रुकते हैं। कौशल दोहराने से बनता है, केवल शब्द याद रखने से नहीं।

यह लेख परिचय है, कमाई या नौकरी का वादा नहीं। अगर आप मार्गदर्शन चाहती हैं, तो डिजिटल खुशी जो कौशल प्रोग्राम साझा करती है उन्हें देखें — और जुड़ने से पहले पूछें कि उनमें क्या शामिल है।$t$,
  'cat-dm',
  'What is Digital Marketing? | Digital Khushi',
  'डिजिटल मार्केटिंग क्या है? | डिजिटल खुशी',
  'A beginner-friendly explanation of digital marketing by Khushi Aswani.',
  'खुशी असवानी द्वारा डिजिटल मार्केटिंग की सरल व्याख्या।',
  'published', now()
),
(
  'article-wfh', 'work-from-home-opportunities',
  'Work from Home Opportunities for Students and Homemakers',
  'छात्रों और गृहिणियों के लिए घर से काम के अवसर',
  'How to look at flexible online work with clear expectations — before you pay anyone.',
  'लचीले ऑनलाइन काम को साफ़ उम्मीदों के साथ कैसे देखें — किसी को पैसे देने से पहले।',
  $t$Many students and homemakers want work that can fit around study or home. Online skills such as communication, content and basic digital marketing can support that hope. Flexibility still needs a real skill, a routine and honest expectations.

Before you join any program, ask four questions. What exactly will I learn? What does it cost? How long does it take? What is not guaranteed? A genuine explanation answers those without rushing you.

Work from home is not automatic income. Some paths are learning paths. Some are business opportunities with cost and risk. Digital Khushi keeps those two ideas separate on purpose.

Read slowly, compare, and decide at your own pace. You can always ask Khushi a question on WhatsApp before you commit.$t$,
  $t$कई छात्र और गृहिणियाँ ऐसा काम चाहती हैं जो पढ़ाई या घर के साथ चल सके। संवाद, कंटेंट और बुनियादी डिजिटल मार्केटिंग जैसे ऑनलाइन कौशल इस उम्मीद में सहायक हो सकते हैं। लचीलेपन के साथ भी असली कौशल, दिनचर्या और ईमानदार उम्मीदें ज़रूरी हैं।

किसी प्रोग्राम से जुड़ने से पहले चार सवाल पूछें। मैं ठीक क्या सीखूँगी? खर्च कितना है? समय कितना लगेगा? किस बात की गारंटी नहीं है? सच्ची जानकारी बिना जल्दबाज़ी इनका जवाब देती है।

घर से काम का मतलब अपने-आप आय नहीं है। कुछ रास्ते सीखने के हैं। कुछ बिज़नेस अवसर हैं, जिनमें खर्च और जोखिम है। डिजिटल खुशी इन दोनों को जानबूझ कर अलग रखती है।

धीरे पढ़ें, तुलना करें, और अपने समय पर तय करें। तय करने से पहले आप व्हाट्सऐप पर खुशी से सवाल भी पूछ सकती हैं।$t$,
  'cat-ob',
  'Work from Home, Without the Hype | Digital Khushi',
  'बिना बढ़ा-चढ़ा कर घर से काम | डिजिटल खुशी',
  'A clear look at work-from-home learning and online business ideas for beginners in India.',
  'भारत के beginners के लिए घर से काम और ऑनलाइन बिज़नेस की साफ़ समझ।',
  'published', now()
),
(
  'article-skills', 'skills-to-learn',
  'Five Skills Worth Learning for a Better Future',
  'बेहतर भविष्य के लिए सीखने लायक पाँच कौशल',
  'Practical skills that build confidence. None of them guarantee a salary — they help you choose better.',
  'व्यावहारिक कौशल जो आत्मविश्वास बनाते हैं। इनमें से कोई वेतन की गारंटी नहीं है — ये बेहतर चुनाव में मदद करते हैं।',
  $t$If you are starting out, learn fewer things and learn them properly.

Clear writing helps people trust you. Basic digital marketing shows you how attention works online. Everyday computer skills — documents, sheets and simple design — make you independent. Communication, including listening, matters more than a perfect script. Money awareness means you can read a fee, a saving and a program inclusion before you say yes.

None of these guarantee a job or earnings. They do make you harder to confuse. Learn one skill until you can explain it to a friend in simple words. That is a better future than a folder of certificates you cannot use.

Khushi Aswani shares this kind of learning through Digital Khushi, along with room to ask questions.$t$,
  $t$अगर आप शुरुआत कर रही हैं, तो कम चीज़ें सीखें और उन्हें ठीक से सीखें।

साफ़ लेखन से लोग आप पर भरोसा करते हैं। बुनियादी डिजिटल मार्केटिंग दिखाती है कि ऑनलाइन ध्यान कैसे बनता है। रोज़मर्रा के कंप्यूटर कौशल — दस्तावेज़, शीट और सरल डिज़ाइन — आपको स्वतंत्र बनाते हैं। संवाद, जिसमें सुनना भी शामिल है, किसी रटे हुए वाक्य से ज़्यादा मायने रखता है। पैसे की समझ का मतलब है कि हाँ कहने से पहले आप शुल्क, बचत और प्रोग्राम में शामिल बातें पढ़ सकें।

इनमें से कोई कौशल नौकरी या कमाई की गारंटी नहीं देता। ये आपको भ्रमित करना कठिन बनाते हैं। एक कौशल तब तक सीखें जब तक आप उसे एक दोस्त को सरल शब्दों में समझा सकें। यह उन प्रमाणपत्रों के फ़ोल्डर से बेहतर भविष्य है जिन्हें आप इस्तेमाल नहीं कर सकते।

खुशी असवानी डिजिटल खुशी के ज़रिए ऐसी ही सीख साझा करती हैं, और सवालों की जगह भी रखती हैं।$t$,
  'cat-growth',
  'Five Skills to Learn | Digital Khushi',
  'सीखने लायक पाँच कौशल | डिजिटल खुशी',
  'Five practical skills for students and homemakers, explained without income promises.',
  'छात्रों और गृहिणियों के लिए पाँच व्यावहारिक कौशल, बिना कमाई के वादे के।',
  'published', now()
);
