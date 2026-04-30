import { useState, useCallback } from 'react';
import { AlertTriangle, Phone, MapPin, Navigation2, Shield, X, CheckCircle2, AlertCircle, Flame, Droplets, Zap, Radio, Users, Building2 } from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
}

interface EvacuationRoute {
  id: string;
  name: string;
  description: string;
  distance: string;
  estimatedTime: string;
  isPrimary: boolean;
}

interface EmergencyOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation?: string;
  emergencyContacts?: EmergencyContact[];
  evacuationRoutes?: EvacuationRoute[];
  onReportEmergency?: (type: string, description: string) => void;
}

function EmergencyOverlay({
  isOpen,
  onClose,
  currentLocation = 'Current Location',
  emergencyContacts = [
    { id: '1', name: 'Security Desk', role: 'Security', phone: '555-0100', email: 'security@building.com' },
    { id: '2', name: 'Fire Department', role: 'Emergency Services', phone: '911' },
    { id: '3', name: 'Building Manager', role: 'Management', phone: '555-0101', email: 'manager@building.com' },
  ],
  evacuationRoutes = [
    { id: '1', name: 'Main Exit', description: 'Primary emergency exit via main lobby', distance: '50m', estimatedTime: '2 min', isPrimary: true },
    { id: '2', name: 'Stairwell B', description: 'Secondary exit via north stairwell', distance: '75m', estimatedTime: '3 min', isPrimary: false },
    { id: '3', name: 'Rear Exit', description: 'Emergency exit via loading dock', distance: '100m', estimatedTime: '4 min', isPrimary: false },
  ],
  onReportEmergency,
}: EmergencyOverlayProps) {
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<string>('');
  const [emergencyDescription, setEmergencyDescription] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const emergencyTypes = [
    { id: 'fire', label: 'Fire', icon: Flame, color: 'bg-red-600 hover:bg-red-700' },
    { id: 'medical', label: 'Medical', icon: AlertCircle, color: 'bg-pink-600 hover:bg-pink-700' },
    { id: 'flood', label: 'Flood/Water', icon: Droplets, color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'power', label: 'Power Outage', icon: Zap, color: 'bg-yellow-600 hover:bg-yellow-700' },
    { id: 'security', label: 'Security', icon: Shield, color: 'bg-purple-600 hover:bg-purple-700' },
    { id: 'other', label: 'Other', icon: AlertTriangle, color: 'bg-gray-600 hover:bg-gray-700' },
  ];

  const handleReportEmergency = useCallback(() => {
    if (selectedEmergencyType && emergencyDescription && onReportEmergency) {
      onReportEmergency(selectedEmergencyType, emergencyDescription);
      setReportSubmitted(true);
      setTimeout(() => {
        setReportSubmitted(false);
        setShowReportForm(false);
        setSelectedEmergencyType('');
        setEmergencyDescription('');
      }, 3000);
    }
  }, [selectedEmergencyType, emergencyDescription, onReportEmergency]);

  const handleCallContact = useCallback((phone: string) => {
    window.location.href = `tel:${phone}`;
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Red Overlay */}
      <div className="fixed inset-0 bg-red-900/30 pointer-events-none z-40" />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-[500px] bg-gray-900 border-l border-red-500/50 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="bg-red-900/30 border-b border-red-500/50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={24} className="text-red-500 animate-pulse" />
            <div>
              <h2 className="text-white font-bold text-lg">Emergency Mode</h2>
              <p className="text-xs text-red-300">Safety & Evacuation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-900/30 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Location */}
        <div className="px-4 py-3 border-b border-gray-800 bg-red-900/10">
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={16} className="text-red-500" />
            <span className="text-gray-400">Current Location:</span>
            <span className="text-white font-medium">{currentLocation}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick Actions */}
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              Report Emergency
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {emergencyTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedEmergencyType(type.id);
                      setShowReportForm(true);
                    }}
                    className={`p-3 rounded-lg transition-colors flex flex-col items-center gap-2 ${type.color}`}
                  >
                    <Icon size={20} />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Report Form */}
            {showReportForm && (
              <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                {reportSubmitted ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 size={16} />
                    <span className="text-sm">Emergency reported successfully</span>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={emergencyDescription}
                      onChange={(e) => setEmergencyDescription(e.target.value)}
                      placeholder="Describe the emergency situation..."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm mb-2 focus:border-red-500 focus:outline-none resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowReportForm(false)}
                        className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReportEmergency}
                        disabled={!selectedEmergencyType || !emergencyDescription}
                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Report
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Evacuation Routes */}
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Navigation2 size={16} className="text-green-500" />
              Evacuation Routes
            </h3>
            <div className="space-y-2">
              {evacuationRoutes.map((route) => (
                <div
                  key={route.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    route.isPrimary
                      ? 'bg-green-900/20 border-green-500/30'
                      : 'bg-gray-800/50 border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white text-sm font-medium">{route.name}</span>
                        {route.isPrimary && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{route.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{route.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Navigation2 size={12} />
                      <span>{route.estimatedTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Phone size={16} className="text-blue-500" />
              Emergency Contacts
            </h3>
            <div className="space-y-2">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{contact.name}</div>
                      <div className="text-xs text-gray-400">{contact.role}</div>
                    </div>
                    <button
                      onClick={() => handleCallContact(contact.phone)}
                      className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white"
                      title={`Call ${contact.name}`}
                    >
                      <Phone size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Phone size={12} />
                      <span>{contact.phone}</span>
                    </div>
                    {contact.email && (
                      <div className="flex items-center gap-1">
                        <Radio size={12} />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Guidelines */}
          <div className="p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Shield size={16} className="text-amber-500" />
              Safety Guidelines
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-2 bg-gray-800/30 rounded-lg">
                <Flame size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-white text-xs font-medium">Fire Safety</div>
                  <div className="text-xs text-gray-400">Stay low, follow exit signs, do not use elevators</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-gray-800/30 rounded-lg">
                <Users size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-white text-xs font-medium">Assembly Point</div>
                  <div className="text-xs text-gray-400">Main parking lot, north side of building</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-gray-800/30 rounded-lg">
                <Building2 size={14} className="text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-white text-xs font-medium">Building Info</div>
                  <div className="text-xs text-gray-400">Floor: {currentLocation.includes('Floor') ? currentLocation.split('Floor')[1]?.trim() : 'Unknown'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-red-900/10">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Radio size={12} className="text-red-500 animate-pulse" />
              <span>Emergency mode active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-400">911</span>
              <span>•</span>
              <span>Security: 555-0100</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EmergencyOverlay;