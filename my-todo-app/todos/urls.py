from django.urls import path
from . import views

urlpatterns = [
    path('home/', views.HomeView.as_view(), name='home'),
    path('', views.TodoListView.as_view(), name='todo-list'),
    path('create/', views.TodoCreateView.as_view(), name='todo-create'),
    path('<int:pk>/edit/', views.TodoUpdateView.as_view(), name='todo-edit'),
    path('<int:pk>/delete/', views.TodoDeleteView.as_view(), name='todo-delete'),
    path('<int:pk>/toggle/', views.toggle_complete, name='todo-toggle'),
]
