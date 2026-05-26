export const TREKKING_LOCATIONS = [
  'Kudremukh','Kumara Parvatha','Tadiandamol','Kodachadri','Mullayanagiri','Skandagiri','Nandi Hills','Kunti Betta',
  'Antharagange','Brahmagiri Hills','Narasimha Parvatha','Kurinjal Peak','Ettina Bhuja','Ballalarayana Durga Fort',
  'Nishani Motte','Jenukal Gudda','Devarayanadurga','Madhugiri','Ramadevara Betta','Savandurga','Kaiwara Betta','Bilikal Rangaswamy Betta',
  'Agumbe'
];

export const DEFAULT_TREK_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80';

export const AGUMBE_IMAGES = [
  'https://images.openai.com/static-rsc-4/SgWNY4HKP9ybJwzxYCMfIJDjCYgK_57Quayb9UtVRKIhIhi6-dhYL-LSyJpC3weaPVPUiZn9t5woPDEez2-UnQxg8UQ7R5CkiGCaqUOeYoGdwvEvxqzWG_DqtRsQVj0Vdg6zeWhyL9HU3GBLqIkNAiOd9oCFM1xcX0FkolgjnpjnPi5_7tLQyrFylf7VyZOO?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/T3OcPkebu88tVprGB5Uyho6lvQ42MSTu_4TAvpGcgnuxRsVzsVezh6SswHktoekrt4ACCkXpwm-wBYPI_F4jFeBVxAznYrBRG1fqlOjhcrAtmdcQRpN1cOvdwxe3Z56AL98rA_LmmCWKdjQRS_-m-y-vzJrDZPgREnvrj0NTMMTqr9VCjrfH7_MkTl90QTv2?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/r7AUthYVjMM70_GtPkgGzXphM3a0al9u1ZIHlaBrNTKF76UH9RfQagGCNz04Y6dTjSK6mAS3ECeqZuRI1zyWu2fRpkPP99a9Tde7N6y2KVIV0HuxIssIIkn1wmREG3MM8xLRBkkCEUaEpKjjD9d_EOaL6i_WBd6TuppYnUhddFXqnHwWmEBkIojrRpJbZ8xx?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/0lJq6T2wDiKK1FvdTKMHRjhIHmuE-UmiXMphms_r0bnz9oHmVvJS0yEzXNTxELAXmXCxUx2czDNhSUGTXoE7OdB15_WzVHv3AVge1TFk41AdSS8_GWICZX4hsCcHs6IpJwMzkXuTYMSIsbIrBHNw7XbrXwbi8D-o6kRh3nR4t4z6oH_ulgOgZoYhXjYptN-K?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/cYw-wA_14ES3-nzxmjJd7FhvuENxILY7mKY_V4wmbwY0PQXhk7x18z0DbNW_-QGp2flWmM80NNFdHHTNoFdeP6M7XmWnCitIBYflVuc98SyK_EzamBSdcmBWQpQmkMGQ_Vnrsz6edDjgTuFPOmay-W71dpXkMfkKPNZ6duZw9DhKxJw01gKzafK0TJYn_cdK?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/ZrmShBu5lGB24qQndM-g5iat5Utoo1vyM-UAD71UtQXiE4LoKgmMTULPswWgS6pZCiFlhsoDcMpodsfqIcPqjk3cDPm1sx0REP8k7S-vyvSAbYmoT5tKze88u8YlGtIeaZmhf4YStusRvNCnFAMKH9kgDxOcylRmV7bBWg68p9MrTY4PxeH_H4PSb5kAhd3R?purpose=fullsize'
];

export const AGUMBE_TEMPLATE = {
  id: 'agumbe-template',
  title: 'Agumbe Rainforest Trek',
  category: 'trekking',
  price: 5200,
  duration: '1 Day / 1 Night',
  location: 'Agumbe, Karnataka',
  description: 'Experience trekking at Agumbe — lush rainforest, viewpoints, and monsoon magic.',
  images: AGUMBE_IMAGES,
  featured: true,
  rating: 4.5,
  review_count: 12,
  max_group_size: 16,
  included: [
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
  ],
  excluded: [
    'Personal Expenses',
    'Snacks & Extra Food',
    'Anything not mentioned in inclusions'
  ],
  itinerary: [
    { day: 'Day 0', title: 'Friday Night', details: ['09:00 PM – Pickup starts from Bangalore', 'Overnight journey to Agumbe'] },
    { day: 'Day 1', title: 'Saturday', details: ['Reach campsite early morning', 'Fresh up & breakfast', 'Start Agumbe Rainforest Trek', 'Explore viewpoints & forest trails', 'Lunch after trek', 'Relax at homestay/campsite', 'Campfire & dinner', 'Return journey to Bangalore at night'] },
    { day: 'Day 2', title: 'Sunday Early Morning', details: ['Reach Bangalore around 05:00 AM'] }
  ],
  pickup_points: ['Silk Board','BTM Layout','Banashankari','RR Nagar','Yeshwanthpur'],
  things_to_carry: ['Trekking Shoes','Raincoat / Poncho','Water Bottle','Extra Clothes','Torch','Personal Medicines','Power Bank'],
  cancellation_policy: ['5+ Days Before Trek → 80% Refund','3–5 Days → 50% Refund','Less than 48 Hours → No Refund']
};

export default {};
