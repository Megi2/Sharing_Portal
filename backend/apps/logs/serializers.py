from rest_framework import serializers
from .models import AccessLog


class AccessLogSerializer(serializers.ModelSerializer):
    userName = serializers.CharField(source="user.name", default=None)
    assetTitle = serializers.CharField(source="asset.title", default=None)
    occurredAt = serializers.DateTimeField(source="occurred_at", read_only=True)

    class Meta:
        model = AccessLog
        fields = [
            "id", "occurredAt", "userName", "assetTitle",
            "action", "ip", "result", "meta_json",
        ]
