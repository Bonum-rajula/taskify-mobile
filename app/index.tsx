// app/index.tsx
import { View } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { theme } from '@/constants/theme';

export default function IndexScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <Typography variant="body" color={theme.colors.textMuted}>
        (Main App Content Will Go Here)
      </Typography>
    </View>
  );
}