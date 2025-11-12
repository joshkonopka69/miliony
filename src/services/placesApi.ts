// Google Places API service for venue search and filtering
// Real implementation using Google Places API

import { performanceOptimizer } from '../utils/performanceOptimizer';

export interface Place {
  placeId: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  rating?: number;
  priceLevel?: number;
  phoneNumber?: string;
  website?: string;
  openingHours?: string[];
  photos?: Array<{
    photoReference: string;
    height: number;
    width: number;
    url?: string;
  }>;
  types: string[];
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  rating?: number;
  priceLevel?: number;
  phoneNumber?: string;
  website?: string;
  openingHours?: {
    openNow: boolean;
    periods: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
    weekdayText: string[];
  };
  photos?: Array<{
    photoReference: string;
    height: number;
    width: number;
  }>;
  reviews?: Array<{
    authorName: string;
    rating: number;
    text: string;
    time: number;
    profilePhotoUrl?: string;
  }>;
  types: string[];
  utcOffset?: number;
  vicinity?: string;
  formattedPhoneNumber?: string;
  internationalPhoneNumber?: string;
  url?: string;
  utcOffsetMinutes?: number;
}

export interface ActivityFilter {
  types: string[];
  keywords: string[];
  radius: number;
}

// Google Places API type mapping for activity filters
// IMPORTANT: Only use VALID Google Places API types
// Invalid types will return ALL nearby places instead of filtered results
export const GOOGLE_PLACES_TYPES = {
  // ✅ VALID Google Places API types:
  'gym': 'gym',
  'stadium': 'stadium',
  'park': 'park',
  'bowling_alley': 'bowling_alley',
  'campground': 'campground',
  
  // ❌ INVALID types (use keywords instead):
  // These DO NOT exist in Google Places API - use point_of_interest + keywords
  'swimming_pool': null, // Use keywords: "swimming pool aquatic center basen"
  'sports_complex': null, // Use keywords: "sports complex"
  'ice_rink': null, // Use keywords: "ice rink ice skating"
  'tennis_court': null, // Use keywords: "tennis court"
  'basketball_court': null, // Use keywords: "basketball court"
} as const;

// Keyword mapping for filters without dedicated Google types
// These keywords help filter facilities that don't have specific type codes
export const GOOGLE_PLACES_KEYWORDS = {
  'swimming_pool': 'swimming pool aquatic center pool natatorium basen pływalnia aquapark',
  'tennis_court': 'tennis court tennis club tenis kort tenisowy',
  'basketball_court': 'basketball court boisko do koszykówki outdoor court',
  'sports_complex': 'sports complex sports center sports hall hala sportowa centrum sportowe',
  'ice_rink': 'ice rink ice skating lodowisko łyżwy',
  'martial_arts': 'martial arts boxing mma kickboxing karate judo taekwondo jiu jitsu muay thai sztuki walki',
  'climbing': 'climbing gym rock climbing bouldering wall wspinaczka ścianka',
  'yoga': 'yoga studio pilates',
  'dance': 'dance studio dance school taniec szkoła tańca',
  'volleyball': 'volleyball court beach volleyball boisko do siatkówki',
  'soccer': 'soccer field football pitch boisko do piłki nożnej',
  'outdoor_activities': 'hiking trail mountain biking outdoor recreation adventure sports',
} as const;

// ═══════════════════════════════════════════════════════════════════
// TYPE-BASED FILTERING RULES (HIGH ACCURACY SYSTEM)
// ═══════════════════════════════════════════════════════════════════

interface FilterRule {
  primaryType: string | null;
  requiredTypes?: string[];
  excludedTypes?: string[];
  requiredKeywords?: string[];
  excludedNamePatterns?: RegExp[];
  requiredNamePattern?: RegExp;
  minRating?: number;
  minReviews?: number;
  description?: string;
}

