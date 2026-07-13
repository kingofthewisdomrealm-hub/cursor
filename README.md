# Tax Power Mapper — Mapa de Poder Fiscal (México)

Aplicación web responsive para trabajadores independientes, emprendedores y pequeños negocios en México. Organiza ingresos cobrados, gastos, CFDI y reservas de ISR e IVA conforme a la normativa fiscal mexicana.

> **Aviso:** Herramienta orientativa basada en LISR y LIVA. No constituye asesoría del SAT. Consulte con un contador público certificado.

## Marco fiscal mexicano

- **ISR** — Impuesto Sobre la Renta (pagos provisionales mensuales)
- **IVA** — Impuesto al Valor Agregado (16% tasa general, 8% frontera)
- **RESICO** — Régimen Simplificado de Confianza (tarifas 1.0%–2.5% sobre ingresos cobrados)
- **Actividad Empresarial** — Deducciones autorizadas (Art. 27 LISR) con CFDI
- **CFDI** — Comprobante Fiscal Digital por Internet (UUID / folio fiscal)

## Características

- Panel con ingresos cobrados, deducciones autorizadas, base ISR, reserva ISR e IVA
- Selector de régimen fiscal (RESICO, Actividad Empresarial, tasa manual)
- Registro de ingresos y gastos con UUID de CFDI, IVA y retenciones
- Categorías alineadas con deducciones del Art. 27 LISR
- Motor SIFTING para clasificar gastos deducibles
- Estado de documentación SAT (CFDI, comprobante, relación con actividad)
- Calculadora de reserva ISR + IVA con fórmulas LISR/LIVA
- Reportes filtrables y exportación CSV

## Ejecutar localmente

```bash
python3 -m http.server 8080
```

Abra [http://localhost:8080](http://localhost:8080). Los datos se guardan en `localStorage`.
