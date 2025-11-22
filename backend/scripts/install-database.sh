#!/bin/bash

# ===============================================
# MOA E-commerce - Database Installation Script
# ===============================================
# Version: 1.0.0
# Date: November 22, 2025
# Description: Script de instalación LIMPIA de base de datos para producción
# ===============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ASCII Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║        MOA E-COMMERCE DATABASE INSTALLER              ║"
echo "║              Production Ready v1.0.0                   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ===============================================
# CONFIGURATION
# ===============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SCHEMA_FILE="$PROJECT_ROOT/database/schema/DDL.sql"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-moa}"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Database User: $DB_USER"
echo "  Database Name: $DB_NAME"
echo "  Schema File: $SCHEMA_FILE"
echo ""

# ===============================================
# PRE-FLIGHT CHECKS
# ===============================================

echo -e "${YELLOW}🔍 Pre-flight checks...${NC}"

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ ERROR: PostgreSQL client (psql) not found${NC}"
    echo "Install with: brew install postgresql@17 (macOS) or sudo apt-get install postgresql-client (Ubuntu)"
    exit 1
fi

# Check if schema file exists
if [ ! -f "$SCHEMA_FILE" ]; then
    echo -e "${RED}❌ ERROR: Schema file not found at $SCHEMA_FILE${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${YELLOW}⚠️  WARNING: .env file not found${NC}"
    echo "Please ensure environment variables are set (DB_USER, DB_PASSWORD, etc.)"
fi

# Test database connection
if ! psql -U "$DB_USER" -d postgres -c "SELECT 1" &> /dev/null; then
    echo -e "${RED}❌ ERROR: Cannot connect to PostgreSQL${NC}"
    echo "Verify that:"
    echo "  1. PostgreSQL is running: brew services list (macOS)"
    echo "  2. User '$DB_USER' has proper permissions"
    echo "  3. Password is correct (if required)"
    exit 1
fi

echo -e "${GREEN}✅ All pre-flight checks passed${NC}"
echo ""

# ===============================================
# CONFIRMATION
# ===============================================

echo -e "${YELLOW}⚠️  WARNING: This will DELETE the existing '$DB_NAME' database and create a new one${NC}"
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${BLUE}Installation cancelled${NC}"
    exit 0
fi

# ===============================================
# INSTALLATION
# ===============================================

echo -e "${BLUE}🚀 Starting database installation...${NC}"
echo ""

# Step 1: Execute DDL schema
echo -e "${BLUE}[1/3] Creating database schema...${NC}"
if psql -U "$DB_USER" -f "$SCHEMA_FILE" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Schema created successfully${NC}"
else
    echo -e "${RED}❌ ERROR: Failed to create schema${NC}"
    echo "Check the error above for details"
    exit 1
fi

# Step 2: Verify tables were created
echo -e "${BLUE}[2/3] Verifying tables...${NC}"
TABLES=$(psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'" | tr -d ' ')
if [ "$TABLES" -gt 0 ]; then
    echo -e "${GREEN}✅ $TABLES tables created${NC}"
else
    echo -e "${RED}❌ ERROR: No tables found${NC}"
    exit 1
fi

# Step 3: Run seeds
echo -e "${BLUE}[3/3] Seeding initial data...${NC}"
cd "$PROJECT_ROOT" && npm run seed:all > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Initial data seeded successfully${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: Some seeds failed, but database schema is ready${NC}"
fi

# ===============================================
# SUMMARY
# ===============================================

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          ✅ INSTALLATION COMPLETED                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Database Summary:${NC}"

# Get counts
USUARIOS=$(psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM usuarios" | tr -d ' ')
PRODUCTOS=$(psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM productos" | tr -d ' ')
CATEGORIAS=$(psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM categorias" | tr -d ' ')
ORDENES=$(psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM ordenes" | tr -d ' ')

echo "  👥 Users: $USUARIOS"
echo "  📦 Products: $PRODUCTOS"
echo "  🏷️  Categories: $CATEGORIAS"
echo "  🛒 Orders: $ORDENES"
echo ""

# Test credentials
echo -e "${BLUE}🔑 Test Credentials:${NC}"
echo "  Admin: admin@moa.cl / admin"
echo "  Demo: demo@moa.cl / demo"
echo ""

echo -e "${GREEN}Database is ready for production! 🎉${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Start backend: npm run -w backend dev"
echo "  2. Start frontend: npm run -w frontend dev"
echo "  3. Test login at http://localhost:5173"
echo ""