export const SPORT_CATEGORY_RULES: Record<string, FilterRule> = {
  // Note: "park" (singular) and "parks" (plural) both point to same rules
  park: {
    primaryType: 'park',
    requiredTypes: ['park'],
    excludedTypes: [
      // ⚠️ SPECIFIC COMMERCIAL TYPES ONLY (not establishment/point_of_interest - real parks have those!)
      'parking',           // Parking lots
      'rv_park',          // RV parks/campsites
      'amusement_park',   // Theme parks
      'dog_park',         // Dog-specific parks
      'garden',           // Botanical gardens
      'florist',          // Plant nurseries ⚡ KEY EXCLUSION
      'store',            // Garden centers/stores ⚡ KEY EXCLUSION
      'shopping_mall',    // Shopping areas
      'lodging',          // Hotels
      // NOTE: NOT excluding 'tourist_attraction' - many real parks are tourist attractions!
      // NOTE: NOT excluding 'establishment' or 'point_of_interest' - real parks have these!
      'home_goods_store', // ⚡ NEW: Garden supply stores
      'hardware_store',   // ⚡ NEW: DIY stores
      'furniture_store',  // ⚡ NEW: Sometimes mislabeled
      'general_contractor', // ⚡ NEW: Landscaping companies
      'roofing_contractor', // ⚡ NEW: Construction
      'electrician',      // ⚡ NEW: Services
      'plumber',          // ⚡ NEW: Services
      'real_estate_agency', // ⚡ NEW: Commercial
      'car_dealer',       // ⚡ NEW: Sometimes near parks
      'car_rental',       // ⚡ NEW: Sometimes near parks
      'car_repair',       // ⚡ NEW: Sometimes near parks
      'gas_station',      // ⚡ NEW: Sometimes near parks
      'convenience_store', // ⚡ NEW: Kiosks
      'supermarket',      // ⚡ NEW: Stores
      'bakery',           // ⚡ NEW: Food stores
      'cafe',             // ⚡ NEW: Unless park cafe
      'restaurant',       // ⚡ NEW: Unless park restaurant
      'bar',              // ⚡ NEW: Bars
      'night_club',       // ⚡ NEW: Clubs
      'liquor_store',     // ⚡ NEW: Stores
      'pharmacy',         // ⚡ NEW: Pharmacies
      'hospital',         // ⚡ NEW: Medical
      'doctor',           // ⚡ NEW: Medical
      'dentist',          // ⚡ NEW: Medical
      'veterinary_care',  // ⚡ NEW: Vet
      'pet_store',        // ⚡ NEW: Pet stores
      'school',           // ⚡ NEW: Schools
      'university',       // ⚡ NEW: Universities
      'library',          // ⚡ NEW: Libraries
      'church',           // ⚡ NEW: Religious
      'mosque',           // ⚡ NEW: Religious
      'synagogue',        // ⚡ NEW: Religious
      'hindu_temple',     // ⚡ NEW: Religious
      'cemetery',         // ⚡ NEW: Cemeteries
      'funeral_home',     // ⚡ NEW: Funeral
      'spa',              // ⚡ NEW: Wellness
      'beauty_salon',     // ⚡ NEW: Beauty
      'hair_care',        // ⚡ NEW: Salons
      'gym',              // ⚡ NEW: Gyms (not parks)
      'stadium',          // ⚡ NEW: Stadiums (not parks)
      'bowling_alley',    // ⚡ NEW: Bowling
      'movie_theater',    // ⚡ NEW: Cinemas
      'museum',           // ⚡ NEW: Museums
      'art_gallery',      // ⚡ NEW: Galleries
      'zoo',              // ⚡ NEW: Zoos
      'aquarium',         // ⚡ NEW: Aquariums
    ],
    excludedNamePatterns: [
      // ⚠️ ULTRA-AGGRESSIVE: ANY of these in name = INSTANT REJECTION
      /nursery/i,          // ⚡ Plant nurseries
      /nurseries/i,        // ⚡ Plural
      /garden center/i,    // ⚡ Garden stores
      /garden centre/i,    // ⚡ UK spelling
      /garden.{0,10}shop/i, // ⚡ Garden shop (with up to 10 chars between)
      /plant/i,            // ⚡ Plant-related
      /plants/i,           // ⚡ Plural
      /flower/i,           // ⚡ Flower shops
      /flowers/i,          // ⚡ Plural
      /tree/i,             // ⚡ Tree nurseries
      /trees/i,            // ⚡ Plural
      /lawn/i,             // ⚡ Lawn care
      /grass/i,            // ⚡ Grass suppliers
      /seed/i,             // ⚡ Seed stores
      /seeds/i,            // ⚡ Plural
      /soil/i,             // ⚡ Soil suppliers
      /compost/i,          // ⚡ Compost
      /fertilizer/i,       // ⚡ Fertilizer
      /sklep/i,            // ⚡ Polish: store
      /centrum ogrodnicze/i, // ⚡ Polish: garden center
      /ogród działkowy/i,   // ⚡ Polish: allotment garden
      /działk/i,            // ⚡ Polish: allotment
      /\bROD\b/i,           // ⚡ Polish: ROD (Rodzinne Ogrody Działkowe)
      /rodzinne ogrody/i,   // ⚡ Polish: Family Gardens
      /ogrody działkowe/i,  // ⚡ Polish: Allotment Gardens
      /szkółka/i,           // ⚡ Polish: nursery
      /szkółk/i,            // ⚡ Polish: nursery (any form)
      /ogrodnicz/i,         // ⚡ Polish: gardening
      /sp\.?\s*z\s*o\.?o\.?/i,  // ⚡ Polish: sp. z o.o. (limited liability company)
      /spółka/i,            // ⚡ Polish: company
      /firma/i,             // ⚡ Polish: firm/company
      /przedsiębiorstwo/i,  // ⚡ Polish: enterprise
      /kruszywa/i,          // ⚡ Aggregates/gravel companies
      /internet trade/i,    // ⚡ Internet trade companies
      /\btrade\b/i,         // ⚡ Trade companies
      /kwiaciarnia/i,       // ⚡ Polish: flower shop
      /kwiat/i,             // ⚡ Polish: flower
      /roślin/i,            // ⚡ Polish: plant
      /ogród/i,             // ⚡ Polish: garden
      /ogrody/i,            // ⚡ Polish: gardens (plural)
      /ogrod/i,             // ⚡ Polish: garden (no diacritic)
      /market/i,            // ⚡ Markets
      /shop/i,              // ⚡ Shops
      /store/i,             // ⚡ Stores
      /parking/i,           // ⚡ Parking lots
      /hotel/i,             // ⚡ Hotels
      /resort/i,            // ⚡ Resorts
      /mall/i,              // ⚡ Malls
      /centrum handlowe/i,  // ⚡ Polish: shopping center
      /galeria/i,           // ⚡ Polish: gallery/mall
      /cemetery/i,          // ⚡ Cemeteries
      /cmentarz/i,          // ⚡ Polish: cemetery
      /crematorium/i,       // ⚡ Crematoriums
      /funeral/i,           // ⚡ Funeral
      /pogrzeb/i,           // ⚡ Polish: funeral
      /buy/i,               // ⚡ Commercial keyword
      /sell/i,              // ⚡ Commercial keyword
      /sale/i,              // ⚡ Commercial keyword
      /sprzedaż/i,          // ⚡ Polish: sale
      /kupno/i,             // ⚡ Polish: purchase
      /price/i,             // ⚡ Commercial keyword
      /cena/i,              // ⚡ Polish: price
      /koszt/i,             // ⚡ Polish: cost
      /supply/i,            // ⚡ Supply stores
      /supplies/i,          // ⚡ Plural
      /equipment/i,         // ⚡ Equipment stores
      /service/i,           // ⚡ Services
      /services/i,          // ⚡ Plural
      /serwis/i,            // ⚡ Polish: service
      /usługi/i,            // ⚡ Polish: services
      /wholesale/i,         // ⚡ Wholesale
      /hurtownia/i,         // ⚡ Polish: wholesale
      /warehouse/i,         // ⚡ Warehouses
      /magazyn/i,           // ⚡ Polish: warehouse
    ],
    minReviews: 5,        // ⚡ BALANCED: Real parks have at least 5 reviews
    description: 'Public parks suitable for sports and recreation'
  },
  parks: {
    primaryType: 'park',
    requiredTypes: ['park'],
    excludedTypes: [
      // ⚠️ SPECIFIC COMMERCIAL TYPES ONLY (not establishment/point_of_interest - real parks have those!)
      'parking',           // Parking lots
      'rv_park',          // RV parks/campsites
      'amusement_park',   // Theme parks
      'dog_park',         // Dog-specific parks
      'garden',           // Botanical gardens
      'florist',          // Plant nurseries ⚡ KEY EXCLUSION
      'store',            // Garden centers/stores ⚡ KEY EXCLUSION
      'shopping_mall',    // Shopping areas
      'lodging',          // Hotels
      // NOTE: NOT excluding 'tourist_attraction' - many real parks are tourist attractions!
      // NOTE: NOT excluding 'establishment' or 'point_of_interest' - real parks have these!
      'home_goods_store', // ⚡ NEW: Garden supply stores
      'hardware_store',   // ⚡ NEW: DIY stores
      'furniture_store',  // ⚡ NEW: Sometimes mislabeled
      'general_contractor', // ⚡ NEW: Landscaping companies
      'roofing_contractor', // ⚡ NEW: Construction
      'electrician',      // ⚡ NEW: Services
      'plumber',          // ⚡ NEW: Services
      'real_estate_agency', // ⚡ NEW: Commercial
      'car_dealer',       // ⚡ NEW: Sometimes near parks
      'car_rental',       // ⚡ NEW: Sometimes near parks
      'car_repair',       // ⚡ NEW: Sometimes near parks
      'gas_station',      // ⚡ NEW: Sometimes near parks
      'convenience_store', // ⚡ NEW: Kiosks
      'supermarket',      // ⚡ NEW: Stores
      'bakery',           // ⚡ NEW: Food stores
      'cafe',             // ⚡ NEW: Unless park cafe
      'restaurant',       // ⚡ NEW: Unless park restaurant
      'bar',              // ⚡ NEW: Bars
      'night_club',       // ⚡ NEW: Clubs
      'liquor_store',     // ⚡ NEW: Stores
      'pharmacy',         // ⚡ NEW: Pharmacies
      'hospital',         // ⚡ NEW: Medical
      'doctor',           // ⚡ NEW: Medical
      'dentist',          // ⚡ NEW: Medical
      'veterinary_care',  // ⚡ NEW: Vet
      'pet_store',        // ⚡ NEW: Pet stores
      'school',           // ⚡ NEW: Schools
      'university',       // ⚡ NEW: Universities
      'library',          // ⚡ NEW: Libraries
      'church',           // ⚡ NEW: Religious
      'mosque',           // ⚡ NEW: Religious
      'synagogue',        // ⚡ NEW: Religious
      'hindu_temple',     // ⚡ NEW: Religious
      'cemetery',         // ⚡ NEW: Cemeteries
      'funeral_home',     // ⚡ NEW: Funeral
      'spa',              // ⚡ NEW: Wellness
      'beauty_salon',     // ⚡ NEW: Beauty
      'hair_care',        // ⚡ NEW: Salons
      'gym',              // ⚡ NEW: Gyms (not parks)
      'stadium',          // ⚡ NEW: Stadiums (not parks)
      'bowling_alley',    // ⚡ NEW: Bowling
      'movie_theater',    // ⚡ NEW: Cinemas
      'museum',           // ⚡ NEW: Museums
      'art_gallery',      // ⚡ NEW: Galleries
      'zoo',              // ⚡ NEW: Zoos
      'aquarium',         // ⚡ NEW: Aquariums
    ],
    excludedNamePatterns: [
      // ⚠️ ULTRA-AGGRESSIVE: ANY of these in name = INSTANT REJECTION
      /nursery/i,          // ⚡ Plant nurseries
      /nurseries/i,        // ⚡ Plural
      /garden center/i,    // ⚡ Garden stores
      /garden centre/i,    // ⚡ UK spelling
      /garden.{0,10}shop/i, // ⚡ Garden shop (with up to 10 chars between)
      /plant/i,            // ⚡ Plant-related
      /plants/i,           // ⚡ Plural
      /flower/i,           // ⚡ Flower shops
      /flowers/i,          // ⚡ Plural
      /tree/i,             // ⚡ Tree nurseries
      /trees/i,            // ⚡ Plural
      /lawn/i,             // ⚡ Lawn care
      /grass/i,            // ⚡ Grass suppliers
      /seed/i,             // ⚡ Seed stores
      /seeds/i,            // ⚡ Plural
      /soil/i,             // ⚡ Soil suppliers
      /compost/i,          // ⚡ Compost
      /fertilizer/i,       // ⚡ Fertilizer
      /sklep/i,            // ⚡ Polish: store
      /centrum ogrodnicze/i, // ⚡ Polish: garden center
      /ogród działkowy/i,   // ⚡ Polish: allotment garden
      /działk/i,            // ⚡ Polish: allotment
      /\bROD\b/i,           // ⚡ Polish: ROD (Rodzinne Ogrody Działkowe)
      /rodzinne ogrody/i,   // ⚡ Polish: Family Gardens
      /ogrody działkowe/i,  // ⚡ Polish: Allotment Gardens
      /szkółka/i,           // ⚡ Polish: nursery
      /ogrodnicz/i,         // ⚡ Polish: gardening
      /sp\.?\s*z\s*o\.?o\.?/i,  // ⚡ Polish: sp. z o.o. (limited liability company)
      /spółka/i,            // ⚡ Polish: company
      /firma/i,             // ⚡ Polish: firm/company
      /przedsiębiorstwo/i,  // ⚡ Polish: enterprise
      /kruszywa/i,          // ⚡ Aggregates/gravel companies
      /internet trade/i,    // ⚡ Internet trade companies
      /\btrade\b/i,         // ⚡ Trade companies
      /kwiaciarnia/i,       // ⚡ Polish: flower shop
      /kwiat/i,             // ⚡ Polish: flower
      /roślin/i,            // ⚡ Polish: plant
      /market/i,            // ⚡ Markets
      /shop/i,              // ⚡ Shops
      /store/i,             // ⚡ Stores
      /parking/i,           // ⚡ Parking lots
      /hotel/i,             // ⚡ Hotels
      /resort/i,            // ⚡ Resorts
      /mall/i,              // ⚡ Malls
      /centrum handlowe/i,  // ⚡ Polish: shopping center
      /galeria/i,           // ⚡ Polish: gallery/mall
      /cemetery/i,          // ⚡ Cemeteries
      /cmentarz/i,          // ⚡ Polish: cemetery
      /crematorium/i,       // ⚡ Crematoriums
      /funeral/i,           // ⚡ Funeral
      /pogrzeb/i,           // ⚡ Polish: funeral
      /buy/i,               // ⚡ Commercial keyword
      /sell/i,              // ⚡ Commercial keyword
      /sale/i,              // ⚡ Commercial keyword
      /sprzedaż/i,          // ⚡ Polish: sale
      /kupno/i,             // ⚡ Polish: purchase
      /price/i,             // ⚡ Commercial keyword
      /cena/i,              // ⚡ Polish: price
      /koszt/i,             // ⚡ Polish: cost
      /supply/i,            // ⚡ Supply stores
      /supplies/i,          // ⚡ Plural
      /equipment/i,         // ⚡ Equipment stores
      /service/i,           // ⚡ Services
      /services/i,          // ⚡ Plural
      /serwis/i,            // ⚡ Polish: service
      /usługi/i,            // ⚡ Polish: services
      /wholesale/i,         // ⚡ Wholesale
      /hurtownia/i,         // ⚡ Polish: wholesale
      /warehouse/i,         // ⚡ Warehouses
      /magazyn/i,           // ⚡ Polish: warehouse
    ],
    minReviews: 5,        // ⚡ BALANCED: Real parks have at least 5 reviews
    description: 'Public parks suitable for sports and recreation'
  },

  water_sports: {
    primaryType: 'point_of_interest',
    requiredKeywords: ['swimming pool', 'aquatic center', 'pool', 'basen', 'pływalnia'],
    excludedTypes: [
      'store',            // Pool supply stores
      'parking',          // Parking areas
      'spa',              // Wellness spas (not sport)
      'beauty_salon',     // Beauty/wellness
      'lodging',          // Hotel pools
      'real_estate_agency', // Real estate
      'plumber',          // Pool services
      'home_goods_store', // Pool equipment stores
    ],
    excludedNamePatterns: [
      /hotel/i,
      /motel/i,
      /resort/i,
      /spa(?!\s*sport)/i, // Exclude spa unless "spa sport"
      /wellness/i,
      /supply/i,          // Pool supply
      /service/i,         // Pool service
      /equipment/i,       // Equipment stores
      /shop/i,
      /store/i,
      /sklep/i,           // Polish: store
      /serwis/i,          // Polish: service
    ],
    requiredNamePattern: /pool|aqua|swim|water|basen|pływaln|wodny/i,
    minReviews: 5,
    description: 'Swimming pools and aquatic centers for sports'
  },

  sport_halls: {
    primaryType: 'gym',
    requiredTypes: ['gym', 'stadium'],
    excludedTypes: [
      'store',
      'school',           // Schools (not public facilities)
      'university',       // Universities
      'parking',
      'lodging',
    ],
    requiredKeywords: ['sports hall', 'sports center', 'arena', 'hala sportowa'],
    excludedNamePatterns: [
      /school/i,
      /szkoła/i,          // Polish: school
      /uniwersytet/i,     // Polish: university
      /akademia/i,        // Polish: academy (often private)
      /store/i,
      /shop/i,
    ],
    description: 'Indoor sports halls and centers'
  },

  sport_fields: {
    primaryType: 'stadium',
    requiredTypes: ['stadium', 'park'],
    excludedTypes: [
      'store',
      'parking',
      'lodging',
    ],
    requiredKeywords: ['soccer field', 'football pitch', 'sports field', 'boisko'],
    excludedNamePatterns: [
      /store/i,
      /shop/i,
      /parking/i,
    ],
    minReviews: 3,
    description: 'Outdoor sports fields (soccer, football, etc.)'
  },

  outside_courts: {
    primaryType: 'point_of_interest',
    requiredKeywords: ['basketball court', 'tennis court', 'court', 'kort', 'boisko'],
    excludedTypes: [
      'store',            // Sports equipment stores
      'courthouse',       // Legal courthouse
      'lawyer',           // Law offices
      'parking',
      'lodging',
      'shopping_mall',
    ],
    excludedNamePatterns: [
      /store/i,
      /shop/i,
      /retail/i,
      /courthouse/i,      // Legal courthouse
      /law/i,
      /attorney/i,
      /legal/i,
      /sklep/i,           // Polish: store
    ],
    requiredNamePattern: /court|kort|boisko|plac/i,
    minReviews: 2,
    description: 'Outdoor basketball and tennis courts'
  },

  fitness: {
    primaryType: 'gym',
    requiredTypes: ['gym'],
    excludedTypes: [
      'store',
      'school',
      'stadium',          // Too large
      'parking',
      'spa',              // Wellness spas
    ],
    excludedNamePatterns: [
      /school/i,
      /szkoła/i,
      /store/i,
      /equipment/i,       // Equipment stores
      /supply/i,
      /spa/i,
      /wellness/i,
      /beauty/i,
    ],
    description: 'Fitness centers and gyms'
  },

  fight_clubs: {
    primaryType: 'gym',
    requiredKeywords: ['martial arts', 'boxing', 'mma', 'kickboxing', 'karate', 'judo'],
    excludedTypes: [
      'store',
      'parking',
      'lodging',
    ],
    excludedNamePatterns: [
      /store/i,
      /shop/i,
      /equipment/i,
      /apparel/i,
    ],
    requiredNamePattern: /martial|box|mma|fight|karate|judo|jiu.?jitsu|kickbox|muay.?thai|taekwondo/i,
    description: 'Martial arts gyms and boxing clubs'
  },

  outdoor: {
    primaryType: 'campground',
    requiredTypes: ['campground', 'park'],
    requiredKeywords: ['hiking', 'climbing', 'outdoor', 'trail'],
    excludedTypes: [
      'store',
      'parking',
      'lodging',
      'rv_park',
    ],
    excludedNamePatterns: [
      /store/i,
      /shop/i,
      /hotel/i,
      /motel/i,
    ],
    description: 'Outdoor activities (hiking, climbing, etc.)'
  },
};

