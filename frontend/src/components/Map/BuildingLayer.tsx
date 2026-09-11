import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';

interface BuildingLayerProps {
    viewer: Cesium.Viewer;
    data: any; // GeoJSON FeatureCollection
    selectedBuildingId?: string | null;
}

export default function BuildingLayer({ viewer, data, selectedBuildingId }: BuildingLayerProps) {
    const dataSourceRef = useRef<Cesium.GeoJsonDataSource | null>(null);

    useEffect(() => {
        let dataSource: Cesium.GeoJsonDataSource;

        const loadData = async () => {
            if (!data) return;

            dataSource = await Cesium.GeoJsonDataSource.load(data);
            dataSourceRef.current = dataSource;
            
            const entities = dataSource.entities.values;
            for (let i = 0; i < entities.length; i++) {
                const entity = entities[i];
                if (entity.polygon) {
                    const height = entity.properties?.height?.getValue() || 16.0;
                    const bId = entity.properties?.id?.getValue() || entity.id;
                    
                    if (entity.properties && !entity.properties.hasProperty('buildingId')) {
                        entity.properties.addProperty('buildingId', new Cesium.ConstantProperty(bId));
                    }

                    entity.polygon.height = new Cesium.ConstantProperty(0);
                    entity.polygon.extrudedHeight = new Cesium.ConstantProperty(height);
                    
                    const isSelected = selectedBuildingId && String(bId) === String(selectedBuildingId);
                    
                    // Highlight selected building with warm amber tone
                    const baseColor = isSelected ? '#f59e0b' : '#e4dfd7';
                    const outlineColor = isSelected ? '#b45309' : '#b8b2a5';

                    entity.polygon.material = new Cesium.ColorMaterialProperty(
                        Cesium.Color.fromCssColorString(baseColor).withAlpha(0.96)
                    );
                    entity.polygon.outline = new Cesium.ConstantProperty(true);
                    entity.polygon.outlineColor = new Cesium.ConstantProperty(
                        Cesium.Color.fromCssColorString(outlineColor)
                    );
                    entity.polygon.shadows = new Cesium.ConstantProperty(Cesium.ShadowMode.ENABLED);
                }
            }

            viewer.dataSources.add(dataSource);
        };

        loadData();

        return () => {
            if (dataSource) {
                viewer.dataSources.remove(dataSource);
            }
        };
    }, [viewer, data]);

    // Update material when selected building changes without reloading entire GeoJSON
    useEffect(() => {
        if (!dataSourceRef.current) return;
        const entities = dataSourceRef.current.entities.values;
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            if (entity.polygon) {
                const bId = entity.properties?.buildingId?.getValue() || entity.properties?.id?.getValue() || entity.id;
                const isSelected = selectedBuildingId && String(bId) === String(selectedBuildingId);
                const color = isSelected ? '#f59e0b' : '#e4dfd7';
                const outline = isSelected ? '#92400e' : '#b8b2a5';
                entity.polygon.material = new Cesium.ColorMaterialProperty(
                    Cesium.Color.fromCssColorString(color).withAlpha(0.96)
                );
                entity.polygon.outlineColor = new Cesium.ConstantProperty(
                    Cesium.Color.fromCssColorString(outline)
                );
            }
        }
    }, [selectedBuildingId]);

    return null;
}
