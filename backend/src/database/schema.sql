-- Enterprise Spatial Operations Platform - Database Schema
-- SQLite Database

-- Walkthrough Projects
CREATE TABLE IF NOT EXISTS walkthroughs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  map_latitude REAL,
  map_longitude REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Scenes (360 Images)
CREATE TABLE IF NOT EXISTS scenes (
  id TEXT PRIMARY KEY,
  walkthrough_id TEXT NOT NULL,
  image_path TEXT NOT NULL,
  thumbnail_path TEXT,
  position_x REAL DEFAULT 0,
  position_y REAL DEFAULT 0,
  position_z REAL DEFAULT 0,
  floor INTEGER DEFAULT 1,
  floor_name TEXT,              -- NEW: Floor/zone name (e.g., "Ground Floor", "Level 2")
  room_name TEXT,
  scene_order INTEGER DEFAULT 0,-- NEW: For reordering scenes
  is_archived INTEGER DEFAULT 0,-- NEW: 0=active, 1=archived
  nadir_image_path TEXT,        -- NEW: Custom nadir patch image
  nadir_scale REAL DEFAULT 1.0, -- NEW: Nadir image scale
  nadir_rotation REAL DEFAULT 0,-- NEW: Nadir image rotation
  nadir_opacity REAL DEFAULT 1, -- NEW: Nadir image opacity (0-1)
  notes TEXT,                   -- NEW: Scene notes
  metadata TEXT,                -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (walkthrough_id) REFERENCES walkthroughs(id) ON DELETE CASCADE
);

-- Navigation Graph (Edges between scenes)
CREATE TABLE IF NOT EXISTS navigation_edges (
  id TEXT PRIMARY KEY,
  from_scene_id TEXT NOT NULL,
  to_scene_id TEXT NOT NULL,
  hotspot_yaw REAL,
  hotspot_pitch REAL,
  target_yaw REAL,              -- NEW: Camera orientation on destination
  target_pitch REAL,            -- NEW: Camera orientation on destination
  label TEXT,
  icon_type TEXT DEFAULT 'navigation',  -- NEW: navigation, info, warning, issue, image, video, document, custom
  icon_color TEXT DEFAULT '#10b981',    -- NEW: Hotspot color
  title TEXT,                   -- NEW: Display title
  description TEXT,             -- NEW: Detailed description
  media_type TEXT,              -- NEW: image, video, pdf, document, url, text
  media_url TEXT,               -- NEW: Media file URL
  custom_icon_url TEXT,         -- NEW: Custom icon image
  is_locked INTEGER DEFAULT 0,  -- NEW: 0=false, 1=true
  metadata TEXT,                -- NEW: JSON for extended properties
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_scene_id) REFERENCES scenes(id) ON DELETE CASCADE,
  FOREIGN KEY (to_scene_id) REFERENCES scenes(id) ON DELETE CASCADE,
  UNIQUE(from_scene_id, to_scene_id)
);

-- AI Tags
CREATE TABLE IF NOT EXISTS ai_tags (
  id TEXT PRIMARY KEY,
  scene_id TEXT NOT NULL,
  object_type TEXT NOT NULL,
  confidence REAL,
  bounding_box TEXT,  -- JSON: {x, y, width, height}
  tags TEXT,  -- JSON array of strings
  ai_model TEXT,
  processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE
);

-- Issues
CREATE TABLE IF NOT EXISTS issues (
  id TEXT PRIMARY KEY,
  walkthrough_id TEXT NOT NULL,
  scene_id TEXT NOT NULL,
  ai_tag_id TEXT,
  type TEXT NOT NULL,  -- damage, safety, maintenance, compliance
  severity TEXT NOT NULL,  -- low, medium, high, critical
  status TEXT DEFAULT 'open',  -- open, in_progress, resolved, closed
  title TEXT NOT NULL,
  description TEXT,
  view_angle TEXT,  -- JSON: {yaw, pitch, fov}
  coordinates_3d TEXT,  -- JSON: {x, y, z}
  assigned_to TEXT,
  created_by TEXT,
  due_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (walkthrough_id) REFERENCES walkthroughs(id) ON DELETE CASCADE,
  FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE,
  FOREIGN KEY (ai_tag_id) REFERENCES ai_tags(id) ON DELETE SET NULL
);

-- Versions
CREATE TABLE IF NOT EXISTS versions (
  id TEXT PRIMARY KEY,
  walkthrough_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  snapshot_data TEXT NOT NULL,  -- JSON: full state snapshot
  change_description TEXT,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (walkthrough_id) REFERENCES walkthroughs(id) ON DELETE CASCADE
);

-- Walkthrough Members (Collaboration)
CREATE TABLE IF NOT EXISTS walkthrough_members (
  walkthrough_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'viewer',  -- owner, editor, viewer
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (walkthrough_id, user_id),
  FOREIGN KEY (walkthrough_id) REFERENCES walkthroughs(id) ON DELETE CASCADE
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  walkthrough_id TEXT NOT NULL,
  scene_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  position TEXT,  -- JSON: {yaw, pitch} for 360 coordinates
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (walkthrough_id) REFERENCES walkthroughs(id) ON DELETE CASCADE,
  FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scenes_walkthrough ON scenes(walkthrough_id);
CREATE INDEX IF NOT EXISTS idx_edges_from ON navigation_edges(from_scene_id);
CREATE INDEX IF NOT EXISTS idx_edges_to ON navigation_edges(to_scene_id);
CREATE INDEX IF NOT EXISTS idx_ai_tags_scene ON ai_tags(scene_id);
CREATE INDEX IF NOT EXISTS idx_issues_walkthrough ON issues(walkthrough_id);
CREATE INDEX IF NOT EXISTS idx_issues_scene ON issues(scene_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_versions_walkthrough ON versions(walkthrough_id);
CREATE INDEX IF NOT EXISTS idx_comments_walkthrough ON comments(walkthrough_id);
CREATE INDEX IF NOT EXISTS idx_comments_scene ON comments(scene_id);
