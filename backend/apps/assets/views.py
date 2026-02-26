from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Asset, AssetPermission, AssetVersion
from .serializers import (
    AssetCreateSerializer,
    AssetDetailSerializer,
    AssetListSerializer,
    AssetUpdateSerializer,
    PermissionBulkSerializer,
    PermissionSerializer,
    VersionCreateSerializer,
    VersionSerializer,
)


# ──────────────────────────────────────────────
# GET  /api/assets/         → 목록
# POST /api/assets/         → 생성
# ──────────────────────────────────────────────
class AssetListCreateView(generics.ListCreateAPIView):
    queryset = (
        Asset.objects
        .select_related("category", "latest_version")
        .prefetch_related("tags")
        .all()
    )

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AssetCreateSerializer
        return AssetListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        asset_type = params.get("type")
        if asset_type and asset_type.upper() != "ALL":
            qs = qs.filter(type=asset_type.upper())

        category_id = params.get("categoryId")
        if category_id:
            qs = qs.filter(category_id=category_id)

        tag = params.get("tag")
        if tag:
            qs = qs.filter(tags__name__iexact=tag)

        q = params.get("q")
        if q:
            qs = qs.filter(title__icontains=q)

        sort = params.get("sort", "latest")
        if sort == "latest":
            qs = qs.order_by("-updated_at")

        # 게시된 자산만 (일반 사용자)
        # TODO: 관리자일 경우 전체 반환
        qs = qs.filter(publish_status=Asset.PublishStatus.PUBLISHED)
        return qs.distinct()

    def perform_create(self, serializer):
        serializer.save()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        asset = serializer.save()
        return Response(
            AssetDetailSerializer(asset).data,
            status=status.HTTP_201_CREATED,
        )


# ──────────────────────────────────────────────
# GET    /api/assets/{id}/   → 상세
# PATCH  /api/assets/{id}/   → 수정
# DELETE /api/assets/{id}/   → 삭제
# ──────────────────────────────────────────────
class AssetDetailView(APIView):

    def _get_asset(self, pk):
        return (
            Asset.objects
            .select_related("category", "latest_version")
            .prefetch_related("tags")
            .get(pk=pk)
        )

    def get(self, request, pk):
        try:
            asset = self._get_asset(pk)
        except Asset.DoesNotExist:
            return Response(
                {"detail": "자산을 찾을 수 없습니다."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(AssetDetailSerializer(asset).data)

    def patch(self, request, pk):
        try:
            asset = Asset.objects.get(pk=pk)
        except Asset.DoesNotExist:
            return Response(
                {"detail": "자산을 찾을 수 없습니다."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = AssetUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.update(asset, serializer.validated_data)
        return Response(AssetDetailSerializer(self._get_asset(pk)).data)

    def delete(self, request, pk):
        try:
            asset = Asset.objects.get(pk=pk)
        except Asset.DoesNotExist:
            return Response(
                {"detail": "자산을 찾을 수 없습니다."},
                status=status.HTTP_404_NOT_FOUND,
            )
        asset.delete()
        return Response({"deleted": True}, status=status.HTTP_200_OK)
    
# ──────────────────────────────────────────────
# GET  /api/assets/{id}/versions/     → 버전 목록
# POST /api/assets/{id}/versions/     → 새 버전 등록
# ──────────────────────────────────────────────
class VersionListCreateView(APIView):

    def get(self, request, pk):
        versions = AssetVersion.objects.filter(asset_id=pk).order_by("-version_no")
        return Response(VersionSerializer(versions, many=True).data)

    def post(self, request, pk):
        try:
            asset = Asset.objects.get(pk=pk)
        except Asset.DoesNotExist:
            return Response(
                {"detail": "자산을 찾을 수 없습니다."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = VersionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        d = serializer.validated_data

        # 새 버전 번호 계산
        last = asset.versions.order_by("-version_no").first()
        next_no = (last.version_no + 1) if last else 1

        ver = AssetVersion.objects.create(
            asset=asset,
            version_no=next_no,
            source_type=d["sourceType"],
            source_url=d["sourceUrl"],
            source_file_id=d.get("sourceFileId", ""),
            note=d.get("note", ""),
            created_by=request.user,
        )
        # latest_version 갱신
        asset.latest_version = ver
        asset.save(update_fields=["latest_version"])

        return Response(VersionSerializer(ver).data, status=status.HTTP_201_CREATED)


# ──────────────────────────────────────────────
# GET /api/assets/{id}/permissions/   → ACL 조회
# PUT /api/assets/{id}/permissions/   → ACL 전체 교체
# ──────────────────────────────────────────────
class PermissionView(APIView):

    def get(self, request, pk):
        perms = AssetPermission.objects.filter(asset_id=pk)
        return Response(PermissionSerializer(perms, many=True).data)

    def put(self, request, pk):
        try:
            asset = Asset.objects.get(pk=pk)
        except Asset.DoesNotExist:
            return Response(
                {"detail": "자산을 찾을 수 없습니다."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PermissionBulkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 기존 권한 삭제 후 새로 생성
        asset.permissions.all().delete()
        for rule in serializer.validated_data["rules"]:
            AssetPermission.objects.create(
                asset=asset,
                subject_type=rule["subject_type"],
                subject_id=rule["subject_id"],
                can_view=rule["can_view"],
                can_download=rule["can_download"],
            )

        perms = asset.permissions.all()
        return Response(PermissionSerializer(perms, many=True).data)
