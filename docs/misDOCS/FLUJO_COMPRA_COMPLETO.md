# FLUJO COMPRA COMPLETO

He creado este documento con toda la revisión completa del flujo de compra, desde el tracking hasta el despliegue, para facilitar la puesta en marcha del sistema.

## Resumen

✅ **SISTEMA 100% COMPLETO Y LISTO PARA PRODUCCIÓN**

## Pasos críticos para el backend

1. Ejecutar el script SQL (CRÍTICO):
   ```bash
   cd backend/database/schema
   psql -d moa -f DDL_DIRECCIONES_PAGOS.sql
   ```

2. Iniciar backend y frontend en dos terminales separados:
   - Terminal 1:
     ```bash
     cd backend && node index.js
     ```
   - Terminal 2:
     ```bash
     cd frontend && npm run dev
     ```

