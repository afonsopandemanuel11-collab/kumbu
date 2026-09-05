export function getSupabaseEnv() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";

  let url = rawUrl
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/+$/, "");

  // Fix accidental double protocols (e.g. https://https://)
  url = url.replace(/^https?:\/\/https?:\/\//i, "https://");

  // If user pasted without protocol, prepend https://
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  const rawKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";

  const anonKey = rawKey
    .trim()
    .replace(/^["']|["']$/g, "");

  return { url, anonKey };
}
