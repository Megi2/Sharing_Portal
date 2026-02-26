from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """DRF 기본 핸들러 + 추가 처리."""
    response = exception_handler(exc, context)
    if response is not None:
        # 상세 에러 코드가 필요하면 여기서 추가
        pass
    return response
