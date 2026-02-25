// ===========================================
// THE VIDEO POOL - Genre Classification Service
// Ported from tvp-export/server/genreService.ts
// Uses MusicBrainz + Last.fm for genre classification
// ===========================================

const GENRE_MAPPING = {
  'hip hop': { primary: 'Hip-Hop / Rap', subGenres: ['Trap', 'Boom Bap'] },
  'hip-hop': { primary: 'Hip-Hop / Rap', subGenres: ['Trap', 'Boom Bap'] },
  'rap': { primary: 'Hip-Hop / Rap', subGenres: [] },
  'trap': { primary: 'Hip-Hop / Rap', subGenres: ['Trap'] },
  'drill': { primary: 'Drill', subGenres: [] },
  'r&b': { primary: 'R&B', subGenres: [] },
  'rnb': { primary: 'R&B', subGenres: [] },
  'soul': { primary: 'Soul', subGenres: [] },
  'pop': { primary: 'Pop', subGenres: [] },
  'dance': { primary: 'Electronic / Dance', subGenres: ['EDM'] },
  'electronic': { primary: 'Electronic / Dance', subGenres: [] },
  'edm': { primary: 'Electronic / Dance', subGenres: ['EDM'] },
  'house': { primary: 'House', subGenres: [] },
  'deep house': { primary: 'House', subGenres: ['Deep House'] },
  'tech house': { primary: 'House', subGenres: ['Tech House'] },
  'progressive house': { primary: 'House', subGenres: ['Progressive House'] },
  'techno': { primary: 'Techno', subGenres: [] },
  'trance': { primary: 'Trance', subGenres: [] },
  'dubstep': { primary: 'Electronic / Dance', subGenres: ['Dubstep'] },
  'drum and bass': { primary: 'Electronic / Dance', subGenres: ['Drum & Bass'] },
  'reggaeton': { primary: 'Latin', subGenres: ['Reggaeton'] },
  'latin': { primary: 'Latin', subGenres: [] },
  'latin pop': { primary: 'Latin', subGenres: ['Latin Pop'] },
  'reggae': { primary: 'Reggae / Dancehall', subGenres: [] },
  'dancehall': { primary: 'Reggae / Dancehall', subGenres: ['Dancehall'] },
  'rock': { primary: 'Rock', subGenres: [] },
  'alternative': { primary: 'Indie / Alternative', subGenres: [] },
  'indie': { primary: 'Indie / Alternative', subGenres: [] },
  'metal': { primary: 'Metal', subGenres: [] },
  'punk': { primary: 'Punk', subGenres: [] },
  'country': { primary: 'Country', subGenres: [] },
  'jazz': { primary: 'Jazz', subGenres: [] },
  'blues': { primary: 'Blues', subGenres: [] },
  'classical': { primary: 'Classical', subGenres: [] },
  'folk': { primary: 'Folk / Americana', subGenres: [] },
  'afrobeats': { primary: 'Afrobeats', subGenres: [] },
  'afrobeat': { primary: 'Afrobeats', subGenres: [] },
  'k-pop': { primary: 'K-Pop', subGenres: [] },
  'kpop': { primary: 'K-Pop', subGenres: [] },
  'funk': { primary: 'Funk', subGenres: [] },
  'gospel': { primary: 'Gospel / CCM', subGenres: [] },
  'christian': { primary: 'Gospel / CCM', subGenres: [] },
  'ambient': { primary: 'Ambient', subGenres: [] },
  'lo-fi': { primary: 'Lo-Fi / Chillhop', subGenres: [] },
  'lofi': { primary: 'Lo-Fi / Chillhop', subGenres: [] },
  'chillhop': { primary: 'Lo-Fi / Chillhop', subGenres: [] },
  'grime': { primary: 'Grime', subGenres: [] },
  'ska': { primary: 'Ska', subGenres: [] },
  'world': { primary: 'World / Global Fusion', subGenres: [] },
};

class GenreService {
  constructor() {
    this.userAgent = 'TheVideoPool/1.0 (contact@thevideopool.com)';
  }

