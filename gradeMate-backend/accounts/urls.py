"""
URL routing for accounts application.
"""

from django.urls import path
from accounts import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),
    path('search_email/', views.search_email, name='search_email'),
    path('set_new_password/', views.set_new_password, name='set_new_password'),
]