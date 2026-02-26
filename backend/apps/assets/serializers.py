from rest_framework import serializers
from .models import Asset, AssetPermission, AssetVersion, Category, Tag


# ──────────────────────────────────────────────
# Category / Tag
# ──────────────────────────────────────────────
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "parent", "sort_order", "is_active"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name"]


# ──────────────────────────────────────────────
# Version
# ──────────────────────────────────────────────
class VersionSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = AssetVersion
        fields = ["id", "versionNo", "sourceType", "sourceUrl", "sourceFileId", "createdAt", "note"]

    versionNo = serializers.IntegerField(source="version_no", read_only=True)
    sourceType = serializers.CharField(source="source_type", read_only=True)
    sourceUrl = serializers.URLField(source="source_url", read_only=True)
    sourceFileId = serializers.CharField(source="source_file_id", read_only=True)


class VersionCreateSerializer(serializers.Serializer):
    sourceType = serializers.ChoiceField(choices=AssetVersion.SourceType.choices)
    sourceUrl = serializers.URLField()
    sourceFileId = serializers.CharField(required=False, default="")
    note = serializers.CharField(required=False, default="")


# ──────────────────────────────────────────────
# Asset 목록
# ──────────────────────────────────────────────
class AssetListSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.name", default=None)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Asset
        fields = [
            "id", "type", "category", "title",
            "publishStatus", "viewScope", "downloadAllowed", "updatedAt",
        ]

    publishStatus = serializers.CharField(source="publish_status", read_only=True)
    viewScope = serializers.CharField(source="view_scope", read_only=True)
    downloadAllowed = serializers.BooleanField(source="download_allowed", read_only=True)


# ──────────────────────────────────────────────
# Asset 상세
# ──────────────────────────────────────────────
class AssetDetailSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.name", default=None)
    tags = serializers.SerializerMethodField()
    latestVersion = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = [
            "id", "type", "category", "title", "description",
            "publishStatus", "viewScope", "downloadAllowed",
            "securityLabel", "tags", "latestVersion",
        ]

    publishStatus = serializers.CharField(source="publish_status", read_only=True)
    viewScope = serializers.CharField(source="view_scope", read_only=True)
    downloadAllowed = serializers.BooleanField(source="download_allowed", read_only=True)
    securityLabel = serializers.CharField(source="security_label", read_only=True)

    def get_tags(self, obj):
        return list(obj.tags.values_list("name", flat=True))

    def get_latestVersion(self, obj):
        ver = obj.latest_version
        if not ver:
            return None
        return {
            "versionNo": ver.version_no,
            "sourceType": ver.source_type,
            "sourceUrl": ver.source_url,
            "sourceFileId": ver.source_file_id,
        }


# ──────────────────────────────────────────────
# Asset 생성
# ──────────────────────────────────────────────
class AssetCreateSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=Asset.Type.choices)
    categoryId = serializers.UUIDField(required=False, allow_null=True)
    title = serializers.CharField(max_length=300)
    description = serializers.CharField(required=False, default="")
    tags = serializers.ListField(child=serializers.CharField(), required=False, default=[])
    viewScope = serializers.ChoiceField(choices=Asset.ViewScope.choices, default="ALL_USERS")
    downloadAllowed = serializers.BooleanField(default=False)
    securityLabel = serializers.ChoiceField(
        choices=Asset.SecurityLabel.choices, required=False, default="L2"
    )
    initialVersion = VersionCreateSerializer(required=False)

    def create(self, validated_data):
        tag_names = validated_data.pop("tags", [])
        initial_version_data = validated_data.pop("initialVersion", None)
        user = self.context["request"].user

        asset = Asset.objects.create(
            type=validated_data["type"],
            category_id=validated_data.get("categoryId"),
            title=validated_data["title"],
            description=validated_data.get("description", ""),
            view_scope=validated_data.get("viewScope", "ALL_USERS"),
            download_allowed=validated_data.get("downloadAllowed", False),
            security_label=validated_data.get("securityLabel", "L2"),
            owner=user,
        )

        # 태그 처리 (get_or_create)
        for tag_name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=tag_name.strip())
            asset.tags.add(tag)

        # 초기 버전
        if initial_version_data:
            ver = AssetVersion.objects.create(
                asset=asset,
                version_no=1,
                source_type=initial_version_data["sourceType"],
                source_url=initial_version_data["sourceUrl"],
                source_file_id=initial_version_data.get("sourceFileId", ""),
                created_by=user,
            )
            asset.latest_version = ver
            asset.save(update_fields=["latest_version"])

        return asset


# ──────────────────────────────────────────────
# Asset 수정
# ──────────────────────────────────────────────
class AssetUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=300, required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    viewScope = serializers.ChoiceField(choices=Asset.ViewScope.choices, required=False)
    downloadAllowed = serializers.BooleanField(required=False, allow_null=True)
    publishStatus = serializers.ChoiceField(choices=Asset.PublishStatus.choices, required=False)
    securityLabel = serializers.ChoiceField(choices=Asset.SecurityLabel.choices, required=False)

    def update(self, instance, validated_data):
        field_map = {
            "title": "title",
            "description": "description",
            "viewScope": "view_scope",
            "downloadAllowed": "download_allowed",
            "publishStatus": "publish_status",
            "securityLabel": "security_label",
        }
        for api_field, model_field in field_map.items():
            if api_field in validated_data:
                setattr(instance, model_field, validated_data[api_field])
        instance.save()
        return instance


# ──────────────────────────────────────────────
# Permission (ACL)
# ──────────────────────────────────────────────
class PermissionSerializer(serializers.ModelSerializer):
    subjectType = serializers.CharField(source="subject_type")
    subjectId = serializers.CharField(source="subject_id")
    canView = serializers.BooleanField(source="can_view")
    canDownload = serializers.BooleanField(source="can_download")

    class Meta:
        model = AssetPermission
        fields = ["subjectType", "subjectId", "canView", "canDownload"]


class PermissionBulkSerializer(serializers.Serializer):
    """PUT /api/assets/{id}/permissions → 전체 교체"""
    rules = PermissionSerializer(many=True)
