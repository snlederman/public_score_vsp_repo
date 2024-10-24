from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

class Operation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='operations')
    id = models.AutoField(primary_key=True)
    link_portal_negocio = models.URLField(blank=True, null=True)
    ejecutivo_negocio = models.CharField(max_length=255)
    nombre_cliente = models.CharField(max_length=255)
    nombre_operacion = models.CharField(max_length=255)
    pais = models.CharField(max_length=255)
    instrumento_financiero = models.CharField(max_length=255)
    tipo_cliente = models.CharField(max_length=255)
    monto_miles = models.FloatField()
    moneda_local = models.CharField(max_length=255)
    calificacion_externa_cliente = models.CharField(max_length=255)
    rating_cliente = models.CharField(max_length=255)
    calificacion_interna_cliente = models.CharField(max_length=255)
    necesidad_cliente = models.CharField(max_length=255)
    competitividad_caf = models.CharField(max_length=255)
    experiencia_caf = models.CharField(max_length=255)
    descripcion = models.TextField()
    actividad_principal = models.CharField(max_length=255)
    segmento_operacion = models.CharField(max_length=255)
    sector_economico = models.CharField(max_length=255)
    sub_sector_economico = models.CharField(max_length=255)
    area_actuacion = models.CharField(max_length=255)
    agendas_misionales = models.CharField(max_length=255)
    agendas_transversales_verdes = models.CharField(max_length=255)
    agendas_transversales_b4 = models.CharField(max_length=255)
    agendas_transversales_b5 = models.CharField(max_length=255)
    agendas_transversales_b6 = models.CharField(max_length=255)
    ods_1 = models.CharField(max_length=255)
    ods_2 = models.CharField(max_length=255)
    ods_3 = models.CharField(max_length=255)
    ods_4 = models.CharField(max_length=255)
    adicionalidad_cubrir_brechas = models.CharField(max_length=255)
    adicionalidad_mitigar_riesgos = models.CharField(max_length=255)
    adicionalidad_mejorar_condiciones = models.CharField(max_length=255)
    adicionalidad_movilizar_recursos = models.CharField(max_length=255)
    adicionalidad_instrumento_innovador = models.CharField(max_length=255)
    adicionalidad_conocimiento = models.CharField(max_length=255)
    fecha_tentativa_desembolso = models.DateField()
    plazo_operacion = models.FloatField()

    def __str__(self):
        return f"{self.id} - {self.nombre_operacion}"


class Corporativo(models.Model):
    operation = models.OneToOneField(Operation, on_delete=models.CASCADE, primary_key=True)
    corporativo_robustez_razon_liquidez = models.CharField(max_length=255)
    corporativo_robustez_estructura_financiera = models.CharField(max_length=255)
    corporativo_robustez_ffo = models.CharField(max_length=255)

    def __str__(self):
        return f"Corporativo para Operación {self.operation.id}"


class FinanciamientoEstructurado(models.Model):
    operation = models.OneToOneField(Operation, on_delete=models.CASCADE, primary_key=True)
    estructurado_contratacion_ingresos = models.CharField(max_length=255)
    estructurado_capex_garantizado = models.CharField(max_length=255)
    estructurado_financiamiento_identificado = models.CharField(max_length=255)
    estructurado_permisos = models.CharField(max_length=255)
    estructurado_estructura_ingresos = models.CharField(max_length=255)
    estructurado_ingresos_publicos = models.CharField(max_length=255)
    estructurado_experiencia_epecista = models.CharField(max_length=255)
    estructurado_experiencia_operador = models.CharField(max_length=255)

    def __str__(self):
        return f"Financiamiento Estructurado para Operación {self.operation.id}"


class InstitucionesFinancieras(models.Model):
    operation = models.OneToOneField(Operation, on_delete=models.CASCADE, primary_key=True)
    financieras_robustez_razon_liquidez = models.CharField(max_length=255)
    financieras_morosidad = models.CharField(max_length=255)
    financieras_solvencia = models.CharField(max_length=255)

    def __str__(self):
        return f"Instituciones Financieras para Operación {self.operation.id}"


class InversionesPatrimoniales(models.Model):
    operation = models.OneToOneField(Operation, on_delete=models.CASCADE, primary_key=True)
    patrimoniales_rentabilidad_esperada = models.FloatField()
    patrimoniales_tipo_fondo = models.CharField(max_length=255)
    patrimoniales_antecedentes_gestor = models.CharField(max_length=255)
    patrimoniales_experiencia_sector = models.CharField(max_length=255)
    patrimoniales_experiencia_region = models.CharField(max_length=255)
    patrimoniales_experiencia_equipo = models.CharField(max_length=255)

    def __str__(self):
        return f"Inversiones Patrimoniales para Operación {self.operation.id}"


class CorporativoEstructuradoFinancieras(models.Model):
    operation = models.OneToOneField(Operation, on_delete=models.CASCADE, primary_key=True)
    corpestfin_riesgo = models.CharField(max_length=255)
    corpestfin_spread_pb = models.FloatField()
    corpestfin_meses_gracia = models.FloatField()
    corpestfin_comision_estructuracion = models.FloatField()
    corpestfin_comision_anual = models.FloatField()
    corpestfin_robustez_cliente = models.CharField(max_length=255)

    def __str__(self):
        return f"Corporativo, Estaructurado ó Financieras para Operación {self.operation.id}"


class CorporativoFinancieras(models.Model):
    operation = models.OneToOneField(Operation, on_delete=models.CASCADE, primary_key=True)
    corpfin_robustez_gerencia = models.CharField(max_length=255)
    corpfin_robustez_posicion_mercado = models.CharField(max_length=255)


    def __str__(self):
        return f"Corporativo ó Financieras {self.operation.id}"


class OperationScore(models.Model):
    operation = models.OneToOneField(Operation, on_delete=models.CASCADE, related_name='score')
    adicionalidad_e_impacto = models.FloatField()
    robustez_cliente = models.FloatField()
    raroc = models.FloatField()
    madurez_proyecto = models.FloatField()
    vsp_score = models.FloatField()

    def __str__(self):
        return f"Score for Operation {self.operation.id}"
