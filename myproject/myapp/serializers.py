import logging
from rest_framework import serializers
from .models import (Operation, Corporativo, FinanciamientoEstructurado, InversionesPatrimoniales,
                     InstitucionesFinancieras, CorporativoEstructuradoFinancieras, CorporativoFinancieras, OperationScore)
from .utils import calculate_vsp_score_components
from django.contrib.auth.models import User


logger = logging.getLogger(__name__)

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email']  # Add email or other fields as needed

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', '')  # Optional email field
        )
        return user

class CorporativoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Corporativo
        fields = '__all__'
        extra_kwargs = {'operation': {'required': False}}

class FinanciamientoEstructuradoSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinanciamientoEstructurado
        fields = '__all__'
        extra_kwargs = {'operation': {'required': False}}

class InstitucionesFinancierasSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitucionesFinancieras
        fields = '__all__'
        extra_kwargs = {'operation': {'required': False}}

class InversionesPatrimonialesSerializer(serializers.ModelSerializer):
    class Meta:
        model = InversionesPatrimoniales
        fields = '__all__'
        extra_kwargs = {'operation': {'required': False}}

class CorporativoEstructuradoFinancierasSerializer(serializers.ModelSerializer):
    class Meta:
        model = CorporativoEstructuradoFinancieras
        fields = '__all__'
        extra_kwargs = {'operation': {'required': False}}

class CorporativoFinancierasSerializer(serializers.ModelSerializer):
    class Meta:
        model = CorporativoFinancieras
        fields = '__all__'
        extra_kwargs = {'operation': {'required': False}}

class OperationScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperationScore
        fields = '__all__'

