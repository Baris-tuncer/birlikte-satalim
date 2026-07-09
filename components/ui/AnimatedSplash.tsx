import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, View, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

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
        <Image
          source={require('@/assets/images/landing.jpg')}
          style={styles.landingImage}
          resizeMode="cover"
        />
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
    backgroundColor: '#FFFFFF',
  },
  landingImage: {
    width,
    height,
  },
});
