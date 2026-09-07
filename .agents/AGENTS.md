# Reglas locales del Proyecto: iAtomica DevOps

Este archivo contiene pautas de comportamiento locales para los asistentes de IA que trabajen en este repositorio.

## 1. Operación de Coolify
- Todas las operaciones hacia la API de Coolify se deben realizar utilizando el archivo de configuración [coolify_config.json](file:///c:/Users/Luiti/Desktop/IAtomica/repositories/coolify_config.json).
- El agente cuenta con la habilidad `coolify-operator` para diagnosticar la salud de la infraestructura y automatizar la reparación de despliegues.
- Prioriza el uso de los scripts nativos en `.agents/skills/coolify-operator/scripts/` para consultas e interacciones de API en lugar de escribir scripts ad-hoc.

## 2. Autonomía de Autocorrección (Self-Healing)
- Si un build de Coolify falla, el asistente tiene la autonomía de analizar el log del build, rastrear el error en el repositorio local correspondiente en la raíz de `repositories/`, corregir los problemas de configuración (como Dockerfiles, paquetes dependientes, puertos incorrectos) y hacer `git push` a la rama correspondiente para automatizar el re-intento.
- Para cambios complejos de lógica de negocio o arquitectura, siempre solicita confirmación al usuario.

## 3. Replicación de la Habilidad
- Ante la creación de un nuevo repositorio o proyecto en el entorno de IAtomica, el agente puede copiar la estructura de la carpeta `.agents/` a la raíz del nuevo repositorio para habilitar de inmediato las herramientas del operador y sincronizar los behaviors.

## 4. Operaciones de Navegador (Browser)
- Cada vez que se requiera interactuar con el navegador para realizar chequeos, navegación o simulaciones, el asistente debe utilizar específicamente las herramientas del servidor **Chrome MCP (`chrome-devtools-mcp`) de forma directa**, evitando delegar tareas a subagentes externos de navegador (`browser_subagent`).

