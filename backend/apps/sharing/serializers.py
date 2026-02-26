from rest_framework import serializers
from .models import ShareRequest


class ShareRequestListSerializer(serializers.ModelSerializer):
    assetTitle = serializers.CharField(source="asset.title", read_only=True)
    requestedByName = serializers.CharField(source="requested_by.name", read_only=True)
    approvedByName = serializers.CharField(source="approved_by.name", read_only=True, default=None)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    approvedAt = serializers.DateTimeField(source="approved_at", read_only=True)

    class Meta:
        model = ShareRequest
        fields = [
            "id", "assetTitle", "requestedByName", "reason",
            "status", "approvedByName", "comment", "createdAt", "approvedAt",
        ]


class ShareRequestCreateSerializer(serializers.Serializer):
    assetId = serializers.UUIDField()
    reason = serializers.CharField()


class ShareRequestActionSerializer(serializers.Serializer):
    comment = serializers.CharField(required=False, default="")
