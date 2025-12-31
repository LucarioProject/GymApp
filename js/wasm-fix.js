// Parche definitivo para corregir errores 404 de archivos .wasm
// Intercepta todas las peticiones a .wasm y las corrige automáticamente
(function() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('[WASM Fix] Activado para desarrollo local');
        
        let correctWasmFile = null;
        let bootJsonLoaded = false;
        
        // Cargar blazor.boot.json inmediatamente para tener el archivo correcto
        (async function() {
            try {
                const response = await fetch('/_framework/blazor.boot.json');
                if (response.ok) {
                    const data = await response.json();
                    if (data.resources && data.resources.assembly) {
                        const wasmFiles = Object.keys(data.resources.assembly).filter(k => k.endsWith('.wasm'));
                        if (wasmFiles.length > 0) {
                            correctWasmFile = wasmFiles[0];
                            bootJsonLoaded = true;
                            console.log('[WASM Fix] Archivo .wasm correcto detectado:', correctWasmFile);
                        }
                    }
                }
            } catch (e) {
                console.warn('[WASM Fix] No se pudo cargar blazor.boot.json inicialmente');
            }
        })();
        
        // Interceptar fetch de manera más agresiva
        const originalFetch = window.fetch;
        window.fetch = async function(...args) {
            const url = args[0];
            const init = args[1] || {};
            
            // Si es una petición a un archivo .wasm
            if (typeof url === 'string' && url.includes('.wasm')) {
                // Si ya tenemos el archivo correcto, usarlo directamente
                if (correctWasmFile && !url.includes(correctWasmFile)) {
                    const correctUrl = '/_framework/' + correctWasmFile;
                    console.log('[WASM Fix] Redirigiendo de', url, 'a', correctUrl);
                    return originalFetch.apply(this, [correctUrl, init]);
                }
                
                // Si no tenemos el archivo correcto aún, intentar obtenerlo
                if (!bootJsonLoaded) {
                    try {
                        const response = await originalFetch('/_framework/blazor.boot.json');
                        if (response.ok) {
                            const data = await response.json();
                            if (data.resources && data.resources.assembly) {
                                const wasmFiles = Object.keys(data.resources.assembly).filter(k => k.endsWith('.wasm'));
                                if (wasmFiles.length > 0) {
                                    correctWasmFile = wasmFiles[0];
                                    bootJsonLoaded = true;
                                    const correctUrl = '/_framework/' + correctWasmFile;
                                    console.log('[WASM Fix] Archivo correcto encontrado, redirigiendo a', correctUrl);
                                    return originalFetch.apply(this, [correctUrl, init]);
                                }
                            }
                        }
                    } catch (e) {
                        console.warn('[WASM Fix] Error al obtener blazor.boot.json:', e);
                    }
                }
                
                // Intentar la petición original
                try {
                    const response = await originalFetch.apply(this, [url, init]);
                    if (response.ok) {
                        return response;
                    }
                } catch (e) {
                    // Si falla y tenemos el archivo correcto, usarlo
                    if (correctWasmFile) {
                        const correctUrl = '/_framework/' + correctWasmFile;
                        console.log('[WASM Fix] Petición falló, usando archivo correcto:', correctUrl);
                        return originalFetch.apply(this, [correctUrl, init]);
                    }
                    throw e;
                }
            }
            
            return originalFetch.apply(this, [url, init]);
        };
    }
})();
