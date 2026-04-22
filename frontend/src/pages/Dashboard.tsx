import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walkthroughApi } from '@/api/walkthroughs';
import { dashboardApi } from '@/api/dashboard';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import WalkthroughForm from '@/components/walkthrough/WalkthroughForm';
import DeleteConfirmModal from '@/components/walkthrough/DeleteConfirmModal';
import SearchFilterBar from '@/components/walkthrough/SearchFilterBar';
import StatCards from '@/components/dashboard/StatCards';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import { useAuthStore, canEdit, canDelete } from '@/stores/authStore';
import { Box, Image, Pencil, Trash2, MapPin, Building2, AlertCircle } from 'lucide-react';

function Dashboard() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: '', status: '', client: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingWalkthrough, setEditingWalkthrough] = useState<any>(null);
  const [deletingWalkthrough, setDeletingWalkthrough] = useState<any>(null);

  // Fetch walkthroughs with filters
  const { data: walkthroughsData, isLoading: walkthroughsLoading } = useQuery({
    queryKey: ['walkthroughs', filters],
    queryFn: () => walkthroughApi.getAll(filters),
  });

  // Fetch clients for filter dropdown
  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => walkthroughApi.getClients(),
  });

  // Fetch dashboard stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats(),
  });

  // Fetch activity feed
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => dashboardApi.getActivity(10),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => walkthroughApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walkthroughs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setDeletingWalkthrough(null);
    },
  });

  const handleDelete = () => {
    if (deletingWalkthrough) {
      deleteMutation.mutate(deletingWalkthrough.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'archived': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  const walkthroughs = walkthroughsData?.data || [];
  const clients = clientsData?.data || [];
  const stats = statsData?.data;
  const activities = activityData?.data;

  // Debug: Log walkthrough data to check scene_count
  console.log('[Dashboard] Walkthroughs:', walkthroughs.map(w => ({ id: w.id, name: w.name, scene_count: w.scene_count })));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      <main className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Stat Cards */}
          <div className="mb-8">
            <StatCards stats={stats} isLoading={statsLoading} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Walkthroughs Section */}
            <div className="xl:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Your Walkthroughs</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {walkthroughs.length} project{walkthroughs.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <SearchFilterBar
                filters={filters}
                onChange={setFilters}
                clients={clients}
              />

              {walkthroughsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-xl">Loading walkthroughs...</div>
                </div>
              ) : walkthroughs.length === 0 ? (
                <div className="text-center py-16 bg-gray-900/50 border border-gray-800 rounded-xl">
                  <Box size={48} className="mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold mb-2">No walkthroughs found</h3>
                  <p className="text-gray-400 mb-6">
                    {filters.search || filters.status || filters.client
                      ? 'Try adjusting your search or filters'
                      : 'Create your first 360° walkthrough project'}
                  </p>
                  {canEdit(user?.role || '') && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Create Walkthrough
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {walkthroughs.map((walkthrough) => (
                    <div
                      key={walkthrough.id}
                      className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-primary-600 transition-all hover:shadow-lg hover:shadow-primary-600/10 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Box size={24} className="text-primary-500" />
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(walkthrough.status)}`}>
                            {walkthrough.status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(walkthrough.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <Link to={`/walkthrough/${walkthrough.id}`}>
                        <h3 className="text-lg font-semibold mb-1 group-hover:text-primary-400 transition-colors">
                          {walkthrough.name}
                        </h3>
                      </Link>

                      {walkthrough.client && (
                        <div className="flex items-center gap-1 text-sm text-gray-400 mb-1">
                          <Building2 size={12} />
                          <span>{walkthrough.client}</span>
                        </div>
                      )}

                      {walkthrough.address && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                          <MapPin size={12} />
                          <span className="truncate">{walkthrough.address}</span>
                        </div>
                      )}

                      {walkthrough.description && (
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                          {walkthrough.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Image size={14} />
                            <span>{walkthrough.scene_count || 0} scenes</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {canEdit(user?.role || '') && (
                            <button
                              onClick={() => setEditingWalkthrough(walkthrough)}
                              className="p-1.5 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          {canDelete(user?.role || '') && (
                            <button
                              onClick={() => setDeletingWalkthrough(walkthrough)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <ActivityFeed activities={activities} isLoading={activityLoading} />
            </div>
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      <WalkthroughForm
        isOpen={showForm || !!editingWalkthrough}
        onClose={() => {
          setShowForm(false);
          setEditingWalkthrough(null);
        }}
        initialData={editingWalkthrough || undefined}
        mode={editingWalkthrough ? 'edit' : 'create'}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={!!deletingWalkthrough}
        onClose={() => setDeletingWalkthrough(null)}
        onConfirm={handleDelete}
        title={deletingWalkthrough?.name || ''}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}

export default Dashboard;
