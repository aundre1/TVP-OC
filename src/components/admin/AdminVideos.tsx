// ============================================
// THE VIDEO POOL - ADMIN VIDEOS TAB
// Video management with bulk actions
// ============================================

import { useState } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Download,
  Clock,
  Play,
  Video,
  TrendingUp,
} from 'lucide-react';
import { clsx } from 'clsx';

interface AdminVideo {
  id: number;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  key: string;
  quality: string[];
  downloadCount: number;
  isTrending: boolean;
  isNew: boolean;
  releaseDate: string;
  duration: number;
}

// Mock videos data
const mockVideos: AdminVideo[] = [
  {
    id: 1,
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    genre: 'Pop',
    bpm: 171,
    key: 'F#m',
    quality: ['4K', '1080p', '720p'],
    downloadCount: 15420,
    isTrending: true,
    isNew: false,
    releaseDate: '2020-11-29',
    duration: 203,
  },
  {
    id: 2,
    title: 'Levitating',
    artist: 'Dua Lipa',
    genre: 'Pop',
    bpm: 103,
    key: 'Bm',
    quality: ['4K', '1080p', '720p'],
    downloadCount: 12800,
    isTrending: true,
    isNew: false,
    releaseDate: '2020-03-27',
    duration: 203,
  },
  {
    id: 3,
    title: 'SICKO MODE',
    artist: 'Travis Scott',
    genre: 'Hip-Hop',
    bpm: 155,
    key: 'G#m',
    quality: ['4K', '1080p', '720p'],
    downloadCount: 9800,
    isTrending: false,
    isNew: false,
    releaseDate: '2018-10-01',
    duration: 312,
  },
  {
    id: 4,
    title: 'Flowers',
    artist: 'Miley Cyrus',
    genre: 'Pop',
    bpm: 118,
    key: 'Am',
    quality: ['4K', '1080p', '720p'],
    downloadCount: 16800,
    isTrending: true,
    isNew: true,
    releaseDate: '2023-01-12',
    duration: 200,
  },
  {
    id: 5,
    title: 'Industry Baby',
    artist: 'Lil Nas X',
    genre: 'Hip-Hop',
    bpm: 150,
    key: 'Em',
    quality: ['1080p', '720p'],
    downloadCount: 8500,
    isTrending: false,
    isNew: false,
    releaseDate: '2021-07-23',
    duration: 212,
  },
];

export default function AdminVideos() {
  const [videos, setVideos] = useState<AdminVideo[]>(mockVideos);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Filter videos
  const filteredVideos = videos.filter(video => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = filterGenre === 'all' || video.genre === filterGenre;
    return matchesSearch && matchesGenre;
  });

  // Get unique genres
  const genres = [...new Set(videos.map(v => v.genre))];

  // Toggle video selection
  const toggleVideoSelection = (id: number) => {
    setSelectedVideos(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle all
  const toggleAll = () => {
    if (selectedVideos.size === filteredVideos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(filteredVideos.map(v => v.id)));
    }
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tvp-text-muted" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-tvp-bg-tertiary border border-tvp-border-subtle rounded-lg text-tvp-text-primary placeholder:text-tvp-text-muted focus:border-tvp-accent-cyan outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
            className="px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-subtle rounded-lg text-tvp-text-primary text-sm focus:border-tvp-accent-cyan outline-none"
          >
            <option value="all">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>

          {selectedVideos.size > 0 && (
            <button className="px-3 py-2 bg-tvp-status-error/10 text-tvp-status-error text-sm rounded-lg hover:bg-tvp-status-error/20 transition-colors flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete ({selectedVideos.size})
            </button>
          )}
        </div>
      </div>

      {/* Videos Table */}
      <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-tvp-bg-tertiary/50">
              <tr className="text-left text-tvp-text-muted">
                <th className="px-4 py-3 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={selectedVideos.size === filteredVideos.length && filteredVideos.length > 0}
                    onChange={toggleAll}
                    className="rounded border-tvp-border-default"
                  />
                </th>
                <th className="px-4 py-3 font-medium">Video</th>
                <th className="px-4 py-3 font-medium">Genre</th>
                <th className="px-4 py-3 font-medium">BPM / Key</th>
                <th className="px-4 py-3 font-medium">Quality</th>
                <th className="px-4 py-3 font-medium">Downloads</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tvp-border-subtle">
              {filteredVideos.map((video) => (
                <tr key={video.id} className="hover:bg-tvp-bg-tertiary/30">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedVideos.has(video.id)}
                      onChange={() => toggleVideoSelection(video.id)}
                      className="rounded border-tvp-border-default"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-9 rounded bg-tvp-bg-tertiary flex items-center justify-center">
                        <Play className="w-4 h-4 text-tvp-text-muted" />
                      </div>
                      <div>
                        <div className="font-medium text-tvp-text-primary">{video.title}</div>
                        <div className="flex items-center gap-2 text-xs text-tvp-text-muted">
                          <span>{video.artist}</span>
                          <span>•</span>
                          <span>{formatDuration(video.duration)}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-tvp-bg-tertiary rounded text-xs text-tvp-text-secondary">
                      {video.genre}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-mono text-sm">
                      <span className="text-tvp-text-primary">{video.bpm}</span>
                      <span className="text-tvp-text-muted">BPM</span>
                      <span className="text-tvp-accent-cyan">{video.key}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {video.quality.map(q => (
                        <span
                          key={q}
                          className={clsx(
                            'px-1.5 py-0.5 rounded text-[10px] font-bold',
                            q === '4K' ? 'bg-amber-500/20 text-amber-400' :
                            q === '1080p' ? 'bg-tvp-accent-cyan/20 text-tvp-accent-cyan' :
                            'bg-tvp-bg-tertiary text-tvp-text-muted'
                          )}
                        >
                          {q}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-tvp-text-secondary">
                      <Download className="w-3 h-3" />
                      <span>{video.downloadCount.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {video.isTrending && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-tvp-status-success/20 text-tvp-status-success rounded text-[10px]">
                          <TrendingUp className="w-3 h-3" />
                          Trending
                        </span>
                      )}
                      {video.isNew && (
                        <span className="px-2 py-0.5 bg-tvp-accent-purple/20 text-tvp-accent-purple rounded text-[10px]">
                          New
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === video.id ? null : video.id)}
                        className="p-1 hover:bg-tvp-bg-tertiary rounded transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-tvp-text-muted" />
                      </button>

                      {openMenuId === video.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-tvp-bg-secondary border border-tvp-border-default rounded-lg shadow-xl z-10 py-1">
                          <button className="w-full px-3 py-2 text-left text-sm text-tvp-text-secondary hover:bg-tvp-accent-cyan/10 hover:text-tvp-accent-cyan flex items-center gap-2">
                            <Eye className="w-3 h-3" />
                            Preview
                          </button>
                          <button className="w-full px-3 py-2 text-left text-sm text-tvp-text-secondary hover:bg-tvp-accent-cyan/10 hover:text-tvp-accent-cyan flex items-center gap-2">
                            <Edit2 className="w-3 h-3" />
                            Edit Metadata
                          </button>
                          <button className="w-full px-3 py-2 text-left text-sm text-tvp-status-error hover:bg-tvp-status-error/10 flex items-center gap-2">
                            <Trash2 className="w-3 h-3" />
                            Delete Video
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-tvp-border-subtle flex items-center justify-between">
          <span className="text-sm text-tvp-text-muted">
            Showing {filteredVideos.length} of {videos.length} videos
          </span>
          {selectedVideos.size > 0 && (
            <span className="text-sm text-tvp-accent-cyan">
              {selectedVideos.size} selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
