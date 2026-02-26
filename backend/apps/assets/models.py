"""
assets/models.py
ERD 섹션 2) 콘텐츠(자산)/버전/태그  +  3) 자산별 ACL
"""
import uuid
from django.db import models
from django.conf import settings


# ──────────────────────────────────────────────
# Category (계층 구조)
# ──────────────────────────────────────────────
class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField("카테고리명", max_length=100)
    parent = models.ForeignKey(
        "self", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="children",
    )
    sort_order = models.IntegerField("정렬순서", default=0)
    is_active = models.BooleanField("활성 여부", default=True)

    class Meta:
        db_table = "categories"
        ordering = ["sort_order", "name"]
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


# ──────────────────────────────────────────────
# Tag
# ──────────────────────────────────────────────
class Tag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField("태그명", max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "tags"
        ordering = ["name"]

    def __str__(self):
        return self.name


# ──────────────────────────────────────────────
# Asset (핵심 도메인)
# ──────────────────────────────────────────────
class Asset(models.Model):
    class Type(models.TextChoices):
        VIDEO = "VIDEO", "영상"
        DOCUMENT = "DOCUMENT", "문서"
        LINK = "LINK", "링크"

    class PublishStatus(models.TextChoices):
        DRAFT = "DRAFT", "초안"
        REVIEW = "REVIEW", "검토중"
        PUBLISHED = "PUBLISHED", "게시됨"
        ARCHIVED = "ARCHIVED", "보관"

    class ViewScope(models.TextChoices):
        ALL_USERS = "ALL_USERS", "전체 공개"
        ADMIN_ONLY = "ADMIN_ONLY", "관리자만"
        CUSTOM = "CUSTOM", "커스텀"

    class SecurityLabel(models.TextChoices):
        L1 = "L1", "L1 - 공개"
        L2 = "L2", "L2 - 사내"
        L3 = "L3", "L3 - 대외비"
        L4 = "L4", "L4 - 극비"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField("유형", max_length=10, choices=Type.choices)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="assets",
    )
    title = models.CharField("제목", max_length=300)
    description = models.TextField("설명", blank=True, default="")
    publish_status = models.CharField(
        "게시 상태", max_length=10,
        choices=PublishStatus.choices, default=PublishStatus.DRAFT,
    )
    view_scope = models.CharField(
        "열람 범위", max_length=12,
        choices=ViewScope.choices, default=ViewScope.ALL_USERS,
    )
    download_allowed = models.BooleanField("다운로드 허용", default=False)
    security_label = models.CharField(
        "보안 등급", max_length=2,
        choices=SecurityLabel.choices, default=SecurityLabel.L2, blank=True,
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="owned_assets",
        db_column="owner_user_id",
    )
    latest_version = models.OneToOneField(
        "AssetVersion", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="+",
        db_column="latest_version_id",
    )
    tags = models.ManyToManyField(Tag, through="AssetTag", related_name="assets", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "assets"
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["type"], name="idx_assets_type"),
            models.Index(fields=["publish_status"], name="idx_assets_pub_status"),
            models.Index(fields=["-updated_at"], name="idx_assets_updated"),
        ]

    def __str__(self):
        return self.title


# ──────────────────────────────────────────────
# AssetVersion (버전 관리)
# ──────────────────────────────────────────────
class AssetVersion(models.Model):
    class SourceType(models.TextChoices):
        GDRIVE = "GDRIVE", "Google Drive"
        URL = "URL", "URL 링크"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    asset = models.ForeignKey(
        Asset, on_delete=models.CASCADE, related_name="versions",
    )
    version_no = models.PositiveIntegerField("버전 번호")
    source_type = models.CharField("소스 유형", max_length=6, choices=SourceType.choices)
    source_url = models.URLField("소스 URL", max_length=1000)
    source_file_id = models.CharField(
        "Drive 파일 ID", max_length=200, blank=True, default="",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name="created_versions",
    )
    note = models.TextField("변경 노트", blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "asset_versions"
        ordering = ["-version_no"]
        unique_together = ("asset", "version_no")

    def __str__(self):
        return f"{self.asset.title} v{self.version_no}"


# ──────────────────────────────────────────────
# Asset ↔ Tag (N:M)
# ──────────────────────────────────────────────
class AssetTag(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "asset_tags"
        unique_together = ("asset", "tag")


# ──────────────────────────────────────────────
# AssetPermission (자산별 ACL)
# ──────────────────────────────────────────────
class AssetPermission(models.Model):
    class SubjectType(models.TextChoices):
        USER = "USER", "사용자"
        DEPT = "DEPT", "부서"
        ROLE = "ROLE", "역할"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    asset = models.ForeignKey(
        Asset, on_delete=models.CASCADE, related_name="permissions",
    )
    subject_type = models.CharField("대상 유형", max_length=4, choices=SubjectType.choices)
    subject_id = models.CharField("대상 ID", max_length=200)
    can_view = models.BooleanField("열람 허용", default=False)
    can_download = models.BooleanField("다운로드 허용", default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "asset_permissions"
        indexes = [
            models.Index(fields=["asset", "subject_type"], name="idx_perm_asset_subj"),
        ]

    def __str__(self):
        return f"{self.asset.title} → {self.subject_type}:{self.subject_id}"
