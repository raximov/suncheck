from django.urls import path
from .views import generate_report, download_report
urlpatterns = [
    path('generate/<uuid:project_id>/', generate_report, name='generate_report'),
    path('download/<uuid:report_id>/', download_report, name='download_report'),
]
