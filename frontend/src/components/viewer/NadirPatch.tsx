import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NadirPatchProps {
  imageUrl: string;
  scale?: number;
  rotation?: number;
  opacity?: number;
}

/**
 * NadirPatch Component
 * 
 * Renders an image overlay at the bottom of the 360° sphere to hide
 * the camera tripod/feet and show branding/logo.
 * 
 * The nadir patch is positioned at the bottom (negative Y) of the sphere
 * and can be customized with scale, rotation, and opacity.
 */
function NadirPatch({ imageUrl, scale = 1.0, rotation = 0, opacity = 1.0 }: NadirPatchProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    // Load the nadir image texture
    const loader = new THREE.TextureLoader();
    loader.load(
      imageUrl,
      (texture) => {
        textureRef.current = texture;
        texture.colorSpace = THREE.SRGBColorSpace;
        
        if (meshRef.current) {
          const material = meshRef.current.material as THREE.MeshBasicMaterial;
          if (material) {
            material.map = texture;
            material.needsUpdate = true;
          }
        }
      },
      undefined,
      (error) => {
        console.error('[NadirPatch] Failed to load texture:', error);
      }
    );

    // Cleanup
    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
      }
    };
  }, [imageUrl]);

  // Update transform on every frame
  useFrame(() => {
    if (!meshRef.current) return;

    // Position at bottom of sphere (adjust Y as needed)
    meshRef.current.position.y = -490;
    
    // Apply scale
    const baseScale = 100 * scale;
    meshRef.current.scale.set(baseScale, baseScale, 1);

    // Apply rotation (in radians)
    meshRef.current.rotation.z = THREE.MathUtils.degToRad(rotation);
    
    // Always face upward
    meshRef.current.rotation.x = -Math.PI / 2;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        transparent
        opacity={opacity}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default NadirPatch;
