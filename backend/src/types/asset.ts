export interface AssetDocument {
  filename: string;
  originalname: string;
  path: string;
  size: number;
  uploaded_at: string;
  mimetype: string;
}

export interface ComplianceTag {
  regulation: string;
  status: 'pass' | 'fail' | 'pending';
  note?: string;
  checked_at?: string;
}

export interface AssetTransition {
  from_status: string;
  to_status: string;
  reason: string;
  user_id: string;
  timestamp: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string; // 'HVAC' | 'Elevator' | 'Fire Extinguisher' | 'Lighting' | 'Plumbing' | 'Other'
  brand?: string;
  model?: string;
  serial_number?: string;
  scene_id?: string;       // which 360 scene it's pinned to
  yaw?: number;            // spatial pinning
  pitch?: number;
  floor?: number;
  room?: string;
  status: 'commissioning' | 'active' | 'maintenance' | 'repair' | 'decommissioned' | 'disposed';
  walkthrough_id?: string;  // which property/walkthrough it belongs to
  org_id?: string;         // organization that owns this asset
  property_id?: string;     // specific property (if different from walkthrough)
  purchase_date?: string;  // ISO date string when asset was purchased
  purchase_price?: number;   // purchase price for depreciation calculation
  useful_life_years?: number; // useful life in years for depreciation (default: 10)
  salvage_value?: number;    // estimated salvage value (default: 0)
  warranty_date?: string;  // ISO date string when warranty expires
  documents?: AssetDocument[]; // attached documents
  health_score?: number; // 0-100, calculated by service
  compliance?: ComplianceTag[]; // compliance tags
  transition_history?: AssetTransition[]; // log of status changes
  created_at: string;
  updated_at: string;
}
