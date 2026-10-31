// Share: turns a saint card into an image. Intentions are never included.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, type ComponentRef } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/actions/Button';
import { NovenaImage } from '@/components/content/NovenaImage';
import { NavBar } from '@/components/navigation/NavBar';
import { colors, screenMargin } from '@/constants/theme';
import { type } from '@/constants/typography';
import { useCatalog } from '@/hooks/useCatalog';
import { shareCard } from '@/utils/shareImage';

export default function Share() {
  const { novenaId } = useLocalSearchParams<{ novenaId: string }>();
  const router = useRouter();
  const { novenaById } = useCatalog();
  // The card below is turned into a picture when Share is tapped. The person's intention is never on it.
  const ref = useRef<ComponentRef<typeof View>>(null);
  const novena = novenaById(novenaId);
  if (!novena) return null;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.page }}>
      <NavBar title="Share" onBack={() => router.back()} />
      <View style={{ padding: screenMargin, gap: 16 }}>
        <View ref={ref} collapsable={false} style={{ backgroundColor: colors.surface.page, gap: 8 }}>
          <NovenaImage image={novena.image} size="full" label={novena.title} style={{ width: '100%', height: 360 }} />
          <Text style={[type.titleCard, { color: colors.text.primary }]}>{novena.title}</Text>
          <Text style={[type.bodyLarge, { color: colors.text.body }]}>{novena.tagline}</Text>
        </View>
        <Button label="Share" onPress={() => shareCard(ref)} />
      </View>
    </SafeAreaView>
  );
}
