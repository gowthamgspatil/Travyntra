export const TREKKING_LOCATIONS = [
  'Kudremukh','Kumara Parvatha','Tadiandamol','Kodachadri','Mullayanagiri','Skandagiri','Nandi Hills','Kunti Betta',
  'Antharagange Caves Sunrise Trek','Brahmagiri Hills','Kurinjal Peak','Ettina Bhuja','Ballalarayana Durga Fort',
  'Nishani Motte','Jenukal Gudda','Devarayanadurga','Madhugiri','Ramadevara Betta','Savandurga','Kaiwara Betta','Bilikal Rangaswamy Betta',
  'Agumbe'
];

export const DEFAULT_TREK_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80';

// Use the provided Agumbe Rainforest image as the primary image for the mock template
export const AGUMBE_IMAGES = [
  'https://muddietrails.com/wp-content/uploads/2024/01/Agumbe-2.webp',
];

export const AGUMBE_TEMPLATE = {
  id: 'agumbe-template',
  title: 'Agumbe Rainforest Trek Package',
  category: 'trekking',
  price: 6999,
  duration: '3 Days / 2 Nights',
  location: 'Bangalore → Agumbe → Bangalore',
  description: 'Agumbe Rainforest Adventure with rainforest exploration, waterfall trail, and sunset viewpoint.',
  images: AGUMBE_IMAGES,
  featured: true,
  rating: 4.5,
  review_count: 5,
  max_group_size: 16,
  included: [
    'AC Transportation from Bangalore',
    '2 Nights Accommodation',
    '2 Breakfasts',
    '2 Dinners',
    '1 Lunch',
    'Trek Coordinator',
    'Forest Trek Guidance',
    'Campfire (Weather Permitting)',
    'Basic First Aid Support',
    'All Toll & Parking Charges',
    'Online Booking Confirmation',
    'Travel Assistance'
  ],
  excluded: [
    'Personal Expenses',
    'Forest Entry Fees',
    'Waterfall Entry Charges',
    'Local Guide Charges',
    'Additional Meals',
    'Travel Insurance',
    'Adventure Activities (if any)',
    'Anything Not Mentioned in Inclusions'
  ],
  itinerary: [
    { day: 'Day 0', title: 'Pickup & Night Journey to Agumbe', details: ['Pickup from Bangalore (Silk Board, BTM Layout, Banashankari, RR Nagar, Yeshwanthpur)', 'AC transportation from Bangalore', 'Night journey to Agumbe with short breaks en route', 'Arrive Agumbe late night / early morning and rest at accommodation or camp depending on schedule'] },
    { day: 'Day 1', title: 'Rainforest Exploration & Sunset', details: ['Arrival at Agumbe', 'Visit Agumbe Rainforest Research Station', 'Explore rainforest biodiversity', 'Check-in & Lunch', 'Visit Agumbe Sunset Viewpoint', 'Sunset over Western Ghats', 'Campfire & Dinner', 'Overnight Stay'] },
    { day: 'Day 2', title: 'Waterfalls Trail', details: ['Breakfast', 'Visit Jogigundi Falls', 'Trek to Onake Abbi Falls', 'Lunch', 'Visit Barkana Falls Viewpoint', 'Return to Stay', 'Dinner & Overnight Stay'] },
    { day: 'Day 3', title: 'Agumbe Departure', details: ['Early Morning Breakfast', 'Check-out', 'Departure to Bangalore', 'Reach Bangalore by Late Night'] }
  ],
  key_locations: [
    {
      day: 'Day 1',
      name: 'Agumbe Rainforest Research Station',
      description: 'Start here to register, get forest permits, and learn about local wildlife. Open 10AM–5PM.',
      map_url: 'https://www.google.com/maps/place/?q=place_id:ChIJ01Gs4-VmuzsRnwrmCkcdXpE'
    },
    {
      day: 'Day 1',
      name: 'Kalinga Centre for Rainforest Ecology',
      description: 'Excellent overnight stay option with night trails, herping, and biodiversity walks. Great Malnad food. Book in advance.',
      map_url: 'https://www.google.com/maps/place/?q=place_id:ChIJmSo3RzVkuzsRCmrPlooaTJ4'
    },
    {
      day: 'Day 1',
      name: 'Agumbe Sunset Viewpoint',
      description: 'Panoramic views of the Western Ghats. Best visited around 5PM for the famous sunset. Watch out for monkeys!',
      map_url: 'https://www.google.com/maps/place/?q=place_id:ChIJrw1qLSNnuzsRSDsD_eujcxI'
    },
    {
      day: 'Day 2',
      name: 'Jogigundi Falls',
      description: 'Short forest trek to a cave waterfall. ₹100 entry. No swimming allowed. Leeches likely in monsoon — carry salt.',
      map_url: 'https://www.google.com/maps/place/?q=place_id:ChIJNQjyq_hnuzsRjvHu5guJS38'
    },
    {
      day: 'Day 2',
      name: 'Onake Abbi Falls',
      description: 'Moderate trek through dense forest. Forest department permit required. Best visited Oct–Jan.',
      map_url: 'https://www.google.com/maps/place/?q=place_id:ChIJZ1CI-yNnuzsRcOkeAVN_7Oo'
    },
    {
      day: 'Day 2',
      name: 'Barkana Falls',
      description: 'One of India’s tallest waterfalls at 850+ ft. 2km walk from parking. ₹100 entry per person.',
      map_url: 'https://www.google.com/maps/place/?q=place_id:ChIJvWm7_BJnuzsR3B1kQzRvHss'
    },
    {
      day: 'Day 3',
      name: 'Agumbe Trek Extension',
      description: 'Optional forest exploration extension around Agumbe. Hire a local guide as needed.',
      map_url: 'https://www.google.com/maps/place/?q=place_id:ChIJVf5x2eVnuzsRldbSUscPdf0'
    }
  ],
  pickup_points: ['Silk Board','BTM Layout','Banashankari','RR Nagar','Yeshwanthpur'],
  things_to_carry: ['Trekking Shoes','Raincoat / Poncho','Water Bottle','Extra Clothes','Torch','Personal Medicines','Power Bank'],
  cancellation_policy: ['5+ Days Before Trek → 80% Refund','3–5 Days → 50% Refund','Less than 48 Hours → No Refund']
};

export default {};
