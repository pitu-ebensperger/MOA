# GitHub Copilot: Cloud Agent vs Local Agent

**Fecha de creación:** 21 de noviembre, 2025  
**Última actualización:** 21 de noviembre, 2025

---

## 📋 Resumen Ejecutivo

Este documento explica las diferencias entre **Cloud Agent** y **Local Agent** de GitHub Copilot, y establece las reglas de configuración para mantener el control del usuario sobre commits, PRs y cambios en el código.

---

## 🔍 Diferencias Principales

### Cloud Agent (Agente en la Nube)

**Características:**
- Se ejecuta en servidores de GitHub en la nube
- Tiene acceso directo a la API de GitHub
- Puede crear branches, commits y PRs automáticamente
- Tiene contexto completo del repositorio remoto
- Mayor poder de cómputo y recursos
- Puede ejecutar tareas en segundo plano

**Ventajas:**
- Procesa repositorios grandes más rápido
- No consume recursos locales
- Puede trabajar en múltiples archivos simultáneamente
- Acceso a herramientas y servicios externos

**Desventajas:**
- Requiere configuración explícita para evitar cambios automáticos
- Puede crear PRs/commits sin intervención si no está configurado correctamente
- Menor control inmediato del usuario

---

### Local Agent (Agente Local)

**Características:**
- Se ejecuta en tu entorno de Visual Studio Code
- Trabaja en tu workspace local
- NO puede hacer commits ni crear PRs automáticamente
- Solo sugiere cambios que TÚ aplicas manualmente
- Funciona con tu copia local del repositorio

**Ventajas:**
- **Control total del usuario** sobre todos los cambios
- Sugerencias en tiempo real mientras codificas
- No hace cambios sin tu aprobación explícita
- Trabaja completamente en tu entorno VSC
- Más seguro para código sensible

**Desventajas:**
- Consume recursos locales (CPU, RAM)
- Limitado por la potencia de tu máquina
- Requiere VSC abierto y funcionando

---

## ⚙️ Configuración y Reglas Establecidas

### Normas para Ambos Agentes en el Proyecto MOA

Ambos agentes (Cloud y Local) deben seguir estas reglas configuradas:

#### ❌ Prohibido (Sin Instrucción Explícita):

1. **NO crear Pull Requests automáticamente**
   - Solo crear PRs cuando se le indique explícitamente
   
2. **NO hacer commits automáticos**
   - No hacer `git commit` sin aprobación
   - No hacer `git push` sin autorización
   
3. **NO comentar en PRs existentes**
   - No agregar comentarios a PRs sin solicitud
   
4. **NO modificar configuración del repositorio**
   - No cambiar settings, webhooks, o configuraciones de GitHub

#### ✅ Permitido y Recomendado:

1. **Sugerir cambios en el chat**
   - Proponer soluciones y explicar el código
   - Responder preguntas sobre el código
   
2. **Generar código en VSC**
   - Crear archivos nuevos
   - Modificar archivos existentes
   - Refactorizar código
   
3. **Análisis y revisión**
   - Revisar código y sugerir mejoras
   - Detectar bugs y problemas de seguridad
   - Proponer optimizaciones

---

## 👤 Control del Usuario

### TÚ (el desarrollador) siempre controlas:

- **Cuándo hacer commits**: Tú decides qué cambios commitear y cuándo
- **Cuándo crear PRs**: Tú creas los PRs manualmente cuando estés listo
- **Qué cambios aplicar**: Revisas y decides qué sugerencias aceptar
- **Mensajes de commit**: Escribes tus propios mensajes descriptivos
- **Revisión de código**: Apruebas todos los cambios antes de integrarlos

### Flujo de Trabajo Recomendado:

```bash
# 1. El agent sugiere cambios o los genera en VSC
# 2. TÚ revisas los cambios localmente
# 3. TÚ decides si aceptar, modificar o rechazar
# 4. TÚ haces el staging:
git add .

# 5. TÚ haces el commit con tu mensaje:
git commit -m "feat: descripción de cambios"

# 6. TÚ haces el push:
git push origin nombre-de-tu-branch

# 7. TÚ creas el PR en GitHub:
gh pr create --title "Título" --body "Descripción"
```

---

## 🎯 ¿Cuándo Usar Cada Uno?

### Usa Cloud Agent cuando:

- Necesitas procesar repositorios grandes
- Quieres análisis profundo del código
- Necesitas acceso a APIs externas
- Trabajas con múltiples archivos/módulos
- Requieres tareas automatizadas complejas

