import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Share,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation, useAppRoute } from '../navigation/hooks';
import { ROUTES } from '../navigation/types';
import { MyEvent, SPORT_COLORS } from '../types/event';
import {
  formatEventDate,
  formatEventTime,
  getTimeUntilEvent,
} from '../utils/eventGrouping';
import { useTranslation, Language } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService, Event as SupabaseEvent } from '../services/supabase';
import { enhancedEventService } from '../services/enhancedEventService';
import { notificationService } from '../services/notificationService';
import ProfilePreviewModal, { ProfilePreviewUser } from '../components/ProfilePreviewModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import placesApiService from '../services/placesApi';

// Sport emoji mapping
const SPORT_EMOJI_MAP: Record<string, string> = {
  basketball: '🏀',
  football: '⚽',
  soccer: '⚽',
  tennis: '🎾',
  running: '🏃‍♂️',
  cycling: '🚴‍♂️',
  swimming: '🏊‍♂️',
  gym: '💪',
  volleyball: '🏐',
  judo: '🥋',
  wrestling: '🤼‍♂️',
  'muay thai': '🥊',
  kickboxing: '🥊',
  rollerblading: '🛼',
  'ice skating': '⛸️',
  skating: '🛹',
  padel: '🎾',
  squash: '🎾',
  bouldering: '🧗‍♂️',
  climbing: '🧗‍♂️',
  'table tennis': '🏓',
  yoga: '🧘',
  pilates: '🧘',
  crossfit: '🏋️‍♂️',
  badminton: '🏸',
  default: '🏅',
};

const getSportEmoji = (sportType: string): string => {
  return SPORT_EMOJI_MAP[sportType?.toLowerCase()] || SPORT_EMOJI_MAP.default;
};

const LOCALE_MAP: Record<Language, string> = {
  en: 'en-US',
  pl: 'pl-PL',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
};

