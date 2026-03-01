// ============================================
// THE VIDEO POOL - ADMIN BULK UPLOADER
// Drag-drop with auto-detect metadata
// ============================================

import { useState, useCallback, useRef } from 'react';
import {
  Upload,
  X,
  Check,
  AlertCircle,
  Loader2,
  Music,
  FileVideo,
  Edit2,
  Trash2,
  ChevronDown,
  Wand2,
  Save,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '@/stores/appStore';
import { post } from '@/api/client';

// Types
interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'analyzing' | 'ready' | 'uploading' | 'complete' | 'error';
  progress: number;
  metadata: VideoMetadata;
  error?: string;
}

interface VideoMetadata {
  title: string;
  artist: string;
  genre: string;
  subgenre: string;
  bpm: number | null;
  key: string;
  quality: string;
  versions: string[];
  duration: number;
  year: number;
}

// Genre options
const GENRES = [
  'Pop', 'Hip-Hop / Rap', 'R&B', 'Rock', 'Latin', 'Electronic / Dance', 'Afrobeats',
  'Country', 'K-Pop', 'Indie / Alternative', 'Jazz', 'Metal', 'Punk', 'Classical',
  'Reggae / Dancehall', 'Blues', 'Folk / Americana', 'House', 'Drill', 'Gospel / CCM',
  'Techno', 'Trance', 'Funk', 'Soul', 'Ska', 'Lo-Fi / Chillhop', 'Ambient',
  'Throwbacks', 'Remixes', 'World / Global Fusion',
];

// Quality options
const QUALITIES = ['4K', '1080p', '720p', '480p'];

// Key options
const KEYS = ['C', 'Cm', 'C#', 'C#m', 'D', 'Dm', 'D#', 'D#m', 'E', 'Em', 'F', 'Fm', 'F#', 'F#m', 'G', 'Gm', 'G#', 'G#m', 'A', 'Am', 'A#', 'A#m', 'B', 'Bm'];

// Version options
const VERSION_OPTIONS = ['clean', 'dirty', 'explicit', 'radio', 'extended', 'remix', 'instrumental', 'acapella', 'intro', 'outro', 'quickhit'];

// Parse filename to extract metadata
function parseFilename(filename: string): Partial<VideoMetadata> {
  // Remove extension
  const name = filename.replace(/\.[^/.]+$/, '');

  // Common patterns:
  // "Artist - Title (Clean)"
  // "Artist - Title [1080p]"
  // "Artist - Title 120BPM"

  const metadata: Partial<VideoMetadata> = {};

  // Try to extract artist and title
  const dashMatch = name.match(/^(.+?)\s*[-–—]\s*(.+)$/);
  if (dashMatch) {
    metadata.artist = dashMatch[1].trim();
    let title = dashMatch[2].trim();

    // Extract version from title
    const versionMatch = title.match(/\(?(Clean|Explicit|Extended|Intro|Outro|Quick Hit)\)?$/i);
    if (versionMatch) {
      metadata.versions = [versionMatch[1].toLowerCase()];
      title = title.replace(/\(?(Clean|Explicit|Extended|Intro|Outro|Quick Hit)\)?$/i, '').trim();
    }

    metadata.title = title;
  } else {
    metadata.title = name;
    metadata.artist = 'Unknown Artist';
  }

  // Extract BPM if present
  const bpmMatch = name.match(/(\d{2,3})\s*BPM/i);
  if (bpmMatch) {
    metadata.bpm = parseInt(bpmMatch[1], 10);
  }

  // Extract quality
  const qualityMatch = name.match(/\[?(4K|1080p|720p|480p)\]?/i);
  if (qualityMatch) {
    metadata.quality = qualityMatch[1].toUpperCase();
  }

  // Detect genre from keywords
  const genreKeywords: Record<string, string[]> = {
    'Hip-Hop': ['rap', 'hip-hop', 'trap', 'drill'],
    'EDM': ['edm', 'house', 'techno', 'trance', 'dubstep', 'bass'],
    'R&B': ['r&b', 'rnb', 'soul'],
    'Pop': ['pop'],
    'Latin': ['latin', 'reggaeton', 'bachata', 'salsa'],
  };

  const lowerName = name.toLowerCase();
  for (const [genre, keywords] of Object.entries(genreKeywords)) {
    if (keywords.some(kw => lowerName.includes(kw))) {
      metadata.genre = genre;
      break;
    }
  }

  return metadata;
}