// ═══════════════════════════════════════════════════════════════════
// PLACE VALIDATION FUNCTION
// ═══════════════════════════════════════════════════════════════════

/**
 * Validates a place against category rules
 * Returns true if place passes all validation checks
 */
const validatePlace = (
  place: any,
  rules: FilterRule
): { valid: boolean; reason?: string } => {
  const types = place.types || [];
  const name = place.name || '';

  // VALIDATION 1: Required Types
  if (rules.requiredTypes && rules.requiredTypes.length > 0) {
    const hasRequiredType = rules.requiredTypes.some(type => types.includes(type));
    if (!hasRequiredType) {
      return {
        valid: false,
        reason: `Missing required type. Has: [${types.join(', ')}], Needs one of: [${rules.requiredTypes.join(', ')}]`
      };
    }
  }

  // VALIDATION 2: Excluded Types (CRITICAL - eliminates false positives)
  if (rules.excludedTypes && rules.excludedTypes.length > 0) {
    const hasExcludedType = types.some(type => rules.excludedTypes!.includes(type));
    if (hasExcludedType) {
      const excludedFound = types.filter(type => rules.excludedTypes!.includes(type));
      return {
        valid: false,
        reason: `Has excluded type: [${excludedFound.join(', ')}]`
      };
    }
  }

  // VALIDATION 3: Required Name Pattern
  if (rules.requiredNamePattern) {
    if (!rules.requiredNamePattern.test(name)) {
      return {
        valid: false,
        reason: `Name "${name}" doesn't match required pattern`
      };
    }
  }

  // VALIDATION 4: Excluded Name Patterns (MOST CRITICAL FOR NURSERIES!)
  if (rules.excludedNamePatterns && rules.excludedNamePatterns.length > 0) {
    const matchesExcluded = rules.excludedNamePatterns.find(pattern => pattern.test(name));
    if (matchesExcluded) {
      return {
        valid: false,
        reason: `🚫 BLOCKED BY NAME: "${name}" matches excluded pattern: ${matchesExcluded}`
      };
    }
  }
  
  // VALIDATION 4.5: EMERGENCY FAILSAFE - Check for common nursery/company terms one more time
  const emergencyNurseryPatterns = [
    /szkółk/i,       // Polish: nursery (any form)
    /ogród/i,        // Polish: garden (any form)
    /ogrod/i,        // Polish: garden (without diacritic)
    /\bROD\b/i,      // Polish: ROD (allotment gardens)
    /rodzinne ogrody/i,  // Polish: Family Gardens
    /nursery/i,      // English
    /garden.{0,15}(shop|center|centre|store)/i,  // Garden shop/center/store
    /plant.{0,10}(shop|store|center|centre)/i,   // Plant shop/store/center
    /sp\.?\s*z\s*o\.?o\.?/i,  // Polish: sp. z o.o. (companies)
    /spółka/i,       // Polish: company
    /firma/i,        // Polish: firm
    /kruszywa/i,     // Aggregates companies
  ];
  
  const emergencyMatch = emergencyNurseryPatterns.find(pattern => pattern.test(name));
  if (emergencyMatch) {
    return {
      valid: false,
      reason: `⚠️ EMERGENCY BLOCK: "${name}" matches nursery pattern: ${emergencyMatch}`
    };
  }

  // VALIDATION 5: Minimum Rating (quality check)
  if (rules.minRating && place.rating) {
    if (place.rating < rules.minRating) {
      return {
        valid: false,
        reason: `Rating ${place.rating} below minimum ${rules.minRating}`
      };
    }
  }

  // VALIDATION 6: Minimum Reviews (quality check - real places have reviews)
  if (rules.minReviews && place.user_ratings_total !== undefined) {
    if (place.user_ratings_total < rules.minReviews) {
      return {
        valid: false,
        reason: `Only ${place.user_ratings_total} reviews, need ${rules.minReviews}`
      };
    }
  }

  // All validations passed
  return { valid: true };
};

