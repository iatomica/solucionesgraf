const fs = require('fs');
const path = require('path');
const https = require('https');

// Path to the config file (looks upwards or absolute)
const configPath = path.resolve(__dirname, '../../../../coolify_config.json');

function loadConfig() {
    if (!fs.existsSync(configPath)) {
        throw new Error(`Config file not found at ${configPath}`);
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function getHeaders(token) {
    return {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
}

function apiRequest(baseUrl, endpoint, token, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const uri = `${baseUrl}${endpoint}`;
        const options = {
            method: method,
            headers: getHeaders(token)
        };
        
        const req = https.request(uri, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                } else {
                    reject(new Error(`API request failed with status ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (err) => { reject(err); });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

// Client Class
class CoolifyClient {
    constructor() {
        const config = loadConfig();
        let url = config.coolify_url.replace(/\/$/, '');
        if (!url.endsWith('/api/v1')) {
            url = `${url}/api/v1`;
        }
        this.baseUrl = url;
        this.token = config.coolify_token;
    }

    getServers() { return apiRequest(this.baseUrl, '/servers', this.token); }
    getProjects() { return apiRequest(this.baseUrl, '/projects', this.token); }
    getProjectDetails(uuid) { return apiRequest(this.baseUrl, `/projects/${uuid}`, this.token); }
    getApplications() { return apiRequest(this.baseUrl, '/applications', this.token); }
    getApplication(uuid) { return apiRequest(this.baseUrl, `/applications/${uuid}`, this.token); }
    getDatabases() { return apiRequest(this.baseUrl, '/databases', this.token); }
    getServices() { return apiRequest(this.baseUrl, '/services', this.token); }
    
    createPublicApp(data) { return apiRequest(this.baseUrl, '/applications/public', this.token, 'POST', data); }
    createPrivateGithubApp(data) { return apiRequest(this.baseUrl, '/applications/private-github', this.token, 'POST', data); }
    updateApp(uuid, data) { return apiRequest(this.baseUrl, `/applications/${uuid}`, this.token, 'PATCH', data); }
    createEnvVar(uuid, envData) { return apiRequest(this.baseUrl, `/applications/${uuid}/envs`, this.token, 'POST', envData); }
    
    getAppLogs(uuid) { return apiRequest(this.baseUrl, `/applications/${uuid}/logs`, this.token); }
    getAppDeployments(uuid) { return apiRequest(this.baseUrl, `/applications/${uuid}/deployments`, this.token); }
    redeployApp(uuid) { return apiRequest(this.baseUrl, `/applications/${uuid}/deploy`, this.token, 'POST'); }

    async waitForDeploymentAndHealth(appUuid, maxWaitSeconds = 180) {
        console.log(`[Coolify Operator] Monitoreando despliegue de app ${appUuid}...`);
        const startTime = Date.now();
        const maxWaitMs = maxWaitSeconds * 1000;

        while (Date.now() - startTime < maxWaitMs) {
            try {
                const app = await this.getApplication(appUuid);
                const status = app.status || 'unknown';
                console.log(`[Coolify Operator] Estado actual de ${app.name || appUuid}: ${status}`);

                if (status === 'running:healthy') {
                    console.log(`[Coolify Operator] CONFIRMADO: La aplicación ${app.name} está corriendo y saludable (running:healthy).`);
                    return { success: true, app };
                }

                if (status.includes('exited') || status.includes('unhealthy') || status.includes('error')) {
                    console.warn(`[Coolify Operator] ADVERTENCIA: La aplicación cambió a estado no saludable: ${status}`);
                    try {
                        const logs = await this.getAppLogs(appUuid);
                        console.log(`=== LOGS DE EJECUCIÓN (${appUuid}) ===\n`, logs);
                    } catch (e) {
                        console.warn("No se pudieron extraer logs:", e.message);
                    }
                }
            } catch (err) {
                console.warn(`[Coolify Operator] Error consultando estado: ${err.message}`);
            }

            await new Promise(r => setTimeout(r, 8000));
        }

        throw new Error(`Tiempo de espera agotado (${maxWaitSeconds}s). La aplicación no alcanzó el estado saludable.`);
    }
}

module.exports = CoolifyClient;

// CLI support
if (require.main === module) {
    const client = new CoolifyClient();
    const arg = process.argv[2];

    async function main() {
        try {
            if (arg === '--servers') {
                const res = await client.getServers();
                console.log(JSON.stringify(res, null, 2));
            } else if (arg === '--apps') {
                const res = await client.getApplications();
                console.log(JSON.stringify(res, null, 2));
            } else if (arg === '--projects') {
                const res = await client.getProjects();
                console.log(JSON.stringify(res, null, 2));
            } else if (arg === '--logs' && process.argv[3]) {
                const res = await client.getAppLogs(process.argv[3]);
                console.log(res);
            } else if (arg === '--wait' && process.argv[3]) {
                const res = await client.waitForDeploymentAndHealth(process.argv[3]);
                console.log(JSON.stringify(res, null, 2));
            } else {
                console.log('Coolify API Wrapper CLI. Usage:');
                console.log('  node coolify-cli.js --servers');
                console.log('  node coolify-cli.js --apps');
                console.log('  node coolify-cli.js --projects');
                console.log('  node coolify-cli.js --logs <app-uuid>');
                console.log('  node coolify-cli.js --wait <app-uuid>');
            }
        } catch (e) {
            console.error('Error:', e.message);
            process.exit(1);
        }
    }
    main();
}
