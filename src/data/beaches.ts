export interface BeachInfo {
  slug: string;
  name: string;
  short: string;
  location?: string;
  best_time?: string;
  highlights: string[];
  activities: string[];
  image: string;
}

export const BEACHES: BeachInfo[] = [
  {
    slug: 'baga-beach',
    name: 'Baga Beach',
    short: 'Popular beach in North Goa known for lively shacks and watersports.',
    location: 'Baga, Goa',
    best_time: 'Nov – Feb',
    highlights: ['Vibrant beach shacks', 'Parasailing & jet-skiing', 'Nightlife'],
    activities: ['Swimming', 'Watersports', 'Beach dining'],
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/3e/36/95/baga-sea-beach.jpg?w=800&h=-1&s=1',
  },
  {
    slug: 'calangute-beach',
    name: 'Calangute Beach',
    short: 'One of Goa’s largest and busiest beaches with a family-friendly vibe.',
    location: 'Calangute, Goa',
    best_time: 'Nov – Feb',
    highlights: ['Long sandy stretch', 'Markets nearby', 'Easy transport links'],
    activities: ['Beach games', 'Shopping', 'Boat rides'],
    image: 'https://media1.thrillophilia.com/filestore/b8iqw6n62s37df5vqj13dpxr17cg_shutterstock_1850377780.jpg',
  },
  {
    slug: 'palolem-beach',
    name: 'Palolem Beach',
    short: 'Scenic crescent-shaped beach in South Goa with chilled-out cafes.',
    location: 'Palolem, Goa',
    best_time: 'Nov – Mar',
    highlights: ['Crescent bay', 'Dolphin trips', 'Kayaking'],
    activities: ['Kayaking', 'Sunset cruises', 'Relaxed cafes'],
    image: 'https://togethertounknown.com/wp-content/uploads/2023/01/DJI_0207-min.jpg',
  },
  {
    slug: 'malpe-beach',
    name: 'Malpe Beach',
    short: 'Laid-back beach near Udupi, gateway to St. Mary’s Island and fresh seafood.',
    location: 'Malpe, Karnataka',
    best_time: 'Oct – Feb',
    highlights: ['St. Mary’s Island ferry', 'Fresh seafood', 'Quiet shores'],
    activities: ['Island trips', 'Fishing boat rides', 'Beach walks'],
    image: 'https://www.trawell.in/admin/images/upload/932329381MalpeBeach_Main.jpg',
  },
  {
    slug: 'kovalam-beach',
    name: 'Kovalam Beach',
    short: 'Tamil Nadu/Kerala border beach famous for lighthouse views and ayurvedic treatments.',
    location: 'Kovalam, Kerala',
    best_time: 'Sep – Mar',
    highlights: ['Lighthouse beach', 'Ayurvedic spas', 'Calm coves'],
    activities: ['Sunbathing', 'Yoga & Ayurveda', 'Boat rides'],
    image: 'https://media1.thrillophilia.com/filestore/ldche17tk7fqhbk1hbizg5jb853r_shutterstock_115358638.jpg?w=400&dpr=2',
  },
  {
    slug: 'tarkarli-beach',
    name: 'Tarkarli Beach',
    short: 'Clear waters and coral reefs — one of India’s best snorkeling spots.',
    location: 'Tarkarli, Maharashtra',
    best_time: 'Oct – Mar',
    highlights: ['Scuba & snorkeling', 'Coral reefs', 'Backwater estuary'],
    activities: ['Scuba diving', 'Snorkeling', 'Houseboat stays'],
    image: 'https://www.captureatrip.com/_next/image?url=https%3A%2F%2Fd1zvcmhypeawxj.cloudfront.net%2Fmisc%2Fblogs%2Fplaces-to-visit-in-tarkarli-2e9660fa98-5s8urx-webp-602b7250ac-1752179209213.webp&w=3840&q=75',
  },
  {
    slug: 'radhanagar-beach',
    name: 'Radhanagar Beach',
    short: 'Pristine beach on Havelock Island (Radhanagar) — famed for powdery white sand.',
    location: 'Havelock (Radhanagar), Andaman',
    best_time: 'Nov – Apr',
    highlights: ['White sand', 'Clear water', 'Sunset viewpoints'],
    activities: ['Snorkeling', 'Beach walks', 'Photography'],
    image: 'https://images.travelandleisureasia.com/wp-content/uploads/sites/2/2019/07/Feature-Image-Radhanagar-Beach.jpg',
  },
  {
    slug: 'elephant-beach',
    name: 'Elephant Beach',
    short: 'Accessible by boat from Havelock, popular for snorkeling and coral life.',
    location: 'Havelock, Andaman',
    best_time: 'Nov – Apr',
    highlights: ['Boat access', 'Snorkeling', 'Coral viewing'],
    activities: ['Snorkeling', 'Glass-bottom boat', 'Swimming'],
    image: 'https://media1.thrillophilia.com/filestore/o3nz0wcc31tmr9qjnu9vwgzyrrvk_cz1bt6eel8zppciuszsrarq24dek_shutterstock_365085719.jpg',
  },
  {
    slug: 'corbyns-cove-beach',
    name: "Corbyn's Cove Beach",
    short: 'Small, popular beach near Port Blair with palm-fringed sands.',
    location: 'Port Blair, Andaman',
    best_time: 'Oct – Apr',
    highlights: ['Near Port Blair', 'Palm trees', 'Sunset views'],
    activities: ['Swimming', 'Jet-skiing', 'Promenade walks'],
    image: 'https://media1.thrillophilia.com/filestore/9vnf2zgr820lruns6skgpv7aga7r_shutterstock_2318303855.jpg',
  },
  {
    slug: 'puri-beach',
    name: 'Puri Beach',
    short: 'Historic and spiritual beach in Odisha — known for temple visits and festivals.',
    location: 'Puri, Odisha',
    best_time: 'Oct – Feb',
    highlights: ['Jagannath Temple nearby', 'Chilika Lake access', 'Religious festivals'],
    activities: ['Temple visits', 'Beach walks', 'Local cuisine'],
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/32/fc/3f/0b/swargadwar-beach-in-puri.jpg?w=1200&h=1200&s=1',
  }
];

export function getBeachBySlug(slug: string) {
  return BEACHES.find((b) => b.slug === slug);
}

export default BEACHES;