class PlacesApiService {
  private apiKey: string = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || 'AIzaSyDBJ65DOu4WMoTRjvz1J6i6VbYbjOoEW2E';
  private baseUrl: string = 'https://maps.googleapis.com/maps/api/place';
  private useMockData: boolean = false; // Set to false to use real API (CHANGED TO FALSE)
  private placeDetailsCache: Map<string, { data: PlaceDetails; timestamp: number }> = new Map();
  private cacheExpiryTime: number = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  // Mock data for fallback when API fails (Wrocław, Poland area)
  private mockPlaces: Place[] = [
    {
      placeId: 'ChIJ_Wroclaw_Park1',
      name: 'Park Szczytnicki',
      address: 'Park Szczytnicki, Wrocław, Poland',
      coordinates: { lat: 51.1089, lng: 17.0770 },
      rating: 4.7,
      types: ['park', 'tourist_attraction'],
    },
    {
      placeId: 'ChIJ_Wroclaw_Gym1',
      name: 'CityFit Wrocław',
      address: 'Powstańców Śląskich 95, 53-332 Wrocław',
      coordinates: { lat: 51.0970, lng: 17.0340 },
      rating: 4.3,
      priceLevel: 2,
      phoneNumber: '+48-71-123-4567',
      website: 'https://cityfit.pl',
      types: ['gym', 'health'],
    },
    {
      placeId: 'ChIJ_Wroclaw_Stadium1',
      name: 'Stadion Wrocław',
      address: 'Aleja Śląska 1, 54-118 Wrocław',
      coordinates: { lat: 51.1408, lng: 16.9426 },
      rating: 4.6,
      priceLevel: 3,
      phoneNumber: '+48-71-366-0066',
      website: 'https://stadionwroclaw.pl',
      types: ['stadium', 'sports_complex'],
    },
    {
      placeId: 'ChIJ_Wroclaw_Park2',
      name: 'Park Południowy',
      address: 'Park Południowy, Wrocław, Poland',
      coordinates: { lat: 51.0838, lng: 17.0054 },
      rating: 4.5,
      types: ['park', 'tourist_attraction'],
    },
    {
      placeId: 'ChIJ_Wroclaw_Gym2',
      name: 'Fitness Club Wrocław',
      address: 'Oławska 23, 50-123 Wrocław',
      coordinates: { lat: 51.0948, lng: 17.0306 },
      rating: 4.2,
      priceLevel: 2,
      phoneNumber: '+48-71-987-6543',
      types: ['gym', 'health'],
    },
    {
      placeId: 'ChIJ_Wroclaw_Sports1',
      name: 'Hala Orbita',
      address: 'Wejherowska 34, 54-239 Wrocław',
      coordinates: { lat: 51.1278, lng: 16.9648 },
      rating: 4.4,
      priceLevel: 2,
      types: ['sports_complex', 'gym'],
    },
    {
      placeId: 'ChIJ_Wroclaw_Park3',
      name: 'Park Grabiszyński',
      address: 'Park Grabiszyński, Wrocław, Poland',
      coordinates: { lat: 51.0730, lng: 17.0050 },
      rating: 4.6,
      types: ['park', 'tourist_attraction'],
    },
    {
      placeId: 'ChIJ_Wroclaw_Pool1',
      name: 'Aqua Park Wrocław',
      address: 'Borowska 99, 50-558 Wrocław',
      coordinates: { lat: 51.0768, lng: 17.0458 },
      rating: 4.3,
      priceLevel: 3,
      phoneNumber: '+48-71-798-6590',
      website: 'https://aquapark.wroc.pl',
      types: ['swimming_pool', 'sports_complex'],
    },
  ];

