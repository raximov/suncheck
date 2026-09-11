from django.urls import path
from .views import analyze_insolation
urlpatterns = [
    path('analyze/<uuid:project_id>/', analyze_insolation, name='analyze_insolation'),
]
