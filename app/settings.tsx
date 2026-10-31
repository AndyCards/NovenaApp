// Settings: not designed yet. Placeholder so the route exists.
import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { Reveal } from '@/motion/Reveal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavBar } from '@/components/navigation/NavBar';
import { colors, screenMargin } from '@/constants/theme';
import { type } from '@/constants/typography';

export default function Settings() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.page }}>
      <NavBar title="Settings" onBack={() => router.back()} />
      <Reveal><Text style={[type.bodyLarge, { color: colors.text.secondary, padding: screenMargin }]}>Settings are not designed yet.</Text></Reveal>
    </SafeAreaView>
  );
}