class OperationSerializer(serializers.ModelSerializer):
    corporativo = CorporativoSerializer(required=False, allow_null=True)
    financiamientoestructurado = FinanciamientoEstructuradoSerializer(required=False, allow_null=True)
    institucionesfinancieras = InstitucionesFinancierasSerializer(required=False, allow_null=True)
    inversionespatrimoniales = InversionesPatrimonialesSerializer(required=False, allow_null=True)
    corporativoestructuradofinancieras = CorporativoEstructuradoFinancierasSerializer(required=False, allow_null=True)
    corporativofinancieras = CorporativoFinancierasSerializer(required=False, allow_null=True)

    class Meta:
        model = Operation
        fields = '__all__'
        read_only_fields = ['user']

    def create(self, validated_data):
        logger.debug(f"Creating operation with data: {validated_data}")
        user = self.context['request'].user # Get the user from the context

        # Extract nested data
        corporativo_data = validated_data.pop('corporativo', None)
        financiamiento_estructurado_data = validated_data.pop('financiamientoestructurado', None)
        instituciones_financieras_data = validated_data.pop('institucionesfinancieras', None)
        inversiones_patrimoniales_data = validated_data.pop('inversionespatrimoniales', None)
        corporativo_estructurado_financieras_data = validated_data.pop('corporativoestructuradofinancieras', None)
        corporativo_financieras_data = validated_data.pop('corporativofinancieras', None)

        # Create the operation with the user
        operation = Operation.objects.create(user=user, **validated_data)

        # Combine all data for score calculation
        operation_data = {
            **validated_data,
            **(corporativo_data or {}),
            **(financiamiento_estructurado_data or {}),
            **(instituciones_financieras_data or {}),
            **(inversiones_patrimoniales_data or {}),
            **(corporativo_estructurado_financieras_data or {}),
            **(corporativo_financieras_data or {})
        }

        # Calculate the score
        adicionalidad_e_impacto, madurez_proyecto, raroc, robustez_cliente, score = calculate_vsp_score_components(operation_data)
        OperationScore.objects.create(operation=operation,
                                      adicionalidad_e_impacto=adicionalidad_e_impacto,
                                      madurez_proyecto=madurez_proyecto,
                                      raroc=raroc,
                                      robustez_cliente=robustez_cliente,
                                      vsp_score=score)

        # Create nested objects if provided
        try:
            if corporativo_data:
                logger.debug(f"Creating Corporativo with data: {corporativo_data}")
                Corporativo.objects.create(operation=operation, **corporativo_data)
            if financiamiento_estructurado_data:
                logger.debug(f"Creating FinanciamientoEstructurado with data: {financiamiento_estructurado_data}")
                FinanciamientoEstructurado.objects.create(operation=operation, **financiamiento_estructurado_data)
            if instituciones_financieras_data:
                logger.debug(f"Creating InstitucionesFinancieras with data: {instituciones_financieras_data}")
                InstitucionesFinancieras.objects.create(operation=operation, **instituciones_financieras_data)
            if inversiones_patrimoniales_data:
                logger.debug(f"Creating InversionesPatrimoniales with data: {inversiones_patrimoniales_data}")
                InversionesPatrimoniales.objects.create(operation=operation, **inversiones_patrimoniales_data)
            if corporativo_estructurado_financieras_data:
                logger.debug(f"Creating CorporativoEstructuradoFinancieras with data: {corporativo_estructurado_financieras_data}")
                CorporativoEstructuradoFinancieras.objects.create(operation=operation, **corporativo_estructurado_financieras_data)
            if corporativo_financieras_data:
                logger.debug(f"Creating CorporativoFinancieras with data: {corporativo_financieras_data}")
                CorporativoFinancieras.objects.create(operation=operation, **corporativo_financieras_data)
        except Exception as e:
            logger.error(f"Error creating nested objects: {e}")
            raise serializers.ValidationError("Error creating nested objects")

        return operation

    def update(self, instance, validated_data):
        logger.debug(f"Updating operation with data: {validated_data}")
        corporativo_data = validated_data.pop('corporativo', None)
        financiamiento_estructurado_data = validated_data.pop('financiamientoestructurado', None)
        instituciones_financieras_data = validated_data.pop('institucionesfinancieras', None)
        inversiones_patrimoniales_data = validated_data.pop('inversionespatrimoniales', None)
        corporativo_estructurado_financieras_data = validated_data.pop('corporativoestructuradofinancieras', None)
        corporativo_financieras_data = validated_data.pop('corporativofinancieras', None)

        operation_data = {
            **validated_data,
            **(corporativo_data or {}),
            **(financiamiento_estructurado_data or {}),
            **(instituciones_financieras_data or {}),
            **(inversiones_patrimoniales_data or {}),
            **(corporativo_estructurado_financieras_data or {}),
            **(corporativo_financieras_data or {})
        }

        # Calculate the score
        adicionalidad_e_impacto, madurez_proyecto, raroc, robustez_cliente, score = calculate_vsp_score_components(operation_data)
        if hasattr(instance, 'score'):
            instance.score.adicionalidad_e_impacto = adicionalidad_e_impacto
            instance.score.madurez_proyecto = madurez_proyecto
            instance.score.raroc = raroc
            instance.score.robustez_cliente = robustez_cliente
            instance.score.vsp_score = score
            instance.score.save()
        else:
            OperationScore.objects.create(operation=instance,
                                          adicionalidad_e_impacto=adicionalidad_e_impacto,
                                          madurez_proyecto=madurez_proyecto,
                                          raroc=raroc,
                                          robustez_cliente=robustez_cliente,
                                          vsp_score=score)

        instance = super().update(instance, validated_data)

        try:
            if corporativo_data:
                logger.debug(f"Updating Corporativo with data: {corporativo_data}")
                Corporativo.objects.update_or_create(operation=instance,
                                                     defaults=corporativo_data)
            if financiamiento_estructurado_data:
                logger.debug(f"Updating FinanciamientoEstructurado with data: {financiamiento_estructurado_data}")
                FinanciamientoEstructurado.objects.update_or_create(operation=instance,
                                                                    defaults=financiamiento_estructurado_data)
            if instituciones_financieras_data:
                logger.debug(f"Updating InstitucionesFinancieras with data: {instituciones_financieras_data}")
                InstitucionesFinancieras.objects.update_or_create(operation=instance,
                                                                  defaults=instituciones_financieras_data)
            if inversiones_patrimoniales_data:
                logger.debug(f"Updating InversionesPatrimoniales with data: {inversiones_patrimoniales_data}")
                InversionesPatrimoniales.objects.update_or_create(operation=instance,
                                                                  defaults=inversiones_patrimoniales_data)
            if corporativo_estructurado_financieras_data:
                logger.debug(f"Updating CorporativoEstructuradoFinancieras with data: {corporativo_estructurado_financieras_data}")
                CorporativoEstructuradoFinancieras.objects.update_or_create(operation=instance,
                                                                  defaults=corporativo_estructurado_financieras_data)
            if corporativo_financieras_data:
                logger.debug(f"Updating CorporativoFinancieras with data: {corporativo_financieras_data}")
                CorporativoFinancieras.objects.update_or_create(operation=instance,
                                                                  defaults=corporativo_financieras_data)
        except Exception as e:
            logger.error(f"Error updating nested objects: {e}")
            raise serializers.ValidationError("Error updating nested objects")

        return instance
