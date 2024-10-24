# myapp/signals.py

from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    """
    Sends a plain text email to the user with the password reset link.
    """
    try:
        frontend_url = settings.FRONTEND_URL  # Ensure this is defined in settings.py
        reset_password_url = f"{frontend_url}/password-reset-confirm/{reset_password_token.user.pk}/{reset_password_token.key}/"

        subject = "Password Reset for Your Account"
        from_email = settings.DEFAULT_FROM_EMAIL
        to_email = reset_password_token.user.email

        message = (
            f"Hello {reset_password_token.user.username},\n\n"
            "You have requested to reset your password. Please click the link below to reset it:\n\n"
            f"{reset_password_url}\n\n"
            "If you did not make this request, please ignore this email.\n\n"
            "Thank you."
        )

        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[to_email],
            fail_silently=False,
        )

        logger.info(f"Password reset email sent to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send password reset email to {to_email}: {e}")
