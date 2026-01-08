import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MyEvent, SPORT_COLORS } from '../types/event';
import { formatEventDate, formatEventTime, formatDistance, getStatusBadge, isEventLive, getTimeUntilEvent } from '../utils/eventGrouping';
import { useTranslation, Language } from '../contexts/TranslationContext';
import { Image } from 'react-native';
import placesApiService from '../services/placesApi';

const LOCALE_MAP: Record<Language, string> = {
  en: 'en-US',
  pl: 'pl-PL',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
};

interface EventCardProps {
  event: MyEvent;
  onPress: () => void;
  onChatPress: () => void;
  onLeavePress: () => void;
}

export default function EventCard({
  event,
  onPress,
  onChatPress,
  onLeavePress,
}: EventCardProps) {
  const { t, language } = useTranslation();
  const [locationPhoto, setLocationPhoto] = React.useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = React.useState(false);

  React.useEffect(() => {
    const fetchLocationPhoto = async () => {
      if (!event.placeId) return;

      try {
        setLoadingPhoto(true);
        const details = await placesApiService.getPlaceDetails(event.placeId);
        if (details?.photos && details.photos.length > 0) {
          // Increase resolution for the bigger banner
          const photoUrl = placesApiService.getPlacePhotoUrl(details.photos[0].photoReference, 600, 400);
          setLocationPhoto(photoUrl);
        }
      } catch (error) {
        console.error('Error fetching location photo for card:', error);
      } finally {
        setLoadingPhoto(false);
      }
    };

    fetchLocationPhoto();
  }, [event.placeId]);

  const locale = LOCALE_MAP[language] ?? 'en-US';
  const sportColor = SPORT_COLORS[event.activity];
  const statusBadge = getStatusBadge(event);
  const isLive = isEventLive(event);
  const statusLabel = statusBadge ? t.myEvents.statusLabels[statusBadge] ?? statusBadge : null;
  const relativeStart = getTimeUntilEvent(
    event.startTime,
    locale,
    t.eventDetails.eventStarted
  );

  // Calculate participant percentage for progress bar
  const participantPercent = (event.participants.current / event.participants.max) * 100;
  const isAlmostFull = participantPercent >= 80;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Location Banner Image */}
      <View style={styles.bannerContainer}>
        {locationPhoto ? (
          <Image
            source={{ uri: locationPhoto }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.bannerPlaceholder, { backgroundColor: sportColor + '20' }]}>
            <Ionicons
              name={getSportIcon(event.activity)}
              size={48}
              color={sportColor}
              style={{ opacity: 0.5 }}
            />
          </View>
        )}

        {/* Sport Icon Overlay */}
        <View style={[styles.sportIconBadge, { backgroundColor: sportColor }]}>
          <Ionicons
            name={getSportIcon(event.activity)}
            size={18}
            color="#000000"
          />
        </View>

        {/* Status Badge Overlay */}
        {statusLabel && (
          <View style={[
            styles.statusBadgeOverlay,
            isLive && styles.statusBadgeLive
          ]}>
            <Text style={[
              styles.statusBadgeText,
              isLive && styles.statusBadgeTextLive
            ]}>
              {statusLabel}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        {/* Title and Activity */}
        <View style={styles.titleRow}>
          <View style={styles.headerInfo}>
            <Text style={styles.eventName} numberOfLines={1}>
              {event.name}
            </Text>
            <Text style={styles.activityLabel}>{event.activity}</Text>
          </View>
        </View>

        <View style={styles.timeUntilContainer}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.timeUntilText}>{relativeStart}</Text>
        </View>

        {/* Participants Progress */}
        <View style={styles.participantsSection}>
          <View style={styles.participantsRow}>
            <Ionicons name="people" size={16} color="#6B7280" />
            <Text style={styles.participantsText}>
              {event.participants.current}/{event.participants.max} {t.myEvents.participantsShort}
            </Text>
            {isAlmostFull && (
              <View style={styles.almostFullBadge}>
                <Text style={styles.almostFullText}>{t.myEvents.almostFull}</Text>
              </View>
            )}
          </View>
          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${participantPercent}%`,
                  backgroundColor: isAlmostFull ? '#F59E0B' : '#10B981'
                }
              ]}
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color="#6B7280" />
          <Text style={styles.infoText} numberOfLines={1}>
            {event.location.name}
            {event.location.distance && ` (${formatDistance(event.location.distance)})`}
          </Text>
        </View>

        {/* Time */}
        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {formatEventDate(event.startTime, locale, {
              today: t.myEvents.groupLabels.TODAY,
              tomorrow: t.myEvents.groupLabels.TOMORROW,
            })}, {formatEventTime(event.startTime, locale)}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          {/* Primary: View Details */}
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>{t.myEvents.viewDetails}</Text>
          </TouchableOpacity>

          {/* Secondary: Chat */}
          {event.chatEnabled && (
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={onChatPress}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble" size={18} color="#000000" />
            </TouchableOpacity>
          )}

          {/* Tertiary: Leave */}
          {event.role === 'joined' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.tertiaryButton]}
              onPress={onLeavePress}
              activeOpacity={0.7}
            >
              <Ionicons name="exit-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Helper function to get sport-specific icon
function getSportIcon(activity: string): keyof typeof Ionicons.glyphMap {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    Football: 'football',
    Basketball: 'basketball',
    Tennis: 'tennisball',
    Volleyball: 'basketball', // Volleyball uses same
    Running: 'walk',
    Cycling: 'bicycle',
    Swimming: 'water',
    Gym: 'barbell',
  };
  return icons[activity] || 'fitness';
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  bannerContainer: {
    height: 160,
    width: '100%',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportIconBadge: {
    position: 'absolute',
    bottom: -20,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  statusBadgeOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  cardContent: {
    padding: 16,
    paddingTop: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  activityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  statusBadgeLive: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  statusBadgeTextLive: {
    color: '#EF4444',
  },
  timeUntilContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  timeUntilText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  participantsSection: {
    marginBottom: 12,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  participantsText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  almostFullBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
  },
  almostFullText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#FDB924',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  secondaryButton: {
    width: 44,
    backgroundColor: '#F3F4F6',
  },
  tertiaryButton: {
    width: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
  },
});

