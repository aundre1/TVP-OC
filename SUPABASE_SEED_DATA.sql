-- ============================================================================
-- The Video Pool - Sample Data for Testing
-- ============================================================================
-- This file contains sample data to test the database connection and schema.
-- Run this AFTER the migration to populate with test data.
-- ============================================================================

SET search_path TO the_video_pool;

-- ============================================================================
-- SAMPLE VIDEOS (15 test videos)
-- ============================================================================

INSERT INTO videos (
  title, artist, label, bpm, key, genre, subgenres, quality, duration,
  thumbnail, video_url, is_new, is_hot
) VALUES

-- Deep House
('Midnight Dreams', 'Luna Echo', 'Deep Records', 120, 'A Minor', 'Deep House',
  ARRAY['Ambient', 'Chill'], '1080p', '4:32',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300',
  'https://example.com/midnight-dreams.mp4', TRUE, FALSE),

('Neon Nights', 'Synthwave Masters', 'Neon Label', 115, 'E Major', 'Deep House',
  ARRAY['Retro', 'Electronic'], '1080p', '5:15',
  'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300',
  'https://example.com/neon-nights.mp4', TRUE, TRUE),

-- Techno
('Industrial Pulse', 'Tech Collective', 'Techno Underground', 130, 'D Minor', 'Techno',
  ARRAY['Industrial', 'Dark'], '4K', '6:45',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300',
  'https://example.com/industrial-pulse.mp4', FALSE, TRUE),

('Berlin Nights', 'Rhythm Section', 'European Sounds', 128, 'F# Minor', 'Techno',
  ARRAY['Progressive', 'Hypnotic'], '1080p', '7:20',
  'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=300',
  'https://example.com/berlin-nights.mp4', FALSE, FALSE),

-- Electro House
('Electric Storm', 'Bass Authority', 'House Nation', 135, 'G Major', 'Electro House',
  ARRAY['Big Room', 'Festival'], '1080p', '5:50',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300',
  'https://example.com/electric-storm.mp4', TRUE, TRUE),

('Cyber Vision', 'Digital Dreams', 'Future House', 132, 'C Major', 'Electro House',
  ARRAY['Futuristic', 'Synth-Pop'], '720p', '4:10',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
  'https://example.com/cyber-vision.mp4', TRUE, FALSE),

-- Progressive House
('Journey Through Space', 'Cosmic Travelers', 'Progressive Vibes', 125, 'B Minor', 'Progressive House',
  ARRAY['Ambient', 'Orchestral'], '1080p', '8:30',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
  'https://example.com/journey-space.mp4', FALSE, FALSE),

('Sunrise Awakening', 'Morning Grooves', 'Chill House Records', 122, 'G Major', 'Progressive House',
  ARRAY['Uplifting', 'Melodic'], '1080p', '6:15',
  'https://images.unsplash.com/photo-1511182584867-e3fca3ebc872?w=300',
  'https://example.com/sunrise-awakening.mp4', FALSE, TRUE),

-- Minimal Techno
('Minimalist Vision', 'Sparse Sound', 'Minimal Movement', 124, 'A Minor', 'Minimal Techno',
  ARRAY['Experimental', 'Stripped'], '1080p', '7:00',
  'https://images.unsplash.com/photo-1516880111498-3cb4e803a90f?w=300',
  'https://example.com/minimalist-vision.mp4', FALSE, FALSE),

('Four Beats', 'Rhythm Pure', 'Simple Sounds', 120, 'D Minor', 'Minimal Techno',
  ARRAY['Hypnotic', 'Repetitive'], '720p', '5:45',
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300',
  'https://example.com/four-beats.mp4', TRUE, FALSE),

-- Trance
('Euphoric Heights', 'Trance Kingdom', 'Trance Paradise', 138, 'E Major', 'Trance',
  ARRAY['Uplifting', 'Melodic'], '1080p', '6:50',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300',
  'https://example.com/euphoric-heights.mp4', FALSE, TRUE),

('Cosmic Evolution', 'Space Journey', 'Trance Dimensions', 135, 'F# Major', 'Trance',
  ARRAY['Progressive', 'Spiritual'], '1080p', '7:30',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300',
  'https://example.com/cosmic-evolution.mp4', TRUE, TRUE),

-- Drum & Bass
('Fast Break', 'Speed Masters', 'Drum & Bass Labs', 175, 'C Minor', 'Drum & Bass',
  ARRAY['Liquid', 'Funk'], '1080p', '5:20',
  'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=300',
  'https://example.com/fast-break.mp4', FALSE, FALSE),

('Liquid Dreams', 'Smooth Beats', 'Liquid Sessions', 170, 'B Minor', 'Drum & Bass',
  ARRAY['Soulful', 'Jazz'], '1080p', '6:10',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300',
  'https://example.com/liquid-dreams.mp4', TRUE, FALSE),