  async searchNearby(
    location: { lat: number; lng: number },
    filter: ActivityFilter
  ): Promise<Place[]> {
    console.log(`\n${'━'.repeat(60)}`);
    console.log(`🔍 SEARCHING WITH TYPE-BASED FILTERING`);
    console.log(`${'━'.repeat(60)}`);
    console.log(`📍 Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
    console.log(`📏 Radius: ${filter.radius}m (${(filter.radius / 1000).toFixed(1)}km)`);
    console.log(`🎯 Types: [${filter.types.join(', ')}]`);
    console.log(`🔤 Keywords: [${filter.keywords.join(', ')}]`);
    console.log();

    // Create cache key for this search
    const cacheKey = `searchNearby_${location.lat}_${location.lng}_${JSON.stringify(filter)}`;
    
    // Check cache first
    const cached = performanceOptimizer.getCache(cacheKey);
    if (cached) {
      console.log('💾 Returning cached results:', cached.length, 'places\n');
      return cached;
    }

    // Use mock data for testing - set useMockData to false to use real API
    if (this.useMockData) {
      console.log('Using mock data for testing');
      const mockResults = this.getMockResults(location, filter);
      performanceOptimizer.setCache(cacheKey, mockResults, 2 * 60 * 1000); // 2 minutes cache
      return mockResults;
    }

    try {
      const allResults: Place[] = [];
      
      // Get the category from filter types (use first type as category)
      const category = filter.types.length > 0 ? filter.types[0] : 'all';
      
      console.log(`🔑 Category detected: "${category}"`);
      
      // Get rules for this category
      const rules = SPORT_CATEGORY_RULES[category];
      
      if (!rules) {
        console.warn(`⚠️ No rules defined for category: ${category}`);
        console.warn(`   Available categories: ${Object.keys(SPORT_CATEGORY_RULES).join(', ')}`);
        console.warn(`   Using fallback method without validation rules`);
        // Fallback to old behavior
        return this.searchWithoutRules(location, filter);
      }
      
      console.log(`✅ Found rules for: ${category}`);
      console.log(`   Description: ${rules.description}`);

      console.log(`📋 Using filtering rules for: ${category}`);
      console.log(`   Primary Type: ${rules.primaryType || 'none (keyword-based)'}`);
      console.log(`   Required Types: ${rules.requiredTypes?.join(', ') || 'none'}`);
      console.log(`   Excluded Types: ${rules.excludedTypes?.length || 0} types`);
      console.log(`   Keywords: ${rules.requiredKeywords?.join(', ') || 'none'}`);
      console.log(`   Min Reviews: ${rules.minReviews || 'none'}`);
      console.log();

      // Build API request
      const params: any = {
        location: `${location.lat},${location.lng}`,
        radius: filter.radius.toString(),
        key: this.apiKey,
      };

      // Add type or keyword based on rules
      if (rules.primaryType) {
        params.type = rules.primaryType;
        console.log(`🔎 API Query: type="${params.type}"`);
      }
      
      if (rules.requiredKeywords && rules.requiredKeywords.length > 0) {
        params.keyword = rules.requiredKeywords.join(' ');
        console.log(`🔎 API Query: keyword="${params.keyword}"`);
      }

      // Make API request
      const url = `${this.baseUrl}/nearbysearch/json?${new URLSearchParams(params).toString()}`;
      
      console.log(`🌐 Fetching from Google Places API...`);
      const response = await fetch(url);
      const data = await response.json();

      // Check API response
      console.log(`📡 API Response: ${data.status}`);
      
      if (data.status === 'ZERO_RESULTS') {
        console.log(`ℹ️  No results found for ${category}\n`);
        return [];
      }

      if (data.status !== 'OK') {
        console.error(`❌ Google Places API Error: ${data.status}`);
        if (data.error_message) {
          console.error(`   Message: ${data.error_message}`);
        }
        throw new Error(`Google Places API error: ${data.status}`);
      }

      const rawResults = data.results || [];
      console.log(`📦 Raw results from API: ${rawResults.length}`);
      console.log();

      // Apply validation filters
      console.log(`🔬 Applying validation filters...`);
      console.log();

      const validatedResults: any[] = [];
      const rejectedResults: any[] = [];

      rawResults.forEach((place: any, index: number) => {
        const validation = validatePlace(place, rules);
        
        if (validation.valid) {
          validatedResults.push(place);
          console.log(`✅ [${index + 1}/${rawResults.length}] ${place.name}`);
          console.log(`   Types: ${place.types?.slice(0, 3).join(', ')}${place.types?.length > 3 ? '...' : ''}`);
          console.log(`   Rating: ${place.rating || 'N/A'} (${place.user_ratings_total || 0} reviews)`);
        } else {
          rejectedResults.push({ place, reason: validation.reason });
          console.log(`❌ [${index + 1}/${rawResults.length}] ${place.name}`);
          console.log(`   Reason: ${validation.reason}`);
          console.log(`   Types: ${place.types?.slice(0, 3).join(', ')}`);
        }
        console.log();
      });

      // Summary
      console.log(`${'━'.repeat(60)}`);
      console.log(`📊 FILTERING SUMMARY:`);
      console.log(`   Raw results: ${rawResults.length}`);
      console.log(`   ✅ Validated: ${validatedResults.length}`);
      console.log(`   ❌ Rejected: ${rejectedResults.length}`);
      console.log(`   🎯 Accuracy: ${rawResults.length > 0 ? ((validatedResults.length / rawResults.length) * 100).toFixed(1) : 0}% kept`);
      console.log(`${'━'.repeat(60)}\n`);

      // Map to our format
      const mappedResults: Place[] = validatedResults.map((place: any) => ({
        placeId: place.place_id,
        name: place.name,
        address: place.vicinity || place.formatted_address || 'Address not available',
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        rating: place.rating,
        priceLevel: place.price_level,
        types: place.types || [],
        photos: place.photos?.map((photo: any) => ({
          photoReference: photo.photo_reference,
          height: photo.height,
          width: photo.width,
        })) || [],
      }));

      // Cache the results
      performanceOptimizer.setCache(cacheKey, mappedResults, 5 * 60 * 1000); // 5 minutes cache
      
      return mappedResults;
    } catch (error) {
      console.error('❌ Error searching nearby places:', error);
      console.error('Falling back to old method...\n');
      
      // Fallback to old method
      return this.searchWithoutRules(location, filter);
    }
  }

  // Fallback method for categories without rules or when type-based filtering fails
  private async searchWithoutRules(
    location: { lat: number; lng: number },
    filter: ActivityFilter
  ): Promise<Place[]> {
    console.log('⚙️ Using fallback search method (no validation rules)');
    
    const allResults: Place[] = [];
    
    // If no types specified, search for general establishments
    if (filter.types.length === 0) {
      console.log('⚠️ No types specified, using keyword search');
      const results = await this.searchByKeyword(location, filter);
      console.log(`📊 Keyword search found ${results.length} results`);
      allResults.push(...results);
    } else {
      console.log('🎯 Searching by types:', filter.types);
      // Search for each type separately (Google Places API limitation)
      for (const type of filter.types) {
        const googleType = GOOGLE_PLACES_TYPES[type as keyof typeof GOOGLE_PLACES_TYPES];
        console.log(`🔎 Searching for type: ${type} -> Google type: ${googleType}`);
        
        if (googleType) {
          // Valid Google type - use type-based search
          const results = await this.searchByType(location, googleType, filter);
          console.log(`✅ Found ${results.length} results for type ${type}`);
          allResults.push(...results);
        } else {
          // Invalid Google type - use keyword search instead
          console.log(`⚠️ Type "${type}" is not a valid Google Places type - using keyword search`);
          const keywords = GOOGLE_PLACES_KEYWORDS[type as keyof typeof GOOGLE_PLACES_KEYWORDS];
          if (keywords) {
            console.log(`🔍 Using keywords: "${keywords}"`);
            const results = await this.searchByKeywordWithType(location, keywords, filter);
            console.log(`✅ Found ${results.length} results for ${type} using keywords`);
            allResults.push(...results);
          } else {
            console.warn(`⚠️ No keywords defined for: ${type}`);
          }
        }
      }
    }

    console.log(`📊 Total results before deduplication: ${allResults.length}`);

    // Remove duplicates based on placeId
    const uniqueResults = allResults.filter((place, index, self) =>
      index === self.findIndex(p => p.placeId === place.placeId)
    );

    console.log(`✅ Results after deduplication: ${uniqueResults.length}\n`);
    
    return uniqueResults;
  }

  private getMockResults(
    location: { lat: number; lng: number },
    filter: ActivityFilter
  ): Place[] {
    console.log('Using mock data for search');
    
    // Filter mock data based on criteria
    let results = this.mockPlaces.filter(place => {
      // Check if place is within radius (simplified distance calculation)
      const distance = this.calculateDistance(location, place.coordinates);
      if (distance > filter.radius) return false;

      // Check if place matches any selected types
      if (filter.types.length > 0) {
        const hasMatchingType = filter.types.some(type => 
          place.types.includes(type)
        );
        if (!hasMatchingType) return false;
      }

      // Check if place matches keywords
      if (filter.keywords.length > 0) {
        const hasMatchingKeyword = filter.keywords.some(keyword =>
          place.name.toLowerCase().includes(keyword.toLowerCase()) ||
          place.address.toLowerCase().includes(keyword.toLowerCase())
        );
        if (!hasMatchingKeyword) return false;
      }

      return true;
    });

    console.log(`Mock results: ${results.length} places found`);
    return results;
  }

  private async searchByType(
    location: { lat: number; lng: number },
    type: string,
    filter: ActivityFilter
  ): Promise<Place[]> {
    const params = new URLSearchParams({
      location: `${location.lat},${location.lng}`,
      radius: filter.radius.toString(),
      type: type,
      key: this.apiKey,
    });

    // Add keyword search if specified
    if (filter.keywords.length > 0) {
      params.append('keyword', filter.keywords.join(' '));
    }

    const url = `${this.baseUrl}/nearbysearch/json?${params}`;
    console.log(`🌐 Making API request for type "${type}":`, url);

    const response = await fetch(url);

    console.log(`📡 API response status for "${type}":`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`📦 API response for "${type}":`, {
      status: data.status,
      resultsCount: data.results?.length || 0,
      errorMessage: data.error_message
    });

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error(`❌ Google Places API error for "${type}":`, data.status, data.error_message);
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    if (data.status === 'ZERO_RESULTS') {
      console.log(`⚠️ No results found for type "${type}"`);
      return [];
    }

    const results = data.results.map((result: any) => ({
      placeId: result.place_id,
      name: result.name,
      address: result.vicinity || result.formatted_address || 'Address not available',
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      rating: result.rating,
      priceLevel: result.price_level,
      types: result.types || [],
      photos: result.photos?.map((photo: any) => ({
        photoReference: photo.photo_reference,
        height: photo.height,
        width: photo.width,
      })) || [],
    }));

    console.log(`✅ Mapped ${results.length} results for type "${type}"`);
    if (results.length > 0 && results.length <= 3) {
      console.log(`📍 Sample results for "${type}":`, results.map(r => ({ name: r.name, types: r.types, photosCount: r.photos?.length || 0 })));
    }
    return results;
  }

  private async searchByKeywordWithType(
    location: { lat: number; lng: number },
    keywords: string,
    filter: ActivityFilter
  ): Promise<Place[]> {
    // Use nearby search with point_of_interest type + specific keywords
    // This is for facilities that don't have dedicated Google types (swimming pools, courts, etc.)
    const params = new URLSearchParams({
      location: `${location.lat},${location.lng}`,
      radius: filter.radius.toString(),
      type: 'point_of_interest', // Broad type
      keyword: keywords, // Specific keywords to filter
      key: this.apiKey,
    });

    const url = `${this.baseUrl}/nearbysearch/json?${params}`;
    console.log(`🌐 Making keyword-based API request:`, url);

    const response = await fetch(url);
    console.log(`📡 Keyword API response status:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Keyword API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`📦 Keyword API response:`, {
      status: data.status,
      resultsCount: data.results?.length || 0,
      errorMessage: data.error_message
    });

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error(`❌ Google Places API error for keywords "${keywords}":`, data.status, data.error_message);
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    if (data.status === 'ZERO_RESULTS') {
      console.log(`⚠️ No results found for keywords: "${keywords}"`);
      return [];
    }

    const results = data.results.map((result: any) => ({
      placeId: result.place_id,
      name: result.name,
      address: result.vicinity || result.formatted_address || 'Address not available',
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      rating: result.rating,
      priceLevel: result.price_level,
      types: result.types || [],
      photos: result.photos?.map((photo: any) => ({
        photoReference: photo.photo_reference,
        height: photo.height,
        width: photo.width,
      })) || [],
    }));

    console.log(`✅ Mapped ${results.length} results for keywords "${keywords}"`);
    if (results.length > 0 && results.length <= 3) {
      console.log(`📍 Sample results:`, results.map(r => ({ name: r.name, types: r.types, photosCount: r.photos?.length || 0 })));
    }
    return results;
  }

