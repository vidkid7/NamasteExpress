/**
 * Centralized icon resolution for culturally-specific symbols that have no
 * direct Lucide equivalent (Nepali festivals and zodiac signs). Keeping the
 * mapping in one place lets the whole site render consistent Lucide icons
 * instead of emoji.
 */
import {
  PartyPopper,
  HeartPulse,
  Sun,
  Sprout,
  Leaf,
  Umbrella,
  CloudRain,
  Music,
  PawPrint,
  Drama,
  Sparkles,
  Moon,
  Flame,
  Sunrise,
  Snowflake,
  BookOpen,
  Palette,
  CalendarDays,
  Mountain,
  MountainSnow,
  Users,
  Droplet,
  Droplets,
  Wheat,
  Scale,
  Target,
  Waves,
  Fish,
  Star,
  type LucideIcon,
} from "lucide-react";

/* ── Festivals: keyed by the Lucide icon name stored in BS_FESTIVALS ── */
const FESTIVAL_ICONS: Record<string, LucideIcon> = {
  PartyPopper,
  HeartPulse,
  Sun,
  Sprout,
  Leaf,
  Umbrella,
  CloudRain,
  Music,
  PawPrint,
  Drama,
  Sparkles,
  Moon,
  Flame,
  Sunrise,
  Snowflake,
  BookOpen,
  Palette,
};

export function FestivalIcon({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  const Icon = (name && FESTIVAL_ICONS[name]) || CalendarDays;
  return <Icon className={className} aria-hidden="true" />;
}

/* ── Zodiac: keyed by sign id (covers both spelling variants used in app) ── */
const ZODIAC_ICONS: Record<string, LucideIcon> = {
  mesh: Flame, // Aries
  brish: Mountain, // Taurus
  mithun: Users, // Gemini
  karkat: Droplet, // Cancer
  singh: Sun, // Leo
  simha: Sun, // Leo (alt spelling)
  kanya: Wheat, // Virgo
  tula: Scale, // Libra
  brischik: Droplets, // Scorpio
  brishchik: Droplets, // Scorpio (alt spelling)
  dhanu: Target, // Sagittarius
  makar: MountainSnow, // Capricorn
  kumbha: Waves, // Aquarius
  meen: Fish, // Pisces
};

export function ZodiacIcon({
  sign,
  className,
}: {
  sign?: string | null;
  className?: string;
}) {
  const Icon = (sign && ZODIAC_ICONS[sign]) || Star;
  return <Icon className={className} aria-hidden="true" />;
}
