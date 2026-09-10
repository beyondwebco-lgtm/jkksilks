import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  name: string;
  category: 'sarees' | 'jewellery' | 'heritage';
  description?: string;
  original_price?: number | null;
  discount_price?: number | null;
  image_url: string;
  image_urls?: string[];
  is_explore_collection?: boolean;
  created_at: string;
};
