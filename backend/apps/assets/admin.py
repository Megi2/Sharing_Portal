from django.contrib import admin
from .models import Asset, AssetPermission, AssetVersion, AssetTag, Category, Tag


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "sort_order", "is_active")


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


class AssetVersionInline(admin.TabularInline):
    model = AssetVersion
    extra = 0
    readonly_fields = ("version_no", "created_by", "created_at")


class AssetPermissionInline(admin.TabularInline):
    model = AssetPermission
    extra = 0


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ("title", "type", "category", "publish_status", "view_scope", "updated_at")
    list_filter = ("type", "publish_status", "view_scope", "security_label")
    search_fields = ("title", "description")
    inlines = [AssetVersionInline, AssetPermissionInline]
