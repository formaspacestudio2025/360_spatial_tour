-- Enterprise Hotspot Media & Link Management
-- Migration: Add hotspot media attachments and link management
-- Date: 2026-04-21

-- Hotspot Media Attachments
CREATE TABLE IF NOT EXISTS hotspot_media (
  id TEXT PRIMARY KEY,
  hotspot_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,  -- image, video, pdf, document, audio
  file_size INTEGER,        -- bytes
  file_path TEXT NOT NULL,
  file_url TEXT,
  thumbnail_path TEXT,
  title TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  uploaded_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotspot_id) REFERENCES navigation_edges(id) ON DELETE CASCADE
);

-- Hotspot Links
CREATE TABLE IF NOT EXISTS hotspot_links (
  id TEXT PRIMARY KEY,
  hotspot_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'custom',  -- website, document, product, manual, maps, internal, custom
  favicon_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotspot_id) REFERENCES navigation_edges(id) ON DELETE CASCADE
);

-- Add animation and style fields to existing navigation_edges
ALTER TABLE navigation_edges ADD COLUMN animation_type TEXT DEFAULT 'pulse';
ALTER TABLE navigation_edges ADD COLUMN animation_speed REAL DEFAULT 1.0;
ALTER TABLE navigation_edges ADD COLUMN style_config TEXT;  -- JSON: {iconSize, opacity, labelPosition, hoverScale, etc.}

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hotspot_media_hotspot_id ON hotspot_media(hotspot_id);
CREATE INDEX IF NOT EXISTS idx_hotspot_links_hotspot_id ON hotspot_links(hotspot_id);
CREATE INDEX IF NOT EXISTS idx_navigation_edges_animation ON navigation_edges(animation_type);
