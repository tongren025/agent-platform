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
