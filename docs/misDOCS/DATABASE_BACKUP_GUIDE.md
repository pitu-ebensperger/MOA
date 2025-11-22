# Guía de Backup de Base de Datos - MOA

## 🎯 Propósito

Script automatizado para crear backups completos de la base de datos PostgreSQL con:
- Timestamp automático
- Compresión gzip
- Limpieza de backups antiguos (>7 días)
- Validación de variables de entorno

---

## 📋 Requisitos Previos

### Herramientas Necesarias

```bash
# Verificar que pg_dump esté instalado
pg_dump --version
# Debe mostrar: pg_dump (PostgreSQL) 17.x o superior

# Si no está instalado:
# macOS: brew install postgresql@17
# Ubuntu/Debian: sudo apt-get install postgresql-client-17
# CentOS/RHEL: sudo yum install postgresql17
```

### Variables de Entorno

El script lee estas variables desde `backend/.env`:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_DATABASE=moa_db
```

---

## 🚀 Uso Básico

### Backup Manual

```bash
# Desde directorio raíz del proyecto
cd backend
./scripts/backup-db.sh

# O especificar directorio de salida
./scripts/backup-db.sh /ruta/custom/backups
```

**Salida esperada:**
```
=== MOA Database Backup ===
Base de datos: moa_db
Usuario: postgres
Host: localhost:5432
Directorio: ./backups

Iniciando backup...
Comprimiendo backup...
✓ Backup completado exitosamente
Archivo: moa_backup_20251121_235900.sql.gz
Tamaño: 456K
Ruta completa: ./backups/moa_backup_20251121_235900.sql.gz

Limpiando backups antiguos (> 7 días)...
Backups actuales: 3

=== Backup finalizado ===
```

---

## 🔄 Backup Automático con Cron

### Setup Cron (Linux/macOS)

```bash
# Editar crontab
crontab -e

# Agregar línea para backup diario a las 2:00 AM
0 2 * * * cd /ruta/completa/a/MOA/backend && ./scripts/backup-db.sh >> /var/log/moa-backup.log 2>&1

# Ejemplo: backup cada 6 horas
0 */6 * * * cd /home/user/MOA/backend && ./scripts/backup-db.sh

# Ejemplo: backup semanal (domingos 3:00 AM)
0 3 * * 0 cd /home/user/MOA/backend && ./scripts/backup-db.sh
```

**Verificar cron activo:**
```bash
crontab -l
```

### Setup PM2 (Node.js Process Manager)

```bash
# Crear script wrapper
cat > backend/scripts/backup-cron.js << 'EOF'
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.join(__dirname, 'backup-db.sh');

try {
  console.log(`[${new Date().toISOString()}] Ejecutando backup...`);
  const output = execSync(scriptPath, { encoding: 'utf-8', cwd: path.join(__dirname, '..') });
  console.log(output);
} catch (error) {
  console.error('Error en backup:', error.message);
  process.exit(1);
}
EOF

# Configurar PM2 cron
pm2 start backend/scripts/backup-cron.js --cron "0 2 * * *" --name moa-backup --no-autorestart
pm2 save
```

---

## 📦 Restaurar Backup

### Restauración Completa

```bash
# 1. Descomprimir backup
gunzip -c backups/moa_backup_20251121_235900.sql.gz > restore.sql

# 2. Restaurar (CUIDADO: esto elimina la BD actual)
psql -h localhost -U postgres -d postgres < restore.sql

# O en un solo comando:
gunzip -c backups/moa_backup_20251121_235900.sql.gz | psql -h localhost -U postgres -d postgres
```

### Restauración a Nueva BD (para testing)

```bash
# Crear nueva BD
createdb -h localhost -U postgres moa_test

# Restaurar en nueva BD
gunzip -c backups/moa_backup_20251121_235900.sql.gz | psql -h localhost -U postgres -d moa_test
```

### Restaurar Tablas Específicas

```bash
# Extraer SQL de tabla específica
gunzip -c backups/moa_backup_20251121_235900.sql.gz | grep -A 1000 "CREATE TABLE productos" > productos.sql

# Restaurar solo esa tabla (en BD existente)
psql -h localhost -U postgres -d moa_db < productos.sql
```

---

## 🔧 Configuración Avanzada

### Cambiar Retención de Backups

Editar `backend/scripts/backup-db.sh`, línea 24:

```bash
DAYS_TO_KEEP=30  # Mantener backups por 30 días
```

### Backup a S3/Cloud Storage

```bash
# Agregar al final del script backup-db.sh (antes de unset PGPASSWORD):