  private async searchByKeyword(
    location: { lat: number; lng: number },
    filter: ActivityFilter
  ): Promise<Place[]> {
    // Use text search when no specific types are selected
    const keyword = filter.keywords.length > 0 
      ? filter.keywords.join(' ') 
      : 'sports fitness gym park';

    console.log('Using keyword search with:', keyword);

    const params = new URLSearchParams({
      query: keyword,
      location: `${location.lat},${location.lng}`,
      radius: filter.radius.toString(),
      key: this.apiKey,
    });

    const url = `${this.baseUrl}/textsearch/json?${params}`;
    console.log('Making keyword API request to:', url);

    const response = await fetch(url);

    console.log('Keyword API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Keyword API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Keyword API response data:', data);

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message);
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    const results = data.results.map((result: any) => ({
      placeId: result.place_id,
      name: result.name,
      address: result.formatted_address || 'Address not available',
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      rating: result.rating,
      priceLevel: result.price_level,
      types: result.types || [],
      photos: result.photos?.map((photo: any) => ({
        photoReference: photo.photo_reference,
        height: photo.height,
        width: photo.width,
      })) || [],
    }));

    console.log(`Mapped ${results.length} results for keyword search`);
    return results;
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    console.log('Getting place details for:', placeId);

    // Check cache first
    const cached = this.placeDetailsCache.get(placeId);
    if (cached && (Date.now() - cached.timestamp) < this.cacheExpiryTime) {
      console.log('Returning cached place details for:', placeId);
      return cached.data;
    }

