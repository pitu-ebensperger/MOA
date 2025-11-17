#!/usr/bin/env node
/**
 * Script de migración de base de datos
 * Ejecuta todas las migraciones en orden
 */

import { execSync } from 'child_process';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_DIR = join(__dirname, '../database/migrations');
const DB_NAME = 'moa';

async function runMigrations() {
  try {
    console.log('🚀 Iniciando migraciones de base de datos...\n');

    // Leer todos los archivos de migración
    const files = await readdir(MIGRATIONS_DIR);
    const migrationFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ordenar por nombre (001_, 002_, etc.)

    if (migrationFiles.length === 0) {
      console.log('❌ No se encontraron archivos de migración');
      return;
    }

    console.log(`📁 Archivos de migración encontrados:`);
    migrationFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
    console.log('');

    // Ejecutar cada migración
    for (const file of migrationFiles) {
      const filePath = join(MIGRATIONS_DIR, file);
      console.log(`⚡ Ejecutando: ${file}`);
      
      try {
        const command = `psql -d ${DB_NAME} -f "${filePath}"`;
        const output = execSync(command, { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        console.log(`   ✅ ${file} ejecutado correctamente`);
        if (output.trim()) {
          console.log(`   📄 Output:`);
          console.log(`   ${output.replace(/\n/g, '\n   ')}`);
        }
      } catch (error) {
        console.error(`   ❌ Error ejecutando ${file}:`);
        console.error(`   ${error.message}`);
        if (error.stdout) {
          console.log(`   📄 Output:`);
          console.log(`   ${error.stdout.replace(/\n/g, '\n   ')}`);
        }
        if (error.stderr) {
          console.log(`   ⚠️  Errores:`);
          console.log(`   ${error.stderr.replace(/\n/g, '\n   ')}`);
        }
        
        // Continuar con el siguiente archivo (no fallar todo)
        console.log(`   ⏭️  Continuando con la siguiente migración...\n`);
      }
    }

    console.log('\n🎉 Migraciones completadas!');
    
    // Mostrar estado de las tablas
    console.log('\n📊 Estado de las tablas:');
    try {
      const tablesOutput = execSync(`psql -d ${DB_NAME} -c "\\dt"`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log(tablesOutput);
    } catch (error) {
      console.log('No se pudo obtener la lista de tablas');
    }

  } catch (error) {
    console.error('❌ Error general en migraciones:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (process.argv[1] === __filename || process.argv[1].endsWith('migrate.js')) {
  runMigrations();
}

export { runMigrations };