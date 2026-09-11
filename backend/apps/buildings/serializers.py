import json
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from django.contrib.gis.geos import GEOSGeometry
from shapely.geometry import shape
from .models import Building

class BuildingSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Building
        geo_field = 'geometry'
        fields = '__all__'

    def to_internal_value(self, data):
        ret = super().to_internal_value(data)
        geom = data.get('geometry')
        if geom:
            try:
                if isinstance(geom, dict):
                    wkt = shape(geom).wkt
                    ret['geometry'] = GEOSGeometry(wkt, srid=4326)
                elif isinstance(geom, str):
                    ret['geometry'] = GEOSGeometry(geom, srid=4326)
            except Exception:
                pass
        return ret

class BuildingListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = ['id', 'project', 'source', 'height', 'name']
