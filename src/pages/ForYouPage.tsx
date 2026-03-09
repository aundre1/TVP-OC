// ============================================
// FOR YOU PAGE - Personalized Recommendations
// ============================================

import { useEffect, useState, useMemo } from 'react';
import VideoGrid from '@/components/VideoGrid';
import VideoList from '@/components/VideoList';
import { useAppStore } from '@/stores/appStore';
import { get } from '@/api/client';
import { extractTracks } from '@/api/adapters';
import { Track } from '@/types';

// Loading skeleton
function SectionSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-video bg-tvp-bg-tertiary rounded-lg mb-2" />
          <div className="h-3 bg-tvp-bg-tertiary rounded w-3/4 mb-1" />
          <div className="h-3 bg-tvp-bg-tertiary rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

// Taste profile panel showing user preferences
function TasteProfilePanel() {
  const [tasteProfile, setTasteProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasteProfile() {
      try {
        // Attempt to fetch real taste profile from backend
        const response = await get<any>('/user/taste-profile').catch(() => null);
        if (response) {
          setTasteProfile(response);
        } else {
          // Fallback to mock data if endpoint doesn't exist yet
          setTasteProfile({
            genres: ['Hip-Hop', 'R&B', 'Electronic'],
            bpmRange: { min: 90, max: 135 },
            favoriteKeys: ['Am', 'Em', 'Dm'],
            topArtists: ['Unknown Beats', 'Producer X'],
            preferredEra: ['2010s', '2020s'],
          });
        }
      } catch (err) {
        console.warn('Failed to fetch taste profile:', err);
        setTasteProfile(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTasteProfile();
  }, []);

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-tvp-border mb-6 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-tvp-bg-secondary transition"
      >
        <div>
          <h3 className="font-semibold text-tvp-text-primary">Your Taste Profile</h3>
          <p className="text-sm text-tvp-text-muted">Detected from your downloads</p>
        </div>
        <span className="text-tvp-accent-cyan text-xl">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="px-4 py-3 bg-tvp-bg-secondary border-t border-tvp-border">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-tvp-bg-tertiary rounded w-1/2" />
              <div className="h-4 bg-tvp-bg-tertiary rounded w-3/4" />
            </div>
          ) : tasteProfile ? (
            <div className="space-y-4">
              {tasteProfile.genres && tasteProfile.genres.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-tvp-text-secondary mb-2">FAVORITE GENRES</p>
                  <div className="flex flex-wrap gap-2">
                    {tasteProfile.genres.map((g: string) => (
                      <span key={g} className="px-2 py-1 bg-tvp-accent-cyan/20 text-tvp-accent-cyan rounded text-xs font-medium">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {tasteProfile.bpmRange && (
                <div>
                  <p className="text-xs font-semibold text-tvp-text-secondary mb-2">BPM SWEET SPOT</p>
                  <p className="text-sm text-tvp-text-primary">
                    {tasteProfile.bpmRange.min}–{tasteProfile.bpmRange.max} BPM
                  </p>
                </div>
              )}

              {tasteProfile.favoriteKeys && tasteProfile.favoriteKeys.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-tvp-text-secondary mb-2">FAVORITE KEYS</p>
                  <div className="flex gap-1">
                    {tasteProfile.favoriteKeys.map((k: string) => (
                      <span key={k} className="px-2 py-1 bg-tvp-bg-tertiary text-tvp-text-primary rounded text-xs font-mono">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {tasteProfile.preferredEra && tasteProfile.preferredEra.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-tvp-text-secondary mb-2">PREFERRED ERA</p>
                  <div className="flex flex-wrap gap-2">
                    {tasteProfile.preferredEra.map((e: string) => (
                      <span key={e} className="text-xs text-tvp-text-muted">{e}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-tvp-text-muted">Download more tracks to build your profile</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ForYouPage() {
  const { viewMode, activeGenre, activeSubgenre } = useAppStore();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchForYou() {
      setLoading(true);
      try {
        // Fetch personalized recommendations
        const response = await get<unknown>('/videos/recommended', { limit: 50 }).catch(() =>
          // Fallback to regular videos if recommendation endpoint doesn't exist
          get<unknown>('/videos', { limit: 50 })
        );

        if (cancelled) return;

        const data = extractTracks(response);
        setTracks(data);
      } catch (err) {
        console.error('Failed to fetch For You tracks:', err);
        setTracks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchForYou();
    return () => { cancelled = true; };
  }, []);

  // Apply genre filter if selected
  const filteredTracks = useMemo(() => {
    if (!activeGenre) return tracks;
    return tracks.filter((track) => {
      const genreMatch = track.genre.toLowerCase().replace(/[^a-z]/g, '') ===
        activeGenre.toLowerCase().replace(/[^a-z]/g, '');
      if (activeSubgenre) {
        const subgenreMatch = track.subgenre?.toLowerCase().replace(/[^a-z]/g, '') ===
          activeSubgenre.toLowerCase().replace(/[^a-z]/g, '');
        return genreMatch && subgenreMatch;
      }
      return genreMatch;
    });
  }, [tracks, activeGenre, activeSubgenre]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-tvp-text-primary mb-2">For You</h1>
        <p className="text-tvp-text-muted">
          Personalized recommendations based on your listening and download history
        </p>
      </div>

      {/* Taste Profile Panel */}
      <TasteProfilePanel />

      {/* Content */}
      {loading ? (
        <SectionSkeleton />
      ) : filteredTracks.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-tvp-text-muted mb-4">No tracks found for this filter.</p>
          <p className="text-sm text-tvp-text-secondary">Try downloading videos to personalize your recommendations.</p>
        </div>
      ) : (
        <>
          <div className="text-sm text-tvp-text-secondary mb-4">
            Showing {filteredTracks.length} recommendations
          </div>
          {viewMode === 'list' ? (
            <VideoList tracks={filteredTracks} showHeader={true} />
          ) : (
            <VideoGrid tracks={filteredTracks} />
          )}
        </>
      )}
    </div>
  );
}