**Configuración recomendada:**
```json
{
  "github.copilot.agent.autoCommit": false,
  "github.copilot.agent.autoPR": false,
  "github.copilot.agent.requireApproval": true
}
```

---

### Usa Local Agent cuando:

- Estás escribiendo código en tiempo real
- Necesitas sugerencias rápidas de autocompletado
- Trabajas en funciones/archivos individuales
- Prefieres máximo control local
- Trabajas con código sensible o privado

**Configuración en VSC:**
- Activa Copilot en la extensión
- Configura sugerencias inline
- Habilita chat local
- Mantén workspace abierto

---

## 🔒 Seguridad y Privacidad

### Ambos Agentes:

- No exponen credenciales ni secrets
- Respetan `.gitignore`
- No comparten código sin permiso
- Siguen políticas de seguridad del proyecto

### Mejores Prácticas:

1. **Revisa siempre** las sugerencias antes de aplicarlas
2. **No aceptes** cambios que no entiendes
3. **Verifica** que no se incluyan secrets en commits
4. **Usa** `.env` para variables sensibles
5. **Configura** `.gitignore` apropiadamente

---

## 📚 Comandos Útiles

### Para Local Agent (VSC):

```
# Activar/desactivar Copilot
Ctrl/Cmd + Shift + P → "Copilot: Toggle"

# Abrir chat
Ctrl/Cmd + Shift + I

# Aceptar sugerencia
Tab

# Rechazar sugerencia
Esc
```

### Para Cloud Agent:

```bash
# Verificar configuración
gh copilot config list

# Desactivar auto-commit
gh copilot config set autoCommit false

# Desactivar auto-PR
gh copilot config set autoPR false
```

---

## 🎓 Resumen para el Proyecto MOA

### Configuración Actual:

En el proyecto **MOA**, ambos agentes están configurados con las siguientes reglas:

1. ✅ **Solo sugerencias y chat** - Los agentes ayudan, pero no actúan solos
2. ✅ **Usuario hace commits** - TÚ tienes control total del historial de git
3. ✅ **Usuario crea PRs** - TÚ decides cuándo y cómo crear pull requests
4. ✅ **Revisión obligatoria** - Todos los cambios pasan por tu revisión

### Workflow Establecido:

```
Agent sugiere → TÚ revisas → TÚ aplicas → TÚ commites → TÚ creas PR
```

**No hay automatización** de git operations sin tu aprobación explícita.

---

## 🤝 Colaboración con los Agentes

### Lo que los Agentes PUEDEN hacer:

- ✅ Generar código en archivos locales
- ✅ Sugerir refactorizaciones
- ✅ Explicar código existente
- ✅ Detectar bugs y errores
- ✅ Proponer mejoras de performance
- ✅ Ayudar con documentación
- ✅ Resolver dudas técnicas

### Lo que los Agentes NO PUEDEN hacer (sin tu orden):

- ❌ Git commit
- ❌ Git push
- ❌ Crear branches
- ❌ Crear/modificar PRs
- ❌ Comentar en GitHub
- ❌ Modificar issues
- ❌ Cambiar configuraciones del repo

---

## 📞 Soporte y Referencias

### Documentación Oficial:

- [GitHub Copilot Docs](https://docs.github.com/en/copilot)
- [VSC Copilot Extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
- [GitHub CLI + Copilot](https://cli.github.com/manual/gh_copilot)

### Documentos Relacionados del Proyecto:

- [README.md](../../README.md) - Información general del proyecto
- [TODO.md](../../TODO.md) - Lista de tareas pendientes
- [docs/STATUS.md](../STATUS.md) - Estado actual del proyecto

---

## ✍️ Conclusión

**Para el proyecto MOA:**

- Ambos agentes (Cloud y Local) siguen las mismas reglas
- **TÚ mantienes control total** sobre commits y PRs
- Los agentes son **asistentes**, no ejecutores autónomos
- Todos los cambios requieren tu **revisión y aprobación**
- El flujo de trabajo es **colaborativo pero controlado**

**Recuerda:** Los agentes están aquí para ayudarte a ser más productivo, pero **TÚ eres el dueño del código** y tomas todas las decisiones finales sobre qué se integra al repositorio.

---

**Mantenedor:** @pitu-ebensperger  
**Proyecto:** MOA Marketplace  
**Repositorio:** [github.com/pitu-ebensperger/MOA](https://github.com/pitu-ebensperger/MOA)
