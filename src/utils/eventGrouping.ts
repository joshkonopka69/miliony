import { MyEvent, EventGroup, GroupedEvents, SportActivity } from '../types/event';

/**
 * Group events by time periods (Today, Tomorrow, This Week, etc.)
 */
export function groupEventsByTime(events: MyEvent[]): GroupedEvents[] {
  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => 
    a.startTime.getTime() - b.startTime.getTime()
  );

  // Group events
  const groups = new Map<EventGroup, MyEvent[]>();
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const nextWeekEnd = new Date(today);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 14);

  sortedEvents.forEach(event => {
    const eventDate = new Date(event.startTime);
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

    let group: EventGroup;

    if (eventDay.getTime() === today.getTime()) {
      group = 'TODAY';
    } else if (eventDay.getTime() === tomorrow.getTime()) {
      group = 'TOMORROW';
    } else if (eventDay < weekEnd) {
      group = 'THIS_WEEK';
    } else if (eventDay < nextWeekEnd) {
      group = 'NEXT_WEEK';
    } else {
      group = 'LATER';
    }

    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group)!.push(event);
  });

  // Convert to array in desired order
  const orderedGroups: EventGroup[] = ['TODAY', 'TOMORROW', 'THIS_WEEK', 'NEXT_WEEK', 'LATER'];
  const result: GroupedEvents[] = [];

  orderedGroups.forEach(group => {
    if (groups.has(group)) {
      result.push({
        group,
        events: groups.get(group)!,
      });
    }
  });

  return result;
}

/**
 * Format date intelligently (Today, Tomorrow, or specific date)
 */
export function formatEventDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (eventDay.getTime() === today.getTime()) {
    return 'Today';
  } else if (eventDay.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else {
    // Format as "Mon, Jan 15" or "Wed, Dec 25"
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  }
}

/**
 * Format time (6:00 PM, 9:30 AM)
 */
export function formatEventTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

/**
 * Format date and time together
 */
export function formatEventDateTime(date: Date): string {
  return `${formatEventDate(date)}, ${formatEventTime(date)}`;
}

/**
 * Get time until event starts (for "Starting in X minutes")
 */
export function getTimeUntilEvent(startTime: Date): string {
  const now = new Date();
  const diff = startTime.getTime() - now.getTime();
  
  if (diff < 0) {
    return 'Started';
  }

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `In ${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `In ${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `In ${minutes} min`;
  } else {
    return 'Starting now';
  }
}

/**
 * Check if event is live (between start and end time)
 */
export function isEventLive(event: MyEvent): boolean {
  const now = new Date();
  return now >= event.startTime && now <= event.endTime;
}

/**
 * Check if event is starting soon (within 30 minutes)
 */
export function isEventStartingSoon(event: MyEvent): boolean {
  const now = new Date();
  const diff = event.startTime.getTime() - now.getTime();
  const minutes = diff / (1000 * 60);
  return minutes > 0 && minutes <= 30;
}

/**
 * Format distance (2.3 km or 850 m)
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Get status badge text
 */
export function getStatusBadge(event: MyEvent): string | null {
  if (isEventLive(event)) {
    return 'Live';
  } else if (isEventStartingSoon(event)) {
    return 'Starting Soon';
  } else if (event.status === 'cancelled') {
    return 'Cancelled';
  }
  return null;
}

/**
 * Get icon name for a sport activity
 */
export function getSportIcon(activity: SportActivity): string {
  switch (activity) {
    case 'Football':
      return 'football-outline';
    case 'Basketball':
      return 'basketball-outline';
    case 'Tennis':
      return 'tennisball-outline';
    case 'Volleyball':
      return 'american-football-outline'; // Closest available icon
    case 'Running':
      return 'walk-outline';
    case 'Cycling':
      return 'bicycle-outline';
    case 'Swimming':
      return 'water-outline';
    case 'Gym':
      return 'barbell-outline';
    default:
      return 'fitness-outline';
  }
}

/**
 * Get color for a sport activity
 */
export function getSportColor(activity: SportActivity): string {
  switch (activity) {
    case 'Football':
      return '#059669'; // Emerald/Green
    case 'Basketball':
      return '#F59E0B'; // Amber/Orange
    case 'Tennis':
      return '#4F46E5'; // Indigo/Purple
    case 'Volleyball':
      return '#EF4444'; // Red
    case 'Running':
      return '#8B5CF6'; // Violet
    case 'Cycling':
      return '#14B8A6'; // Teal
    case 'Swimming':
      return '#3B82F6'; // Blue
    case 'Gym':
      return '#6B7280'; // Gray
    default:
      return '#9CA3AF'; // Light Gray
  }
}

