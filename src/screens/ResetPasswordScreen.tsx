import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Animated,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { ROUTES } from '../navigation/types';

export default function ResetPasswordScreen() {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const { resetPassword } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleResetPassword = async () => {
        if (!password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const result = await resetPassword(password);
            if (result.success) {
                Alert.alert(
                    'Success',
                    'Your password has been reset successfully. You can now log in with your new password.',
                    [{ text: 'OK', onPress: () => navigation.navigate(ROUTES.AUTH) }]
                );
            } else {
                Alert.alert('Error', result.error?.message || 'Failed to reset password');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <View style={styles.logoCircle}>
                                    <Text style={styles.logoText}>Sm</Text>
                                </View>
                            </View>
                            <Text style={styles.title}>Reset Password</Text>
                            <Text style={styles.subtitle}>Enter your new password below to secure your account.</Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>New Password</Text>
                                <View style={styles.passwordInputContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="Minimal 6 characters"
                                        secureTextEntry={!showPassword}
                                        placeholderTextColor="#9CA3AF"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={20}
                                            color="#6B7280"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Confirm New Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Repeat your new password"
                                    secureTextEntry={!showPassword}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.button, isLoading && styles.buttonDisabled]}
                                onPress={handleResetPassword}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#000000" />
                                ) : (
                                    <>
                                        <Text style={styles.buttonText}>Update Password</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#000000" style={{ marginLeft: 8 }} />
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => navigation.navigate(ROUTES.AUTH)}
                            >
                                <Text style={styles.backButtonText}>Back to Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        width: '100%',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    logoText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#000000',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 16,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
    },
    eyeIcon: {
        padding: 14,
    },
    button: {
        backgroundColor: '#FFD700',
        borderRadius: 16,
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
    },
    backButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6B7280',
    },
});
