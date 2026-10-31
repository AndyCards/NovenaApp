// Home (Discover), built to match Figma Page 34:
// "Home · First-time user" (1227:56592) and "Home · Returning user · Continue praying" (1227:56659).
// Sections after the top ones come from the catalog's collections, so Home can be re-themed from the Excel sheet.
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CarouselIndicator } from '@/components/content/CarouselIndicator';
import { ContinueCard } from '@/components/content/ContinueCard';
import { FeastDayItem } from '@/components/content/FeastDayItem';
import { FeaturedNovenaCard } from '@/components/content/FeaturedNovenaCard';
import { HowItWorksCard } from '@/components/content/HowItWorksCard';
import { IntentionTile } from '@/components/content/IntentionTile';
import { NovenaCard } from '@/components/content/NovenaCard';
import { NovenaRow } from '@/components/content/NovenaRow';
import { SectionHeader } from '@/components/content/SectionHeader';
import { useRunMenu } from '@/components/overlays/useRunMenu';
import { HomeAppBar } from '@/components/navigation/HomeAppBar';
import { colors, screenMargin } from '@/constants/theme';
import { Reveal } from '@/motion/Reveal';
import { strings } from '@/copy/strings';
import type { Collection, Novena } from '@/content/types';
import { useCatalog } from '@/hooks/useCatalog';
import { useRuns } from '@/hooks/useNovenaRun';
import { todayString } from '@/utils/dateUtils';
import { upcomingFeasts } from '@/utils/feasts';

