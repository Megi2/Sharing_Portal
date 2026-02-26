from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.assets.models import Asset
from .models import ShareRequest
from .serializers import (
    ShareRequestActionSerializer,
    ShareRequestCreateSerializer,
    ShareRequestListSerializer,
)


# ──────────────────────────────────────────────
# POST /api/share-requests/          → 생성
# GET  /api/share-requests/?status=  → 목록
# ──────────────────────────────────────────────
class ShareRequestListCreateView(APIView):

    def get(self, request):
        qs = ShareRequest.objects.select_related("asset", "requested_by", "approved_by")
        req_status = request.query_params.get("status")
        if req_status:
            qs = qs.filter(status=req_status.upper())
        return Response(ShareRequestListSerializer(qs, many=True).data)

    def post(self, request):
        serializer = ShareRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        d = serializer.validated_data

        try:
            asset = Asset.objects.get(pk=d["assetId"])
        except Asset.DoesNotExist:
            return Response(
                {"detail": "자산을 찾을 수 없습니다."},
                status=status.HTTP_404_NOT_FOUND,
            )

        sr = ShareRequest.objects.create(
            asset=asset,
            requested_by=request.user,
            reason=d["reason"],
        )
        return Response(
            ShareRequestListSerializer(sr).data,
            status=status.HTTP_201_CREATED,
        )


# ──────────────────────────────────────────────
# POST /api/share-requests/{id}/approve
# ──────────────────────────────────────────────
class ShareRequestApproveView(APIView):

    def post(self, request, pk):
        try:
            sr = ShareRequest.objects.get(pk=pk)
        except ShareRequest.DoesNotExist:
            return Response({"detail": "요청을 찾을 수 없습니다."}, status=404)

        if sr.status != ShareRequest.Status.PENDING:
            return Response({"detail": "이미 처리된 요청입니다."}, status=400)

        serializer = ShareRequestActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        sr.status = ShareRequest.Status.APPROVED
        sr.approved_by = request.user
        sr.comment = serializer.validated_data.get("comment", "")
        sr.approved_at = timezone.now()
        sr.save()

        return Response(ShareRequestListSerializer(sr).data)


# ──────────────────────────────────────────────
# POST /api/share-requests/{id}/reject
# ──────────────────────────────────────────────
class ShareRequestRejectView(APIView):

    def post(self, request, pk):
        try:
            sr = ShareRequest.objects.get(pk=pk)
        except ShareRequest.DoesNotExist:
            return Response({"detail": "요청을 찾을 수 없습니다."}, status=404)

        if sr.status != ShareRequest.Status.PENDING:
            return Response({"detail": "이미 처리된 요청입니다."}, status=400)

        serializer = ShareRequestActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        sr.status = ShareRequest.Status.REJECTED
        sr.approved_by = request.user
        sr.comment = serializer.validated_data.get("comment", "")
        sr.approved_at = timezone.now()
        sr.save()

        return Response(ShareRequestListSerializer(sr).data)
