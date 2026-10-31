// Root of the app: loads fonts, content and the database, then shows the screens.
import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold, useFonts } from '@expo-google-fonts/figtree';
import { SourceSerif4_400Regular, SourceSerif4_600SemiBold } from '@expo-google-fonts/source-serif-4';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/theme';
import { ReminderSync } from '@/components/ReminderSync';
import { CatalogProvider } from '@/hooks/useCatalog';

export default function RootLayout() {
  // Load the two typefaces first (Figtree for the app, Source Serif for prayers). Show nothing until they are ready.
  const [loaded] = useFonts({ Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold, SourceSerif4_400Regular, SourceSerif4_600SemiBold });
  if (!loaded) return null;
  // Make the novena list available to every screen, then show whichever screen the person is on.
  return (
    <CatalogProvider>
      <ReminderSync />
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface.page } }} />
    </CatalogProvider>
  );
}
