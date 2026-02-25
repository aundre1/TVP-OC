import { get, post } from './client';

export interface Genre {
  id: string;
  name: string;
  subGenres: string[];
}

export interface GenreClassification {
  primaryGenre: string;
  subGenres: string[];
  confidence: number;
  source: string;
}

export async function getGenres(): Promise<Genre[]> {
  return get<Genre[]>('/genres');
}

export async function classifyTrack(artist: string, title: string): Promise<{ success: boolean; classification: GenreClassification; message: string }> {
  return post('/genres/classify', { artist, title });
}

export async function reclassifyBatch(tracks: Array<{ id: number; artist: string; title: string }>): Promise<{ success: boolean; results: Array<{ id: number; classification: GenreClassification }>; message: string }> {
  return post('/genres/reclassify-batch', { tracks });
}
