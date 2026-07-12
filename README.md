# Tax Power Mapper — Mapa de Poder Fiscal

Aplicación web responsive para que trabajadores independientes, emprendedores y pequeños negocios organicen ingresos, gastos, recibos y reservas fiscales durante todo el año.

> **Aviso:** Esta herramienta no constituye asesoría legal ni fiscal. Utiliza estimaciones orientativas. Consulte con un profesional de impuestos.

## Características

- **Panel Principal** — Ingresos, gastos, posibles deducciones, ganancia imponible estimada, reserva fiscal y recibos faltantes
- **Registrar Ingreso** — Monto, fecha, fuente, cliente/proyecto, método de pago y notas
- **Registrar Gasto** — Monto, comercio, categoría, propósito comercial, recibo, % uso comercial y más
- **Motor SIFTING Fiscal** — Clasifique gastos como Negocio, Personal, Mixto o No estoy seguro
- **Estado de Documentación** — Listo para revisión, falta recibo, falta propósito, necesita aclaración, gasto personal
- **Calculadora de Reserva Fiscal** — Porcentaje de impuestos ajustable con fórmulas en tiempo real
- **Reportes** — Filtros por mes, año, categoría, cliente, proyecto y estado; exportación CSV
- **Puntuación de Preparación Fiscal** — Indicador visual con recomendaciones de mejora

## Ejecutar localmente

```bash
python3 -m http.server 8080
```

Abra [http://localhost:8080](http://localhost:8080) en su navegador.

Los datos se guardan automáticamente en el almacenamiento local del navegador (`localStorage`).

## Tecnologías

- HTML5, CSS3, JavaScript (ES modules)
- Sin dependencias externas ni paso de compilación
- Diseño responsive con barra lateral en escritorio y menú móvil
