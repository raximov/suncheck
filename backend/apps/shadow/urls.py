from django.urls import path
from .views import analyze_shadow, animate_shadow

urlpatterns = [
    path('analyze/<uuid:project_id>/', analyze_shadow, name='analyze_shadow'),
    path('animate/<uuid:project_id>/', animate_shadow, name='animate_shadow'),
]
