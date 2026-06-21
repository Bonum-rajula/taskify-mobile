// app/(app)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { CheckSquare, User } from 'lucide-react-native';
import { theme } from '@/constants/theme';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerShown: false, 
      }}
    >
      <Tabs.Screen
        name="tasks/index" // Strictly target the index file
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      {/* Explicitly hide the dynamic route from generating a rogue tab */}
      <Tabs.Screen
        name="tasks/[id]"
        options={{ href: null }}
      />
    </Tabs>
  );
}