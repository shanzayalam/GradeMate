"""
Authentication utility module for GradeMate backend.

Handles JSON Web Token (JWT) generation, decoding, and refreshing.
"""

from datetime import datetime, timedelta
import jwt
from django.conf import settings


def generate_jwt_token(user):
    """
    Generate a signed JWT token for an authenticated user.

    :param user: User model instance
    :return: Encoded JWT string token
    """
    expiration_time = datetime.now() + timedelta(hours=10)

    payload = {
        'user_id': user.id,
        'email': user.email,
        'exp': expiration_time.timestamp(),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')


def generate_jwt(payload):
    """
    Generate a signed JWT token for a given dictionary payload.

    :param payload: Dictionary containing JWT claims
    :return: Encoded JWT string token
    """
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')


def decode_jwt_token(token):
    """
    Decode and verify a signed JWT token.

    :param token: JWT token string
    :return: Decoded payload dictionary
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])


def refresh_jwt_token(token):
    """
    Refresh an existing JWT token by extending its expiration time.

    :param token: Original JWT token string
    :return: Refreshed JWT token string
    """
    payload = decode_jwt_token(token)
    new_expiration = datetime.now() + timedelta(hours=10)
    payload['exp'] = new_expiration.timestamp()
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
