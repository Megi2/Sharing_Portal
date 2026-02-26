from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Announcement
from .serializers import AnnouncementCreateSerializer, AnnouncementSerializer


# ──────────────────────────────────────────────
# GET /api/announcements/latest
# ──────────────────────────────────────────────
class AnnouncementLatestView(APIView):

    def get(self, request):
        ann = Announcement.objects.select_related("created_by").first()
        if not ann:
            return Response(None)
        return Response(AnnouncementSerializer(ann).data)


# ──────────────────────────────────────────────
# POST /api/announcements/
# ──────────────────────────────────────────────
class AnnouncementCreateView(APIView):

    def post(self, request):
        serializer = AnnouncementCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        d = serializer.validated_data

        # 기존 pinned 해제 (1건만 유지)
        if d.get("isPinned"):
            Announcement.objects.filter(is_pinned=True).update(is_pinned=False)

        ann = Announcement.objects.create(
            title=d["title"],
            body=d["body"],
            is_pinned=d.get("isPinned", False),
            created_by=request.user,
        )
        return Response(
            AnnouncementSerializer(ann).data,
            status=status.HTTP_201_CREATED,
        )
