from django.urls import path

from . import views

urlpatterns = [
    path('', views.wishlist_detail, name='wishlist_detail'),
    path('add/', views.wishlist_add, name='wishlist_add'),
    path('remove/', views.wishlist_remove, name='wishlist_remove'),
]
