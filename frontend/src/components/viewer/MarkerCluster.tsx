import { useState, useMemo, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface ClusterableMarker {
  id: string;
  position: [number, number, number];
  [key: string]: any;
}

interface MarkerClusterProps {
  markers: ClusterableMarker[];
  clusterDistance?: number; // Distance threshold for clustering (in world units)
  maxClusterZoom?: number; // Camera FOV threshold for unclustering
  currentFov?: number;
  onMarkerClick?: (marker: ClusterableMarker) => void;
  renderMarker: (marker: ClusterableMarker) => React.ReactNode;
  renderCluster?: (cluster: Cluster, onClick: () => void) => React.ReactNode;
}

interface Cluster {
  id: string;
  position: THREE.Vector3;
  markers: ClusterableMarker[];
  count: number;
}

function MarkerCluster({
  markers,
  clusterDistance = 50, // Default 50 world units
  maxClusterZoom = 60, // Uncluster when FOV is below this
  currentFov = 75,
  onMarkerClick,
  renderMarker,
  renderCluster,
}: MarkerClusterProps) {
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);

  // Calculate distance between two 3D points
  const calculateDistance = useCallback((pos1: THREE.Vector3, pos2: THREE.Vector3) => {
    return pos1.distanceTo(pos2);
  }, []);

  // Build clusters using a simple distance-based algorithm
  const clusters = useMemo(() => {
    if (markers.length === 0) return [];

    const clusters: Cluster[] = [];
    const assignedMarkers = new Set<string>();

    // Convert marker positions to Vector3
    const markerPositions = markers.map(marker => ({
      marker,
      position: new THREE.Vector3(...marker.position)
    }));

    // Build clusters
    for (const { marker, position } of markerPositions) {
      if (assignedMarkers.has(marker.id)) continue;

      // Find all markers within cluster distance
      const clusterMarkers: ClusterableMarker[] = [marker];
      const clusterPosition = position.clone();
      assignedMarkers.add(marker.id);

      for (const { marker: otherMarker, position: otherPosition } of markerPositions) {
        if (assignedMarkers.has(otherMarker.id)) continue;

        const distance = calculateDistance(position, otherPosition);
        if (distance <= clusterDistance) {
          clusterMarkers.push(otherMarker);
          clusterPosition.add(otherPosition);
          assignedMarkers.add(otherMarker.id);
        }
      }

      // Calculate cluster center (average position)
      if (clusterMarkers.length > 1) {
        clusterPosition.divideScalar(clusterMarkers.length);
      }

      clusters.push({
        id: `cluster-${clusterMarkers.map(m => m.id).sort().join('-')}`,
        position: clusterPosition,
        markers: clusterMarkers,
        count: clusterMarkers.length
      });
    }

    return clusters;
  }, [markers, clusterDistance, calculateDistance]);

  // Determine if we should show clusters or individual markers
  const shouldCluster = currentFov > maxClusterZoom;

  // Handle cluster click
  const handleClusterClick = useCallback((cluster: Cluster) => {
    if (cluster.count === 1) {
      const marker = cluster.markers[0];
      if (onMarkerClick) {
        onMarkerClick(marker);
      }
    } else {
      // Toggle cluster expansion
      setExpandedCluster(prev =>
        prev === cluster.id ? null : cluster.id
      );
    }
  }, [onMarkerClick]);

  // Default cluster renderer
  const defaultClusterRenderer = useCallback((cluster: Cluster, onClick: () => void) => (
    <group onClick={onClick}>
      {/* Cluster circle */}
      <mesh position={[cluster.position.x, cluster.position.y, cluster.position.z]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Cluster count */}
      <Text
        position={[cluster.position.x, cluster.position.y + 1.2, cluster.position.z]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {cluster.count}
      </Text>

      {/* Cluster ring */}
      <mesh position={[cluster.position.x, cluster.position.y, cluster.position.z]}>
        <ringGeometry args={[1.0, 1.2, 32]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  ), []);

  return (
    <group>
      {shouldCluster ? (
        // Show clusters
        clusters.map(cluster => {
          const isExpanded = expandedCluster === cluster.id;

          if (isExpanded || cluster.count === 1) {
            // Show individual markers when expanded or if only one marker in cluster
            return (
              <group key={cluster.id}>
                {cluster.markers.map(marker => (
                  <group
                    key={marker.id}
                    onClick={onMarkerClick ? (e) => {
                      e.stopPropagation();
                      onMarkerClick(marker);
                    } : undefined}
                  >
                    {renderMarker(marker)}
                  </group>
                ))}
              </group>
            );
          }

          // Show cluster
          return (
            <group key={cluster.id}>
              {renderCluster
                ? renderCluster(cluster, () => handleClusterClick(cluster))
                : defaultClusterRenderer(cluster, () => handleClusterClick(cluster))
              }
            </group>
          );
        })
      ) : (
        // Show individual markers
        markers.map(marker => (
          <group
            key={marker.id}
            onClick={onMarkerClick ? (e) => {
              e.stopPropagation();
              onMarkerClick(marker);
            } : undefined}
          >
            {renderMarker(marker)}
          </group>
        ))
      )}
    </group>
  );
}

export default MarkerCluster;