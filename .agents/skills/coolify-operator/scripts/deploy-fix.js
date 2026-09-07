const path = require('path');
const fs = require('fs');
const CoolifyClient = require('./coolify-cli');

// Map applications to local workspace folder names
function getLocalRepoPath(gitRepoUrl) {
    if (!gitRepoUrl) return null;
    
    // Extract repo name, e.g. "iatomica/chatbot-template" -> "chatbot-template"
    const repoName = gitRepoUrl.split('/').pop().replace(/\.git$/, '');
    
    // Check if a directory with this name exists in our repositories root
    const repositoriesRoot = path.resolve(__dirname, '../../../../');
    const localPath = path.join(repositoriesRoot, repoName);
    
    if (fs.existsSync(localPath) && fs.statSync(localPath).isDirectory()) {
        return localPath;
    }
    return null;
}

async function analyzeDeployment(appUuid) {
    if (!appUuid) {
        console.error('Error: Debes proporcionar el UUID de la aplicación.');
        console.log('Uso: node deploy-fix.js <app-uuid>');
        process.exit(1);
    }

    console.log(`=== Iniciando Análisis de Despliegue para UUID: ${appUuid} ===`);
    const client = new CoolifyClient();

    try {
        let app = null;
        let deployments = [];

        // Try to fetch specific application details first (highly reliable)
        try {
            const apps = await client.getApplications();
            app = apps.find(a => a.uuid === appUuid);
        } catch (e) {
            console.warn(`Warning: No se pudo listar aplicaciones: ${e.message}`);
        }

        // Try to fetch deployment history (fallback gracefully if 404 or unsupported)
        try {
            deployments = await client.getAppDeployments(appUuid);
        } catch (e) {
            // Silence 404 or other deployments endpoint errors
        }

        if (app) {
            console.log(`\nInformación de la Aplicación:`);
            console.log(` - Nombre: ${app.name}`);
            console.log(` - Estado Actual: ${app.status}`);
            console.log(` - FQDN/Dominio: ${app.fqdn || 'None'}`);
            console.log(` - Repositorio: ${app.git_repository}`);
            console.log(` - Rama: ${app.git_branch}`);
            
            const localPath = getLocalRepoPath(app.git_repository);
            if (localPath) {
                console.log(` - Carpeta Local Encontrada: ${localPath}`);
                console.log(`\n💡 Sugerencia para el Agente:`);
                console.log(`   El repositorio local está disponible en: [${path.basename(localPath)}](file:///${localPath.replace(/\\/g, '/')})`);
                console.log(`   Puedes ingresar a esta carpeta para realizar modificaciones y hacer un push para corregir el despliegue.`);
            } else {
                console.log(` - Carpeta Local: No encontrada en el directorio repositories/`);
            }
        } else {
            console.error('Error: No se encontró la aplicación en Coolify con el UUID proporcionado.');
        }

        if (deployments && deployments.length > 0) {
            const latest = deployments[0];
            console.log(`\nÚltimo Despliegue registrado:`);
            console.log(` - ID: ${latest.id}`);
            console.log(` - Estado: ${latest.status}`);
            console.log(` - Commit: ${latest.commit_message || 'N/A'}`);
        } else {
            console.log('\nNota: No se pudo obtener el historial de builds detallados desde la API (puede que no haya builds registrados o la versión de la API de tu Coolify difiera).');
        }

    } catch (e) {
        console.error('Error durante el análisis:', e.message);
        process.exit(1);
    }
}

const uuidArg = process.argv[2];
analyzeDeployment(uuidArg);
