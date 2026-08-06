// Maps common subscription names to the real favicon/logo from that
// service's own website, so the icon shown is exactly the logo people
// actually recognize — not a simplified stand-in.
//
// Matching is a simple case-insensitive substring check against whatever
// the user typed as the subscription name. Each match returns a *list* of
// candidate icon sources (different favicon lookup services); the
// BrandIcon component tries them in order and only falls back to a colored
// initial avatar if every source fails to load.

const BRANDS = [
  { match: ["netflix"], domain: "netflix.com" },
  { match: ["amazon prime", "prime video"], domain: "primevideo.com" },
  { match: ["amazon"], domain: "amazon.com" },
  { match: ["spotify"], domain: "spotify.com" },
  { match: ["disney"], domain: "disneyplus.com" },
  { match: ["youtube"], domain: "youtube.com" },
  { match: ["claude", "anthropic"], domain: "claude.ai" },
  { match: ["chatgpt", "openai"], domain: "chatgpt.com" },
  { match: ["gemini", "google one", "google drive", "google workspace", "google"], domain: "google.com" },
  { match: ["apple music"], domain: "music.apple.com" },
  { match: ["apple tv"], domain: "tv.apple.com" },
  { match: ["icloud"], domain: "icloud.com" },
  { match: ["apple"], domain: "apple.com" },
  { match: ["microsoft 365", "office 365"], domain: "office.com" },
  { match: ["microsoft"], domain: "microsoft.com" },
  { match: ["github"], domain: "github.com" },
  { match: ["notion"], domain: "notion.so" },
  { match: ["dropbox"], domain: "dropbox.com" },
  { match: ["slack"], domain: "slack.com" },
  { match: ["hbo", "max"], domain: "max.com" },
  { match: ["hulu"], domain: "hulu.com" },
  { match: ["playstation", "ps plus", "ps+"], domain: "playstation.com" },
  { match: ["xbox", "game pass"], domain: "xbox.com" },
  { match: ["adobe", "creative cloud"], domain: "adobe.com" },
  { match: ["canva"], domain: "canva.com" },
  { match: ["figma"], domain: "figma.com" },
  { match: ["linkedin"], domain: "linkedin.com" },
  { match: ["patreon"], domain: "patreon.com" },
  { match: ["twitch"], domain: "twitch.tv" },
  { match: ["zoom"], domain: "zoom.us" },
  { match: ["vercel"], domain: "vercel.com" },
  { match: ["1password"], domain: "1password.com" },
  { match: ["nordvpn"], domain: "nordvpn.com" },
  { match: ["audible"], domain: "audible.com" },
  { match: ["paramount"], domain: "paramountplus.com" },
  { match: ["peacock"], domain: "peacock.tv" },
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

function iconSourcesFor(domain) {
  return [
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    `https://${domain}/favicon.ico`,
  ];
}

// Returns { domain, iconSources, letter, color }. iconSources is an empty
// array when no brand matched; letter/color are always populated for the
// fallback avatar.
export function getBrand(name) {
  const n = (name || "").toLowerCase();
  const fallback = initialFallback(name);
  for (const brand of BRANDS) {
    if (brand.match.some((m) => n.includes(m))) {
      return { domain: brand.domain, iconSources: iconSourcesFor(brand.domain), ...fallback };
    }
  }
  return { domain: null, iconSources: [], ...fallback };
}
