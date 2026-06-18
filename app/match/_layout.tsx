import { Stack } from 'expo-router';
import { Colors } from '@/constants/Theme';

export default function MatchLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  );
}