// Works out which card of a sideways carousel is showing, so the little dots can follow along.
const pageFrom = (e: NativeSyntheticEvent<NativeScrollEvent>, step: number) => Math.round(e.nativeEvent.contentOffset.x / step) + 1;

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { catalog, novenaById } = useCatalog();
  const runsApi = useRuns();
  const { runs, start, resume, loaded } = runsApi;
  const { openMenu, menus } = useRunMenu(runsApi);
  const [scrolled, setScrolled] = useState(false); // true once the page has scrolled, so the top bar can lift
  const [continuePage, setContinuePage] = useState(1);
  const [featuredPage, setFeaturedPage] = useState(1);

  // Novenas the person is praying right now. If there are any, they are a "returning" user and see the Continue cards first.
  const active = runs.filter((r) => r.status === 'active').map((r) => ({ run: r, novena: novenaById(r.novenaId) })).filter((x) => x.novena);
  const returning = active.length > 0;
  // Home's sections (favourites, mental health, etc.) come from the catalog, in the order set in the spreadsheet.
  const collections = [...catalog.collections].sort((a, b) => a.order - b.order);
  const novenasOf = (c: Collection) => c.novenaIds.map(novenaById).filter((n): n is Novena => !!n);
  const featured = collections.find((c) => c.layout === 'featured');
  const others = collections.filter((c) => c !== featured);
  const feasts = upcomingFeasts(catalog, todayString(), 4);
  const categories = [...catalog.categories].sort((a, b) => a.order - b.order);

  // Tapping a novena opens its page. "Start Novena" on a featured card starts it (or continues it) and opens today's prayer.
  const open = (n: Novena) => router.push(`/novena/${n.id}`);
  const busy = useRef(false); // stops a double tap from starting the same novena twice
  const startNovena = async (n: Novena) => {
    if (busy.current || !loaded) return;
    busy.current = true;
    try {
      // Already praying it (or paused)? Pick it up again instead of starting a second copy.
      const existing = runs.find((r) => r.novenaId === n.id && (r.status === 'active' || r.status === 'paused'));
      if (existing?.status === 'paused') await resume(existing.id);
      const runId = existing?.id ?? (await start(n.id));
      router.push(`/reader/${runId}/${existing?.continueDay ?? 1}`);
    } finally {
      busy.current = false;
    }
  };

  const continueWidth = width - 50; // 340 on a 390pt screen; the next card peeks in
  const featuredWidth = width - 2 * screenMargin;

  // The featured cards slide along by themselves every few seconds, and loop back to the first.
  // If the person touches the row, it stays still for a while so it never fights their finger.
  const featuredRef = useRef<{ scrollTo: (o: { x: number; animated?: boolean }) => void } | null>(null);
  const featuredCount = featured ? novenasOf(featured).length : 0;
  const pausedUntil = useRef(0);
  const nextPage = useRef(0);
  useEffect(() => {
    if (!returning || featuredCount < 2) return;
    const timer = setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      nextPage.current = (nextPage.current + 1) % featuredCount;
      featuredRef.current?.scrollTo({ x: nextPage.current * (featuredWidth + 10), animated: true });
      setFeaturedPage(nextPage.current + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, [returning, featuredCount, featuredWidth]);

  // Draws one section. "list" sections show tall rows going down; other sections show cards you swipe sideways.
  const renderCollection = (c: Collection, index: number, layout = c.layout ?? 'cards') => (
    <Reveal key={c.id} index={index} style={{ gap: 10 }}>
      <SectionHeader title={c.title} subtitle={c.subtitle} />
      {layout === 'list' ? (
        <View style={{ gap: 12 }}>{novenasOf(c).map((n) => <NovenaRow key={n.id} novena={n} onPress={() => open(n)} />)}</View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: screenMargin, gap: 12 }}>
          {novenasOf(c).map((n) => <NovenaCard key={n.id} novena={n} onPress={() => open(n)} />)}
        </ScrollView>
      )}
    </Reveal>
  );

  // The "Feast days ahead" row: the next four saints' feast days.
  const feastSection = (index: number) => feasts.length > 0 && (
    <Reveal index={index} style={{ gap: 10 }}>
      <SectionHeader title="Feast days ahead" subtitle={strings.home.feastSubtitle} onSeeAll={() => router.push('/calendar')} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: screenMargin }}>
        {feasts.map((f) => (
          <FeastDayItem key={f.saint.id} saintName={f.saint.name} avatar={f.saint.avatar} feastDate={f.feastDate}
            onPress={() => (f.novena ? open(f.novena) : router.push('/calendar'))} />
        ))}
      </View>
    </Reveal>
  );

  return (
    <SafeAreaView edges={[]} style={{ flex: 1, backgroundColor: colors.surface.default }}>
      {/* Top bar: the pocketNovena name, then Calendar and Search buttons. */}
      <HomeAppBar raised={scrolled} onCalendar={() => router.push('/calendar')} onSearch={() => router.push('/search')} />
      <ScrollView scrollEventThrottle={16} onScroll={(e) => { const s = e.nativeEvent.contentOffset.y > 2; if (s !== scrolled) setScrolled(s); }} contentContainerStyle={{ paddingTop: 12, paddingBottom: 140, gap: 32 }}>
        {/* Someone already praying sees: Continue cards, featured novenas, intentions, feast days, then the other sections. */}
        {/* Someone new sees: featured novenas, "How a novena works", feast days, then the other sections. */}
        {!loaded ? null : returning ? (
          <>
            <Reveal index={0} style={{ gap: 10 }}>
              {/* "Continue praying": one card per novena in progress, swipe sideways. */}
              <SectionHeader title={strings.home.continueTitle} subtitle={strings.home.continueSubtitle} />
              <View style={{ gap: 6 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={continueWidth + 10} decelerationRate="fast"
                  onMomentumScrollEnd={(e) => setContinuePage(pageFrom(e, continueWidth + 10))}
                  contentContainerStyle={{ paddingHorizontal: screenMargin, paddingVertical: 6, gap: 10 }} style={{ marginVertical: -4 }}>
                  {active.map(({ run, novena }) => (
                    <ContinueCard key={run.id} novena={novena!} day={run.continueDay} missed={run.missed.length} width={continueWidth}
                      onOpen={() => open(novena!)} onMenu={(y) => openMenu(run.id, y)} onContinue={() => router.push(`/reader/${run.id}/${run.continueDay}`)} />
                  ))}
                </ScrollView>
                {active.length > 1 ? <CarouselIndicator count={active.length} active={continuePage} /> : null}
              </View>
            </Reveal>
            {featured ? (
              <Reveal index={1} style={{ gap: 10 }}>
                {/* The big featured cards with the "Start Novena" button. */}
                <SectionHeader title={featured.title} subtitle={featured.subtitle} />
                <View style={{ gap: 6, paddingBottom: 6 }}>
                  <ScrollView ref={(r) => { featuredRef.current = r; }} horizontal showsHorizontalScrollIndicator={false} snapToInterval={featuredWidth + 10} decelerationRate="fast"
                    onScrollBeginDrag={() => { pausedUntil.current = Date.now() + 8000; }}
                    onMomentumScrollEnd={(e) => { const page = pageFrom(e, featuredWidth + 10); nextPage.current = page - 1; setFeaturedPage(page); }}
                    contentContainerStyle={{ paddingHorizontal: screenMargin, paddingVertical: 8, gap: 10 }}>
                    {novenasOf(featured).map((n) => (
                      <FeaturedNovenaCard key={n.id} novena={n} width={featuredWidth} onPress={() => open(n)} onStart={() => startNovena(n)} />
                    ))}
                  </ScrollView>
                  <CarouselIndicator count={novenasOf(featured).length} active={featuredPage} tone="strong" />
                </View>
              </Reveal>
            ) : null}
            <Reveal index={2} style={{ gap: 10 }}>
              {/* "What are you praying for?": two tiles per row. Tapping one shows the novenas for that need. */}
              <SectionHeader title={strings.home.intentionsTitle} />
              <View style={{ paddingHorizontal: screenMargin, gap: 10 }}>
                {Array.from({ length: Math.ceil(categories.length / 2) }, (_, row) => (
                  <View key={row} style={{ flexDirection: 'row', gap: 10 }}>
                    {categories.slice(row * 2, row * 2 + 2).map((c) => (
                      <IntentionTile key={c.id} label={c.name} icon={c.icon} onPress={() => router.push({ pathname: '/search', params: { category: c.id } })} />
                    ))}
                  </View>
                ))}
              </View>
            </Reveal>
            {feastSection(3)}
            {others.map((c, i) => renderCollection(c, 4 + i))}
          </>
        ) : (
          <>
            {featured ? renderCollection(featured, 0, 'cards') : null}
            <Reveal index={1} style={{ gap: 10 }}>
              <SectionHeader title={strings.home.howItWorksTitle} subtitle={strings.home.howItWorksSubtitle} />
              <View style={{ paddingHorizontal: screenMargin }}><HowItWorksCard /></View>
            </Reveal>
            {feastSection(2)}
            {others.map((c, i) => renderCollection(c, 3 + i))}
          </>
        )}
      </ScrollView>
      {menus}
    </SafeAreaView>
  );
}
