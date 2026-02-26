import csv
from django.http import HttpResponse
from rest_framework import generics
from rest_framework.views import APIView

from .models import AccessLog
from .serializers import AccessLogSerializer


class _LogFilterMixin:
    """공통 필터 로직: from, to, action, result."""

    def apply_filters(self, qs, params):
        date_from = params.get("from")
        date_to = params.get("to")
        action = params.get("action")
        result = params.get("result")
        if date_from:
            qs = qs.filter(occurred_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(occurred_at__date__lte=date_to)
        if action:
            qs = qs.filter(action=action.upper())
        if result:
            qs = qs.filter(result=result.upper())
        return qs


# ──────────────────────────────────────────────
# GET /api/logs/
# ──────────────────────────────────────────────
class AccessLogListView(_LogFilterMixin, generics.ListAPIView):
    queryset = AccessLog.objects.select_related("user", "asset").all()
    serializer_class = AccessLogSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        return self.apply_filters(qs, self.request.query_params)


# ──────────────────────────────────────────────
# GET /api/logs/export  → CSV 다운로드
# ──────────────────────────────────────────────
class AccessLogExportView(_LogFilterMixin, APIView):

    def get(self, request):
        qs = AccessLog.objects.select_related("user", "asset").all()
        qs = self.apply_filters(qs, request.query_params)

        response = HttpResponse(content_type="text/csv; charset=utf-8-sig")
        response["Content-Disposition"] = 'attachment; filename="access_logs.csv"'

        writer = csv.writer(response)
        writer.writerow(["일시", "사용자", "자산", "액션", "IP", "결과"])
        for log in qs[:10000]:  # 최대 10,000건
            writer.writerow([
                log.occurred_at.strftime("%Y-%m-%d %H:%M:%S"),
                getattr(log.user, "name", ""),
                getattr(log.asset, "title", ""),
                log.action,
                log.ip or "",
                log.result,
            ])
        return response
