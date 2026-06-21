import { Stack } from 'expo-router';
import { Colors } from '@/constants/Theme';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text.primary,
        animation: 'fade',
      }}
    />
  );
}
