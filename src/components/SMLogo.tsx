import React from 'react';
import { View, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';

interface SMLogoProps {
    size?: number;
    style?: ViewStyle;
    imageStyle?: ImageStyle;
}

const SMLogo: React.FC<SMLogoProps> = ({ size = 70, style, imageStyle }) => (
    <View style={[styles.container, { width: size, height: size }, style]}>
        <Image
            source={require('../../assets/logo.png')}
            style={[styles.logo, { width: size, height: size }, imageStyle]}
            resizeMode="contain"
        />
    </View>
);

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        borderRadius: 8,
    }
});

export default SMLogo;