-- Future Bass
('Future Vibes', 'Bass Innovators', 'New Generation', 128, 'A Major', 'Future Bass',
  ARRAY['Melodic', 'Chilled'], '1080p', '5:05',
  'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300',
  'https://example.com/future-vibes.mp4', TRUE, TRUE);

-- ============================================================================
-- SAMPLE USER PROFILES (5 test users)
-- ============================================================================

INSERT INTO user_profiles (
  user_id, name, email, plan, downloads_remaining, view_mode, section_order
) VALUES

('user_001', 'DJ Alex', 'alex@example.com', 'pro', 50,
  'grid', '["trending", "new-releases", "for-you"]'::jsonb),

('user_002', 'Sarah the Mixer', 'sarah@example.com', 'free', 0,
  'list', '["new-releases", "trending", "for-you"]'::jsonb),

('user_003', 'Beat Producer', 'beat@example.com', 'elite', 999,
  'grid', '["for-you", "trending", "new-releases"]'::jsonb),

('user_004', 'House Collector', 'house@example.com', 'pro', 25,
  'list', '["new-releases", "for-you", "trending"]'::jsonb),

('user_005', 'Demo User', 'demo@example.com', 'free', 0,
  'grid', '["trending", "new-releases", "for-you"]'::jsonb);

-- ============================================================================
-- SAMPLE FAVORITES (user favorited videos)
-- ============================================================================

INSERT INTO favorites (user_id, video_id) VALUES

-- Alex favorited 4 videos
('user_001', (SELECT id FROM videos WHERE title = 'Neon Nights' LIMIT 1)),
('user_001', (SELECT id FROM videos WHERE title = 'Electric Storm' LIMIT 1)),
('user_001', (SELECT id FROM videos WHERE title = 'Euphoric Heights' LIMIT 1)),
('user_001', (SELECT id FROM videos WHERE title = 'Cosmic Evolution' LIMIT 1)),

-- Sarah favorited 2 videos
('user_002', (SELECT id FROM videos WHERE title = 'Midnight Dreams' LIMIT 1)),
('user_002', (SELECT id FROM videos WHERE title = 'Sunrise Awakening' LIMIT 1)),

-- Beat Producer favorited 5 videos
('user_003', (SELECT id FROM videos WHERE title = 'Industrial Pulse' LIMIT 1)),
('user_003', (SELECT id FROM videos WHERE title = 'Berlin Nights' LIMIT 1)),
('user_003', (SELECT id FROM videos WHERE title = 'Electric Storm' LIMIT 1)),
('user_003', (SELECT id FROM videos WHERE title = 'Fast Break' LIMIT 1)),
('user_003', (SELECT id FROM videos WHERE title = 'Liquid Dreams' LIMIT 1)),

-- House Collector favorited 3 videos
('user_004', (SELECT id FROM videos WHERE title = 'Journey Through Space' LIMIT 1)),
('user_004', (SELECT id FROM videos WHERE title = 'Sunrise Awakening' LIMIT 1)),
('user_004', (SELECT id FROM videos WHERE title = 'Electric Storm' LIMIT 1));

-- ============================================================================
-- SAMPLE DOWNLOADS (download history)
-- ============================================================================

INSERT INTO downloads (user_id, video_id) VALUES

-- Alex downloaded videos
('user_001', (SELECT id FROM videos WHERE title = 'Neon Nights' LIMIT 1)),
('user_001', (SELECT id FROM videos WHERE title = 'Electric Storm' LIMIT 1)),

-- Beat Producer downloaded videos
('user_003', (SELECT id FROM videos WHERE title = 'Industrial Pulse' LIMIT 1)),
('user_003', (SELECT id FROM videos WHERE title = 'Berlin Nights' LIMIT 1)),
('user_003', (SELECT id FROM videos WHERE title = 'Fast Break' LIMIT 1)),

-- House Collector downloaded videos
('user_004', (SELECT id FROM videos WHERE title = 'Journey Through Space' LIMIT 1)),
('user_004', (SELECT id FROM videos WHERE title = 'Sunrise Awakening' LIMIT 1));

-- ============================================================================
-- SAMPLE PLAYLISTS (user-created sets)
-- ============================================================================

INSERT INTO playlists (user_id, name, description, is_public) VALUES

('user_001', 'Peak Time Bangers', 'High energy tracks for the peak of the set', TRUE),
('user_001', 'Deep & Smooth', 'Deep house grooves for warm-up', FALSE),

('user_002', 'Chill Vibes', 'Relaxing tracks for background music', TRUE),

