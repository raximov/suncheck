import { useEffect } from 'react';
import * as Cesium from 'cesium';

interface ShadowLayerProps {
    viewer: Cesium.Viewer;
    data: any; // GeoJSON FeatureCollection
}

export default function ShadowLayer({ viewer, data }: ShadowLayerProps) {
    useEffect(() => {
        let dataSource: Cesium.GeoJsonDataSource;

        const loadData = async () => {
            if (!data) return;

            dataSource = await Cesium.GeoJsonDataSource.load(data, {
                clampToGround: true,
                stroke: Cesium.Color.TRANSPARENT,
                fill: Cesium.Color.fromCssColorString('#2d2822').withAlpha(0.35),
            });

            viewer.dataSources.add(dataSource);
        };

        loadData();

        return () => {
            if (dataSource) {
                viewer.dataSources.remove(dataSource);
            }
        };
    }, [viewer, data]);

    return null;
}
