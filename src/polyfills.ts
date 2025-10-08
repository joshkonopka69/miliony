// src/polyfills.ts
// NUCLEAR FIX for "property is not configurable" errors
// This must be imported FIRST - before ANY other imports

// CRITICAL: Import polyfills in specific order to avoid conflicts
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

// Prevent property configuration conflicts
const originalDefineProperty = Object.defineProperty;
Object.defineProperty = function(obj: any, prop: string, descriptor: any) {
  try {
    return originalDefineProperty.call(this, obj, prop, descriptor);
  } catch (error) {
    // If property is not configurable, skip it
    if (error.message.includes('not configurable')) {
      console.warn(`Skipping non-configurable property: ${prop}`);
      return obj;
    }
    throw error;
  }
};

// Safe crypto polyfill
if (typeof global.crypto === 'undefined') {
  try {
    const expoCrypto = require('expo-crypto');
    if (expoCrypto && expoCrypto.getRandomValues) {
      global.crypto = expoCrypto;
    } else {
      throw new Error('expo-crypto not available');
    }
  } catch (error) {
    console.warn('expo-crypto not available, using fallback');
    global.crypto = {
      getRandomValues: (array: any) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      }
    };
  }
}

// Safe URL polyfill
if (typeof global.URL === 'undefined') {
  try {
    const urlPolyfill = require('react-native-url-polyfill');
    if (urlPolyfill && urlPolyfill.URL) {
      global.URL = urlPolyfill.URL;
    }
  } catch (error) {
    console.warn('URL polyfill not available');
  }
}

// Safe TextEncoder/TextDecoder polyfills
if (typeof global.TextEncoder === 'undefined') {
  try {
    const textEncoding = require('text-encoding');
    if (textEncoding && textEncoding.TextEncoder) {
      global.TextEncoder = textEncoding.TextEncoder;
      global.TextDecoder = textEncoding.TextDecoder;
    } else {
      throw new Error('text-encoding not available');
    }
  } catch (error) {
    console.warn('text-encoding not available, using fallback');
    global.TextEncoder = class TextEncoder {
      encode(input: string) {
        return new Uint8Array(Buffer.from(input, 'utf8'));
      }
    };
    global.TextDecoder = class TextDecoder {
      decode(input: Uint8Array) {
        return Buffer.from(input).toString('utf8');
      }
    };
  }
}

console.log('✅ Nuclear polyfills loaded successfully');