('user_003', 'Techno Masters', 'Dark, industrial techno collection', TRUE),
('user_003', 'Liquid Perfection', 'Smooth drum and bass', FALSE),

('user_004', 'House Essentials', 'Classic and modern house tracks', TRUE);

-- ============================================================================
-- SAMPLE PLAYLIST_VIDEOS (videos in playlists)
-- ============================================================================

INSERT INTO playlist_videos (playlist_id, video_id, position) VALUES

-- Peak Time Bangers (user_001)
((SELECT id FROM playlists WHERE name = 'Peak Time Bangers' LIMIT 1),
  (SELECT id FROM videos WHERE title = 'Electric Storm' LIMIT 1), 1),
((SELECT id FROM playlists WHERE name = 'Peak Time Bangers' LIMIT 1),
  (SELECT id FROM videos WHERE title = 'Euphoric Heights' LIMIT 1), 2),
((SELECT id FROM playlists WHERE name = 'Peak Time Bangers' LIMIT 1),
  (SELECT id FROM videos WHERE title = 'Fast Break' LIMIT 1), 3),

-- Deep & Smooth (user_001)
((SELECT id FROM playlists WHERE name = 'Deep & Smooth' LIMIT 1),
  (SELECT id FROM videos WHERE title = 'Midnight Dreams' LIMIT 1), 1),
((SELECT id FROM playlists WHERE name = 'Deep & Smooth' LIMIT 1),
  (SELECT id FROM videos WHERE title = 'Journey Through Space' LIMIT 1), 2),

-- Chill Vibes (user_002)
((SELECT id FROM playlists WHERE name = 'Chill Vibes' LIMIT 1),
  (SELECT id FROM videos WHERE title = 'Midnight Dreams' LIMIT 1), 1),
((SELECT id FROM playlists WHERE name = 'Chill Vibes' LIMIT 1),
  (SELECT id FROM videos WHERE title = 'Sunrise Awakening' LIMIT 1), 2),
((SELECT id FROM playlists WHERE name = 'Chill Vibes' LIMIT 1),
  (SELECT id FROM videos WHERE title = 'Minimalist Vision' LIMIT 1), 3),

-- Techno Masters (user_003)
((SELECT id FROM playlists WHERE name = 'Techno Masters' LIMIT 1),
  (SELECT id FROM videos WHERE title = 'Industrial Pulse' LIMIT 1), 1),
((SELECT id FROM playlists WHERE name = 'Techno Masters' LIMIT 1),
  (SELECT id FROM videos WHERE title = 'Berlin Nights' LIMIT 1), 2),
((SELECT id FROM playlists WHERE name = 'Techno Masters' LIMIT 1),
  (SELECT id FROM videos WHERE title = 'Four Beats' LIMIT 1), 3),

-- Liquid Perfection (user_003)
((SELECT id FROM playlists WHERE name = 'Liquid Perfection' LIMIT 1),
  (SELECT id FROM videos WHERE title = 'Liquid Dreams' LIMIT 1), 1),
((SELECT id FROM playlists WHERE name = 'Liquid Perfection' LIMIT 1),
  (SELECT id FROM videos WHERE title = 'Fast Break' LIMIT 1), 2),

-- House Essentials (user_004)
((SELECT id FROM playlists WHERE name = 'House Essentials' LIMIT 1),
  (SELECT id FROM videos WHERE title = 'Journey Through Space' LIMIT 1), 1),
((SELECT id FROM playlists WHERE name = 'House Essentials' LIMIT 1),
  (SELECT id FROM videos WHERE title = 'Sunrise Awakening' LIMIT 1), 2),
((SELECT id FROM playlists WHERE name = 'House Essentials' LIMIT 1),
  (SELECT id FROM videos WHERE title = 'Electric Storm' LIMIT 1), 3),
((SELECT id FROM playlists WHERE name = 'House Essentials' LIMIT 1),
  (SELECT id FROM videos WHERE title = 'Neon Nights' LIMIT 1), 4);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- This creates:
-- • 15 sample videos (various genres: house, techno, trance, D&B)
-- • 5 test user profiles (mix of free, pro, elite plans)
-- • 14 favorite entries (users favoriting videos)
-- • 7 downloads (download history)
-- • 6 playlists (user-created sets)
-- • 13 playlist-video relationships
--
-- To verify, run:
-- SELECT COUNT(*) as video_count FROM videos;
-- SELECT COUNT(*) as user_count FROM user_profiles;
-- SELECT COUNT(*) as favorite_count FROM favorites;
-- SELECT COUNT(*) as download_count FROM downloads;
-- SELECT COUNT(*) as playlist_count FROM playlists;
-- SELECT COUNT(*) as playlist_video_count FROM playlist_videos;
-- ============================================================================
