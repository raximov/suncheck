from rest_framework import serializers
from .models import InsolationAnalysis
class InsolationSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsolationAnalysis
        fields = '__all__'
