import { getExtendedDb, writeDb } from '../config/database';
import { AssetEvent, AssetEventCreate, AssetTimelineParams, DigitalTwinSummary } from '../types/assetEvent';

export async function logAssetEvent(event: AssetEventCreate): Promise<AssetEvent> {
  const id = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const now = new Date().toISOString();

  const newEvent: AssetEvent = {
    id,
    ...event,
    created_at: now,
  };

  const extDb = getExtendedDb();
  if (!extDb.asset_events) {
    extDb.asset_events = [];
  }
  extDb.asset_events.push(newEvent);
  writeDb();

  return newEvent;
}

export async function getAssetTimeline(
  assetId: string,
  params: AssetTimelineParams = {}
): Promise<{ events: AssetEvent[]; total: number }> {
  const { limit = 50, offset = 0, event_type, start_date, end_date } = params;

  const extDb = getExtendedDb();
  let events: AssetEvent[] = (extDb.asset_events || []).filter(
    (e: any) => e.asset_id === assetId
  );

  // Apply filters
  if (event_type) {
    events = events.filter(e => e.event_type === event_type);
  }
  if (start_date) {
    events = events.filter(e => e.created_at >= start_date);
  }
  if (end_date) {
    events = events.filter(e => e.created_at <= end_date);
  }

  // Sort newest first
  events.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = events.length;
  const paginated = events.slice(offset, offset + limit);

  return { events: paginated, total };
}

export async function getDigitalTwinSummary(assetId: string): Promise<DigitalTwinSummary> {
  const extDb = getExtendedDb();
  const events: AssetEvent[] = (extDb.asset_events || []).filter(
    (e: any) => e.asset_id === assetId
  );

  const inspections = events.filter(e => e.event_type === 'inspected');
  const maintenance = events.filter(e => e.event_type === 'maintained');
  const issues = events.filter(e => e.event_type === 'issue_opened');
  const resolved = events.filter(e => e.event_type === 'issue_resolved');

  // Calculate uptime percentage (simplified: days active / total days since creation)
  const createdEvent = events.find(e => e.event_type === 'created');
  const now = new Date();
  const createdDate = createdEvent ? new Date(createdEvent.created_at) : new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const totalDays = Math.max(1, Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));

  const downtimeEvents = events.filter(e => e.event_type === 'state_changed' && e.metadata?.to_status === 'repair');
  const downtimeDays = downtimeEvents.length * 2; // Simplified: assume each repair takes 2 days
  const uptimePercentage = Math.max(0, Math.min(100, 100 - (downtimeDays / totalDays) * 100));

  // MTBF (Mean Time Between Failures) - simplified
  const failures = events.filter(e => e.event_type === 'issue_opened' && e.metadata?.severity === 'critical');
  const mtbfDays = failures.length > 0 ? Math.floor(totalDays / failures.length) : totalDays;

  // Total maintenance cost
  const totalCost = maintenance.reduce((sum, e) => sum + (e.metadata?.cost || 0), 0);

  // Last inspection/maintenance dates
  const lastInspection = inspections.length > 0 ? inspections[inspections.length - 1].created_at : undefined;
  const lastMaintenance = maintenance.length > 0 ? maintenance[maintenance.length - 1].created_at : undefined;

  // Health trend (simplified)
  const recentHealthChanges = events
    .filter(e => e.event_type === 'health_changed')
    .slice(-5);
  let healthTrend: 'improving' | 'stable' | 'declining' = 'stable';
  if (recentHealthChanges.length >= 2) {
    const first = recentHealthChanges[0].metadata?.score || 50;
    const last = recentHealthChanges[recentHealthChanges.length - 1].metadata?.score || 50;
    if (last > first + 5) healthTrend = 'improving';
    else if (last < first - 5) healthTrend = 'declining';
  }

  return {
    total_inspections: inspections.length,
    total_maintenance: maintenance.length,
    total_issues: issues.length,
    resolved_issues: resolved.length,
    uptime_percentage: uptimePercentage,
    mtbf_days: mtbfDays,
    total_cost: totalCost,
    last_inspection: lastInspection,
    last_maintenance: lastMaintenance,
    health_trend: healthTrend,
  };
}
