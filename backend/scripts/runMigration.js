#!/usr/bin/env node

import pool from "../database/config.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🔧 Ejecutando migración para agregar columnas faltantes...');
    
    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, '../database/migrations/add_missing_columns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Ejecutar la migración
    await pool.query(migrationSQL);
    
    console.log('✅ Migración ejecutada exitosamente');
    
    // Verificar las columnas
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'productos' 
      ORDER BY column_name
    `);
    
    console.log('\n📋 Columnas de la tabla productos:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runMigration();