// Simulate BPM detection (in production, would use audio analysis)
function simulateBPMDetection(): number {
  // Return common DJ BPM ranges
  const ranges = [
    { min: 70, max: 90 },   // Hip-Hop
    { min: 100, max: 120 }, // Pop
    { min: 120, max: 140 }, // House/EDM
    { min: 140, max: 170 }, // Drum & Bass
  ];
  const range = ranges[Math.floor(Math.random() * ranges.length)];
  return Math.floor(range.min + Math.random() * (range.max - range.min));
}

// Simulate key detection
function simulateKeyDetection(): string {
  const keys = ['C', 'Cm', 'D', 'Dm', 'E', 'Em', 'F', 'Fm', 'G', 'Gm', 'A', 'Am', 'B', 'Bm'];
  return keys[Math.floor(Math.random() * keys.length)];
}

export default function BulkUploader() {
  const { showToast } = useAppStore();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Process dropped/selected files
  const processFiles = async (fileList: FileList | File[]) => {
    const videoFiles = Array.from(fileList).filter(f =>
      f.type.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm)$/i.test(f.name)
    );

    if (videoFiles.length === 0) {
      showToast('warning', 'No valid video files found');
      return;
    }

    setIsAnalyzing(true);

    // Create upload entries
    const newFiles: UploadFile[] = videoFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      name: file.name,
      size: file.size,
      status: 'analyzing' as const,
      progress: 0,
      metadata: {
        title: '',
        artist: '',
        genre: 'Pop',
        subgenre: '',
        bpm: null,
        key: '',
        quality: '1080p',
        versions: ['clean'],
        duration: 0,
        year: new Date().getFullYear(),
      },
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate metadata analysis for each file
    for (const uploadFile of newFiles) {
      await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));

      const parsed = parseFilename(uploadFile.file.name);
      const detected = {
        bpm: simulateBPMDetection(),
        key: simulateKeyDetection(),
        duration: Math.floor(180 + Math.random() * 120), // 3-5 minutes
      };

      setFiles(prev => prev.map(f =>
        f.id === uploadFile.id
          ? {
              ...f,
              status: 'ready' as const,
              metadata: {
                title: parsed.title || uploadFile.file.name.replace(/\.[^/.]+$/, ''),
                artist: parsed.artist || 'Unknown Artist',
                genre: parsed.genre || 'Pop',
                subgenre: '',
                bpm: parsed.bpm || detected.bpm,
                key: detected.key,
                quality: parsed.quality || '1080p',
                versions: parsed.versions || ['clean'],
                duration: detected.duration,
                year: new Date().getFullYear(),
              },
            }
          : f
      ));
    }

    setIsAnalyzing(false);
    showToast('success', `Analyzed ${videoFiles.length} video${videoFiles.length > 1 ? 's' : ''}`);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  // Update metadata
  const updateMetadata = (id: string, field: keyof VideoMetadata, value: any) => {
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, metadata: { ...f.metadata, [field]: value } } : f
    ));
  };

  // Remove file
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // Auto-detect all
  const autoDetectAll = async () => {
    setIsAnalyzing(true);
    for (const file of files.filter(f => f.status === 'ready')) {
      await new Promise(r => setTimeout(r, 200));
      setFiles(prev => prev.map(f =>
        f.id === file.id
          ? {
              ...f,
              metadata: {
                ...f.metadata,
                bpm: simulateBPMDetection(),
                key: simulateKeyDetection(),
              },
            }
          : f
      ));
    }
    setIsAnalyzing(false);
    showToast('success', 'Metadata refreshed for all files');
  };

  // Upload all — sends metadata to backend; video files must already be in S3
  const uploadAll = async () => {
    const readyFiles = files.filter(f => f.status === 'ready');
    if (readyFiles.length === 0) {
      showToast('warning', 'No files ready to upload');
      return;
    }

    setIsUploading(true);

    // Mark all ready files as uploading
    setFiles(prev => prev.map(f =>
      f.status === 'ready' ? { ...f, status: 'uploading' as const, progress: 30 } : f
    ));

    try {
      const videosPayload = readyFiles.map(f => ({
        title: f.metadata.title,
        artist: f.metadata.artist,
        genre: f.metadata.genre,
        subgenre: f.metadata.subgenre || undefined,
        bpm: f.metadata.bpm ?? undefined,
        key: f.metadata.key || undefined,
        duration: f.metadata.duration,
        year: f.metadata.year,
      }));

      const response = await post<{
        results: Array<{ success: boolean; title: string; artist: string; error?: string }>;
        summary: { total: number; successful: number; failed: number };
      }>('/admin/videos/bulk-upload', { videos: videosPayload });

      // Map results back to files by title+artist
      setFiles(prev => prev.map(f => {
        if (f.status !== 'uploading') return f;
        const result = response.results.find(
          r => r.title === f.metadata.title && r.artist === f.metadata.artist
        );
        if (result?.success) {
          return { ...f, status: 'complete' as const, progress: 100 };
        }
        return { ...f, status: 'error' as const, progress: 0, error: result?.error ?? 'Upload failed' };
      }));

      if (response.summary.successful > 0) {
        showToast('success', `Registered ${response.summary.successful} video${response.summary.successful > 1 ? 's' : ''} in catalog`);
      }
      if (response.summary.failed > 0) {
        showToast('error', `${response.summary.failed} video${response.summary.failed > 1 ? 's' : ''} failed to register`);
      }
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.error ?? 'Upload failed — check console';
      showToast('error', msg);
      setFiles(prev => prev.map(f =>
        f.status === 'uploading'
          ? { ...f, status: 'error' as const, progress: 0, error: msg }
          : f
      ));
    } finally {
      setIsUploading(false);
    }
  };

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const readyCount = files.filter(f => f.status === 'ready').length;
  const completeCount = files.filter(f => f.status === 'complete').length;

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={clsx(
          'relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer',
          isDragging
            ? 'border-tvp-accent-cyan bg-tvp-accent-cyan/10'
            : 'border-tvp-border-default hover:border-tvp-accent-cyan hover:bg-tvp-bg-tertiary/50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,.mp4,.mov,.avi,.mkv,.webm"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <Upload className={clsx(
          'w-12 h-12 mx-auto mb-4 transition-colors',
          isDragging ? 'text-tvp-accent-cyan' : 'text-tvp-text-muted'
        )} />

        <p className="text-lg font-medium text-tvp-text-primary mb-2">
          {isDragging ? 'Drop files here' : 'Drag and drop videos here'}
        </p>
        <p className="text-sm text-tvp-text-muted">
          or click to browse • MP4, MOV, AVI, MKV, WebM • Max 2GB per file
        </p>

        {isAnalyzing && (
          <div className="absolute inset-0 bg-tvp-bg-secondary/90 flex items-center justify-center rounded-xl">
            <div className="flex items-center gap-3 text-tvp-accent-cyan">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-medium">Analyzing files...</span>
            </div>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-tvp-bg-tertiary/30 rounded-xl border border-tvp-border-subtle">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-tvp-border-subtle">
            <div className="flex items-center gap-4">
              <span className="text-sm text-tvp-text-secondary">
                {files.length} file{files.length > 1 ? 's' : ''} •
                {readyCount > 0 && ` ${readyCount} ready`}
                {completeCount > 0 && ` • ${completeCount} complete`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={autoDetectAll}
                disabled={isAnalyzing || readyCount === 0}
                className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                  isAnalyzing || readyCount === 0
                    ? 'bg-tvp-bg-tertiary text-tvp-text-muted cursor-not-allowed'
                    : 'bg-tvp-accent-purple/20 text-tvp-accent-purple hover:bg-tvp-accent-purple/30'
                )}
              >
                <Wand2 className="w-4 h-4" />
                Re-detect All
              </button>
              <button
                onClick={uploadAll}
                disabled={isUploading || readyCount === 0}
                className={clsx(
                  'flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  isUploading || readyCount === 0
                    ? 'bg-tvp-bg-tertiary text-tvp-text-muted cursor-not-allowed'
                    : 'bg-tvp-accent-cyan text-black hover:bg-tvp-accent-cyan-hover'
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload All ({readyCount})
                  </>
                )}
              </button>
            </div>
          </div>

          {/* File Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-tvp-bg-tertiary/50">
                <tr className="text-left text-tvp-text-muted">
                  <th className="px-4 py-3 font-medium">File</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Artist</th>
                  <th className="px-4 py-3 font-medium">Genre</th>
                  <th className="px-4 py-3 font-medium">BPM</th>
                  <th className="px-4 py-3 font-medium">Key</th>
                  <th className="px-4 py-3 font-medium">Quality</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tvp-border-subtle">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-tvp-bg-tertiary/30">
                    {/* Filename */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileVideo className="w-4 h-4 text-tvp-text-muted flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-tvp-text-primary truncate max-w-[150px]" title={file.name}>
                            {file.name}
                          </div>
                          <div className="text-xs text-tvp-text-muted">{formatSize(file.size)}</div>
                        </div>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={file.metadata.title}
                        onChange={(e) => updateMetadata(file.id, 'title', e.target.value)}
                        className="w-full bg-transparent border border-transparent hover:border-tvp-border-subtle focus:border-tvp-accent-cyan px-2 py-1 rounded text-tvp-text-primary outline-none"
                      />
                    </td>

                    {/* Artist */}
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={file.metadata.artist}
                        onChange={(e) => updateMetadata(file.id, 'artist', e.target.value)}
                        className="w-full bg-transparent border border-transparent hover:border-tvp-border-subtle focus:border-tvp-accent-cyan px-2 py-1 rounded text-tvp-text-primary outline-none"
                      />
                    </td>

                    {/* Genre */}
                    <td className="px-4 py-3">
                      <select
                        value={file.metadata.genre}
                        onChange={(e) => updateMetadata(file.id, 'genre', e.target.value)}
                        className="bg-tvp-bg-tertiary border border-tvp-border-subtle rounded px-2 py-1 text-tvp-text-primary outline-none focus:border-tvp-accent-cyan"
                      >
                        {GENRES.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </td>

                    {/* BPM */}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={file.metadata.bpm || ''}
                        onChange={(e) => updateMetadata(file.id, 'bpm', parseInt(e.target.value) || null)}
                        className="w-16 bg-transparent border border-transparent hover:border-tvp-border-subtle focus:border-tvp-accent-cyan px-2 py-1 rounded text-tvp-text-primary outline-none font-mono"
                        min="60"
                        max="200"
                      />
                    </td>

                    {/* Key */}
                    <td className="px-4 py-3">
                      <select
                        value={file.metadata.key}
                        onChange={(e) => updateMetadata(file.id, 'key', e.target.value)}
                        className="bg-tvp-bg-tertiary border border-tvp-border-subtle rounded px-2 py-1 text-tvp-accent-cyan outline-none focus:border-tvp-accent-cyan font-mono"
                      >
                        <option value="">-</option>
                        {KEYS.map(k => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </td>

                    {/* Quality */}
                    <td className="px-4 py-3">
                      <select
                        value={file.metadata.quality}
                        onChange={(e) => updateMetadata(file.id, 'quality', e.target.value)}
                        className="bg-tvp-bg-tertiary border border-tvp-border-subtle rounded px-2 py-1 text-tvp-text-primary outline-none focus:border-tvp-accent-cyan"
                      >
                        {QUALITIES.map(q => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {file.status === 'analyzing' && (
                        <span className="flex items-center gap-1 text-tvp-text-muted">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing
                        </span>
                      )}
                      {file.status === 'ready' && (
                        <span className="flex items-center gap-1 text-tvp-accent-cyan">
                          <Check className="w-4 h-4" />
                          Ready
                        </span>
                      )}
                      {file.status === 'uploading' && (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-tvp-bg-tertiary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-tvp-accent-cyan transition-all"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-tvp-text-muted">{file.progress}%</span>
                        </div>
                      )}
                      {file.status === 'complete' && (
                        <span className="flex items-center gap-1 text-tvp-status-success">
                          <Check className="w-4 h-4" />
                          Complete
                        </span>
                      )}
                      {file.status === 'error' && (
                        <span className="flex items-center gap-1 text-tvp-status-error" title={file.error}>
                          <AlertCircle className="w-4 h-4" />
                          Error
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1.5 text-tvp-text-muted hover:text-tvp-status-error rounded transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
