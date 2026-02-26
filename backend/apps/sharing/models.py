"""
sharing/models.py
ERD 섹션 4) 공유요청/반출승인
"""
import uuid
from django.conf import settings
from django.db import models


class ShareRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "대기"
        APPROVED = "APPROVED", "승인"
        REJECTED = "REJECTED", "반려"
        CANCELLED = "CANCELLED", "취소"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    asset = models.ForeignKey(
        "assets.Asset", on_delete=models.CASCADE, related_name="share_requests",
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="share_requests_created",
    )
    reason = models.TextField("요청 사유")
    status = models.CharField(
        "상태", max_length=10,
        choices=Status.choices, default=Status.PENDING,
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="share_requests_handled",
    )
    comment = models.TextField("승인/반려 코멘트", blank=True, default="")
    approved_at = models.DateTimeField("처리 시간", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "share_requests"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"], name="idx_share_req_status"),
        ]

    def __str__(self):
        return f"[{self.status}] {self.asset.title} by {self.requested_by.name}"
