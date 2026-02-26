"""
announcements/models.py
ERD 섹션 6) 공지
"""
import uuid
from django.conf import settings
from django.db import models


class Announcement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField("제목", max_length=200)
    body = models.TextField("내용")
    is_pinned = models.BooleanField("고정 여부", default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name="announcements",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "announcements"
        ordering = ["-is_pinned", "-created_at"]

    def __str__(self):
        return self.title
