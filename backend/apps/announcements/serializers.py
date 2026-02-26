from rest_framework import serializers
from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    createdByName = serializers.CharField(source="created_by.name", read_only=True, default=None)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    isPinned = serializers.BooleanField(source="is_pinned")

    class Meta:
        model = Announcement
        fields = ["id", "title", "body", "isPinned", "createdByName", "createdAt"]


class AnnouncementCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    body = serializers.CharField()
    isPinned = serializers.BooleanField(default=False)
