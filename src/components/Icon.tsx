// Icons: the Phosphor set, "Light" weight, as used in the Figma file's Icons page.
import {
  Bell, BookmarkSimple, Calendar, Moon, Sun, CaretDown, Clock, ClockCounterClockwise, Bookmarks, Books, Briefcase, CalendarDots, CaretLeft, CaretRight, Check, Cross, DotsThree,
  DownloadSimple, Export, HandHeart, HandsPraying, Headphones, Heart, Heartbeat, MagnifyingGlass, MaskSad, Pause, Play, SpeakerSimpleSlash,
  UsersThree, X, ArrowCounterClockwise, Trash, BookOpenText, CheckCircle,
} from 'phosphor-react-native';
import { colors } from '@/constants/theme';

const icons = {
  back: CaretLeft, chevronLeft: CaretLeft, chevronRight: CaretRight, close: X, clear: X, more: DotsThree,
  share: Export, search: MagnifyingGlass, check: Check, play: Play, pause: Pause, download: DownloadSimple,
  bookmark: BookmarkSimple, bookmarks: Bookmarks, books: Books, book: Books, bell: Bell, calendar: CalendarDots,
  heart: Heart, history: ClockCounterClockwise, handsPraying: HandsPraying, headphones: Headphones,
  clock: Clock, sun: Sun, moon: Moon, calendarDate: Calendar, speakerSlash: SpeakerSimpleSlash, chevronDown: CaretDown,
  cross: Cross, handHeart: HandHeart, usersThree: UsersThree, briefcase: Briefcase, heartbeat: Heartbeat, maskSad: MaskSad,
  restart: ArrowCounterClockwise, trash: Trash, bookOpen: BookOpenText, checkCircle: CheckCircle,
} as const;
export type IconName = keyof typeof icons;

type Props = { name: IconName; size?: number; color?: string; weight?: 'light' | 'regular' | 'fill' };

export function Icon({ name, size = 22, color = colors.icon.default, weight = 'light' }: Props) {
  const Glyph = icons[name];
  return <Glyph size={size} color={color} weight={weight} />;
}

export const isIconName = (n: string | undefined): n is IconName => !!n && n in icons;
