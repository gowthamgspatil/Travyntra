import { createClient } from '@supabase/supabase-js';

// Usage:
// SUPABASE_URL=https://xyz.supabase.co SUPABASE_SERVICE_KEY=your_service_role_key node scripts/seed-trekking-packages.mjs

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const locations = [
  'Kudremukh', 'Kumara Parvatha', 'Tadiandamol', 'Kodachadri', 'Mullayanagiri', 'Skandagiri', 'Nandi Hills', 'Kunti Betta',
  'Antharagange', 'Brahmagiri Hills', 'Narasimha Parvatha', 'Kurinjal Peak', 'Ettina Bhuja', 'Bandaje Falls', 'Ballalarayana Durga Fort',
  'Nishani Motte', 'Jenukal Gudda', 'Devarayanadurga', 'Madhugiri', 'Ramadevara Betta', 'Savandurga', 'Kaiwara Betta', 'Bilikal Rangaswamy Betta',
  'Agumbe', 'Kudlu Falls', 'Jog Falls', 'Hebbe Falls', 'Jogi Gundi Falls', 'Sathodi Falls', 'Magod Falls', 'Shivanasamudra Falls',
  'Iruppu Falls', 'Abbey Falls', 'Dudhsagar Falls', 'Unchalli Falls'
];

async function main() {
  console.log('Checking existing trekking packages...');
  const { data: existing, error: fetchErr } = await supabase.from('packages').select('id,title,location').in('category', ['trekking']).limit(1000);
  if (fetchErr) {
    console.error('Failed to fetch existing packages:', fetchErr.message || fetchErr);
    process.exit(1);
  }

  const existingTitles = new Set((existing || []).map((p) => p.title));

  // Exclude Falls from the seed list
  const filteredLocations = locations.filter(loc => !/falls/i.test(loc));

  const toInsert = filteredLocations
    .map((loc, idx) => {
      // Use Unsplash dynamic image for the location (search by location + trekking)
      const img = loc === 'Agumbe'
        ? 'https://kudremukhnationalpark.org/wp-content/uploads/2024/11/narasimha-parvatha-trek-1-scaled-e1732274149593.webp'
        : `https://source.unsplash.com/900x500/?${encodeURIComponent(loc)},trekking`;
      const agumbeImages = [
        'https://images.openai.com/static-rsc-4/SgWNY4HKP9ybJwzxYCMfIJDjCYgK_57Quayb9UtVRKIhIhi6-dhYL-LSyJpC3weaPVPUiZn9t5woPDEez2-UnQxg8UQ7R5CkiGCaqUOeYoGdwvEvxqzWG_DqtRsQVj0Vdg6zeWhyL9HU3GBLqIkNAiOd9oCFM1xcX0FkolgjnpjnPi5_7tLQyrFylf7VyZOO?purpose=fullsize',
        'https://images.openai.com/static-rsc-4/T3OcPkebu88tVprGB5Uyho6lvQ42MSTu_4TAvpGcgnuxRsVzsVezh6SswHktoekrt4ACCkXpwm-wBYPI_F4jFeBVxAznYrBRG1fqlOjhcrAtmdcQRpN1cOvdwxe3Z56AL98rA_LmmCWKdjQRS_-m-y-vzJrDZPgREnvrj0NTMMTqr9VCjrfH7_MkTl90QTv2?purpose=fullsize',
        'https://images.openai.com/static-rsc-4/r7AUthYVjMM70_GtPkgGzXphM3a0al9u1ZIHlaBrNTKF76UH9RfQagGCNz04Y6dTjSK6mAS3ECeqZuRI1zyWu2fRpkPP99a9Tde7N6y2KVIV0HuxIssIIkn1wmREG3MM8xLRBkkCEUaEpKjjD9d_EOaL6i_WBd6TuppYnUhddFXqnHwWmEBkIojrRpJbZ8xx?purpose=fullsize',
      ];
      const priceBase = 3500 + (idx % 6) * 700;
      const duration = idx % 3 === 0 ? '1 Day / 1 Night' : idx % 3 === 1 ? '2 Days / 1 Night' : '3 Days / 2 Nights';
      return {
        title: loc === 'Agumbe' ? 'Agumbe Rainforest Trek' : `${loc} Trek`,
        category: 'trekking',
        price: loc === 'Agumbe' ? 5200 : priceBase,
        duration,
        location: `${loc}, Karnataka`,
        description: loc === 'Agumbe' ? 'Experience trekking at Agumbe — lush rainforest, viewpoints, and monsoon magic.' : `A guided trek to ${loc} through scenic trails and viewpoints.`,
        images: loc === 'Agumbe' ? agumbeImages : [img],
        featured: loc === 'Agumbe' ? true : (idx % 7 === 0),
        max_group_size: loc === 'Agumbe' ? 16 : 12,
        included: loc === 'Agumbe' ? [
          'AC Transportation from Bangalore',
          'Trek Permission & Forest Entry Fees',
          'Experienced Trek Leader & Guide',
          '1 Breakfast',
          '1 Lunch',
          '1 Dinner',
          'Bonfire & Stay (Camp/Homestay)',
          'Basic First Aid Support',
          'Online Booking Confirmation',
          'Travel Assistance'
        ] : [],
        excluded: loc === 'Agumbe' ? [
          'Personal Expenses',
          'Snacks & Extra Food',
          'Anything not mentioned in inclusions'
        ] : [],
        itinerary: loc === 'Agumbe' ? [
          { day: 'Day 0', title: 'Friday Night', details: ['09:00 PM – Pickup starts from Bangalore', 'Overnight journey to Agumbe'] },
          { day: 'Day 1', title: 'Saturday', details: ['Reach campsite early morning', 'Fresh up & breakfast', 'Start Agumbe Rainforest Trek', 'Explore viewpoints & forest trails', 'Lunch after trek', 'Relax at homestay/campsite', 'Campfire & dinner', 'Return journey to Bangalore at night'] },
          { day: 'Day 2', title: 'Sunday Early Morning', details: ['Reach Bangalore around 05:00 AM'] }
        ] : null,
        pickup_points: loc === 'Agumbe' ? ['Silk Board','BTM Layout','Banashankari','RR Nagar','Yeshwanthpur'] : null,
        things_to_carry: loc === 'Agumbe' ? ['Trekking Shoes','Raincoat / Poncho','Water Bottle','Extra Clothes','Torch','Personal Medicines','Power Bank'] : null,
        cancellation_policy: loc === 'Agumbe' ? ['5+ Days Before Trek → 80% Refund','3–5 Days → 50% Refund','Less than 48 Hours → No Refund'] : null,
      };
    })
    .filter((p) => !existingTitles.has(p.title));

  if (toInsert.length === 0) {
    console.log('No new trekking packages to insert.');
    return;
  }

  console.log(`Inserting ${toInsert.length} packages...`);
  const { data, error } = await supabase.from('packages').insert(toInsert).select();
  if (error) {
    console.error('Insert failed:', error.message || error);
    process.exit(1);
  }

  console.log(`Inserted ${data.length} packages.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
