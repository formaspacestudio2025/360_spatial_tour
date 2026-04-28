import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Mock dependencies before importing AssetMarker
vi.mock('three', () => ({
  Vector3: vi.fn().mockImplementation((x: number, y: number, z: number) => ({ x, y, z })),
  Mesh: vi.fn(),
  BoxGeometry: vi.fn(),
  MeshStandardMaterial: vi.fn(),
}));

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useRef: vi.fn(() => ({ current: null })),
}));

vi.mock('@react-three/drei', () => ({
  Html: vi.fn(({ children, ...props }: any) => <div data-testid="html-overlay" {...props}>{children}</div>),
}));

// Import AssetMarker after mocks
import AssetMarker from '../AssetMarker';
import { Asset } from '@/types';

describe('AssetMarker', () => {
  const mockAsset: Asset = {
    id: 'asset-1',
    name: 'Test HVAC Unit',
    type: 'HVAC',
    status: 'active',
    scene_id: 'scene-1',
    yaw: 45,
    pitch: 30,
    walkthrough_id: 'walkthrough-1',
    org_id: 'org-1',
    property_id: 'prop-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when yaw is undefined', () => {
    const assetWithoutYaw = { ...mockAsset, yaw: undefined as any };
    const { container } = render(<AssetMarker asset={assetWithoutYaw} onClick={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when pitch is undefined', () => {
    const assetWithoutPitch = { ...mockAsset, pitch: undefined as any };
    const { container } = render(<AssetMarker asset={assetWithoutPitch} onClick={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when yaw is null', () => {
    const assetWithNullYaw = { ...mockAsset, yaw: null as any };
    const { container } = render(<AssetMarker asset={assetWithNullYaw} onClick={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when pitch is null', () => {
    const assetWithNullPitch = { ...mockAsset, pitch: null as any };
    const { container } = render(<AssetMarker asset={assetWithNullPitch} onClick={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders when yaw and pitch are provided', () => {
    const { container } = render(<AssetMarker asset={mockAsset} onClick={vi.fn()} />);
    expect(container.firstChild).not.toBeNull();
  });

  it('displays asset name in the HTML overlay', () => {
    render(<AssetMarker asset={mockAsset} onClick={vi.fn()} />);
    expect(screen.getByText('Test HVAC Unit')).toBeInTheDocument();
  });
});
