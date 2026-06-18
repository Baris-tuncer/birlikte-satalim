import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '@/constants/Theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.borderLight,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 88 : 64,
          ...Shadows.sm,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'İlanlar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
          tabBarLabel: () => (
            <Text style={styles.tabLabel}>İlanlar</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="demands"
        options={{
          title: 'Talepler',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
          tabBarLabel: () => (
            <Text style={styles.tabLabel}>Talepler</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portföyüm',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
          tabBarLabel: () => (
            <Text style={styles.tabLabel}>Portföyüm</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
          tabBarLabel: () => (
            <Text style={styles.tabLabel}>Profil</Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    color: Colors.text.primary,
  },
});
