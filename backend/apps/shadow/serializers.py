from rest_framework import serializers
from .models import ShadowAnalysis

class ShadowAnalyzeRequestSerializer(serializers.Serializer):
    date = serializers.DateField()
    time = serializers.TimeField()

class ShadowAnimationRequestSerializer(serializers.Serializer):
    date = serializers.DateField()
    time_start = serializers.TimeField()
    time_end = serializers.TimeField()
    interval = serializers.IntegerField(default=60)

class ShadowResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShadowAnalysis
        fields = '__all__'
