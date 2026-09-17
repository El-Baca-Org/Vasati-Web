export type PrayerKey =
  | "imsak" | "sabah" | "gunes" | "israk" | "kerahet"
  | "ogle" | "ikindi" | "asr_sani" | "isfirar_sems"
  | "aksam" | "istibak_nucum" | "yatsi" | "isa_sani" | "kible_saati";

export type PrayerTimes = Record<PrayerKey, string>;

export type VasatiSnapshot = {
  gregorian: { year: number; month: number; day: number; dayOfYear: number };
  vasatiYear: number;
  currentGregorian: string;
  currentVasati: string;
  prayers: PrayerTimes;
};

const prayerKeys: PrayerKey[] = [
  "imsak", "sabah", "gunes", "israk", "kerahet", "ogle", "ikindi",
  "asr_sani", "isfirar_sems", "aksam", "istibak_nucum", "yatsi", "isa_sani", "kible_saati"
];

const formatClock = (minutes: number) => {
  const normalized = ((minutes % 720) + 720) % 720;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
};

const toMinutes = (value: string) => {
  const match = value.match(/(\d{1,2}):(\d{1,2})/);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
};

const dayOfYear = (date: Date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
};

const localDateParts = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
};

export async function loadSnapshot(): Promise<VasatiSnapshot> {
  const xml = await fetch("/Vakitler.xml").then((response) => response.text());
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const nodes = Array.from(doc.querySelectorAll("prayertimes"));
  const today = localDateParts();
  const date = new Date(today.year, today.month - 1, today.day);
  const doy = dayOfYear(date) - 1;
  const byDay = new Map(nodes.map((node) => [Number(node.getAttribute("dayofyear")), node.textContent?.trim() ?? ""]));
  const nextRow = (byDay.get(doy + 1) ?? byDay.get(doy) ?? "").split(/\s+/);
  const todayRow = (byDay.get(doy) ?? "").split(/\s+/);

  const raw: Record<PrayerKey, string> = {
    imsak: nextRow[0] ?? "--:--", sabah: nextRow[1] ?? "--:--", gunes: nextRow[2] ?? "--:--",
    israk: nextRow[3] ?? "--:--", kerahet: nextRow[4] ?? "--:--", ogle: nextRow[5] ?? "--:--",
    ikindi: nextRow[6] ?? "--:--", asr_sani: nextRow[7] ?? "--:--", isfirar_sems: nextRow[8] ?? "--:--",
    aksam: todayRow[9] ?? "--:--", istibak_nucum: todayRow[10] ?? "--:--", yatsi: todayRow[11] ?? "--:--",
    isa_sani: todayRow[12] ?? "--:--", kible_saati: nextRow[13] ?? "--:--"
  };

  const sunset = toMinutes(raw.aksam);
  const prayers = {} as PrayerTimes;
  prayers.aksam = "00:00";
  for (const key of prayerKeys) {
    if (key === "aksam") continue;
    const absolute = (toMinutes(raw[key]) - sunset + 1440) % 1440;
    prayers[key] = formatClock(absolute);
  }

  const now = new Date();
  const h = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Istanbul", hour: "2-digit", hour12: false }).format(now));
  const m = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Istanbul", minute: "2-digit" }).format(now));
  const s = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Istanbul", second: "2-digit" }).format(now));
  const secondsFromMidnight = h * 3600 + m * 60 + s;
  const vasatiSeconds = (1440 - sunset) * 60 + secondsFromMidnight;
  const currentVasati = `${String(Math.floor((vasatiSeconds / 3600) % 12)).padStart(2, "0")}:${String(Math.floor((vasatiSeconds / 60) % 60)).padStart(2, "0")}:${String(vasatiSeconds % 60).padStart(2, "0")}`;
  const vasatiYear = (today.year - 621) + Math.floor((today.year - 621) / 33);

  return { gregorian: { ...today, dayOfYear: doy + 1 }, vasatiYear, currentGregorian: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`, currentVasati, prayers };
}
