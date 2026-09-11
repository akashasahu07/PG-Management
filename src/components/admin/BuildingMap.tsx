'use client';

import React, { useState } from 'react';
import { Bed as BedIcon, User, CheckCircle2, AlertCircle, X, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/due-date';

interface BedData {
  id: string;
  bedNumber: number;
  status: string;
  resident?: {
    id: string;
    residentId: string;
    name: string;
    phone: string;
    monthlyRent: number;
    joiningDate: string;
  } | null;
}

interface RoomData {
  id: string;
  roomNumber: string;
  sharingCapacity: number;
  monthlyRent: number;
  status: string;
  beds: BedData[];
}

interface FloorData {
  id: string;
  code: string;
  displayName: string;
  floorNumber: number;
  rooms: RoomData[];
}

interface BuildingMapProps {
  floors: FloorData[];
  onAssignResident?: (roomId: string, bedId: string) => void;
}

export function BuildingMap({ floors, onAssignResident }: BuildingMapProps) {
  const [selectedFloorCode, setSelectedFloorCode] = useState<string>(floors[0]?.code || 'G');
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedRoom(null);
    };
    if (selectedRoom) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedRoom]);

  const activeFloor = floors.find((f) => f.code === selectedFloorCode) || floors[0];

  return (
    <div className="space-y-6">
      {/* Floor Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {floors.map((floor) => {
          const isSelected = floor.code === selectedFloorCode;
          const totalBeds = floor.rooms.reduce((acc, r) => acc + r.beds.length, 0);
          const occupiedBeds = floor.rooms.reduce(
            (acc, r) => acc + r.beds.filter((b) => b.status === 'OCCUPIED').length,
            0
          );
          const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

          return (
            <button
              key={floor.code}
              onClick={() => {
                setSelectedFloorCode(floor.code);
                setSelectedRoom(null);
              }}
              className={`px-4 py-3 rounded-2xl transition-all duration-200 text-left shrink-0 border ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-400/40 shadow-lg shadow-indigo-600/25'
                  : 'bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none'
              }`}
            >
              <div className="text-sm font-semibold">{floor.displayName}</div>
              <div className="text-[11px] opacity-80 mt-0.5 flex items-center gap-2">
                <span>{occupiedBeds}/{totalBeds} Beds</span>
                <span>•</span>
                <span className={occupancyRate >= 90 ? 'text-amber-500 dark:text-amber-300 font-medium' : 'text-emerald-600 dark:text-emerald-300 font-medium'}>
                  {occupancyRate}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Grid of Rooms for the Active Floor */}
      {activeFloor && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {activeFloor.rooms.map((room) => {
            const occupied = room.beds.filter((b) => b.status === 'OCCUPIED').length;
            const available = room.beds.length - occupied;
            const isFull = available === 0;
            const isPartial = occupied > 0 && !isFull;
            const isAvailable = occupied === 0;

            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border relative overflow-hidden group hover:scale-[1.02] shadow-sm dark:shadow-none ${
                  isFull
                    ? 'bg-white dark:bg-slate-900/50 border-rose-300 dark:border-rose-500/30 hover:border-rose-500'
                    : isPartial
                    ? 'bg-white dark:bg-slate-900/50 border-amber-300 dark:border-amber-500/30 hover:border-amber-500'
                    : 'bg-white dark:bg-slate-900/50 border-emerald-300 dark:border-emerald-500/30 hover:border-emerald-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      Room {room.roomNumber}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {room.sharingCapacity}-Sharing • {formatCurrency(room.monthlyRent)}/mo
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                      isFull
                        ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                        : isPartial
                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                        : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                    }`}
                  >
                    {isFull ? 'Full' : isPartial ? 'Partial' : 'Available'}
                  </span>
                </div>

                {/* Bed Slots Mini Icons */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {room.beds.map((bed) => (
                      <span
                        key={bed.id}
                        title={`Bed ${bed.bedNumber}: ${bed.status} ${bed.resident ? `(${bed.resident.name})` : ''}`}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-colors ${
                          bed.status === 'OCCUPIED'
                            ? 'bg-indigo-50 dark:bg-indigo-600/30 border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300'
                            : 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {bed.bedNumber}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <span>{available} free</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Room Detail Modal */}
      {selectedRoom && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedRoom(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Room {selectedRoom.roomNumber} Details
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedRoom.sharingCapacity}-Sharing Capacity • {formatCurrency(selectedRoom.monthlyRent)} / month
                </p>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Bed Allocation Status
              </h4>

              <div className="space-y-2.5">
                {selectedRoom.beds.map((bed) => (
                  <div
                    key={bed.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                      bed.status === 'OCCUPIED'
                        ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80'
                        : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          bed.status === 'OCCUPIED'
                            ? 'bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
                            : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                        }`}
                      >
                        <BedIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          Bed #{bed.bedNumber}
                        </div>
                        {bed.resident ? (
                          <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                            <User className="w-3 h-3 text-indigo-500" />
                            <span>{bed.resident.name}</span>
                            <span className="text-slate-400 font-mono">({bed.resident.residentId})</span>
                          </div>
                        ) : (
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Available for assignment</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {bed.status === 'AVAILABLE' && onAssignResident && (
                      <button
                        onClick={() => {
                          onAssignResident(selectedRoom.id, bed.id);
                          setSelectedRoom(null);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