  async classifyFromMusicBrainz(artist, title) {
    try {
      const query = encodeURIComponent(`artist:${artist} AND recording:${title}`);
      const url = `https://musicbrainz.org/ws/2/recording?query=${query}&fmt=json&limit=1`;

      const response = await fetch(url, {
        headers: { 'User-Agent': this.userAgent }
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (!data.recordings || data.recordings.length === 0) return null;

      const recording = data.recordings[0];
      const tags = recording.tags || [];
      if (tags.length === 0) return null;

      const sortedTags = tags.sort((a, b) => b.count - a.count);
      const topTag = sortedTags[0].name.toLowerCase();

      const mapping = this.findGenreMapping(topTag);
      if (mapping) {
        return {
          primaryGenre: mapping.primary,
          subGenres: mapping.subGenres,
          confidence: Math.min(sortedTags[0].count / 10, 1),
          source: 'musicbrainz'
        };
      }

      return null;
    } catch (error) {
      console.error('MusicBrainz API error:', error);
      return null;
    }
  }

  async classifyFromLastFm(artist, title, apiKey) {
    if (!apiKey) {
      console.log('Last.fm API key not provided, skipping Last.fm lookup');
      return null;
    }

    try {
      const url = `https://ws.audioscrobbler.com/2.0/?method=track.gettoptags&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&api_key=${apiKey}&format=json`;

      const response = await fetch(url);
      if (!response.ok) return null;

      const data = await response.json();
      if (!data.toptags?.tag || data.toptags.tag.length === 0) return null;

      const topTag = data.toptags.tag[0].name.toLowerCase();
      const mapping = this.findGenreMapping(topTag);

      if (mapping) {
        return {
          primaryGenre: mapping.primary,
          subGenres: mapping.subGenres,
          confidence: Math.min(data.toptags.tag[0].count / 100, 1),
          source: 'lastfm'
        };
      }

      return null;
    } catch (error) {
      console.error('Last.fm API error:', error);
      return null;
    }
  }

  async classifyTrack(artist, title, lastFmApiKey) {
    const musicBrainzResult = await this.classifyFromMusicBrainz(artist, title);
    if (musicBrainzResult && musicBrainzResult.confidence > 0.5) {
      return musicBrainzResult;
    }

    const lastFmResult = await this.classifyFromLastFm(artist, title, lastFmApiKey);
    if (lastFmResult) return lastFmResult;

    if (musicBrainzResult) return musicBrainzResult;

    return this.classifyFromLocalAnalysis(title);
  }

  classifyFromLocalAnalysis(title) {
    const titleLower = title.toLowerCase();

    const keywordsToGenre = {
      'remix': 'Remixes',
      'extended': 'Remixes',
      'mashup': 'Remixes',
      'bootleg': 'Remixes',
      'club mix': 'Remixes',
      'throwback': 'Throwbacks',
      'classic': 'Throwbacks',
      'retro': 'Throwbacks',
      '90s': 'Throwbacks',
      '80s': 'Throwbacks',
      '2000s': 'Throwbacks',
    };

    for (const [keyword, genre] of Object.entries(keywordsToGenre)) {
      if (titleLower.includes(keyword)) {
        return {
          primaryGenre: genre,
          subGenres: [],
          confidence: 0.3,
          source: 'local'
        };
      }
    }

    return {
      primaryGenre: 'Electronic / Dance',
      subGenres: [],
      confidence: 0.1,
      source: 'local'
    };
  }

  findGenreMapping(tag) {
    const normalizedTag = tag.toLowerCase().trim();

    if (GENRE_MAPPING[normalizedTag]) {
      return GENRE_MAPPING[normalizedTag];
    }

    for (const [key, value] of Object.entries(GENRE_MAPPING)) {
      if (normalizedTag.includes(key) || key.includes(normalizedTag)) {
        return value;
      }
    }

    return null;
  }

  async reclassifyGenres(tracks, lastFmApiKey) {
    const results = [];

    for (const track of tracks) {
      // Rate limit: 1 request per 1.1 seconds (MusicBrainz requirement)
      await new Promise(resolve => setTimeout(resolve, 1100));

      const classification = await this.classifyTrack(track.artist, track.title, lastFmApiKey);
      results.push({ id: track.id, classification });
    }

    return results;
  }
}

export const genreService = new GenreService();
export default genreService;
