const CLIENT_ID = 'e6c5e501a5694c9d8f6364f29d1bd73e';
const CLIENT_SECRET = 'aa3bc59c90fe429cbb9d5dc6568533e7';

export const getSpotifyToken = async () => {
  const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  
  const data = await response.json();
  return data.access_token;
};

export const searchSongs = async (query, token) => {
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    }
  );

  const data = await response.json();
  return data.tracks.items;
};

export const getItunesPreview = async (songName, artistName) => {
  try {
    const term = encodeURIComponent(`${songName} ${artistName}`);
    const response = await fetch(
      `https://itunes.apple.com/search?term=${term}&media=music&limit=1`
    );
    const data = await response.json();
    return data.results?.[0]?.previewUrl ?? null;
  } catch (e) {
    return null;
  }
};