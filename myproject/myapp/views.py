import logging
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, status
from .models import Operation
from .serializers import OperationSerializer
from django.http import HttpResponse
from django.conf import settings
from .models import CustomUser
from django.urls import reverse
from django.core.mail import send_mail
from .utils import generate_verification_token
from django.core import signing
from django.http import Http404
from django.db import IntegrityError, transaction
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from .utils import generate_superset_guest_token, get_client_ip, ratelimit_key, calculate_raroc
from langchain_community.chat_models import ChatOpenAI
from langchain_experimental.sql import SQLDatabaseChain
from langchain import SQLDatabase

logger = logging.getLogger(__name__)

DASHBOARD_ID = settings.DASHBOARD_ID

def home(request):
    return HttpResponse("Welcome to the API homepage")

class AuthCheckView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logger.debug(f"AuthCheck requested by user: {request.user}")
        return Response({"message": "Authenticated"}, status=200)

class SignupView(APIView):
    permission_classes = [AllowAny]  # Add this line

    def post(self, request):
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')

        logger.debug(f"Received signup request for email: {email}, username: {username}")

        # Validate email domain
        if not email or not email.endswith('@caf.com'):
            logger.error(f"Invalid email domain: {email}")
            return Response({'error': 'Only institutional emails (@caf.com) are allowed.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create the user in an inactive state
        try:
            # Use atomic transaction to ensure email is sent successfully before user creation is finalized
            with transaction.atomic():
                user = CustomUser.objects.create_user(username=username, email=email, password=password)
                logger.debug(f"User created: {user.username}, {user.email}")
                user.is_active = False
                user.save()
                logger.debug(f"User saved with is_active=False: {user.is_active}")

                # Send verification email
                token = generate_verification_token(user)
                verification_link = request.build_absolute_uri(reverse('verify_email', args=[token]))
                print(f"Verification link: {verification_link}")
                logger.debug(f"Sending verification email to {email} with token {token}")
                send_mail(
                    'Verify your email',
                    f'Please click the following link to verify your email: {verification_link}',
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )

                return Response({'message': 'User created successfully. Please verify your email.'}, status=status.HTTP_201_CREATED)
        except IntegrityError:
            logger.error(f"User already exists: {email}")
            return Response({'error': 'A user with that email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Signup failed with error: {e}")
            return Response({'error': 'Signup failed.'}, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, token):
        logger.debug(f"Email verification requested with token: {token}")
        try:
            data = signing.loads(token, max_age=86400)  # Token expires after 1 day (86400 seconds)
            user_id = data.get('user_id')
            logger.debug(f"Token decoded successfully, user_id: {user_id}")
            user = CustomUser.objects.get(pk=user_id)
            user.is_active = True
            user.save()
            logger.debug(f"User {user.email} verified successfully and is_active=True")
            return HttpResponse('Email verified successfully. You can now log in.')
        except (signing.BadSignature, signing.SignatureExpired) as e:
            logger.error(f"Token invalid or expired: {e}")
            return HttpResponse('Verification link is invalid or has expired.', status=status.HTTP_400_BAD_REQUEST)
        except CustomUser.DoesNotExist:
            logger.error(f"User with ID {user_id} does not exist.")
            raise Http404("User does not exist")

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        logger.debug(f"Token refresh request received: {request.data}")
        response = super().post(request, *args, **kwargs)

        try:
            # Check if access and refresh tokens are in the response
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')
            if access_token and refresh_token:
                logger.debug(f"Access token generated: {access_token}")
                logger.debug(f"Refresh token generated: {refresh_token}")

                # Set the access token in the HTTP-only cookie
                response.set_cookie(
                    key='access_token',
                    value=response.data['access'],
                    httponly=True,  # Make the cookie HTTP-only
                    secure=settings.CSRF_COOKIE_SECURE,  # Only send the cookie over HTTPS
                    samesite='Strict'  # Prevent the cookie from being sent with cross-site requests
                )

                # Set the refresh token in the HTTP-only cookie
                response.set_cookie(
                    key='refresh_token',
                    value=response.data['refresh'],
                    httponly=True,
                    secure=settings.CSRF_COOKIE_SECURE,
                    samesite='Strict'
                )

                # Optionally remove the access token from the response body
                del response.data['access']
                del response.data['refresh']

            else:
                logger.error("Token generation failed. Access or refresh token missing.")
        except Exception as e:
            logger.error(f"Error processing token response: {e}")

        return response

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        logger.debug(f"Token refresh request received: {request.data}")

        # Get the refresh token from the cookie
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            logger.error("No refresh token found in cookies.")
            return Response({'error': 'No refresh token provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Set the refresh token in the request data
        request.data['refresh'] = refresh_token

        response = super().post(request, *args, **kwargs)

        try:
            access_token = response.data.get('access')
            if access_token:
                logger.debug(f"Access token generated: {access_token}")

                # Set the new access token in the cookie
                response.set_cookie(
                    key='access_token',
                    value=access_token,
                    httponly=True,
                    secure=settings.CSRF_COOKIE_SECURE,
                    samesite='Strict'
                )

                # Remove tokens from response body for security
                del response.data['access']
            else:
                logger.error("Token generation failed. Access token missing.")
        except Exception as e:
            logger.error(f"Error processing token response: {e}")

        return response

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            if not refresh_token:
                logger.error("No refresh token found in cookies during logout.")
                return Response({"error": "No refresh token provided."}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()  # Blacklist the refresh token
            logger.info(f"Refresh token blacklisted for user: {request.user.username}")

            # Delete the tokens from cookies
            response = Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            logger.info(f"Cookies deleted for user: {request.user.username}")
            return response
        except (TokenError, InvalidToken) as e:
            # Token is already blacklisted or invalid
            logger.warning(f"Token error during logout for user {request.user.username}: {e}")
            # Still delete the cookies and respond with success
            response = Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            logger.info(f"Cookies deleted for user: {request.user.username} despite token error.")
            return response
        except Exception as e:
            logger.error(f"Logout failed for user {request.user.username}: {e}")
            return Response({"error": "Logout failed."}, status=status.HTTP_400_BAD_REQUEST)

class OperationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Operation.objects.all().select_related(
        'corporativo',
        'financiamientoestructurado',
        'institucionesfinancieras',
        'inversionespatrimoniales',
        'corporativoestructuradofinancieras',
        'corporativofinancieras'
    )
    serializer_class = OperationSerializer

    def get_queryset(self):
        # Filter operations by the current user
        return Operation.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Save the new operation with the current user as the owner
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        logger.debug(f"Request data: {request.data}")
        operation_serializer = self.get_serializer(data=request.data)

        try:
            operation_serializer.is_valid(raise_exception=True)
            operation = operation_serializer.save()
            logger.debug(f"Operation created with ID: {operation.id}")
        except Exception as e:
            logger.error(f"Validation error for operation: {operation_serializer.errors}")
            logger.error(f"Exception: {e}")
            return Response(operation_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        headers = self.get_success_headers(operation_serializer.data)
        return Response(operation_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        logger.debug(f"Updating operation with ID: {instance.id} with data: {request.data}")
        operation_serializer = self.get_serializer(instance, data=request.data, partial=partial)

        try:
            operation_serializer.is_valid(raise_exception=True)
            operation = operation_serializer.save()
            logger.debug(f"Operation updated with ID: {operation.id}")
        except Exception as e:
            logger.error(f"Validation error for operation: {operation_serializer.errors}")
            logger.error(f"Exception: {e}")
            return Response(operation_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(operation_serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        logger.debug(f"Retrieving operation with ID: {instance.id}")
        serializer = self.get_serializer(instance)
        logger.debug(f"Serialized data for retrieve: {serializer.data}")
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        logger.debug("Listing all operations")
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class GetSupersetGuestToken(APIView):
    permission_classes = [IsAuthenticated]  # Adjust permissions as needed

    @method_decorator(ratelimit(key=ratelimit_key, rate='5/m', block=True))
    def get(self, request):
        client_ip = get_client_ip(request)
        logger.info(f"Request made from IP: {client_ip}")

        # Retrieve dashboard_id from the request
        dashboard_id = request.query_params.get('dashboard_id', DASHBOARD_ID)
        if not dashboard_id:
            return Response({'error': 'Dashboard ID is required.'}, status=400)

        try:
            # Generate the guest token
            token = generate_superset_guest_token(dashboard_id)
            return Response({'guest_token': token})
        except Exception as e:
            logger.error(f"Error generating guest token: {e}")
            return Response({'error': 'Failed to generate guest token.'}, status=500)

class NLQueryView(APIView):
    def post(self, request):
        question = request.data.get('question', '')
        if not question:
            return Response({'error': 'Pregunta no proporcionada.'}, status=status.HTTP_400_BAD_REQUEST)

        API_KEY = settings.OPENAI_API_KEY
        llm = ChatOpenAI(temperature=0, api_key=API_KEY, model='gpt-4')

        database_url = settings.DATABASE_URL

        db = SQLDatabase.from_uri(
            database_url,
            include_tables=['myapp_operation', 'myapp_operationscore', 'myapp_customuser']
        )

        QUERY_TEMPLATE = """
        Dada una pregunta de entrada, primero crea una consulta SQL de PostgreSQL sintácticamente correcta para ejecutar, luego mira los resultados de la consulta y devuelve la respuesta en español.
        Utiliza el siguiente formato:
        Pregunta: {question}
        SQLQuery: Consulta SQL para ejecutar
        SQLResult: Resultado de la consulta SQL
        Respuesta: Respuesta final aquí
        """

        db_chain = SQLDatabaseChain(llm=llm, database=db, verbose=True)

        try:
            question_prompt = QUERY_TEMPLATE.format(question=question)
            result = db_chain.run(question_prompt)
            return Response({'result': result}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RarocCalculatorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        operation_data = request.data.get('operation_data', {})
        metodologia_perdida_esperada = request.data.get('metodologia_perdida_esperada')
        metodologia_capital = request.data.get('metodologia_capital')

        try:
            raroc_value = calculate_raroc(
                operation_data,
                metodologia_perdida_esperada=metodologia_perdida_esperada,
                metodologia_capital=metodologia_capital
            )
            return Response({'raroc': raroc_value}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error calculating RAROC: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
