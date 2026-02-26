from django.contrib import admin
from .models import ShareRequest


@admin.register(ShareRequest)
class ShareRequestAdmin(admin.ModelAdmin):
    list_display = ("asset", "requested_by", "status", "approved_by", "created_at")
    list_filter = ("status",)
