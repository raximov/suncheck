from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def generate_report(request, project_id):
    return Response({'status': 'not implemented'})
    
@api_view(['GET'])
def download_report(request, report_id):
    return Response({'status': 'not implemented'})
