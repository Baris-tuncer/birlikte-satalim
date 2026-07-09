import React from 'react';
import { StyleSheet, Text, View, Pressable, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/landing.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.primaryButtonText}>Giriş Yap</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.secondaryButtonText}>Kayıt Ol</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundImage: {
    width,
    height,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 60,
    left: Spacing.xl,
    right: Spacing.xl,
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadows.md,
  },
  primaryButtonText: {
    ...Typography.headline,
    color: Colors.text.inverse,
  },
  secondaryButton: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  secondaryButtonText: {
    ...Typography.headline,
    color: Colors.accent,
  },
});
