import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { Issue } from '@/types/issue';

interface IssueMarkerProps {
  issue: Issue;
  onClick?: (issue: Issue) => void;
}

function yawPitchToPosition(yaw: number, pitch: number, radius: number = 10): THREE.Vector3 {
  const y = Math.sin(pitch) * radius;
  const rProj = Math.cos(pitch) * radius;
  const x = Math.sin(yaw) * rProj;
  const z = Math.cos(yaw) * rProj;
  return new THREE.Vector3(x, y, z);
}

const statusColors: Record<string, string> = {
  open: '#ef4444', // red
  in_progress: '#eab308', // yellow
  resolved: '#22c55e', // green
  closed: '#6b7280', // gray
};

function IssueMarker({ issue, onClick }: IssueMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const position = yawPitchToPosition(issue.yaw, issue.pitch, 10);

  useFrame(() => {
    if (meshRef.current) {
      // subtle pulse
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.15;
      meshRef.current.scale.setScalar(scale);
      meshRef.current.lookAt(0, 0, 0);
      meshRef.current.rotateY(Math.PI);
    }
  });

  const color = statusColors[issue.status] || '#6b7280';

  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick?.(issue);
  };

  return (
    <group position={position}>
      {/* Click target */}
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
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Label */}
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
          {issue.title}
        </div>
      </Html>
    </group>
  );
}

export default IssueMarker;
