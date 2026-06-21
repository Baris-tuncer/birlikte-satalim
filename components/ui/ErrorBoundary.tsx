import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/Theme';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <Ionicons name="warning-outline" size={36} color={Colors.error} />
          </View>
          <Text style={styles.title}>
            {this.props.fallbackTitle ?? 'Bir Hata Oluştu'}
          </Text>
          <Text style={styles.subtitle}>
            Beklenmeyen bir sorun meydana geldi. Lütfen tekrar deneyin.
          </Text>
          {this.state.error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText} numberOfLines={6}>
                {this.state.error.message}
              </Text>
            </View>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              pressed && { opacity: 0.85 },
            ]}
            onPress={this.handleRetry}
          >
            <Ionicons name="refresh" size={18} color={Colors.text.inverse} />
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.error + '14',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.title3,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  errorBox: {
    backgroundColor: Colors.error + '0A',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.error + '28',
  },
  errorText: {
    ...Typography.caption1,
    color: Colors.error,
    fontFamily: 'SpaceMono',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
  },
  retryText: {
    ...Typography.headline,
    color: Colors.text.inverse,
  },
});
