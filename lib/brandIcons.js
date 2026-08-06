// Maps common subscription names to a brand icon from Simple Icons
// (https://simpleicons.org — a free, open-source library of brand logos,
// loaded here from its public CDN). Matching is a simple case-insensitive
// substring check against whatever the user typed as the subscription name.
//
// If a name doesn't match anything here — or the icon fails to load for any
// reason — callers fall back to a colored initial avatar, so there's never
// a broken image.

const BRANDS = [
  { match: ["netflix"], slug: "netflix", color: "E50914" },
  { match: ["amazon prime", "prime video"], slug: "primevideo", color: "00A8E1" },
  { match: ["amazon"], slug: "amazon", color: "FF9900" },
  { match: ["spotify"], slug: "spotify", color: "1ED760" },
  { match: ["disney"], slug: "disneyplus", color: "113CCF" },
  { match: ["youtube"], slug: "youtube", color: "FF0000" },
  { match: ["claude", "anthropic"], slug: "anthropic", color: "D97757" },
  { match: ["chatgpt", "openai"], slug: "openai", color: "412991" },
  { match: ["gemini", "google one", "google drive", "google workspace"], slug: "google", color: "4285F4" },
  { match: ["apple music"], slug: "applemusic", color: "FA243C" },
  { match: ["apple tv"], slug: "appletv", color: "000000" },
  { match: ["icloud"], slug: "icloud", color: "3693F3" },
  { match: ["google"], slug: "google", color: "4285F4" },
  { match: ["apple"], slug: "apple", color: "555555" },
  { match: ["microsoft 365", "office 365"], slug: "microsoftoffice", color: "D83B01" },
  { match: ["microsoft"], slug: "microsoft", color: "5E5E5E" },
  { match: ["github"], slug: "github", color: "181717" },
  { match: ["notion"], slug: "notion", color: "000000" },
  { match: ["dropbox"], slug: "dropbox", color: "0061FF" },
  { match: ["slack"], slug: "slack", color: "4A154B" },
  { match: ["hbo", "max"], slug: "max", color: "002BE7" },
  { match: ["hulu"], slug: "hulu", color: "1CE783" },
  { match: ["playstation", "ps plus", "ps+"], slug: "playstation", color: "003791" },
  { match: ["xbox", "game pass"], slug: "xbox", color: "107C10" },
  { match: ["adobe", "creative cloud"], slug: "adobe", color: "FF0000" },
  { match: ["canva"], slug: "canva", color: "00C4CC" },
  { match: ["figma"], slug: "figma", color: "F24E1E" },
  { match: ["linkedin"], slug: "linkedin", color: "0A66C2" },
  { match: ["patreon"], slug: "patreon", color: "FF424D" },
  { match: ["twitch"], slug: "twitch", color: "9146FF" },
  { match: ["zoom"], slug: "zoom", color: "0B5CFF" },
  { match: ["vercel"], slug: "vercel", color: "000000" },
  { match: ["1password"], slug: "1password", color: "3B66BC" },
  { match: ["nordvpn"], slug: "nordvpn", color: "4687FF" },
  { match: ["audible"], slug: "audible", color: "F8991C" },
  { match: ["paramount"], slug: "paramountplus", color: "0064FF" },
  { match: ["peacock"], slug: "peacock", color: "000000" },
];

// A small set of pleasant, legible colors for the initial-avatar fallback.
const PALETTE = ["#6366F1", "#EC4899", "#10B981", "#F59E0B", "#3B82F6", "#EF4444", "#8B5CF6", "#14B8A6"];

function initialFallback(name) {
  const trimmed = (name || "").trim();
  const letter = (trimmed[0] || "?").toUpperCase();
  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hash = trimmed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = PALETTE[Math.abs(hash) % PALETTE.length];
  return { letter, color };
}

// Returns { iconUrl, letter, color }. iconUrl is null when no brand matched;
// letter/color are always populated for the fallback avatar.
export function getBrand(name) {
  const n = (name || "").toLowerCase();
  const fallback = initialFallback(name);
  for (const brand of BRANDS) {
    if (brand.match.some((m) => n.includes(m))) {
      return { iconUrl: `https://cdn.simpleicons.org/${brand.slug}/${brand.color}`, ...fallback };
    }
  }
  return { iconUrl: null, ...fallback };
}
