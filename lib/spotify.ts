type SpotifyTrack = {
  id: string;
  name: string;
  preview_url: string | null;
  external_urls: { spotify: string };
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  artists: Array<{ name: string }>;
};

export const getAccessToken = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error("SPOTIFY_CLIENT_ID ou SPOTIFY_CLIENT_SECRET manquant");
  }

  const credentials = Buffer.from(
    `${clientId}:${clientSecret}`,
  ).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Impossible de récupérer le token Spotify (${response.status}): ${detail}`);
  }

  const data = await response.json();
  return data.access_token as string;
};

export const searchTracks = async (query: string) => {
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Recherche Spotify indisponible (${response.status}): ${detail}`);
  }

  const data = await response.json();
  return (data.tracks?.items ?? []) as SpotifyTrack[];
};