# Upload a AWS S3
if command -v aws &> /dev/null; then
    echo "Subiendo a S3..."
    aws s3 cp "$COMPRESSED_FILE" s3://tu-bucket/backups/moa/
fi

# O Google Cloud Storage
if command -v gsutil &> /dev/null; then
    echo "Subiendo a GCS..."
    gsutil cp "$COMPRESSED_FILE" gs://tu-bucket/backups/moa/
fi
```

### Notificación por Email

```bash
# Agregar al final del script (requiere mailx o sendmail):

echo "Backup completado: ${BACKUP_FILE}.gz (${SIZE})" | \
    mail -s "MOA Backup $(date +%Y-%m-%d)" admin@tu-dominio.com
```

---

## 🛡️ Mejores Prácticas

### Seguridad

- ❌ **NUNCA** commitear backups al repositorio Git
- ✅ Almacenar backups en ubicación diferente al servidor (S3, Google Cloud)
- ✅ Encriptar backups si contienen datos sensibles:
  ```bash
  gpg -c backups/moa_backup_20251121_235900.sql.gz
  # Genera: moa_backup_20251121_235900.sql.gz.gpg
  ```

### Monitoreo

- ✅ Verificar logs de cron regularmente: `tail -f /var/log/moa-backup.log`
- ✅ Alertar si backup falla (integrar con Sentry, PagerDuty)
- ✅ Probar restauración mensualmente (backup sin restore = no backup)

### Almacenamiento

- ✅ Calcular espacio: DB 500MB → backup comprimido ~100MB
- ✅ Mantener al menos 3 backups (regla 3-2-1: 3 copias, 2 medios, 1 off-site)
- ✅ Rotar backups: diario (7 días), semanal (4 semanas), mensual (12 meses)

---

## 🚨 Troubleshooting

### Error: `pg_dump: command not found`

**Solución:**
```bash
# macOS
brew install postgresql@17
echo 'export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"' >> ~/.zshrc

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql-client-17
```

### Error: `psql: FATAL: password authentication failed`

**Solución:**
```bash
# Verificar password en .env
cat backend/.env | grep DB_PASSWORD

# Test manual
psql -h $DB_HOST -U $DB_USER -d $DB_DATABASE -c "SELECT version();"
```

### Error: `Permission denied: ./backup-db.sh`

**Solución:**
```bash
chmod +x backend/scripts/backup-db.sh
```

### Backup Muy Grande (>1GB)

**Solución:**
```bash
# Usar formato custom (mejor compresión)
pg_dump -h $DB_HOST -U $DB_USER -d $DB_DATABASE -Fc -f backup.dump

# Restaurar custom format
pg_restore -h $DB_HOST -U $DB_USER -d $DB_DATABASE backup.dump
```

---

## 📊 Ejemplo de Rotación Completa (Producción)

```bash
#!/bin/bash
# backup-rotation.sh - Estrategia 3-2-1

BACKUP_DIR="/var/backups/moa"
DAILY_DIR="$BACKUP_DIR/daily"
WEEKLY_DIR="$BACKUP_DIR/weekly"
MONTHLY_DIR="$BACKUP_DIR/monthly"

# Crear directorios
mkdir -p $DAILY_DIR $WEEKLY_DIR $MONTHLY_DIR

# Backup diario
./scripts/backup-db.sh $DAILY_DIR
LATEST=$(ls -t $DAILY_DIR/moa_backup_*.sql.gz | head -1)

# Si es domingo, copiar a weekly
if [ $(date +%u) -eq 7 ]; then
    cp $LATEST $WEEKLY_DIR/
    find $WEEKLY_DIR -name "*.sql.gz" -mtime +28 -delete  # 4 semanas
fi

# Si es día 1 del mes, copiar a monthly
if [ $(date +%d) -eq 01 ]; then
    cp $LATEST $MONTHLY_DIR/
    find $MONTHLY_DIR -name "*.sql.gz" -mtime +365 -delete  # 1 año
fi

# Limpiar daily (7 días)
find $DAILY_DIR -name "*.sql.gz" -mtime +7 -delete

# Upload a S3 (opcional)
aws s3 sync $BACKUP_DIR s3://moa-backups/ --exclude "*" --include "*.sql.gz"
```

---

## 📚 Referencias

- **PostgreSQL Backup Docs:** https://www.postgresql.org/docs/current/backup-dump.html
- **Cron Syntax:** https://crontab.guru/
- **AWS S3 CLI:** https://aws.amazon.com/cli/

---

**Última actualización:** 21 noviembre 2025  
**Script ubicación:** `backend/scripts/backup-db.sh`
