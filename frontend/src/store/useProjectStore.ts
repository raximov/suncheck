import { create } from 'zustand';
import { Building } from '../types';

interface ProjectState {
    selectedDate: string;
    selectedTime: string;
    selectedDistrict: string;
    selectedBuilding: Building | null;
    buildings: any; // GeoJSON FeatureCollection
    shadows: any; // GeoJSON FeatureCollection
    isAnimating: boolean;
    isLoading: boolean;
    
    setDate: (date: string) => void;
    setTime: (time: string) => void;
    setDistrict: (district: string) => void;
    setSelectedBuilding: (building: Building | null) => void;
    setBuildings: (buildings: any) => void;
    setShadows: (shadows: any) => void;
    setIsAnimating: (isAnimating: boolean) => void;
    setIsLoading: (isLoading: boolean) => void;

    fetchShadows: (projectId: string, date: string, time: string) => Promise<void>;
    fetchBuildings: (projectId: string, bbox: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
    selectedDate: new Date().toISOString().split('T')[0],
    selectedTime: '12:00',
    selectedDistrict: 'it_park',
    selectedBuilding: null,
    buildings: null,
    shadows: null,
    isAnimating: false,
    isLoading: false,

    setDate: (date) => set({ selectedDate: date }),
    setTime: (time) => set({ selectedTime: time }),
    setDistrict: (district) => set({ selectedDistrict: district }),
    setSelectedBuilding: (building) => set({ selectedBuilding: building }),
    setBuildings: (buildings) => set({ buildings }),
    setShadows: (shadows) => set({ shadows }),
    setIsAnimating: (isAnimating) => set({ isAnimating }),
    setIsLoading: (isLoading) => set({ isLoading }),

    fetchShadows: async (projectId, date, time) => {
        // Implementation in api.ts integration
    },
    fetchBuildings: async (projectId, bbox) => {
        // Implementation in api.ts integration
    }
}));
