---
name: coolify-operator
description: Habilidad para monitorear, diagnosticar, leer logs y solucionar fallas de despliegue en Coolify de forma autónoma.
---

# Skill: Coolify Operator

Esta habilidad permite al asistente operar tu infraestructura en Coolify de forma autónoma para mantener tus servicios levantados y resolver errores de compilación y ejecución.

## 🛠️ Herramientas Disponibles
La habilidad utiliza scripts nativos en Node.js ubicados en `scripts/` que consumen la API de Coolify:
- `coolify-cli.js`: Cliente de bajo nivel para consultar recursos y despliegues.
- `diagnose.js`: Analizador de salud y extractor de logs de fallas.
- `deploy-fix.js`: Evaluador de errores de compilación y ciclo de reparación de código.

---

## 🔍 Guías de Acción y Flujos de Trabajo

### 1. Diagnóstico de Salud de la Infraestructura
Cuando se solicite evaluar el estado general o ante una sospecha de caída de un servicio:
1. Ejecuta el script `diagnose.js` mediante Node.js:
   ```bash
   node .agents/skills/coolify-operator/scripts/diagnose.js
   ```
2. Analiza la salida. Si reporta recursos `unhealthy` o `exited`:
   * Lee la causa probable identificada.
   * Extrae los logs de ejecución del contenedor usando `coolify-cli.js` o el propio script de diagnóstico para comprender por qué se cayó el servicio.
3. Informa al usuario sugiriendo una acción correctiva o procediendo a solucionarlo de forma autónoma si es un error de configuración.

### 2. Auto-Resolución de Despliegues Fallidos
Cuando un despliegue falle en Coolify:
1. Extrae los logs de compilación (build logs) usando `coolify-cli.js`.
2. Lee y comprende la traza del error de build:
   * **Error de Sintaxis o compilación TypeScript:** Identifica qué archivo causó el fallo.
   * **Error de dependencias:** Revisa si falta declarar un paquete en `package.json` o si hay un conflicto de versiones de Node.
   * **Error en Dockerfile:** Revisa si la imagen base, la ruta de copia o el comando `CMD` final son incorrectos.
3. Busca el repositorio local correspondiente en la raíz de `repositories/` (ej: `repositories/chatbot-template`).
4. **Repara el problema:**
   * Abre el archivo correspondiente en el repositorio local.
   * Corrige el error en el Dockerfile o la dependencia faltante.
   * Prueba localmente si es posible o realiza un commit descriptivo del fix (ej. `fix: Dockerfile entrypoint`).
   * Empuja los cambios (`git push`) a la rama correspondiente.
5. Monitorea el nuevo despliegue vía API hasta verificar que cambie a `running:healthy`.

### 🎭 3. Simulación de Navegación de Usuario (E2E)
Si el contenedor está saludable pero quieres verificar que la aplicación web funcione para el usuario final:
1. Identifica el dominio o FQDN público en el reporte.
2. Lanza el subagente de navegación web (`browser_subagent`) indicándole:
   * Navegar a la URL de la aplicación.
   * Realizar una acción de prueba (ej. ingresar datos de prueba, hacer clic en el inicio).
   * Confirmar si el servidor responde correctamente (HTTP 200) o si se producen errores en la consola.
