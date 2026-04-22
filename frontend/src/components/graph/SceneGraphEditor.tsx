import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  NodeTypes,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  ConnectionLineType,
  addEdge,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SceneNode } from './SceneNode';
import { GraphToolbar } from './GraphToolbar';
import { scenesToNodes, hotspotsToEdges, autoLayoutNodes } from '../../utils/graphUtils';
import { Hotspot, hotspotsApi } from '../../api/hotspots';

interface Scene {
  id: string;
  image_path: string;
  [key: string]: any;
}

interface SceneGraphEditorProps {
  scenes: Scene[];
  hotspots: Hotspot[];
  onNodeClick?: (sceneId: string) => void;
  onConnectionCreated?: (hotspot: Hotspot) => void;
  onConnectionDeleted?: (hotspotId: string) => void;
}

const nodeTypes: NodeTypes = {
  sceneNode: SceneNode,
};

export function SceneGraphEditor({ scenes, hotspots, onNodeClick, onConnectionCreated, onConnectionDeleted }: SceneGraphEditorProps) {
  const initialNodes = scenesToNodes(scenes);
  const initialEdges = hotspotsToEdges(hotspots);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [layoutDirection, setLayoutDirection] = useState<'horizontal' | 'vertical'>('horizontal');

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick]
  );

  const handleZoomIn = useCallback(() => {
    // React Flow provides zoom via controls, this is for custom toolbar
  }, []);

  const handleZoomOut = useCallback(() => {
    // React Flow provides zoom via controls
  }, []);

  const handleFitView = useCallback(() => {
    // Can be implemented with useReactFlow hook if needed
  }, []);

  const handleAutoLayout = useCallback(
    (direction: 'horizontal' | 'vertical') => {
      setLayoutDirection(direction);
      const updatedNodes = autoLayoutNodes(nodes, direction);
      setNodes(updatedNodes);
    },
    [nodes, setNodes]
  );

  // NEW: Handle connection creation (drag from one node to another)
  const onConnect = useCallback(
    async (connection: Connection) => {
      // Prevent self-connections
      if (connection.source === connection.target) {
        console.warn('[Graph] Cannot connect scene to itself');
        return;
      }

      // Add edge to UI immediately (optimistic update)
      const newEdge: Edge = {
        id: `edge-temp-${Date.now()}`,
        source: connection.source!,
        target: connection.target!,
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
        animated: true,
        label: 'New Connection',
      };

      setEdges((eds) => addEdge(newEdge, eds));

      // Save to database
      try {
        console.log('[Graph] Creating hotspot connection:', connection.source, '->', connection.target);
        
        const response = await hotspotsApi.create(connection.source!, {
          to_scene_id: connection.target!,
          yaw: 0, // Default values - can be edited later
          pitch: 0,
          label: 'New Connection',
          icon_type: 'navigation',
          icon_color: '#10b981',
        });

        // Replace temporary edge with real one
        setEdges((eds) => {
          const updated = eds.filter((e) => e.id !== newEdge.id);
          return addEdge(
            {
              id: `edge-${response.data.id}`,
              source: connection.source!,
              target: connection.target!,
              type: 'smoothstep',
              style: { stroke: '#10b981', strokeWidth: 2 },
              animated: true,
              label: response.data.label,
            },
            updated
          );
        });

        // Notify parent
        onConnectionCreated?.(response.data);
        console.log('[Graph] Connection saved successfully');
      } catch (error) {
        console.error('[Graph] Failed to save connection:', error);
        // Remove temporary edge on failure
        setEdges((eds) => eds.filter((e) => e.id !== newEdge.id));
        alert('Failed to save connection. Please try again.');
      }
    },
    [setEdges, onConnectionCreated]
  );

  // NEW: Handle edge deletion
  const handleDeleteEdge = useCallback(
    async (edges: Edge[]) => {
      // Process each deleted edge
      for (const edge of edges) {
        // Extract hotspot ID from edge ID (format: "edge-{hotspotId}")
        const hotspotId = edge.id.replace('edge-', '');

        if (!hotspotId || hotspotId.startsWith('temp')) {
          // Just remove from UI if it's a temp edge
          continue;
        }

        try {
          console.log('[Graph] Deleting hotspot:', hotspotId);
          await hotspotsApi.delete(hotspotId);
          
          // Notify parent
          onConnectionDeleted?.(hotspotId);
          console.log('[Graph] Connection deleted successfully');
        } catch (error) {
          console.error('[Graph] Failed to delete connection:', error);
          alert('Failed to delete connection. Please try again.');
        }
      }
    },
    [onConnectionDeleted]
  );

  return (
    <div className="w-full h-full bg-gray-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onNodeClick={handleNodeClick}
        onConnect={onConnect}
        onEdgesDelete={handleDeleteEdge}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        className="bg-gray-900"
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: '#10b981', strokeWidth: 2 }}
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Background color="#374151" gap={20} size={1} />
        <Controls showInteractive={false} className="bg-gray-800 border-gray-700" />
      </ReactFlow>

      <GraphToolbar
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onAutoLayout={handleAutoLayout}
        layoutDirection={layoutDirection}
      />
    </div>
  );
}
