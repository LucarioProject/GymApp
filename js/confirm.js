window.showConfirm = function (message) {
    return new Promise((resolve) => {
        // Eliminar cualquier modal existente primero
        const existingOverlay = document.getElementById('confirm-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.id = 'confirm-overlay';
        
        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'confirm-modal';
        
        // Contenedor del icono
        const iconContainer = document.createElement('div');
        iconContainer.className = 'confirm-icon-container';
        const icon = document.createElement('div');
        icon.className = 'confirm-icon';
        icon.innerHTML = '⚠️';
        iconContainer.appendChild(icon);
        
        // Mensaje
        const messageEl = document.createElement('div');
        messageEl.className = 'confirm-message';
        messageEl.textContent = message;
        
        // Botones
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'confirm-buttons';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'confirm-btn confirm-btn-cancel';
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.type = 'button';
        
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'confirm-btn confirm-btn-confirm';
        confirmBtn.textContent = 'Eliminar';
        confirmBtn.type = 'button';
        
        const cleanup = () => {
            if (overlay && overlay.parentNode) {
                overlay.classList.remove('show');
                setTimeout(() => {
                    if (overlay && overlay.parentNode) {
                        document.body.removeChild(overlay);
                    }
                }, 300);
            }
            document.removeEventListener('keydown', handleEsc);
        };
        
        cancelBtn.onclick = (e) => {
            e.stopPropagation();
            cleanup();
            resolve(false);
        };
        
        confirmBtn.onclick = (e) => {
            e.stopPropagation();
            cleanup();
            resolve(true);
        };
        
        buttonsContainer.appendChild(cancelBtn);
        buttonsContainer.appendChild(confirmBtn);
        
        modal.appendChild(iconContainer);
        modal.appendChild(messageEl);
        modal.appendChild(buttonsContainer);
        overlay.appendChild(modal);
        
        // Agregar al DOM
        document.body.appendChild(overlay);
        
        // Prevenir scroll del body cuando el modal está abierto
        document.body.style.overflow = 'hidden';
        
        // Animación de entrada
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });
        
        // Cerrar al hacer clic en el overlay (fuera del modal)
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                cleanup();
                resolve(false);
            }
        };
        
        // Prevenir que el clic en el modal cierre el overlay
        modal.onclick = (e) => {
            e.stopPropagation();
        };
        
        // Cerrar con ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape' || e.keyCode === 27) {
                cleanup();
                resolve(false);
            }
        };
        document.addEventListener('keydown', handleEsc);
        
        // Restaurar scroll cuando se cierre
        const originalOverflow = document.body.style.overflow;
        setTimeout(() => {
            if (!document.getElementById('confirm-overlay')) {
                document.body.style.overflow = originalOverflow;
            }
        }, 300);
    });
};
