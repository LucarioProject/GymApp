// Validación simple para inputs de mediciones
// Solo bloquea letras, permite escribir números libremente
(function() {
    function initMeasurementInputs() {
        const inputs = document.querySelectorAll('.measurement-input-field');
        
        inputs.forEach(input => {
            // Prevenir que se peguen caracteres no válidos
            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                const cleaned = pastedText.replace(/[^\d\.]/g, '');
                
                // Si tiene múltiples puntos, mantener solo el primero
                const parts = cleaned.split('.');
                let finalText = parts[0] || '';
                if (parts.length > 1) {
                    finalText += '.' + parts.slice(1).join('').replace(/\./g, '');
                }
                
                // Insertar el texto limpio
                const start = input.selectionStart;
                const end = input.selectionEnd;
                const currentValue = input.value;
                const newValue = currentValue.substring(0, start) + finalText + currentValue.substring(end);
                input.value = newValue;
                
                // Disparar evento input para que Blazor lo procese
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.setSelectionRange(start + finalText.length, start + finalText.length);
            });
            
            // Bloquear SOLO teclas de letras y símbolos, permitir escribir números libremente
            input.addEventListener('keydown', function(e) {
                const key = e.key;
                
                // Permitir teclas de control siempre
                if (key === 'Backspace' || key === 'Delete' || key === 'Tab' || key === 'Enter' ||
                    key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown' ||
                    key === 'Home' || key === 'End' || key === 'Escape' ||
                    key === 'Control' || key === 'Meta' || key === 'Alt' || key === 'Shift' ||
                    (e.ctrlKey && (key === 'a' || key === 'c' || key === 'v' || key === 'x'))) {
                    return;
                }
                
                // Permitir números (0-9)
                if (key.length === 1 && /[0-9]/.test(key)) {
                    return;
                }
                
                // Permitir punto solo si no existe ya uno
                if ((key === '.' || key === 'Period' || key === 'NumpadDecimal') && !input.value.includes('.')) {
                    return;
                }
                
                // Bloquear todo lo demás (letras, símbolos, etc.)
                e.preventDefault();
                return false;
            });
            
            // NO hacer validación en tiempo real - dejar que Blazor lo maneje completamente
        });
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMeasurementInputs);
    } else {
        initMeasurementInputs();
    }
    
    // También inicializar después de que Blazor cargue
    window.addEventListener('load', function() {
        setTimeout(initMeasurementInputs, 100);
    });
    
    // Exponer función global para reinicializar después de cambios dinámicos
    window.initMeasurementInputs = initMeasurementInputs;
})();
