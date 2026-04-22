import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walkthroughApi } from '@/api/walkthroughs';
import { scenesApi } from '@/api/scenes';
import { hotspotsApi } from '@/api/hotspots';
import { aiApi, AITag } from '@/api/ai';
import Viewer360 from '@/components/viewer/Viewer360';
import SceneList from '@/components/viewer/SceneList';
import HotspotEditor from '@/components/viewer/HotspotEditor';
import BulkUpload from '@/components/viewer/BulkUpload';
import { ViewModeToolbar, ViewMode } from '@/components/viewer/ViewModeToolbar';
import { AIProcessingPanel } from '@/components/ai/AIProcessingPanel';
import { AITagFilter } from '@/components/ai/AITagFilter';
import { SceneGraphEditor } from '@/components/graph/SceneGraphEditor';
import Sidebar from '@/components/layout/Sidebar';
import { useViewerStore } from '@/stores/viewerStore';
import { useHotspotStore } from '@/stores/hotspotStore';
import { useAITagStore } from '@/stores/aiTagStore';
import { canEdit } from '@/stores/authStore';
import { useAuthStore } from '@/stores/authStore';
import { Scene } from '@/types';
import { ArrowLeft, Upload, Image, Navigation2, BrainCircuit, GitGraph } from 'lucide-react';
import { Link } from 'react-router-dom';

type SidebarTab = 'scenes' | 'hotspots' | 'ai' | 'graph';