    // Use mock data for testing
    if (this.useMockData) {
      console.log('Using mock place details for:', placeId);
      const mockDetails = this.getMockPlaceDetails(placeId);
      if (mockDetails) {
        // Cache the mock data
        this.placeDetailsCache.set(placeId, {
          data: mockDetails,
          timestamp: Date.now()
        });
        return mockDetails;
      }
    }

    try {
      const params = new URLSearchParams({
        place_id: placeId,
        fields: 'place_id,name,formatted_address,geometry,rating,price_level,formatted_phone_number,website,opening_hours,photos,reviews,types,utc_offset,vicinity,international_phone_number,url,utc_offset_minutes',
        key: this.apiKey,
      });

      const response = await fetch(
        `${this.baseUrl}/details/json?${params}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }

      const result = data.result;
      const placeDetails: PlaceDetails = {
        placeId: result.place_id,
        name: result.name,
        address: result.formatted_address || 'Address not available',
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        },
        rating: result.rating,
        priceLevel: result.price_level,
        phoneNumber: result.formatted_phone_number,
        website: result.website,
        openingHours: result.opening_hours ? {
          openNow: result.opening_hours.open_now,
          periods: result.opening_hours.periods || [],
          weekdayText: result.opening_hours.weekday_text || []
        } : undefined,
        photos: result.photos?.map((photo: any) => ({
          photoReference: photo.photo_reference,
          height: photo.height,
          width: photo.width
        })) || [],
        reviews: result.reviews?.map((review: any) => ({
          authorName: review.author_name,
          rating: review.rating,
          text: review.text,
          time: review.time,
          profilePhotoUrl: review.profile_photo_url
        })) || [],
        types: result.types || [],
        utcOffset: result.utc_offset,
        vicinity: result.vicinity,
        formattedPhoneNumber: result.formatted_phone_number,
        internationalPhoneNumber: result.international_phone_number,
        url: result.url,
        utcOffsetMinutes: result.utc_offset_minutes
      };

      // Cache the result
      this.placeDetailsCache.set(placeId, {
        data: placeDetails,
        timestamp: Date.now()
      });

      console.log('Place details fetched and cached for:', placeId);
      return placeDetails;
    } catch (error) {
      console.error('Error getting place details:', error);
      
      // Fallback to mock data
      const mockDetails = this.getMockPlaceDetails(placeId);
      if (mockDetails) {
        console.log('Using mock data as fallback for:', placeId);
        return mockDetails;
      }
      
      throw new Error('Failed to get place details');
    }
  }

  private getMockPlaceDetails(placeId: string): PlaceDetails | null {
    const mockPlacesDetails: { [key: string]: PlaceDetails } = {
      'ChIJ123456789': {
        placeId: 'ChIJ123456789',
        name: 'Central Park',
        address: 'Central Park, New York, NY 10024',
        coordinates: { lat: 40.7829, lng: -73.9654 },
        rating: 4.5,
        priceLevel: 0,
        phoneNumber: '+1-212-310-6600',
        website: 'https://www.centralparknyc.org',
        openingHours: {
          openNow: true,
          periods: [],
          weekdayText: ['Monday: 6:00 AM – 1:00 AM', 'Tuesday: 6:00 AM – 1:00 AM', 'Wednesday: 6:00 AM – 1:00 AM', 'Thursday: 6:00 AM – 1:00 AM', 'Friday: 6:00 AM – 1:00 AM', 'Saturday: 6:00 AM – 1:00 AM', 'Sunday: 6:00 AM – 1:00 AM']
        },
        photos: [
          { photoReference: 'mock_photo_1', height: 400, width: 600 }
        ],
        reviews: [
          {
            authorName: 'John Doe',
            rating: 5,
            text: 'Beautiful park with great walking trails and recreational facilities.',
            time: Date.now() - 86400000, // 1 day ago
            profilePhotoUrl: 'https://via.placeholder.com/50'
          }
        ],
        types: ['park', 'tourist_attraction'],
        utcOffset: -300,
        vicinity: 'Manhattan, New York'
      },
      'ChIJ987654321': {
        placeId: 'ChIJ987654321',
        name: 'Equinox Gym',
        address: '123 Main St, New York, NY 10001',
        coordinates: { lat: 40.7589, lng: -73.9851 },
        rating: 4.2,
        priceLevel: 3,
        phoneNumber: '+1-555-0123',
        website: 'https://equinox.com',
        openingHours: {
          openNow: true,
          periods: [],
          weekdayText: ['Monday: 5:00 AM – 11:00 PM', 'Tuesday: 5:00 AM – 11:00 PM', 'Wednesday: 5:00 AM – 11:00 PM', 'Thursday: 5:00 AM – 11:00 PM', 'Friday: 5:00 AM – 11:00 PM', 'Saturday: 6:00 AM – 10:00 PM', 'Sunday: 7:00 AM – 9:00 PM']
        },
        photos: [
          { photoReference: 'mock_photo_2', height: 400, width: 600 }
        ],
        reviews: [
          {
            authorName: 'Jane Smith',
            rating: 4,
            text: 'Great gym with excellent equipment and clean facilities.',
            time: Date.now() - 172800000, // 2 days ago
            profilePhotoUrl: 'https://via.placeholder.com/50'
          }
        ],
        types: ['gym', 'health'],
        utcOffset: -300,
        vicinity: 'Manhattan, New York'
      }
    };

    return mockPlacesDetails[placeId] || null;
  }

  async getPlacePhoto(photoReference: string, maxWidth: number = 400): Promise<string> {
    console.log('Getting place photo:', photoReference);

    try {
      const params = new URLSearchParams({
        photo_reference: photoReference,
        maxwidth: maxWidth.toString(),
        key: this.apiKey,
      });

      const response = await fetch(
        `${this.baseUrl}/photo?${params}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Return the photo URL
      return response.url;
    } catch (error) {
      console.error('Error getting place photo:', error);
      // Return a placeholder image URL as fallback
      return `https://via.placeholder.com/${maxWidth}x${Math.floor(maxWidth * 0.75)}/cccccc/666666?text=Photo+Not+Available`;
    }
  }

