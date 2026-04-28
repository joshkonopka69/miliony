import React, { useEffect, useRef, createContext, useContext, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
} from 'react-native';

const { width } = Dimensions.get('window');

// Clean SportsMap Modal Colors - Black/White/Yellow theme
const MODAL_COLORS = {
    overlay: 'rgba(0, 0, 0, 0.5)',
    background: '#FFFFFF',
    accent: '#FFD700',
    border: '#E5E5E5',
    text: '#000000',
    textSecondary: '#666666',
    cancelButton: '#F5F5F5',
    confirmButton: '#FFD700',
    destructiveButton: '#FF4444',
};

interface ConfirmationButton {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
}

interface ConfirmationOptions {
    title: string;
    message?: string;
    buttons?: ConfirmationButton[];
    icon?: string;
}

interface ConfirmationContextType {
    showConfirmation: (options: ConfirmationOptions) => void;
    hideConfirmation: () => void;
}

const ConfirmationContext = createContext<ConfirmationContextType | null>(null);

export function useConfirmation(): ConfirmationContextType {
    const context = useContext(ConfirmationContext);
    if (!context) {
        throw new Error('useConfirmation must be used within a ConfirmationProvider');
    }
    return context;
}

interface ConfirmationProviderProps {
    children: React.ReactNode;
}

export function ConfirmationProvider({ children }: ConfirmationProviderProps) {
    const [visible, setVisible] = useState(false);
    const [options, setOptions] = useState<ConfirmationOptions>({
        title: '',
        message: '',
        buttons: [],
    });

    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 65,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleAnim.setValue(0.9);
            opacityAnim.setValue(0);
        }
    }, [visible]);

    const showConfirmation = useCallback((newOptions: ConfirmationOptions) => {
        setOptions({
            ...newOptions,
            buttons: newOptions.buttons || [{ text: 'OK', style: 'default' }],
        });
        setVisible(true);
    }, []);

    const hideConfirmation = useCallback(() => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setVisible(false);
        });
    }, []);

    const handleButtonPress = (button: ConfirmationButton) => {
        hideConfirmation();
        if (button.onPress) {
            setTimeout(() => button.onPress?.(), 200);
        }
    };

    const getButtonStyle = (style?: string) => {
        switch (style) {
            case 'destructive':
                return styles.destructiveButton;
            case 'cancel':
                return styles.cancelButton;
            default:
                return styles.confirmButton;
        }
    };

    const getButtonTextStyle = (style?: string) => {
        switch (style) {
            case 'destructive':
                return styles.destructiveButtonText;
            case 'cancel':
                return styles.cancelButtonText;
            default:
                return styles.confirmButtonText;
        }
    };

    return (
        <ConfirmationContext.Provider value={{ showConfirmation, hideConfirmation }}>
            {children}
            <Modal
                visible={visible}
                transparent
                animationType="none"
                onRequestClose={hideConfirmation}
            >
                <TouchableWithoutFeedback onPress={hideConfirmation}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <Animated.View
                                style={[
                                    styles.modalContainer,
                                    {
                                        transform: [{ scale: scaleAnim }],
                                        opacity: opacityAnim,
                                    },
                                ]}
                            >
                                <View style={styles.modalContent}>
                                    {/* Yellow accent line at top */}
                                    <View style={styles.accentLine} />

                                    {/* Icon */}
                                    {options.icon && (
                                        <View style={styles.iconContainer}>
                                            <Text style={styles.icon}>{options.icon}</Text>
                                        </View>
                                    )}

                                    {/* Title */}
                                    <Text style={styles.title}>{options.title}</Text>

                                    {/* Message */}
                                    {options.message && (
                                        <Text style={styles.message}>{options.message}</Text>
                                    )}

                                    {/* Buttons */}
                                    <View style={styles.buttonsContainer}>
                                        {options.buttons?.map((button, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[styles.button, getButtonStyle(button.style)]}
                                                onPress={() => handleButtonPress(button)}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={[styles.buttonText, getButtonTextStyle(button.style)]}>
                                                    {button.text}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* Yellow bottom line */}
                                    <View style={styles.bottomLine} />
                                </View>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </ConfirmationContext.Provider>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: MODAL_COLORS.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContainer: {
        width: width - 48,
        maxWidth: 340,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: MODAL_COLORS.background,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 12,
    },
    modalContent: {
        padding: 24,
        paddingTop: 28,
        alignItems: 'center',
    },
    accentLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: MODAL_COLORS.accent,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: MODAL_COLORS.accent,
    },
    icon: {
        fontSize: 26,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: MODAL_COLORS.text,
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    message: {
        fontSize: 15,
        color: MODAL_COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonsContainer: {
        width: '100%',
        gap: 10,
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButton: {
        backgroundColor: MODAL_COLORS.confirmButton,
    },
    cancelButton: {
        backgroundColor: MODAL_COLORS.cancelButton,
        borderWidth: 1,
        borderColor: MODAL_COLORS.border,
    },
    destructiveButton: {
        backgroundColor: MODAL_COLORS.destructiveButton,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    confirmButtonText: {
        color: '#000000',
    },
    cancelButtonText: {
        color: MODAL_COLORS.text,
    },
    destructiveButtonText: {
        color: '#FFFFFF',
    },
    bottomLine: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: MODAL_COLORS.accent,
    },
});
