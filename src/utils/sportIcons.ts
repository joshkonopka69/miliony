/**
 * Shared sport icon mapping — Ionicons names for all sport types.
 * Used across the app for consistent sport iconography.
 */

// Map of sport key → Ionicons name
export const SPORT_ICONS: Record<string, string> = {
  basketball: 'basketball-outline',
  football: 'football-outline',
  soccer: 'football-outline',
  tennis: 'tennisball-outline',
  volleyball: 'baseball-outline',
  swimming: 'water-outline',
  gym: 'barbell-outline',
  running: 'walk-outline',
  cycling: 'bicycle-outline',
  climbing: 'trending-up-outline',
  boxing: 'fitness-outline',
  mma: 'fitness-outline',
  judo: 'body-outline',
  bjj: 'body-outline',
  calisthenics: 'body-outline',
  chess: 'grid-outline',
  pingPong: 'tablet-landscape-outline',
  badminton: 'tennisball-outline',
  squash: 'tennisball-outline',
  rollerSkating: 'walk-outline',
  default: 'trophy-outline',
};

// Map of sport key → accent color 
export const SPORT_COLORS: Record<string, string> = {
  basketball: '#F97316',
  football: '#10B981',
  soccer: '#10B981',
  tennis: '#FBBF24',
  volleyball: '#3B82F6',
  swimming: '#06B6D4',
  gym: '#8B5CF6',
  running: '#EF4444',
  cycling: '#14B8A6',
  climbing: '#F59E0B',
  boxing: '#DC2626',
  mma: '#B91C1C',
  judo: '#7C3AED',
  bjj: '#6D28D9',
  calisthenics: '#8B5CF6',
  chess: '#6B7280',
  pingPong: '#EC4899',
  badminton: '#06B6D4',
  squash: '#F97316',
  rollerSkating: '#A855F7',
  default: '#FFD700',
};

/**
 * Get the Ionicons name for a sport type.
 */
export function getSportIconName(sportType: string): string {
  const normalized = sportType.toLowerCase().replace(/[^a-z]/g, '');
  return SPORT_ICONS[sportType] || SPORT_ICONS[normalized] || SPORT_ICONS.default;
}

/**
 * Get the accent color for a sport type.
 */
export function getSportColor(sportType: string): string {
  return SPORT_COLORS[sportType] || SPORT_COLORS.default;
}