  // Utility methods
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    // Simplified distance calculation (not accurate for large distances)
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLng = this.toRad(point2.lng - point1.lng);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.lat)) * Math.cos(this.toRad(point2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Return distance in meters
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Cache management methods
  clearCache(): void {
    this.placeDetailsCache.clear();
    console.log('Place details cache cleared');
  }

  getCacheSize(): number {
    return this.placeDetailsCache.size;
  }

  isCached(placeId: string): boolean {
    const cached = this.placeDetailsCache.get(placeId);
    return cached !== undefined && (Date.now() - cached.timestamp) < this.cacheExpiryTime;
  }

  // Enhanced photo URL generation
  getPlacePhotoUrl(photoReference: string, maxWidth: number = 400, maxHeight?: number): string {
    const params = new URLSearchParams({
      photo_reference: photoReference,
      maxwidth: maxWidth.toString(),
      key: this.apiKey,
    });

    if (maxHeight) {
      params.append('maxheight', maxHeight.toString());
    }

    return `${this.baseUrl}/photo?${params}`;
  }

  // Get place details with photo URLs
  async getPlaceDetailsWithPhotos(placeId: string): Promise<PlaceDetails | null> {
    const placeDetails = await this.getPlaceDetails(placeId);
    if (!placeDetails || !placeDetails.photos) {
      return placeDetails;
    }

    // Add photo URLs to the place details
    const placeDetailsWithPhotos = {
      ...placeDetails,
      photos: placeDetails.photos.map(photo => ({
        ...photo,
        url: this.getPlacePhotoUrl(photo.photoReference, 400, 300)
      }))
    };

    return placeDetailsWithPhotos;
  }

}

export const placesApiService = new PlacesApiService();
export default placesApiService;
