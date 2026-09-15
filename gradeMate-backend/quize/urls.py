"""
URL routing for quize application.
"""

from django.urls import path
from quize import views

urlpatterns = [
    path('upload_quiz/', views.upload_quiz, name='upload_quiz'),
    path('dashboard-stats/', views.dashboard, name='dashboard_stats'),
    path('quiz_view/', views.quiz_view, name='quiz_view'),
    path('get_all_quizes/', views.get_all_quizes, name='get_all_quizes'),
    path('check_plagiarism/', views.check_plagiarism, name='check_plagiarism'),
]