import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/Theme';

const SPLASH_IMAGE_URI =
  'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1080&q=80';

interface AnimatedSplashProps {
  children: React.ReactNode;
}

export default function AnimatedSplash({ children }: AnimatedSplashProps) {
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;

  const fadeOut = useCallback(() => {
    // Hold visible for a moment, then fade out
    Animated.sequence([
      Animated.delay(2000),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  }, [opacity]);

  // If image takes too long, fade out anyway after 4 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      fadeOut();
    }, 4000);
    return () => clearTimeout(timeout);
  }, [fadeOut]);

  const handleImageLoad = useCallback(() => {
    // Fade in the image on top of the solid background
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      fadeOut();
    });
  }, [imageOpacity, fadeOut]);

  if (!visible) {
    return <>{children}</>;
  }

  return (
    <View style={styles.wrapper}>
      {children}
      <Animated.View style={[styles.splash, { opacity }]}>
        {/* Solid color background is always visible */}

        {/* Image fades in once loaded */}
        <Animated.Image
          source={{ uri: SPLASH_IMAGE_URI }}
          style={[styles.image, { opacity: imageOpacity }]}
          onLoad={handleImageLoad}
        />

        {/* Dark overlay + text */}
        <View style={styles.overlay}>
          <Text style={styles.appName}>Beraber Satalim</Text>
          <Text style={styles.tagline}>
            Portföyünüz burada buluşuyor
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  splash: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    backgroundColor: Colors.primary,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 37, 64, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  appName: {
    ...Typography.largeTitle,
    color: Colors.text.inverse,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...Typography.subhead,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
