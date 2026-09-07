const CoolifyClient = require('./coolify-cli');

async function runDiagnostics() {
    console.log('=== Iniciando Diagnóstico de Salud de Coolify ===');
    const client = new CoolifyClient();

    try {
        console.log('Consultando recursos en la API...');
        const [servers, projects, apps, dbs, services] = await Promise.all([
            client.getServers().catch(() => []),
            client.getProjects().catch(() => []),
            client.getApplications().catch(() => []),
            client.getDatabases().catch(() => []),
            client.getServices().catch(() => [])
        ]);

        console.log(`\nServidores Conectados: ${servers.length}`);
        servers.forEach(s => {
            const reachable = s.settings ? s.settings.is_reachable : false;
            console.log(` - [${s.name}] IP: ${s.ip} | Reachable: ${reachable}`);
        });

        const unhealthyList = [];

        // Evaluar Aplicaciones
        const appsUnhealthy = apps.filter(app => {
            const status = app.status || '';
            return !status.includes('running') || status.includes('unhealthy');
        });
        
        if (appsUnhealthy.length > 0) {
            console.log(`\n⚠️  Aplicaciones con problemas de salud (${appsUnhealthy.length}):`);
            for (const app of appsUnhealthy) {
                console.log(` - [${app.name}] Status: ${app.status} | FQDN: ${app.fqdn || 'None'} | UUID: ${app.uuid}`);
                unhealthyList.push({ type: 'Application', name: app.name, uuid: app.uuid, status: app.status });
            }
        } else {
            console.log('\n✅ Todas las aplicaciones están saludables.');
        }

        // Evaluar Bases de Datos
        const dbsUnhealthy = dbs.filter(db => {
            const status = db.status || '';
            return !status.includes('running') || status.includes('unhealthy');
        });

        if (dbsUnhealthy.length > 0) {
            console.log(`\n⚠️  Bases de datos con problemas de salud (${dbsUnhealthy.length}):`);
            dbsUnhealthy.forEach(db => {
                console.log(` - [${db.name}] Status: ${db.status} | Tipo: ${db.type} | UUID: ${db.uuid}`);
                unhealthyList.push({ type: 'Database', name: db.name, uuid: db.uuid, status: db.status });
            });
        } else {
            console.log('\n✅ Todas las bases de datos están saludables.');
        }

        // Evaluar Servicios
        const svcsUnhealthy = services.filter(svc => {
            const status = svc.status || '';
            return !status.includes('running') || status.includes('unhealthy');
        });

        if (svcsUnhealthy.length > 0) {
            console.log(`\n⚠️  Servicios con problemas de salud (${svcsUnhealthy.length}):`);
            svcsUnhealthy.forEach(svc => {
                console.log(` - [${svc.name}] Status: ${svc.status} | UUID: ${svc.uuid}`);
                unhealthyList.push({ type: 'Service', name: svc.name, uuid: svc.uuid, status: svc.status });
            });
        } else {
            console.log('\n✅ Todos los servicios de plantilla están saludables.');
        }

        // Extraer logs de diagnóstico para aplicaciones caídas
        if (appsUnhealthy.length > 0) {
            console.log('\n=== Extrayendo logs de contenedores caídos para análisis ===');
            for (const app of appsUnhealthy) {
                console.log(`\n--------------------------------------------`);
                console.log(`Logs de la Aplicación: ${app.name} (${app.uuid})`);
                console.log(`--------------------------------------------`);
                try {
                    const logs = await client.getAppLogs(app.uuid);
                    if (logs) {
                        const lines = logs.split('\n');
                        const lastLines = lines.slice(-30).join('\n');
                        console.log(lastLines || '[No se encontraron registros de log en el contenedor]');
                    } else {
                        console.log('[No hay logs disponibles]');
                    }
                } catch (e) {
                    console.log(`No se pudieron obtener logs para ${app.name}: ${e.message}`);
                }
            }
        }

        console.log('\n=== Diagnóstico Completado ===');
    } catch (e) {
        console.error('Error durante la ejecución del diagnóstico:', e.message);
        process.exit(1);
    }
}

runDiagnostics();
