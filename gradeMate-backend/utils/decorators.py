"""
Authentication decorators for GradeMate request authorization.
"""

from functools import wraps
from django.http import JsonResponse
from rest_framework import status
from accounts.auth_utils import decode_jwt_token


def jwt_required(view_func):
    """
    Decorator to enforce JWT Bearer authentication on protected API endpoints.

    Attaches decoded payload to request object as `user_payload`.
    Returns HTTP 401 Unauthorized if Authorization header is missing or invalid.
    """
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return JsonResponse(
                {"error": "Authorization header missing."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return JsonResponse(
                {"error": "Invalid Authorization header format. Expected 'Bearer <token>'."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token = parts[1]
        try:
            payload = decode_jwt_token(token)
            request.user_payload = payload
        except Exception as err:
            return JsonResponse(
                {"error": f"Invalid or expired token: {str(err)}"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return view_func(request, *args, **kwargs)

    return wrapped_view
