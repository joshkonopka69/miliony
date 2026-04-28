import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Image,
    Animated,
} from 'react-native';
import { useTranslation } from '../contexts/TranslationContext';

export interface ProfilePreviewUser {
    id: string;
    display_name: string;
    avatar_url?: string;
    favorite_sports?: string[];
}

interface ProfilePreviewModalProps {
    visible: boolean;
    user: ProfilePreviewUser | null;
    onClose: () => void;
    onViewFullProfile: (userId: string) => void;
}

// Sport emoji mapping
const SPORT_EMOJI: Record<string, string> = {
    basketball: '🏀',
    football: '⚽',
    soccer: '⚽',
    tennis: '🎾',
    running: '🏃',
    cycling: '🚴',
    swimming: '🏊',
    gym: '💪',
    volleyball: '🏐',
    baseball: '⚾',
    hockey: '🏒',
    golf: 'golf-outline',
    yoga: '🧘',
    pilates: '🤸',
    weightlifting: '🏋️',
    crossfit: '💪',
    rock_climbing: '🧗',
    surfing: '🏄',
    skiing: '⛷️',
    snowboarding: '🏂',
};

export default function ProfilePreviewModal({
    visible,
    user,
    onClose,
    onViewFullProfile,
}: ProfilePreviewModalProps) {
    const { t } = useTranslation();

    if (!user) return null;

    const initials = user.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const handleViewProfile = () => {
        onClose();
        onViewFullProfile(user.id);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    style={styles.modal}
                    activeOpacity={1}
                    onPress={() => { }}
                >
                    {/* Close Button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Text style={{fontSize: 18, color: '#6B7280'}}>✕</Text>
                    </TouchableOpacity>

                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        {user.avatar_url ? (
                            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitials}>{initials}</Text>
                            </View>
                        )}
                    </View>

                    {/* Name */}
                    <Text style={styles.userName}>{user.display_name}</Text>

                    {/* Sports */}
                    {user.favorite_sports && user.favorite_sports.length > 0 && (
                        <View style={styles.sportsContainer}>
                            {user.favorite_sports.slice(0, 4).map((sport, index) => (
                                <View key={index} style={styles.sportTag}>
                                    <Text style={styles.sportEmoji}>
                                        {SPORT_EMOJI[sport.toLowerCase()] || '🏆'}
                                    </Text>
                                    <Text style={styles.sportName}>{sport}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* View Profile Button */}
                    <TouchableOpacity
                        style={styles.viewProfileButton}
                        onPress={handleViewProfile}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.viewProfileText}>
                            {t.profile?.viewProfile || 'View Full Profile'}
                        </Text>
                        <Text style={{fontSize: 16, color: '#000000'}}>•</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 320,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarContainer: {
        marginTop: 8,
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000000',
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
        textAlign: 'center',
    },
    sportsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    sportTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    sportEmoji: {
        fontSize: 14,
    },
    sportName: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    viewProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD700',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 14,
        gap: 8,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    viewProfileText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000000',
    },
});
