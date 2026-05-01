import { getDatabaseAdapter } from './database.adapter';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

interface SeedConfig {
  assetCount?: number;
  inspectionCount?: number;
  workOrderCount?: number;
  clearExisting?: boolean;
}

/**
 * Seed the database with demo data
 * Idempotent: safe to rerun (checks for existing data)
 */
export async function seedDatabase(config: SeedConfig = {}): Promise<{
  assetsCreated: number;
  inspectionsCreated: number;
  workOrdersCreated: number;
}> {
  const {
    assetCount = 10,
    inspectionCount = 5,
    workOrderCount = 5,
    clearExisting = false,
  } = config;

  const adapter = getDatabaseAdapter();
  let assetsCreated = 0;
  let inspectionsCreated = 0;
  let workOrdersCreated = 0;

  try {
    // Clear existing data if requested
    if (clearExisting) {
      console.log('Clearing existing seed data...');
      // Implement clear logic if needed
    }

    // Check if we already have data
    const existingAssets = adapter.query('assets') || [];
    if (existingAssets.length > 0 && !clearExisting) {
      console.log(`Database already has ${existingAssets.length} assets, skipping seed`);
      return { assetsCreated: 0, inspectionsCreated: 0, workOrdersCreated: 0 };
    }

    // Sample asset types and brands
    const assetTypes = ['HVAC', 'Elevator', 'Fire Extinguisher', 'Lighting', 'Plumbing'];
    const brands = {
      'HVAC': ['Carrier', 'Trane', 'Lennox'],
      'Elevator': ['Otis', 'Schindler', 'ThyssenKrupp'],
      'Fire Extinguisher': ['Kidde', 'First Alert', 'Amerex'],
      'Lighting': ['Philips', 'GE', 'Sylvania'],
      'Plumbing': ['Kohler', 'Moen', 'Delta'],
    };

    const statuses = ['commissioning', 'active', 'maintenance', 'repair', 'decommissioned'];
    const walkthroughIds = ['walk_001', 'walk_002', 'walk_003'];

    // Create sample assets
    const assetIds: string[] = [];
    for (let i = 0; i < assetCount; i++) {
      const type = assetTypes[i % assetTypes.length];
      const brandList = brands[type as keyof typeof brands] || ['Generic'];
      const brand = brandList[0];
      const status = statuses[Math.floor(Math.random() * 3)]; // Mostly active/commissioning
      const walkthrough_id = walkthroughIds[i % walkthroughIds.length];

      const assetId = `seed_asset_${i + 1}`;
      assetIds.push(assetId);

      const now = new Date().toISOString();
      const purchaseDate = new Date();
      purchaseDate.setFullYear(purchaseDate.getFullYear() - Math.floor(Math.random() * 5));

      const asset = {
        id: assetId,
        name: `${brand} ${type} Unit ${i + 1}`,
        type,
        brand,
        model: `MOD-${1000 + i}`,
        serial_number: `SN-${Date.now().toString().slice(-6)}${i}`,
        scene_id: `scene_${String(i + 1).padStart(3, '0')}`,
        yaw: Math.random() * 360,
        pitch: (Math.random() - 0.5) * 180,
        floor: Math.floor(Math.random() * 5) + 1,
        room: `Room ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`,
        status,
        walkthrough_id,
        org_id: 'org_001',
        property_id: walkthrough_id,
        purchase_date: purchaseDate.toISOString().split('T')[0],
        purchase_price: 1000 + Math.random() * 9000,
        useful_life_years: 10,
        salvage_value: 500,
        warranty_date: new Date(purchaseDate.getTime() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        health_score: 50 + Math.random() * 50,
        compliance: [
          { regulation: 'OSHA', status: 'pass', checked_at: now },
          { regulation: 'ISO-9001', status: Math.random() > 0.5 ? 'pass' : 'fail', checked_at: now },
        ],
        transition_history: [],
        created_at: now,
        updated_at: now,
      };

      adapter.insert('assets', asset);
      assetsCreated++;
    }

    // Create sample inspections
    for (let i = 0; i < inspectionCount; i++) {
      const assetId = assetIds[i % assetIds.length];
      const inspectionId = `seed_insp_${i + 1}`;
      const now = new Date().toISOString();

      const inspection = {
        id: inspectionId,
        asset_id: assetId,
        inspector_id: 'user_001',
        status: ['scheduled', 'in_progress', 'completed'][Math.floor(Math.random() * 3)],
        started_at: i > 0 ? new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString() : undefined,
        completed_at: i > 2 ? new Date().toISOString() : undefined,
        location_data: JSON.stringify({ floor: 1, room: 'Lobby' }),
        weather_conditions: 'Clear',
        checklist_template_id: 'template_001',
        created_at: now,
        updated_at: now,
      };

      adapter.insert('inspections', inspection);
      inspectionsCreated++;
    }

    // Create sample work orders
    for (let i = 0; i < workOrderCount; i++) {
      const assetId = assetIds[i % assetIds.length];
      const woId = `seed_wo_${i + 1}`;
      const now = new Date().toISOString();
      const priorities = ['low', 'medium', 'high', 'critical'];

      const workOrder = {
        id: woId,
        asset_id: assetId,
        title: `Maintenance: ${assetIds[i % assetIds.length]}`,
        description: `Routine maintenance task ${i + 1}`,
        priority: priorities[Math.floor(Math.random() * 4)],
        status: ['open', 'assigned', 'in_progress', 'completed'][Math.floor(Math.random() * 4)],
        due_date: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
        assigned_to: 'user_002',
        estimated_hours: 2 + Math.random() * 8,
        actual_hours: i > 2 ? 3 + Math.random() * 6 : undefined,
        parts_used: JSON.stringify([{ name: 'Filter', quantity: 1 }, { name: 'Belt', quantity: 2 }]),
        cost: 100 + Math.random() * 900,
        created_at: now,
        updated_at: now,
      };

      adapter.insert('work_orders', workOrder);
      workOrdersCreated++;
    }

    console.log(`✅ Seed complete: ${assetsCreated} assets, ${inspectionsCreated} inspections, ${workOrdersCreated} work orders`);
    return { assetsCreated, inspectionsCreated, workOrdersCreated };

  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  }
}

/**
 * CLI wrapper for running seeds
 */
export async function runSeedFromCLI(): Promise<void> {
  const args = process.argv.slice(2);
  const clear = args.includes('--clear');

  console.log('Starting database seed...');
  const result = await seedDatabase({ clearExisting: clear });
  console.log('Seed results:', result);
}

// Allow running directly: npx tsx src/config/seed.ts
if (require.main === module) {
  runSeedFromCLI();
}
