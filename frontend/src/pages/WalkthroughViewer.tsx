import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walkthroughApi } from '@/api/walkthroughs';
import { scenesApi } from '@/api/scenes';
import { hotspotsApi } from '@/api/hotspots';
import { issuesApi } from '@/api/issuesApi';
import { assetsApi } from '@/api/assetsApi';
import { Issue } from '@/types/issue';
import { Asset } from '@/types';
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
import IssueFormModal from '@/components/viewer/IssueFormModal';
import AssetFormModal from '@/components/viewer/AssetFormModal';
import { useViewerStore } from '@/stores/viewerStore';
import { useHotspotStore } from '@/stores/hotspotStore';
import { useAITagStore } from '@/stores/aiTagStore';
import { canEdit } from '@/stores/authStore';
import { useAuthStore } from '@/stores/authStore';
import { Scene } from '@/types';
import { ArrowLeft, Upload, Image, Navigation2, BrainCircuit, GitGraph, AlertCircle, Box } from 'lucide-react';
import { Link } from 'react-router-dom';

type SidebarTab = | scenes | hotspots | ai | graph | issues | assets | inspection;

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
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isPlacingIssue, setIsPlacingIssue] = useState(false);
  const [isPlacingAsset, setIsPlacingAsset] = useState(false);
  const [pendingAssetCoord, setPendingAssetCoord] = useState<{ yaw: number; pitch: number } | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assetMarkers, setAssetMarkers] = useState<Asset[]>([]);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [pendingIssueCoord, setPendingIssueCoord] = useState<{ yaw: number; pitch: number } | null>(null);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [targetOrientation, setTargetOrientation] = useState<{ yaw: number; pitch: number } | null>(null);
  const [transitionStyle, setTransitionStyle] = useState<string>('zoom-fade');

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

  // Fetch issues for current scene
  const { data: issuesData } = useQuery({
    queryKey: ['issues', currentScene?.id],
    queryFn: () => issuesApi.getAll({ scene_id: currentScene!.id }),
    enabled: !!currentScene?.id,
  });
  useEffect(() => {
    setIssues(issuesData?.data || []);
  }, [issuesData]);

  // Fetch assets for walkthrough, filter by current scene
  const { data: assetsData } = useQuery({
    queryKey: ['assets', id],
    queryFn: () => assetsApi.getAll(id!),
    enabled: !!id,
  });
  useEffect(() => {
    if (assetsData && currentScene) {
      console.log('Assets data:', assetsData);
      const sceneAssets = assetsData.filter((a: Asset) => a.scene_id === currentScene.id);
      console.log('Filtered assets for scene', currentScene.id, ':', sceneAssets);
      setAssetMarkers(sceneAssets);
    } else {
      console.log('No assets data or current scene');
      setAssetMarkers([]);
    }
  }, [assetsData, currentScene]);

  // Filter issues that have valid spatial coordinates
  const spatialIssues = issues.filter(
    (i) => typeof i.yaw === 'number' && typeof i.pitch === 'number'
  );

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

  const handleSceneChange = useCallback((sceneId: string, orientation?: { yaw: number; pitch: number }, transition?: string) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (scene) {
      if (orientation) {
        console.log('[Viewer] Applying orientation:', orientation);
        setTargetOrientation(orientation);
      } else {
        setTargetOrientation(null);
      }
      if (transition) {
        setTransitionStyle(transition);
      } else {
        setTransitionStyle('zoom-fade');
      }
      handleSceneSelect(scene);
    }
  }, [scenes, handleSceneSelect]);

  const handlePlaceIssue = useCallback((yaw: number, pitch: number) => {
    setPendingIssueCoord({ yaw, pitch });
    setEditingIssue(null);
    setShowIssueModal(true);
  }, []);

  const createIssueMutation = useMutation({
    mutationFn: (data: any) => issuesApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', currentScene?.id] });
      setShowIssueModal(false);
      setIsPlacingIssue(false);
      setPendingIssueCoord(null);
    },
  });

  const handlePlaceAsset = useCallback((yaw: number, pitch: number) => {
    setPendingAssetCoord({ yaw, pitch });
    setEditingAsset(null);
    setShowAssetModal(true);
  }, []);
  const updateIssueMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => issuesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', currentScene?.id] });
      setShowIssueModal(false);
      setEditingIssue(null);
    },
  });

  const deleteIssueMutation = useMutation({
    mutationFn: (id: string) => issuesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', currentScene?.id] });
    },
  });

  const createAssetMutation = useMutation({
    mutationFn: (data: any) => assetsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setShowAssetModal(false);
      setIsPlacingAsset(false);
      setPendingAssetCoord(null);
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => assetsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setShowAssetModal(false);
      setEditingAsset(null);
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (id: string) => assetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });

  const handleIssueSubmit = (formData: any) => {
    if (editingIssue) {
      updateIssueMutation.mutate({ id: editingIssue.id, data: formData });
    } else if (pendingIssueCoord) {
      createIssueMutation.mutate({
        ...formData,
        walkthrough_id: id!,
        scene_id: currentScene!.id,
        yaw: pendingIssueCoord.yaw,
        pitch: pendingIssueCoord.pitch,
      });
    }
  };

  const handleAssetSubmit = (formData: any) => {
    console.log('Asset submit formData:', formData);
    if (editingAsset) {
      updateAssetMutation.mutate({ id: editingAsset.id, data: formData });
    } else {
      const sceneId = formData.scene_id || currentScene!.id;
      console.log('Creating asset with scene_id:', sceneId, 'yaw:', formData.yaw, 'pitch:', formData.pitch);
      createAssetMutation.mutate({
        ...formData,
        walkthrough_id: id!,
        scene_id: sceneId,
        yaw: formData.yaw,
        pitch: formData.pitch,
      });
    }
  };

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
          <div className="flex overflow-x-auto flex-nowrap border-b border-gray-800">
            <button
              onClick={() => { setActiveTab('scenes'); setViewMode('viewer'); }}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
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
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
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
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
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
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'graph'
                  ? 'text-primary-400 border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <GitGraph size={14} />
              Graph
            </button>
            <button
              onClick={() => { setActiveTab('issues'); setViewMode('viewer'); }}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'issues'
                  ? 'text-primary-400 border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <AlertCircle size={14} />
              Issues
            </button>
            <button
              onClick={() => { setActiveTab('assets'); setViewMode('viewer'); }}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'assets'
                  ? 'text-primary-400 border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Box size={14} />
              Assets
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
            ) : activeTab === 'issues' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Issues</h3>
                  {editorMode === 'edit' && (
                    <button
                      onClick={() => setIsPlacingIssue(!isPlacingIssue)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        isPlacingIssue
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      {isPlacingIssue ? 'Cancel' : 'Place Issue Pin'}
                    </button>
                  )}
                </div>
                <div className="text-gray-400 text-sm">
                  {issues.length === 0 ? 'No issues for this scene.' : `${issues.length} issue(s) found.`}
                </div>
                <div className="space-y-2">
                  {issues.map(issue => (
                    <div key={issue.id} className="p-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-primary-500/50 transition-all group">
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-white text-sm font-semibold truncate flex-1">{issue.title}</div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingIssue(issue);
                              setShowIssueModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-primary-400"
                          >
                            <Navigation2 size={12} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this issue?')) {
                                deleteIssueMutation.mutate(issue.id);
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-400"
                          >
                            <AlertCircle size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase ${
                          issue.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          issue.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {issue.severity}
                        </span>
                        <span className="text-[10px] text-gray-500 capitalize">{issue.status}</span>
                      </div>
                      {issue.description && (
                        <div className="text-gray-400 text-xs mt-2 line-clamp-2">{issue.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === 'assets' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Assets</h3>
                  {editorMode === 'edit' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingAsset(null); setPendingAssetCoord(null); setShowAssetModal(true); }}
                        className="px-3 py-1.5 rounded-lg text-xs bg-primary-600 hover:bg-primary-700 text-white transition-colors"
                      >
                        Add Asset
                      </button>
                      <button
                        onClick={() => setIsPlacingAsset(!isPlacingAsset)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          isPlacingAsset
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-primary-600 hover:bg-primary-700 text-white'
                        }`}
                      >
                        {isPlacingAsset ? 'Cancel' : 'Place Asset Pin'}
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-gray-400 text-sm">
                  {assetMarkers?.length === 0 ? 'No assets pinned to this scene.' : `${assetMarkers?.length || 0} asset(s) pinned.`}
                </div>
                <div className="space-y-2">
                  {assetMarkers?.map(asset => (
                    <div key={asset.id} className="p-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-primary-500/50 transition-all group">
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-white text-sm font-semibold truncate flex-1">{asset.name}</div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingAsset(asset);
                              setShowAssetModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-primary-400"
                          >
                            <Navigation2 size={12} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this asset?')) {
                                deleteAssetMutation.mutate(asset.id);
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-400"
                          >
                            <AlertCircle size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">{asset.type}</div>
                      {asset.brand && <div className="text-xs text-gray-500">{asset.brand} {asset.model}</div>}
                    </div>
                  ))}
                </div>
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
                issueMarkers={spatialIssues}
                aiTags={aiTags.filter((t) => t.scene_id === currentScene.id)}
                assetMarkers={assetMarkers}
                onSceneChange={handleSceneChange}
                onPlaceHotspot={handlePlaceHotspot}
                onPlaceIssue={handlePlaceIssue}
                onPlaceAsset={handlePlaceAsset}
                isPlacingIssue={isPlacingIssue && editorMode === 'edit'}
                isPlacingAsset={isPlacingAsset && editorMode === 'edit'}
                nadirImage={currentScene.nadir_image_url || currentScene.nadir_image_path}
                nadirScale={currentScene.nadir_scale || 1.0}
                nadirRotation={currentScene.nadir_rotation || 0}
                nadirOpacity={currentScene.nadir_opacity || 1.0}
                initialOrientation={targetOrientation}
                transitionStyle={transitionStyle}
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

      {/* Issue Modal */}
      <IssueFormModal
        isOpen={showIssueModal}
        onClose={() => {
          setShowIssueModal(false);
          setEditingIssue(null);
          setPendingIssueCoord(null);
        }}
        onSubmit={handleIssueSubmit}
        initialData={editingIssue || undefined}
        mode={editingIssue ? 'edit' : 'create'}
        isPending={createIssueMutation.isPending || updateIssueMutation.isPending}
      />

      {/* Asset Modal */}
      <AssetFormModal
        isOpen={showAssetModal}
        onClose={() => {
          setShowAssetModal(false);
          setEditingAsset(null);
          setPendingAssetCoord(null);
        }}
        onSubmit={handleAssetSubmit}
        initialData={editingAsset}
        isPending={createAssetMutation.isPending || updateAssetMutation.isPending}
        sceneId={currentScene?.id}
        pendingCoord={pendingAssetCoord}
      />

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
