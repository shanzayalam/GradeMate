"""
Email utility functions for sending account verification and password resets.
"""

import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)
DEFAULT_SUPPORT_EMAIL = 'support@grademate.ai'


def send_verification_email(username, email_address, token):
    """
    Send an email verification link to a newly registered user.

    :param username: User display name
    :param email_address: Destination email address
    :param token: Verification JWT token
    """
    try:
        verification_url = f"http://localhost:5173/email-verified/{token}"

        html_message = render_to_string('emailverification.html', {
            'username': username,
            'email': email_address,
            'verification_url': verification_url,
            'support_email': DEFAULT_SUPPORT_EMAIL
        })
        plain_message = strip_tags(html_message)

        msg = EmailMultiAlternatives(
            subject='Verify your GradeMate account',
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL or 'noreply@grademate.ai',
            to=[email_address]
        )
        msg.attach_alternative(html_message, "text/html")
        msg.send()
        logger.info(f"Verification email sent to {email_address}")

    except Exception as err:
        logger.error(f"Failed to send verification email to {email_address}: {err}")


def send_reset_password_email(username, email_address, token):
    """
    Send a password reset email containing a reset token link.

    :param username: User display name
    :param email_address: Destination email address
    :param token: Password reset token string
    """
    try:
        reset_url = f"http://localhost:5173/reset-password/{token}"

        html_message = render_to_string('resetPassword.html', {
            'username': username,
            'email': email_address,
            'verification_url': reset_url,
            'support_email': DEFAULT_SUPPORT_EMAIL
        })
        plain_message = strip_tags(html_message)

        msg = EmailMultiAlternatives(
            subject='Reset your GradeMate password',
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL or 'noreply@grademate.ai',
            to=[email_address]
        )
        msg.attach_alternative(html_message, "text/html")
        msg.send()
        logger.info(f"Password reset email sent to {email_address}")

    except Exception as err:
        logger.error(f"Failed to send reset email to {email_address}: {err}")
