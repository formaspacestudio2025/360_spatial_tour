import { useTexture } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

interface Sphere360Props {
  imageUrl: string;
  opacity?: number;
}

function Sphere360({ imageUrl, opacity = 1 }: Sphere360Props) {
  const texture = useTexture(imageUrl);
  const meshRef = useRef<THREE.Mesh>(null);

  // Configure texture for 360 display
  if (texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.mapping = THREE.EquirectangularReflectionMapping;
    // Enable anisotropic filtering for better quality
    texture.anisotropy = 8;
  }

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}

export default Sphere360;
