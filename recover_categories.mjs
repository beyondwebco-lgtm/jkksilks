import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.join('=').trim();
  }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

const oldData = [
  {
    "id": "3",
    "name": "Temple",
    "section": "jewellery",
    "description": "",
    "coverImage": ""
  },
  {
    "id": "4",
    "name": "Bronze",
    "section": "heritage",
    "description": "",
    "coverImage": ""
  },
  {
    "id": "zqu126i5y",
    "name": "KANCHI PATTU ",
    "section": "sarees",
    "description": "",
    "coverImage": "https://pub-86931b9a48754ca69882abcca3e55951.r2.dev/1789709433436-image.png"
  },
  {
    "id": "v08gxhpyh",
    "name": "MYSORE SILK ",
    "section": "sarees",
    "description": "",
    "coverImage": "https://pub-86931b9a48754ca69882abcca3e55951.r2.dev/1789711690030-image.png"
  }
];

async function migrate() {
  const { data, error } = await supabase.from('categories').insert(oldData);
  if (error) {
    console.error('Error inserting:', error);
  } else {
    console.log('Successfully recovered categories!');
  }
}

migrate();
