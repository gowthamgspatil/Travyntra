import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Usage:
// SUPABASE_URL=https://xyz.supabase.co SUPABASE_SERVICE_KEY=your_service_role_key node scripts/seed-cruises.mjs

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Load cruise titles from src/data/cruises.ts (exports default array)
const cruisesPath = path.resolve('src', 'data', 'cruises.ts');
const cruiseImagesPath = path.resolve('src', 'data', 'cruiseImages.ts');

if (!fs.existsSync(cruisesPath)) {
  console.error('Could not find src/data/cruises.ts');
  process.exit(1);
}

// Import dynamically using esm loader via createRequire-like approach
const cruises = (await import(`../src/data/cruises.ts`)).default;
const cruiseImages = (await import(`../src/data/cruiseImages.ts`)).default;

async function main() {
  console.log('Fetching existing cruise packages from Supabase...');
  const { data: existing, error: fetchErr } = await supabase.from('packages').select('id,title').in('category', ['cruise']).limit(2000);
  if (fetchErr) {
    console.error('Failed to fetch existing packages:', fetchErr.message || fetchErr);
    process.exit(1);
  }

  const existingTitles = new Set((existing || []).map((p) => p.title));

  const toInsert = cruises.map((title, idx) => {
    const img = cruiseImages[title] || `https://source.unsplash.com/900x500/?${encodeURIComponent(title.split(' ')[0])},cruise`;
    const price = 5000 + (idx % 8) * 2500;
    const duration = `${2 + (idx % 5)} Days / ${1 + (idx % 3)} Nights`;
    const location = title.includes('Goa') ? 'Goa, India' : `${title.split(' ')[0]}, India`;
    return {
      title,
      category: 'cruise',
      price,
      duration,
      location,
      description: `Experience the ${title} with comfortable amenities and scenic views.`,
      images: [img],
      featured: idx === 0,
      rating: 4.5 - (idx % 4) * 0.1,
      review_count: 20 + (idx % 100),
      max_group_size: 30,
      itinerary: [],
    };
  }).filter((p) => !existingTitles.has(p.title));

  if (toInsert.length === 0) {
    console.log('No new cruise packages to insert.');
    return;
  }

  console.log(`Inserting ${toInsert.length} cruise packages...`);
  const { data, error } = await supabase.from('packages').insert(toInsert).select();
  if (error) {
    console.error('Insert failed:', error.message || error);
    process.exit(1);
  }

  console.log(`Inserted ${data.length} cruise packages.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
