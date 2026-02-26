"""
공통 Response 포맷:
  성공 → {"success": true, "data": {}, "message": null}
  실패 → {"success": false, "data": null, "message": "에러 메시지"}
"""
from rest_framework.renderers import JSONRenderer


class ApiRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get("response") if renderer_context else None
        if response and response.status_code >= 400:
            # DRF 에러 → "detail" 키가 흔함
            message = data.get("detail", data) if isinstance(data, dict) else data
            payload = {"success": False, "data": None, "message": message}
        else:
            payload = {"success": True, "data": data, "message": None}
        return super().render(payload, accepted_media_type, renderer_context)
