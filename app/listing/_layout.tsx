import { Stack } from 'expo-router';
import { Colors } from '@/constants/Theme';

export default function ListingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  );
}