function WalkthroughViewer() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [activeTab, setActiveTab] = useState<SidebarTab>('scenes');
  const [showUpload, setShowUpload] = useState(false);
  const [viewMode, setViewMode] = useState<'viewer' | 'graph'>('viewer');
  const [editorMode, setEditorMode] = useState<ViewMode>('view'); // NEW: View/Edit/Share mode
  const [aiTags, setAiTags] = useState<AITag[]>([]);
  const { setCurrentScene: setViewerScene } = useViewerStore();
  const { setHotspots, setPendingHotspot, hotspots } = useHotspotStore();
  const { setTags: setAITags } = useAITagStore();
  const queryClient = useQueryClient();

  const { data: walkthroughData } = useQuery({
    queryKey: ['walkthrough', id],
    queryFn: () => walkthroughApi.getById(id!),
    enabled: !!id,
  });

  const { data: scenesData, isLoading: scenesLoading } = useQuery({
    queryKey: ['scenes', id],
    queryFn: () => scenesApi.getByWalkthrough(id!),
    enabled: !!id,
  });

  // Fetch hotspots for current scene
  const { data: hotspotsData } = useQuery({
    queryKey: ['hotspots', currentScene?.id],
    queryFn: () => hotspotsApi.getByScene(currentScene!.id),
    enabled: !!currentScene?.id,
    staleTime: 0, // Always refetch when scene changes
    refetchOnMount: true, // Refetch when component mounts
  });

  const scenes = scenesData?.data || [];
  const walkthrough = walkthroughData?.data;

  // Update hotspot store when data changes
  useEffect(() => {
    if (hotspotsData?.data) {
      console.log('Hotspots received:', hotspotsData.data);
      setHotspots(hotspotsData.data);
    }
  }, [hotspotsData, setHotspots]);

  // Fetch AI tags when scenes load
  useEffect(() => {
    if (id && scenes.length > 0) {
      aiApi.getTags(id).then((res) => {
        setAiTags(res.data);
        setAITags(res.data);
      }).catch(() => {});
    }
  }, [id, scenes.length]);

  // Preload scene images for faster switching
  useEffect(() => {
    if (scenes.length > 0) {
      scenes.forEach((scene) => {
        if (scene.image_url) {
          const img = new window.Image();
          img.src = scene.image_url;
        }
      });
    }
  }, [scenes]);

  const handleSceneSelect = useCallback((scene: Scene) => {
    console.log('Selecting scene:', scene);
    console.log('Scene image_url:', scene.image_url);
    console.log('Scene image_path:', scene.image_path);
    setCurrentScene(scene);
    setViewerScene(scene);
    setPendingHotspot(null);
  }, [setViewerScene, setPendingHotspot]);

  const handlePlaceHotspot = useCallback((yaw: number, pitch: number) => {
    setPendingHotspot({ yaw, pitch });
  }, [setPendingHotspot]);

  const handleSceneChange = useCallback((sceneId: string, orientation?: { yaw: number; pitch: number }) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (scene) {
      handleSceneSelect(scene);
      // TODO: Apply orientation to camera after scene loads
      if (orientation) {
        console.log('[Viewer] Applying orientation:', orientation);
        // Will be handled by Viewer360 component
      }
    }
  }, [scenes, handleSceneSelect]);

  // Set first scene as current when scenes load
  useEffect(() => {
    if (scenes.length > 0 && !currentScene) {
      console.log('Auto-selecting first scene:', scenes[0]);
      handleSceneSelect(scenes[0]);
    }
  }, [scenes, currentScene, handleSceneSelect]);

  const canManage = user ? canEdit(user.role) : false;

  if (scenesLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading walkthrough...</div>
      </div>
    );
  }

  if (!currentScene) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="text-white text-xl">No scenes available</div>
        {canManage && (
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Upload size={18} />
            Upload Scenes
          </button>
        )}
        <BulkUpload
          walkthroughId={id!}
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-white font-semibold">{walkthrough?.name}</h2>
            <p className="text-sm text-gray-400">
              {currentScene.room_name || 'Scene'} • Floor {currentScene.floor}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* NEW: View/Edit/Share Mode Toolbar */}
          <ViewModeToolbar
            walkthroughId={id!}
            walkthroughName={walkthrough?.name || 'Walkthrough'}
            canEdit={canManage}
            currentMode={editorMode}
            onModeChange={setEditorMode}
          />
          
          {canManage && (
            <button
              onClick={() => setShowUpload(true)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              <Upload size={14} />
              Upload Scenes
            </button>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Image size={14} />
            <span>{scenes.length} scenes</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar>
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => { setActiveTab('scenes'); setViewMode('viewer'); }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'scenes'
                  ? 'text-primary-400 border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Image size={14} />
              Scenes
            </button>
            <button
              onClick={() => { setActiveTab('hotspots'); setViewMode('viewer'); }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'hotspots'
                  ? 'text-primary-400 border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Navigation2 size={14} />
              Hotspots
            </button>
            <button
              onClick={() => { setActiveTab('ai'); setViewMode('viewer'); }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'ai'
                  ? 'text-primary-400 border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BrainCircuit size={14} />
              AI
            </button>
            <button
              onClick={() => { setActiveTab('graph'); setViewMode('graph'); }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'graph'
                  ? 'text-primary-400 border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <GitGraph size={14} />
              Graph
            </button>
          </div>

          {/* Tab content */}
          <div className="p-4 h-[calc(100%-49px)] overflow-y-auto">
            {activeTab === 'scenes' ? (
              <SceneList
                scenes={scenes}
                currentSceneId={currentScene.id}
                onSceneSelect={handleSceneSelect}
                walkthroughId={id!}
              />
            ) : activeTab === 'hotspots' ? (
              editorMode === 'edit' ? (
                <HotspotEditor
                  scenes={scenes}
                  currentSceneId={currentScene.id}
                />
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <p>Switch to Edit mode to manage hotspots</p>
                  <button
                    onClick={() => setEditorMode('edit')}
                    className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs transition-colors"
                  >
                    Enter Edit Mode
                  </button>
                </div>
              )
            ) : activeTab === 'ai' ? (
              <div className="space-y-6">
                <AIProcessingPanel
                  walkthroughId={id!}
                  sceneId={currentScene.id}
                  totalScenes={scenes.length}
                />
                <AITagFilter compact />
              </div>
            ) : (
              <div className="text-gray-400 text-sm text-center py-8">
                Switch to Graph view to see navigation map
              </div>
            )}
          </div>
        </Sidebar>

        {/* Main View */}
        <div className="flex-1 relative">
          {viewMode === 'viewer' ? (
            currentScene.image_url ? (
              <Viewer360
                imageUrl={currentScene.image_url}
                hotspots={hotspots}
                aiTags={aiTags.filter((t) => t.scene_id === currentScene.id)}
                onSceneChange={handleSceneChange}
                onPlaceHotspot={handlePlaceHotspot}
                nadirImage={currentScene.nadir_image_url || currentScene.nadir_image_path}
                nadirScale={currentScene.nadir_scale || 1.0}
                nadirRotation={currentScene.nadir_rotation || 0}
                nadirOpacity={currentScene.nadir_opacity || 1.0}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <p className="text-white text-xl mb-2">Loading scene...</p>
                  <p className="text-gray-400 text-sm">Scene ID: {currentScene.id}</p>
                  <p className="text-gray-500 text-xs mt-2">Image path: {currentScene.image_path}</p>
                </div>
              </div>
            )
          ) : (
            <SceneGraphEditor
              scenes={scenes}
              hotspots={hotspots}
              onNodeClick={handleSceneChange}
              onConnectionCreated={(hotspot) => {
                console.log('[Viewer] Connection created:', hotspot);
                // Refresh hotspots for the source scene
                queryClient.invalidateQueries({ queryKey: ['hotspots', hotspot.from_scene_id] });
              }}
              onConnectionDeleted={(hotspotId) => {
                console.log('[Viewer] Connection deleted:', hotspotId);
                // Refresh all hotspots
                queryClient.invalidateQueries({ queryKey: ['hotspots'] });
              }}
            />
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <BulkUpload
        walkthroughId={id!}
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
      />
    </div>
  );
}

export default WalkthroughViewer;
