/**
 * Heroicons SVG Components for React Native
 * Based on https://heroicons.com/ (Outline style)
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Map Pin Icon - for navbar map
export const MapPinIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  strokeWidth = 1.5 
}) => (
  <Svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
  >
    <Path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" 
    />
    <Path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" 
    />
  </Svg>
);

// Trophy Icon - for navbar my games
export const TrophyIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  strokeWidth = 1.5 
}) => (
  <Svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
  >
    <Path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" 
    />
  </Svg>
);

// User Icon - for navbar profile
export const UserIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  strokeWidth = 1.5 
}) => (
  <Svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
  >
    <Path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" 
    />
  </Svg>
);

// Bell Icon - for notifications
export const BellIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  strokeWidth = 1.5 
}) => (
  <Svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
  >
    <Path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" 
    />
  </Svg>
);

// Cog/Settings Icon
export const CogIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  strokeWidth = 1.5 
}) => (
  <Svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
  >
    <Path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" 
    />
    <Path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" 
    />
  </Svg>
);

// Filter/Adjustments Icon
export const AdjustmentsIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  strokeWidth = 1.5 
}) => (
  <Svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
  >
    <Path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" 
    />
  </Svg>
);

// Export all icons
export const HeroIcons = {
  MapPin: MapPinIcon,
  Trophy: TrophyIcon,
  User: UserIcon,
  Bell: BellIcon,
  Cog: CogIcon,
  Adjustments: AdjustmentsIcon,
};

export default HeroIcons;
