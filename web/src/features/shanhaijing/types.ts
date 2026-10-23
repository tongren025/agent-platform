/**
 * 山海经专栏与角色图鉴前端数据契约。
 */

export interface CharacterImage {
  id: string;
  url: string;
  title: string;
  source: string;
  is_cover?: boolean;
}

export interface ShanhaiCharacter {
  id: string;
  name: string;
  pinyin?: string;
  title?: string;
  category: string;
  mountain: string;
  classic_quote: string;
  modern_desc: string;
  ability?: string;
  mortal_identity?: string;
  divine_form?: string;
  visual_prompt?: string;
  images: CharacterImage[];
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ShanhaiCategoryInfo {
  categories: string[];
  mountains: string[];
  stats: {
    total_characters: number;
    total_images: number;
    category_counts: Record<string, number>;
  };
}

export interface WebImageResult {
  id: string;
  url: string;
  title: string;
  source: string;
  is_cover?: boolean;
}

/** 原典版本；资源未部署时仍返回目录，并明确标记不可读状态。 */
export interface ShanhaiEdition {
  id: string;
  title: string;
  year: number;
  annotator: string;
  editor: string;
  holding_institution: string;
  shelfmark: string;
  page_count: number;
  file_bytes: number;
  sha256: string;
  source_url: string;
  notes: string;
  chapters: { number: number; title: string; start_pdf_page: number }[];
  pdf_url: string;
  page_image_base_url: string;
  pdf_available: boolean;
  preview_available: boolean;
}

/** 已定位表示本条摘录和页码核对过，不认证旧角色引文的全部内容。 */
export interface ShanhaiCitation {
  id: string;
  character_id: string;
  source_title: string;
  source_url: string | null;
  edition_id: string | null;
  edition_title: string | null;
  chapter_number: number | null;
  chapter_title: string | null;
  chapter_start_pdf_page: number | null;
  pdf_page: number | null;
  scan_side: 'left' | 'right' | 'both' | null;
  review_status: 'located' | 'pending' | 'external';
  excerpt: string;
  note: string;
}
