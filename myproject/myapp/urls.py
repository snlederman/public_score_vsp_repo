from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OperationViewSet

router = DefaultRouter()
router.register(r'operations', OperationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
