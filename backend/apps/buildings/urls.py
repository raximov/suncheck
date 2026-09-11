from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BuildingViewSet, fetch_osm_buildings

router = DefaultRouter()
router.register(r'', BuildingViewSet, basename='building')

urlpatterns = [
    path('fetch-osm/', fetch_osm_buildings, name='fetch_osm_buildings'),
    path('', include(router.urls)),
]
