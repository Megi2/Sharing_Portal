"""
logs/models.py
ERD 섹션 5) 로그(감사/모니터링)
"""
import uuid
from django.conf import settings
from django.db import models


class AccessLog(models.Model):
    class Action(models.TextChoices):
        VIEW = "VIEW", "열람"
        DOWNLOAD = "DOWNLOAD", "다운로드"
        PLAY = "PLAY", "재생"
        SEARCH = "SEARCH", "검색"
        EXPORT_LOG = "EXPORT_LOG", "로그 내보내기"
        DENIED = "DENIED", "접근 거부"

    class Result(models.TextChoices):
        SUCCESS = "SUCCESS", "성공"
        DENIED = "DENIED", "거부"
        FAIL = "FAIL", "실패"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    occurred_at = models.DateTimeField("발생 시간", auto_now_add=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="access_logs",
    )
    asset = models.ForeignKey(
        "assets.Asset", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="access_logs",
    )
    action = models.CharField("액션", max_length=12, choices=Action.choices)
    ip = models.GenericIPAddressField("IP 주소", blank=True, null=True)
    user_agent = models.TextField("User-Agent", blank=True, default="")
    result = models.CharField("결과", max_length=7, choices=Result.choices, default=Result.SUCCESS)
    meta_json = models.JSONField("메타 정보", null=True, blank=True)

    class Meta:
        db_table = "access_logs"
        ordering = ["-occurred_at"]
        indexes = [
            models.Index(fields=["-occurred_at"], name="idx_log_occurred"),
            models.Index(fields=["action"], name="idx_log_action"),
            models.Index(fields=["user"], name="idx_log_user"),
        ]

    def __str__(self):
        return f"[{self.action}] {self.user} → {self.asset} ({self.result})"
