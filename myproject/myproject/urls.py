"""myproject URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from myapp.views import (home,
                         CustomTokenObtainPairView,
                         CustomTokenRefreshView,
                         AuthCheckView,
                         SignupView,
                         VerifyEmailView,
                         GetSupersetGuestToken,
                         LogoutView,
                         NLQueryView,
                         RarocCalculatorView)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('myapp.urls')),
    path('api/check-auth/', AuthCheckView.as_view(), name='auth_check'),
    path('api/signup/', SignupView.as_view(), name='signup'),
    path('api/verify-email/<str:token>/', VerifyEmailView.as_view(), name='verify_email'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/password-reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
    path('api/get_superset_guest_token/', GetSupersetGuestToken.as_view(), name='get_superset_guest_token'),
    path('', home, name='home'),
    path('api/nl-query/', NLQueryView.as_view(), name='nl_query'),
    path('api/raroc-calculator/', RarocCalculatorView.as_view(), name='raroc_calculator'),
]
