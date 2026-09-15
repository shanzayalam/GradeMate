"""
Authentication views for accounts app.

Provides user registration, login, password reset email, and password update APIs.
"""

import json
import logging
from django.contrib.auth.hashers import make_password, check_password
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view

from accounts.models import User
from accounts.auth_utils import generate_jwt_token, decode_jwt_token
from utils.emails import send_reset_password_email

logger = logging.getLogger(__name__)


@api_view(['POST'])
def signup(request):
    """
    Handle user registration.

    Expects JSON body with 'email', 'password', and 'name'.
    """
    try:
        data = json.loads(request.body) if request.body else request.data
        email = data.get("email")
        password = data.get("password")
        name = data.get("name")

        if not email or not password or not name:
            return JsonResponse(
                {"error": "Email, password, and name are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return JsonResponse(
                {"error": "Email already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        hashed_password = make_password(password)
        User.objects.create(
            email=email,
            password=hashed_password,
            name=name,
            active_status=True,
            email_verified=True
        )

        logger.info(f"User created successfully: {email}")
        return JsonResponse(
            {"message": "User registered successfully."},
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        logger.error(f"Signup exception: {str(e)}")
        return JsonResponse(
            {"error": "Internal server error during registration."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def login(request):
    """
    Handle user login authentication.

    Expects JSON body with 'email' and 'password'.
    Returns JWT token and user profile details.
    """
    try:
        data = json.loads(request.body) if request.body else request.data
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return JsonResponse(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email=email).first()
        if not user or not check_password(password, user.password):
            return JsonResponse(
                {"error": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user_data = {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "createdAt": user.created_at.strftime("%d %b %Y"),
        }

        token = generate_jwt_token(user)
        logger.info(f"User logged in: {email}")

        return JsonResponse(
            {"token": token, "user": user_data},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        logger.error(f"Login exception: {str(e)}")
        return JsonResponse(
            {"error": "Internal server error during authentication."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def search_email(request):
    """
    Initiate password reset flow by looking up user email and sending email.

    Expects JSON body with 'email'.
    """
    try:
        data = json.loads(request.body) if request.body else request.data
        email = data.get("email")
        if not email:
            return JsonResponse(
                {"error": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email=email).first()
        if not user:
            return JsonResponse(
                {"error": "User with this email was not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        send_reset_password_email(user.name, user.email, generate_jwt_token(user))
        logger.info(f"Reset password email sent to {email}")

        return JsonResponse(
            {"message": "Reset password email sent."},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        logger.error(f"Search email exception: {str(e)}")
        return JsonResponse(
            {"error": "Failed to send reset email."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def set_new_password(request):
    """
    Set a new password using a reset token.

    Expects JSON body with 'token' and 'password'.
    """
    try:
        data = json.loads(request.body) if request.body else request.data
        token = data.get('token')
        new_password = data.get("password")

        if not token or not new_password:
            return JsonResponse(
                {"error": "Token and new password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            decoded_token = decode_jwt_token(token)
            user_id = decoded_token.get('user_id')
        except Exception:
            return JsonResponse(
                {'error': 'Invalid or expired token.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse(
                {'error': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        user.password = make_password(new_password)
        user.save(update_fields=["password"])
        logger.info(f"Password updated for user ID: {user_id}")

        return JsonResponse(
            {"message": "Password updated successfully."},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        logger.error(f"Set new password exception: {str(e)}")
        return JsonResponse(
            {"error": "Failed to reset password."},
            status=status.HTTP_400_BAD_REQUEST
        )
