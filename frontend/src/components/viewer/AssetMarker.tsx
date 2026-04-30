import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { Asset } from '@/types';

interface AssetMarkerProps {
  asset: Asset;
  onClick?: (asset: Asset) => void;
  issueCount?: number;
  healthScore?: number;
}

function yawPitchToPosition(yaw: number, pitch: number, radius: number = 25): THREE.Vector3 {
  const y = Math.sin(pitch) * radius;
  const rProj = Math.cos(pitch) * radius;
  const x = Math.sin(yaw) * rProj;
  const z = Math.cos(yaw) * rProj;
  return new THREE.Vector3(x, y, z);
}

const statusColors: Record<string, string> = {
  active: '#22c55e',      // green
  maintenance: '#f59e0b',  // amber
  retired: '#6b7280',     // gray
};

const typeColors: Record<string, string> = {
  HVAC: '#3b82f6',      // blue
  Elevator: '#22c55e',   // green
  'Fire Extinguisher': '#ef4444', // red
  Lighting: '#eab308',   // yellow
  Plumbing: '#06b6d4',  // cyan
  Other: '#6b7280',     // gray
};

function AssetMarker({ asset, onClick, issueCount, healthScore }: AssetMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const position = asset.yaw !== undefined && asset.pitch !== undefined
    ? yawPitchToPosition(asset.yaw, asset.pitch, 25)
    : new THREE.Vector3(0, 0, 0);

  useFrame(() => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(Date.now() * 0.002) * 0.1;
      meshRef.current.scale.setScalar(scale);
      meshRef.current.lookAt(0, 0, 0);
      meshRef.current.rotateY(Math.PI);
    }
  });

  const typeColor = typeColors[asset.type] || typeColors.Other;
  const statusColor = statusColors[asset.status] || null;
  const color = statusColor || typeColor; // Status color takes priority

  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick?.(asset);
  };

  if (asset.yaw === undefined || asset.yaw === null || asset.pitch === undefined || asset.pitch === null) return null;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Issue count badge */}
      {issueCount !== undefined && issueCount > 0 && (
        <Html center distanceFactor={10} position={[0, 0.5, 0]} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              background: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
            }}
          >
            {issueCount > 9 ? '9+' : issueCount}
          </div>
        </Html>
      )}

      <Html center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            whiteSpace: 'nowrap',
            transform: 'translateY(-20px)',
          }}
        >
          {asset.name}
          {healthScore !== undefined && (
            <span style={{ marginLeft: '6px', color: healthScore >= 80 ? '#4ade80' : healthScore >= 60 ? '#fbbf24' : '#f87171' }}>
              ({healthScore})
            </span>
          )}
        </div>
      </Html>
    </group>
  );
}

export default AssetMarker;
