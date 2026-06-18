import { Stack } from 'expo-router';
import { Colors } from '@/constants/Theme';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text.primary,
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  );
}
