'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, Loader2 } from 'lucide-react';
import { BuildingMap } from '@/components/admin/BuildingMap';
import { AddResidentModal } from '@/components/admin/AddResidentModal';

export default function AdminRoomsPage() {
  const [floors, setFloors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal for quick assign from room click
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetRoomId, setTargetRoomId] = useState<string | undefined>();
  const [targetBedId, setTargetBedId] = useState<string | undefined>();

  useEffect(() => {
    fetchFloors();
  }, []);

  const fetchFloors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/floors');
      if (!res.ok) throw new Error('Failed to load floors');
      const data = await res.json();
      setFloors(data.floors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignResident = (roomId: string, bedId: string) => {
    setTargetRoomId(roomId);
    setTargetBedId(bedId);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-7 h-7 text-sky-500" />
            <span>Interactive Building Map</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Visual room and bed occupancy allocation across Ground Floor & Floors A–E
          </p>
        </div>

        <button
          onClick={() => {
            setTargetRoomId(undefined);
            setTargetBedId(undefined);
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Allocate Bed to Resident</span>
        </button>
      </div>

      {/* Building Map Visualizer */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Loading building floor structure...</span>
        </div>
      ) : (
        <BuildingMap
          floors={floors}
          onAssignResident={handleAssignResident}
        />
      )}

      {/* Add Resident Modal */}
      <AddResidentModal
        isOpen={showAddModal}
        initialRoomId={targetRoomId}
        initialBedId={targetBedId}
        onClose={() => setShowAddModal(false)}
        onResidentAdded={fetchFloors}
      />
    </div>
  );
}
