window.longPress = {
    init: function (element, dotNetRef, measurementId) {
        if (!element) {
            console.log('LongPress: element is null');
            return;
        }

        // Remover listeners anteriores si existen
        if (element._longPressHandlers) {
            element.removeEventListener('touchstart', element._longPressHandlers.touchstart);
            element.removeEventListener('touchend', element._longPressHandlers.touchend);
            element.removeEventListener('touchmove', element._longPressHandlers.touchmove);
            element.removeEventListener('touchcancel', element._longPressHandlers.touchcancel);
            element.removeEventListener('mousedown', element._longPressHandlers.mousedown);
            element.removeEventListener('mouseup', element._longPressHandlers.mouseup);
            element.removeEventListener('mouseleave', element._longPressHandlers.mouseleave);
            element.removeEventListener('contextmenu', element._longPressHandlers.contextmenu);
        }

        let pressTimer = null;
        let isLongPress = false;
        const longPressDelay = 500; // 500ms para considerar long press
        let startX = 0;
        let startY = 0;

        const startPress = (e) => {
            // Prevenir el menú contextual del navegador
            e.preventDefault();
            e.stopPropagation();
            
            // Obtener coordenadas
            if (e.touches && e.touches.length > 0) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            } else {
                startX = e.clientX;
                startY = e.clientY;
            }
            
            isLongPress = false;
            pressTimer = setTimeout(() => {
                isLongPress = true;
                if (dotNetRef) {
                    dotNetRef.invokeMethodAsync('ShowContextMenu', measurementId, startX, startY)
                        .catch(err => console.error('Error calling ShowContextMenu:', err));
                }
            }, longPressDelay);
        };

        const endPress = (e) => {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
            // Si fue un click normal (no long press), no hacer nada
            if (!isLongPress && e) {
                e.stopPropagation();
            }
        };

        const cancelPress = () => {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
            isLongPress = false;
        };

        // Crear handlers
        const handlers = {
            touchstart: startPress,
            touchend: endPress,
            touchmove: cancelPress,
            touchcancel: cancelPress,
            mousedown: startPress,
            mouseup: endPress,
            mouseleave: cancelPress,
            contextmenu: (e) => {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        // Guardar handlers para poder removerlos después
        element._longPressHandlers = handlers;

        // Eventos táctiles para móvil
        element.addEventListener('touchstart', handlers.touchstart, { passive: false });
        element.addEventListener('touchend', handlers.touchend, { passive: true });
        element.addEventListener('touchmove', handlers.touchmove, { passive: true });
        element.addEventListener('touchcancel', handlers.touchcancel, { passive: true });

        // Eventos de mouse para escritorio
        element.addEventListener('mousedown', handlers.mousedown);
        element.addEventListener('mouseup', handlers.mouseup);
        element.addEventListener('mouseleave', handlers.mouseleave);
        element.addEventListener('contextmenu', handlers.contextmenu);
    }
};

