'use client';

import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import ShadowLayer from './ShadowLayer';
import BuildingLayer from './BuildingLayer';
import { useProjectStore } from '@/store/useProjectStore';

interface CesiumMapProps {
    shadows: any;
    buildings: any;
}

export default function CesiumMap({ shadows, buildings }: CesiumMapProps) {
    const viewerRef = useRef<Cesium.Viewer | null>(null);
    const [viewerInstance, setViewerInstance] = useState<Cesium.Viewer | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { selectedBuilding, setSelectedBuilding, selectedDate, selectedTime, selectedDistrict } = useProjectStore();

    useEffect(() => {
        if (!containerRef.current) return;

        Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN || '';

        const osmProvider = new Cesium.OpenStreetMapImageryProvider({
            url: 'https://tile.openstreetmap.org/'
        });

        const viewer = new Cesium.Viewer(containerRef.current, {
            baseLayer: new Cesium.ImageryLayer(osmProvider),
            baseLayerPicker: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            navigationHelpButton: false,
            sceneModePicker: false,
            timeline: false,
            animation: false,
            shadows: true,
        });

        if (process.env.NEXT_PUBLIC_CESIUM_TOKEN) {
            viewer.scene.setTerrain(Cesium.Terrain.fromWorldTerrain());
        }

        viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#f4f1ea');
        viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#e8e5dc');

        // Initial view
        viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(69.3340, 41.3364, 850.0),
            orientation: {
                heading: Cesium.Math.toRadians(-35.0),
                pitch: Cesium.Math.toRadians(-42.0),
                roll: 0.0
            }
        });

        viewer.scene.globe.enableLighting = true;
        viewer.shadows = true;

        // Click handler for buildings
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((click: any) => {
            const pickedObject = viewer.scene.pick(click.position);
            if (Cesium.defined(pickedObject) && pickedObject.id) {
                const entity = pickedObject.id;
                const props = entity.properties ? entity.properties.getValue(viewer.clock.currentTime) : {};
                const bId = props?.buildingId || props?.id || entity.id;

                if (bId && !String(bId).startsWith('shadow-')) {
                    const height = Number(props?.height) || 16.0;
                    const floors = Number(props?.levels) || Math.max(1, Math.round(height / 3.2));
                    const name = props?.name || undefined;
                    setSelectedBuilding({
                        id: String(bId),
                        name: name || undefined,
                        height,
                        floors,
                        source: props?.source || 'OpenStreetMap',
                        properties: props,
                    });
                    return;
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        viewerRef.current = viewer;
        setViewerInstance(viewer);

        return () => {
            if (viewerRef.current && !viewerRef.current.isDestroyed()) {
                viewerRef.current.destroy();
            }
            handler.destroy();
            setViewerInstance(null);
        };
    }, [setSelectedBuilding]);

    // Update Sun position based on store date/time
    useEffect(() => {
        if (!viewerRef.current) return;
        const dateString = `${selectedDate}T${selectedTime}:00+05:00`;
        const dateObj = new Date(dateString);
        
        const julianDate = Cesium.JulianDate.fromDate(dateObj);
        viewerRef.current.clock.currentTime = julianDate;
    }, [selectedDate, selectedTime]);

    // Fly camera smoothly when district changes across ALL Tashkent
    useEffect(() => {
        if (!viewerRef.current) return;
        const coordsMap: Record<string, { lng: number; lat: number; height: number; pitch: number; heading: number }> = {
            all: { lng: 69.2800, lat: 41.3100, height: 11000, pitch: -60, heading: 0 },
            it_park: { lng: 69.3340, lat: 41.3364, height: 850, pitch: -42, heading: -35 },
            central: { lng: 69.2797, lat: 41.3111, height: 1800, pitch: -45, heading: 0 },
            mirzo_ulugbek: { lng: 69.3350, lat: 41.3450, height: 2600, pitch: -45, heading: 0 },
            yunusobod: { lng: 69.2850, lat: 41.3550, height: 2600, pitch: -45, heading: 0 },
            chilonzor: { lng: 69.2150, lat: 41.2800, height: 2600, pitch: -45, heading: 0 },
            mirobod: { lng: 69.2900, lat: 41.2900, height: 2400, pitch: -45, heading: 0 },
            chorsu: { lng: 69.2350, lat: 41.3250, height: 2600, pitch: -45, heading: 0 },
            yashnobod: { lng: 69.3350, lat: 41.2950, height: 2600, pitch: -45, heading: 0 },
            sergeli: { lng: 69.2250, lat: 41.2250, height: 2600, pitch: -45, heading: 0 },
            yangihayot: { lng: 69.2150, lat: 41.1950, height: 2600, pitch: -45, heading: 0 },
            uchtepa: { lng: 69.1750, lat: 41.2950, height: 2600, pitch: -45, heading: 0 },
            olmazor: { lng: 69.2150, lat: 41.3550, height: 2600, pitch: -45, heading: 0 },
            yakkasaroy: { lng: 69.2550, lat: 41.2750, height: 2400, pitch: -45, heading: 0 },
            bektemir: { lng: 69.3450, lat: 41.2350, height: 2600, pitch: -45, heading: 0 },
        };
        const target = coordsMap[selectedDistrict] || coordsMap['it_park'];
        viewerRef.current.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(target.lng, target.lat, target.height),
            orientation: {
                heading: Cesium.Math.toRadians(target.heading),
                pitch: Cesium.Math.toRadians(target.pitch),
                roll: 0.0
            },
            duration: 1.2
        });
    }, [selectedDistrict]);

    return (
        <div id="cesiumContainer" ref={containerRef} className="w-full h-full absolute inset-0">
            {viewerInstance && shadows && <ShadowLayer viewer={viewerInstance} data={shadows} />}
            {viewerInstance && buildings && (
                <BuildingLayer 
                    viewer={viewerInstance} 
                    data={buildings} 
                    selectedBuildingId={selectedBuilding?.id} 
                />
            )}
        </div>
    );
}