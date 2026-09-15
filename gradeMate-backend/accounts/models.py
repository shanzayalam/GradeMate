"""
User Model module for accounts app.

Defines the User entity for GradeMate authentication and session management.
"""

import uuid
from django.db import models


class User(models.Model):
    """User model representing registered instructors/users."""

    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    name = models.CharField(max_length=150, default="")
    active_status = models.BooleanField(default=True)
    email_verified = models.BooleanField(default=False)
    address = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    token_secret = models.CharField(
        max_length=64,
        default=uuid.uuid4
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Return email representation of the user."""
        return self.email
