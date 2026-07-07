import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/Theme';

interface AnimatedSplashProps {
  children: React.ReactNode;
}

export default function AnimatedSplash({ children }: AnimatedSplashProps) {
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;

  const fadeOut = useCallback(() => {
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

  useEffect(() => {
    fadeOut();
  }, [fadeOut]);

  if (!visible) {
    return <>{children}</>;
  }

  return (
    <View style={styles.wrapper}>
      {children}
      <Animated.View style={[styles.splash, { opacity }]}>
        <View style={styles.content}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>
            Gayrimenkul danışmanlarının{'\n'}iş birliği platformu
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
    backgroundColor: Colors.accent,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: Spacing.xl,
  },
  tagline: {
    ...Typography.title3,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 28,
  },
});