export default function EventDetailsScreen() {
  const navigation = useAppNavigation();
  const route = useAppRoute<'EventDetails'>();
  const initialEvent = route.params?.game as MyEvent;
  const eventIdFromParams = route.params?.game?.id || (route.params as any)?.gameId || (route.params as any)?.id;

  const [event, setEvent] = useState<MyEvent | null>(initialEvent || null);
  const { t, language } = useTranslation();
  const { getUserId, user: currentUser } = useAuth();
  const userId = getUserId();
  const loginRequiredMessage = t.friends?.loginRequired || 'Please sign in to continue.';
  const locale = LOCALE_MAP[language] ?? 'en-US';

  const [hasJoined, setHasJoined] = useState(initialEvent?.role === 'joined');
  const [participantsState, setParticipantsState] = useState(initialEvent?.participants);
  const [isProcessing, setIsProcessing] = useState(false);
  const [requestPending, setRequestPending] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(!initialEvent && !!eventIdFromParams);
  const [participantsList, setParticipantsList] = useState<ProfilePreviewUser[]>([]);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ProfilePreviewUser | null>(null);
  const [showReschedulePicker, setShowReschedulePicker] = useState(false);
  const [newStartTime, setNewStartTime] = useState(initialEvent?.startTime || new Date());
  const [locationPhoto, setLocationPhoto] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  const relativeStart = event
    ? getTimeUntilEvent(event.startTime, locale, t.eventDetails.eventStarted)
    : '';

  useEffect(() => {
    if (eventIdFromParams) {
      loadEventById(eventIdFromParams);
    }
  }, [eventIdFromParams]);

  const loadEventById = async (id: string) => {
    try {
      setIsLoadingEvent(true);
      const rawEvent = await supabaseService.getEventById(id) as SupabaseEvent;
      if (rawEvent) {
        // Map raw event to MyEvent
        const mappedEvent: MyEvent = {
          id: rawEvent.id,
          name: rawEvent.name,
          activity: rawEvent.activity as any,
          startTime: new Date(rawEvent.scheduled_datetime),
          endTime: rawEvent.end_datetime ? new Date(rawEvent.end_datetime) : new Date(new Date(rawEvent.scheduled_datetime).getTime() + 2 * 60 * 60 * 1000),
          location: {
            name: rawEvent.location_name,
            address: rawEvent.location_name, // fallback
            lat: rawEvent.latitude,
            lng: rawEvent.longitude,
          },
          participants: {
            current: rawEvent.participants_count || 0,
            max: rawEvent.max_participants || 0,
          },
          status: rawEvent.status as any,
          role: 'joined', // Default, will check below
          chatEnabled: rawEvent.chat_enabled !== false,
          createdBy: {
            id: (rawEvent as any).creator?.id || (rawEvent as any).created_by_id || rawEvent.created_by,
            name: (rawEvent as any).creator?.display_name || (rawEvent as any).creator_name || 'Organizer',
            avatar_url: (rawEvent as any).creator?.avatar_url || (rawEvent as any).creator_avatar,
          },
          description: rawEvent.description,
          requiresApproval: rawEvent.requires_approval,
          placeId: rawEvent.place_id || (rawEvent as any).placeId || null,
        };

        // Check if current user is creator
        if (userId === (mappedEvent.createdBy.id)) {
          mappedEvent.role = 'created';
        } else {
          // Check if user is participant
          const isParticipant = await supabaseService.isParticipant(id, userId || '');
          mappedEvent.role = isParticipant ? 'joined' : 'invited'; // invited as fallback for "not joined"
        }

        // If current user is creator, use updated local profile data for faster/accurate avatar display
        if (userId === mappedEvent.createdBy.id && currentUser) {
          mappedEvent.createdBy.name = currentUser.display_name || mappedEvent.createdBy.name;
          mappedEvent.createdBy.avatar_url = currentUser.avatar_url || mappedEvent.createdBy.avatar_url;
        }

        setEvent(mappedEvent);
        setHasJoined(mappedEvent.role === 'joined');
        setParticipantsState(mappedEvent.participants);
      }
    } catch (error) {
      console.error('Error loading event by ID:', error);
    } finally {
      setIsLoadingEvent(false);
    }
  };

  // Fetch participants when event is loaded
  useEffect(() => {
    if (event?.id) {
      const fetchParticipants = async () => {
        try {
          const participants = await supabaseService.getEventParticipants(event.id);
          const mapped: ProfilePreviewUser[] = participants.map((p: any) => ({
            id: p.user?.id || p.user_id,
            display_name: p.user?.display_name || 'Unknown',
            avatar_url: p.user?.avatar_url,
            favorite_sports: p.user?.favorite_sports || [],
          }));
          setParticipantsList(mapped);
        } catch (error) {
          console.error('Error loading participants on mount:', error);
        }
      };
      fetchParticipants();
    }
  }, [event?.id]);

  // Fetch location photo when event is loaded
  useEffect(() => {
    const fetchLocationPhoto = async () => {
      if (!event?.placeId) {
        setLocationPhoto(null);
        return;
      }

      try {
        setLoadingPhoto(true);
        const details = await placesApiService.getPlaceDetails(event.placeId);
        if (details?.photos && details.photos.length > 0) {
          const photoUrl = placesApiService.getPlacePhotoUrl(details.photos[0].photoReference, 800, 600);
          setLocationPhoto(photoUrl);
        } else {
          setLocationPhoto(null);
        }
      } catch (error) {
        console.error('Error fetching location photo for details:', error);
        setLocationPhoto(null);
      } finally {
        setLoadingPhoto(false);
      }
    };

    fetchLocationPhoto();
  }, [event?.placeId]);

  const handleBack = () => {
    navigation.goBack();
  };

  const sendJoinRequest = async () => {
    if (!event) return;
    if (!userId) {
      Alert.alert(t.common.error, loginRequiredMessage);
      return;
    }
    if (requestPending) {
      Alert.alert(t.eventDetails.requestAccess, t.eventDetails.requestPending);
      return;
    }
    if (!event.createdBy?.id) {
      Alert.alert(t.common.error, t.eventDetails.errorMessage);
      return;
    }

    try {
      setIsProcessing(true);
      await notificationService.sendNotificationWithStorage(event.createdBy.id, {
        title: t.eventDetails.requestAccess,
        body: `${currentUser?.display_name || 'Someone'} wants to join "${event.name}".`,
        type: 'event_updated',
        data: {
          eventId: event.id,
          requesterId: userId,
          requesterName: currentUser?.display_name,
        },
      });
      setRequestPending(true);
      Alert.alert(t.common.success, t.eventDetails.requestSent);
    } catch (error) {
      console.error('Failed to send join request:', error);
      Alert.alert(t.common.error, t.eventDetails.errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const performJoin = async () => {
    if (!event) return;
    if (!userId) {
      Alert.alert(t.common.error, loginRequiredMessage);
      return;
    }

    if (participantsInfo && participantsInfo.max > 0 && participantsInfo.current >= participantsInfo.max) {
      Alert.alert(t.common.error, t.eventDetails.eventFull);
      return;
    }

    try {
      setIsProcessing(true);
      const joined = await supabaseService.joinEvent(event.id, userId);
      if (joined) {
        setHasJoined(true);
        setParticipantsState(prev =>
          prev
            ? { ...prev, current: Math.min(prev.current + 1, prev.max) }
            : prev
        );
        Alert.alert(t.common.success, t.eventDetails.joinSuccess);
      } else {
        Alert.alert(t.common.error, t.eventDetails.errorMessage);
      }
    } catch (error) {
      console.error('Failed to join event:', error);
      Alert.alert(t.common.error, t.eventDetails.errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const performLeave = async () => {
    if (!event || !eventIdFromParams) return;
    if (!userId) {
      Alert.alert(t.common.error, loginRequiredMessage);
      return;
    }
    try {
      setIsProcessing(true);
      const result = await enhancedEventService.leaveEvent(eventIdFromParams);
      if (result.success) {
        setHasJoined(false);
        setParticipantsState(prev =>
          prev
            ? { ...prev, current: Math.max(prev.current - 1, 0) }
            : prev
        );
        Alert.alert(t.common.success, t.myEvents.leaveEventSuccess);
        // Refresh event data to ensure consistency
        loadEventById(eventIdFromParams);
      } else {
        Alert.alert(t.common.error, result.error || t.eventDetails.errorMessage);
      }
    } catch (error) {
      console.error('Failed to leave event:', error);
      Alert.alert(t.common.error, t.eventDetails.errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJoinEvent = () => {
    if (!event) return;
    if (event.requiresApproval) {
      sendJoinRequest();
      return;
    }

    Alert.alert(
      t.eventDetails.joinGame,
      t.eventDetails.joinPrompt.replace('{name}', event?.name ?? ''),
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.confirm,
          onPress: performJoin,
        },
      ]
    );
  };

  const handleLeaveEvent = () => {
    const leaveTxt = t.myEvents.leaveEventConfirm || 'Leave';
    const cancelTxt = t.common?.cancel || 'Cancel';

    console.log('DEBUG: handleLeaveEvent alert shown');
    console.log('DEBUG: Leave Label:', leaveTxt);
    console.log('DEBUG: Cancel Label:', cancelTxt);

    Alert.alert(
      '[DEBUG] ' + (t.eventDetails.leaveGame || 'Leave Game'),
      (t.myEvents.leaveEventMessage || 'Do you want to leave "{name}"?').replace('{name}', event?.name ?? ''),
      [
        {
          text: cancelTxt,
          style: 'cancel',
        },
        {
          text: leaveTxt,
          style: 'destructive',
          onPress: () => {
            console.log('DEBUG: Leave button pressed');
            performLeave();
          },
        },
      ]
    );
  };

  const handleChatPress = () => {
    navigation.navigate(ROUTES.GAME_CHAT, { game: event });
  };

  const handleShareEvent = async () => {
    try {
      if (!event) return;
      const formattedDate = formatEventDate(event.startTime, locale, {
        today: t.myEvents.groupLabels.TODAY,
        tomorrow: t.myEvents.groupLabels.TOMORROW,
      });
      const message = t.eventDetails.shareMessage
        .replace('{name}', event.name)
        .replace('{location}', event.location.name)
        .replace('{date}', formattedDate);
      const result = await Share.share({
        message,
      });
      if (result.action === Share.sharedAction) {
        Alert.alert(t.common.success, t.eventDetails.shareSuccess);
      }
    } catch (error) {
      Alert.alert(t.common.error, t.eventDetails.shareError);
    }
  };

  const handleViewLocation = () => {
    Alert.alert(t.eventDetails.viewLocationTitle, t.eventDetails.viewLocationMessage);
  };

  const handleViewParticipants = async () => {
    if (!event?.id) return;
    try {
      const participants = await supabaseService.getEventParticipants(event.id);
      const mapped: ProfilePreviewUser[] = participants.map((p: any) => ({
        id: p.user?.id || p.user_id,
        display_name: p.user?.display_name || 'Unknown',
        avatar_url: p.user?.avatar_url,
        favorite_sports: p.user?.favorite_sports || [],
      }));
      setParticipantsList(mapped);
      setShowParticipantsModal(true);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const handleUserPress = (user: ProfilePreviewUser) => {
    setShowParticipantsModal(false);
    setSelectedUser(user);
  };

  const handleViewFullProfile = (userId: string) => {
    setSelectedUser(null);
    navigation.navigate(ROUTES.PROFILE, { userId });
  };

  const handleManageEvent = () => {
    if (Platform.OS === 'android') {
      // Android only supports 3 buttons. We split into two steps or use a different approach.
      Alert.alert(
        t.eventDetails.manageEvent,
        t.eventDetails.manageOptions,
        [
          {
            text: t.eventDetails.rescheduleEvent,
            onPress: () => setShowReschedulePicker(true),
          },
          {
            text: t.eventDetails.deleteEvent,
            onPress: handleDeleteEvent,
            style: 'destructive',
          },
          {
            text: t.common?.cancel || 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } else {
      // iOS supports more buttons
      Alert.alert(
        t.eventDetails.manageEvent,
        t.eventDetails.manageOptions,
        [
          {
            text: t.eventDetails.rescheduleEvent,
            onPress: () => setShowReschedulePicker(true),
          },
          {
            text: t.eventDetails.cancelEvent,
            onPress: handleCancelEvent,
            style: 'destructive',
          },
          {
            text: t.eventDetails.deleteEvent,
            onPress: handleDeleteEvent,
            style: 'destructive',
          },
          {
            text: t.common?.cancel || 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  const handleReschedule = async (event: any, selectedDate?: Date) => {
    setShowReschedulePicker(Platform.OS === 'ios');
    if (selectedDate && eventIdFromParams) {
      setNewStartTime(selectedDate);

      Alert.alert(
        t.eventDetails.rescheduleEvent,
        t.eventDetails.confirmReschedule,
        [
          { text: t.common?.cancel || 'Cancel', style: 'cancel' },
          {
            text: t.common?.confirm || 'OK',
            onPress: async () => {
              setIsProcessing(true);
              const result = await enhancedEventService.updateEvent(eventIdFromParams, {
                start_time: selectedDate.toISOString()
              });
              setIsProcessing(false);

              if (result.success) {
                Alert.alert(t.common?.success || 'Success', 'Event rescheduled successfully');
                loadEventById(eventIdFromParams);
              } else {
                Alert.alert(t.common?.error || 'Error', result.error || 'Failed to reschedule event');
              }
            }
          }
        ]
      );
    }
  };

  const handleCancelEvent = () => {
    Alert.alert(
      t.eventDetails.cancelEvent,
      t.eventDetails.confirmCancel,
      [
        { text: t.common?.cancel || 'Cancel', style: 'cancel' },
        {
          text: t.common?.confirm || 'OK',
          onPress: async () => {
            if (eventIdFromParams) {
              setIsProcessing(true);
              const result = await enhancedEventService.cancelEvent(eventIdFromParams);
              setIsProcessing(false);
              if (result.success) {
                Alert.alert(t.common?.success || 'Success', 'Event cancelled');
                navigation.goBack();
              } else {
                Alert.alert(t.common?.error || 'Error', result.error || 'Failed to cancel event');
              }
            }
          }
        }
      ]
    );
  };

  const handleDeleteEvent = () => {
    Alert.alert(
      t.eventDetails.deleteEvent,
      t.eventDetails.confirmDelete,
      [
        { text: t.common?.cancel || 'Cancel', style: 'cancel' },
        {
          text: t.eventDetails.deleteEvent,
          style: 'destructive',
          onPress: async () => {
            if (eventIdFromParams) {
              setIsProcessing(true);
              const result = await enhancedEventService.deleteEvent(eventIdFromParams);
              setIsProcessing(false);
              if (result.success) {
                Alert.alert(t.common?.success || 'Success', 'Event deleted permanently');
                navigation.goBack();
              } else {
                Alert.alert(t.common?.error || 'Error', result.error || 'Failed to delete event');
              }
            }
          }
        }
      ]
    );
  };

  if (isLoadingEvent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={[styles.errorTitle, { marginTop: 16 }]}>{t.common.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#D1D5DB" />
          <Text style={styles.errorTitle}>{t.eventDetails.errorTitle}</Text>
          <Text style={styles.errorMessage}>
            {t.eventDetails.errorMessage}
          </Text>
          <TouchableOpacity style={styles.errorButton} onPress={handleBack}>
            <Text style={styles.errorButtonText}>{t.eventDetails.errorButton}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const participantsInfo = participantsState || event.participants;
  const isCreator = event.role === 'created';
  const isPrivateEvent = !!event.requiresApproval;
  const isEventFull =
    participantsInfo ? (participantsInfo.max > 0 && participantsInfo.current >= participantsInfo.max) : false;
  const sportColor = SPORT_COLORS[event.activity] || '#FFD700';

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <SafeAreaView style={styles.topBarSafeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.eventDetails.title}</Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareEvent}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Banner Section (Like EventCard) */}
        <View style={styles.bannerContainer}>
          {locationPhoto ? (
            <Image
              source={{ uri: locationPhoto }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.bannerPlaceholder, { backgroundColor: sportColor + '10' }]}>
              <Ionicons
                name={getSportEmoji(event.activity) === '🏀' ? 'basketball' : 'fitness'}
                size={64}
                color={sportColor}
                style={{ opacity: 0.3 }}
              />
            </View>
          )}

          {/* Sport Icon Overlay */}
          <View style={[styles.sportIconBadge, { backgroundColor: sportColor }]}>
            <Text style={styles.sportEmojiOverlay}>{getSportEmoji(event.activity)}</Text>
          </View>
        </View>

        {/* Event Content Info */}
        <View style={styles.headerCard}>
          <Text style={styles.eventName}>{event.name}</Text>
          <Text style={styles.eventActivity}>{event.activity}</Text>

          {/* Time Until Event */}
          <View style={styles.timeUntilBadge}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.timeUntilText}>{relativeStart}</Text>
          </View>

          {/* Creator Badge */}
          {isCreator && (
            <View style={styles.creatorBadge}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.creatorBadgeText}>{t.eventDetails.creatorBadge}</Text>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="people" size={24} color="#FFD700" />
            <Text style={styles.statValue}>
              {participantsInfo?.current ?? 0}/{participantsInfo?.max ?? 0}
            </Text>
            <Text style={styles.statLabel}>{t.eventDetails.players}</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="location" size={24} color="#FFD700" />
            <Text style={styles.statValue}>{event.location.distance?.toFixed(1) || '—'} km</Text>
            <Text style={styles.statLabel}>{t.eventDetails.distanceLabel}</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
            <Text style={styles.statValue}>{t.eventDetails.skillLevelAll}</Text>
            <Text style={styles.statLabel}>{t.eventDetails.skillLevel}</Text>
          </View>
        </View>

        {/* Date & Time Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={20} color="#1F2937" />
            <Text style={styles.sectionTitle}>{t.eventDetails.gameInformation}</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.eventDetails.date}</Text>
              <Text style={styles.detailValue}>
                {formatEventDate(event.startTime, locale, {
                  today: t.myEvents.groupLabels.TODAY,
                  tomorrow: t.myEvents.groupLabels.TOMORROW,
                })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.eventDetails.startTime}</Text>
              <Text style={styles.detailValue}>{formatEventTime(event.startTime, locale)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.eventDetails.endTime}</Text>
              <Text style={styles.detailValue}>{formatEventTime(event.endTime, locale)}</Text>
            </View>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color="#1F2937" />
            <Text style={styles.sectionTitle}>{t.eventDetails.location}</Text>
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.locationName}>{event.location.name}</Text>
            <Text style={styles.locationAddress}>{event.location.address}</Text>
            <TouchableOpacity
              style={styles.viewMapButton}
              onPress={handleViewLocation}
              activeOpacity={0.7}
            >
              <Ionicons name="map" size={16} color="#FFD700" />
              <Text style={styles.viewMapText}>{t.eventDetails.viewOnMap}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Participants Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={20} color="#1F2937" />
            <Text style={styles.sectionTitle}>{t.eventDetails.participantsSection}</Text>
          </View>
          <View style={styles.sectionContent}>
            {/* Participant Thumbnails Row */}
            {participantsList.length > 0 && (
              <View style={styles.participantsThumbnails}>
                {participantsList.slice(0, 5).map((p, idx) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.thumbnailWrapper, { marginLeft: idx === 0 ? 0 : -12, zIndex: 10 - idx }]}
                    onPress={() => setSelectedUser(p)}
                    activeOpacity={0.8}
                  >
                    {p.avatar_url ? (
                      <Image source={{ uri: p.avatar_url }} style={styles.thumbnailImage} />
                    ) : (
                      <View style={styles.thumbnailPlaceholder}>
                        <Text style={styles.thumbnailInitials}>
                          {p.display_name.slice(0, 1).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
                {participantsList.length > 5 && (
                  <View style={[styles.thumbnailMore, { marginLeft: -12, zIndex: 0 }]}>
                    <Text style={styles.thumbnailMoreText}>+{participantsList.length - 5}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.participantsInfo}>
              <View style={styles.participantsStat}>
                <Text style={styles.participantsNumber}>
                  {participantsInfo?.current ?? 0}
                </Text>
                <Text style={styles.participantsLabel}>{t.eventDetails.joinedLabel}</Text>
              </View>
              <View style={styles.participantsDivider} />
              <View style={styles.participantsStat}>
                <Text style={styles.participantsNumber}>
                  {Math.max(
                    (participantsInfo?.max ?? 0) - (participantsInfo?.current ?? 0),
                    0
                  )}
                </Text>
                <Text style={styles.participantsLabel}>{t.eventDetails.spotsLeft}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewParticipantsButton}
              onPress={handleViewParticipants}
              activeOpacity={0.7}
            >
              <Text style={styles.viewParticipantsText}>{t.eventDetails.viewParticipants}</Text>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description Section */}
        {event.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color="#1F2937" />
              <Text style={styles.sectionTitle}>{t.eventDetails.description}</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.descriptionText}>{event.description}</Text>
            </View>
          </View>
        )}

        {/* Organizer Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color="#1F2937" />
            <Text style={styles.sectionTitle}>{t.eventDetails.organizer}</Text>
          </View>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.organizerCard}
              onPress={() => setSelectedUser({
                id: event.createdBy.id,
                display_name: event.createdBy.name,
                avatar_url: event.createdBy.avatar_url,
                favorite_sports: [] // We don't have this but it's okay for preview
              })}
              activeOpacity={0.8}
            >
              <View style={styles.organizerAvatar}>
                {event.createdBy.avatar_url ? (
                  <Image source={{ uri: event.createdBy.avatar_url }} style={styles.organizerAvatarImage} />
                ) : (
                  <Text style={styles.organizerInitials}>
                    {event.createdBy.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={styles.organizerInfo}>
                <Text style={styles.organizerName}>{event.createdBy.name}</Text>
                <Text style={styles.organizerRole}>{t.eventDetails.organizerRole}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Buttons */}
      <SafeAreaView style={styles.actionSafeArea}>
        <View style={styles.actionContainer}>
          {event.chatEnabled && (
            <TouchableOpacity
              style={styles.chatButton}
              onPress={handleChatPress}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#1F2937" />
              <Text style={styles.chatButtonText}>{t.eventDetails.chat}</Text>
            </TouchableOpacity>
          )}

          {isCreator ? (
            <TouchableOpacity
              style={styles.manageButton}
              onPress={handleManageEvent}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={20} color="#000000" />
              <Text style={styles.manageButtonText}>{t.eventDetails.manageEvent}</Text>
            </TouchableOpacity>
          ) : hasJoined ? (
            <TouchableOpacity
              style={styles.leaveButton}
              onPress={handleLeaveEvent}
              activeOpacity={0.7}
            >
              <Ionicons name="exit-outline" size={20} color="#FFFFFF" />
              <Text style={styles.leaveButtonText}>{t.eventDetails.leaveGame}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.joinButton,
                ((isEventFull && !isPrivateEvent) || isProcessing || (isPrivateEvent && requestPending)) &&
                styles.joinButtonDisabled,
              ]}
              onPress={handleJoinEvent}
              activeOpacity={0.7}
              disabled={
                isProcessing ||
                (!isPrivateEvent && isEventFull) ||
                (isPrivateEvent && requestPending)
              }
            >
              <Ionicons name="add-circle-outline" size={20} color="#000000" />
              <Text style={styles.joinButtonText}>
                {isPrivateEvent
                  ? requestPending
                    ? t.eventDetails.requestPending
                    : t.eventDetails.requestAccess
                  : isEventFull
                    ? t.eventDetails.eventFull
                    : t.eventDetails.joinGame}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {/* Participants List Modal */}
      <Modal
        visible={showParticipantsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowParticipantsModal(false)}
      >
        <View style={styles.participantsModalOverlay}>
          <View style={styles.participantsModalContent}>
            <View style={styles.participantsModalHeader}>
              <Text style={styles.participantsModalTitle}>
                {t.eventDetails.participantsSection}
              </Text>
              <TouchableOpacity
                onPress={() => setShowParticipantsModal(false)}
                style={styles.participantsModalClose}
              >
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.participantsListContainer}>
              {participantsList.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.participantItem}
                  onPress={() => handleUserPress(user)}
                  activeOpacity={0.7}
                >
                  {user.avatar_url ? (
                    <Image source={{ uri: user.avatar_url }} style={styles.participantAvatar} />
                  ) : (
                    <View style={styles.participantAvatarPlaceholder}>
                      <Text style={styles.participantInitials}>
                        {user.display_name.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.participantName}>{user.display_name}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
              {participantsList.length === 0 && (
                <Text style={styles.noParticipantsText}>
                  {(t.eventDetails as any).noParticipants || 'No participants yet'}
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Profile Preview Modal */}
      <ProfilePreviewModal
        visible={!!selectedUser}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onViewFullProfile={handleViewFullProfile}
      />

      {showReschedulePicker && (
        <DateTimePicker
          value={new Date(newStartTime)}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleReschedule}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  // Top Bar Styles
  topBarSafeArea: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 5,
  },
  topBar: {
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  // Header Card
  headerCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingTop: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bannerContainer: {
    height: 220, // Taller for details screen
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
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  sportEmojiOverlay: {
    fontSize: 20,
  },
  eventName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  eventActivity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  timeUntilBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    marginTop: 8,
  },
  timeUntilText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
  },
  creatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    marginTop: 8,
  },
  creatorBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Section Styles
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionContent: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  // Location
  locationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  viewMapText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  // Participants
  participantsInfo: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  participantsStat: {
    flex: 1,
    alignItems: 'center',
  },
  participantsNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  participantsLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  participantsDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  viewParticipantsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  viewParticipantsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  // Description
  descriptionText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  // Organizer
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  organizerInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  // New Thumbnail Styles
  participantsThumbnails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  thumbnailWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  thumbnailMore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  thumbnailMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  organizerRole: {
    fontSize: 13,
    color: '#6B7280',
  },
  // Action Buttons
  actionSafeArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  joinButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  joinButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  leaveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  manageButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  bottomSpacing: {
    height: 20,
  },
  // Participants Modal Styles
  participantsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  participantsModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 30,
  },
  participantsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  participantsModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  participantsModalClose: {
    padding: 4,
  },
  participantsListContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  participantAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
  },
  participantAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  participantName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 12,
  },
  noParticipantsText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
