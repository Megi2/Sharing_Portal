from django.contrib import admin
from .models import AccessLog


@admin.register(AccessLog)
class AccessLogAdmin(admin.ModelAdmin):
    list_display = ("occurred_at", "user", "asset", "action", "result", "ip")
    list_filter = ("action", "result")
    readonly_fields = ("id", "occurred_at")
