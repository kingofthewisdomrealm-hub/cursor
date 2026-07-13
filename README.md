# Tax Power Mapper — Mapa de Poder Fiscal (México)

Aplicación web responsive para trabajadores independientes, emprendedores y pequeños negocios en México. Organiza ingresos cobrados, gastos, CFDI y reservas de ISR e IVA conforme a la normativa fiscal mexicana.

> **Aviso:** Herramienta orientativa basada en LISR y LIVA. No constituye asesoría del SAT. Consulte con un contador público certificado.

## Regímenes por tipo de contribuyente

### Persona Física (PF)
- **RESICO (PF)** — ISR 1.0% a 2.5% sobre ingresos cobrados
- **Actividad Empresarial y Profesional** — deducciones con CFDI
- **Arrendamiento** — ingresos por renta de inmuebles
- **Tasa manual**

### Persona Moral (PM)
- **RESICO (PM)** — ISR 2.0% a 3.5% sobre ingresos cobrados
- **General de Ley** — ISR 30% sobre utilidad fiscal
- **Coordinados** — actividades específicas
- **Tasa manual**

## Marco fiscal mexicano

- **ISR** — Impuesto Sobre la Renta (pagos provisionales mensuales)
- **IVA** — Impuesto al Valor Agregado (16% tasa general, 8% frontera)
- **CFDI** — Comprobante Fiscal Digital por Internet (UUID / folio fiscal)

## Características

- **Selector de Régimen Fiscal** — PF/PM, 22 regímenes, cuestionario, recomendaciones y panel admin
- Selector **Persona Física / Persona Moral** con regímenes específicos para cálculos
- Panel con ingresos cobrados, deducciones autorizadas, base ISR, reserva ISR e IVA
- Registro de ingresos y gastos con UUID de CFDI, IVA y retenciones
- Categorías alineadas con deducciones del Art. 27 LISR
- Motor SIFTING para clasificar gastos deducibles
- Estado de documentación SAT (CFDI, comprobante, relación con actividad)
- Calculadora de reserva ISR + IVA con fórmulas LISR/LIVA
- Reportes filtrables y **exportación/importación XML**
- **Importación CFDI XML** del SAT (auto-llena monto, UUID, IVA, emisor)

## Ejecutar localmente

```bash
python3 -m http.server 8080
```

Abra [http://localhost:8080](http://localhost:8080). Los datos se guardan en `localStorage`.
