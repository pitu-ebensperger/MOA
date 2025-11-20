/* eslint-env node */
import { mockAuthApi } from '../src/mocks/api/auth.js';
import { env } from '../src/config/env.js';

console.log('🔍 VERIFICACIÓN DE MOCKS DE AUTENTICACIÓN');
console.log('==========================================');

console.log(`📊 Configuración actual:`);
console.log(`   USE_MOCKS: ${env.USE_MOCKS}`);
console.log(`   API_BASE_URL: ${env.API_BASE_URL}`);
console.log(`   NODE_ENV: ${env.NODE_ENV}`);
console.log('');

const testUsers = [
  { email: 'admin@moa.cl', password: 'admin', expectedRole: 'ADMIN' },
  { email: 'demo@moa.cl', password: 'demo', expectedRole: 'CLIENTE' },
  { email: 'cliente@mail.cl', password: 'demo', expectedRole: 'CLIENTE' }
];

async function testLogin(credentials) {
  try {
    console.log(`🔐 Probando: ${credentials.email} con contraseña "${credentials.password}"`);
    const result = await mockAuthApi.login(credentials);
    
    const success = result.user.role === credentials.expectedRole;
    const icon = success ? '✅' : '⚠️';
    
    console.log(`${icon} Resultado:`);
    console.log(`   Token: ${result.token.substring(0, 20)}...`);
    console.log(`   Usuario: ${result.user.firstName} ${result.user.lastName}`);
    console.log(`   Rol: ${result.user.role}`);
    console.log(`   Email: ${result.user.email}`);
    console.log('');
    
    return success;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    console.log('');
    return false;
  }
}

async function runTests() {
  let successCount = 0;
  
  for (const testUser of testUsers) {
    const success = await testLogin(testUser);
    if (success) successCount++;
  }
  
  console.log('==========================================');
  console.log(`📈 Resultados: ${successCount}/${testUsers.length} tests pasaron`);
  
  if (successCount === testUsers.length) {
    console.log('🎉 ¡Todos los mocks funcionan correctamente!');
    console.log('');
    console.log('🚀 Para probar en la aplicación:');
    console.log('   1. Ejecuta: npm run dev');
    console.log('   2. Ve a http://localhost:5173');
    console.log('   3. Usa cualquiera de los usuarios de arriba');
  } else {
    console.log('⚠️  Algunos tests fallaron. Revisa la configuración.');
  }
}

// Error handling
const nodeProcess = globalThis.process;

nodeProcess?.on('unhandledRejection', (error) => {
  console.error('❌ Error no manejado:', error.message);
  nodeProcess?.exit(1);
});

runTests().catch(console.error);
