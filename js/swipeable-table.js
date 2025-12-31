window.swipeableTable = {
    initAll: function (dotNetRef) {
        const rows = document.querySelectorAll('.measurement-row:not([data-swipe-initialized])');
        rows.forEach(row => {
            const measurementId = row.getAttribute('data-measurement-id');
            if (measurementId) {
                window.swipeableTable.init(row, measurementId, dotNetRef);
                row.setAttribute('data-swipe-initialized', 'true');
            }
        });
    },
    
    init: function (rowEl, measurementId, dotNetRef) {
        if (!rowEl || rowEl.hasAttribute('data-swipe-initialized')) return;

        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        const threshold = 80;
        let deleteArea = null;

        // Crear área de eliminación si no existe
        if (!rowEl.querySelector('.swipeable-delete-area')) {
            deleteArea = document.createElement('div');
            deleteArea.className = 'swipeable-delete-area';
            deleteArea.innerHTML = '<button class="delete-button-swipe-table">🗑️ Eliminar</button>';
            rowEl.style.position = 'relative';
            rowEl.appendChild(deleteArea);
            
            deleteArea.querySelector('button').addEventListener('click', async () => {
                if (dotNetRef) {
                    await dotNetRef.invokeMethodAsync('DeleteMeasurementById', measurementId);
                }
                resetPosition();
            });
        } else {
            deleteArea = rowEl.querySelector('.swipeable-delete-area');
        }

        const resetPosition = () => {
            rowEl.style.transform = 'translateX(0)';
            rowEl.style.transition = 'transform 0.3s ease';
            if (deleteArea) {
                deleteArea.style.opacity = '0';
                deleteArea.style.right = '-120px';
                deleteArea.style.transition = 'opacity 0.3s ease, right 0.3s ease';
            }
            setTimeout(() => {
                rowEl.style.transition = '';
                if (deleteArea) deleteArea.style.transition = '';
            }, 300);
        };

        const handleStart = (clientX) => {
            startX = clientX;
            isDragging = true;
            rowEl.style.transition = '';
            if (deleteArea) deleteArea.style.transition = '';
        };

        const handleMove = (clientX) => {
            if (!isDragging) return;
            
            currentX = clientX - startX;

            // Solo permitir deslizar hacia la izquierda (X negativo)
            if (currentX < 0) {
                const distance = Math.abs(currentX);
                rowEl.style.transform = `translateX(${currentX}px)`;
                
                // Mostrar área de eliminación con opacidad y posición
                if (deleteArea) {
                    const opacity = Math.min(distance / threshold, 1);
                    deleteArea.style.opacity = opacity.toString();
                    deleteArea.style.right = `${-120 + distance}px`;
                }
            }
        };

        const handleEnd = () => {
            if (!isDragging) return;
            isDragging = false;

            // Si se deslizó lo suficiente, mantenerlo abierto, de lo contrario resetear
            if (Math.abs(currentX) >= threshold) {
                rowEl.style.transform = `translateX(-${threshold}px)`;
                rowEl.style.transition = 'transform 0.3s ease';
                if (deleteArea) {
                    deleteArea.style.opacity = '1';
                    deleteArea.style.right = '0px';
                    deleteArea.style.transition = 'opacity 0.3s ease, right 0.3s ease';
                }
            } else {
                resetPosition();
            }

            currentX = 0;
        };

        // Eventos táctiles para móvil
        rowEl.addEventListener('touchstart', (e) => {
            handleStart(e.touches[0].clientX);
        }, { passive: true });

        rowEl.addEventListener('touchmove', (e) => {
            handleMove(e.touches[0].clientX);
        }, { passive: true });

        rowEl.addEventListener('touchend', () => {
            handleEnd();
        }, { passive: true });

        // Eventos de mouse para escritorio
        rowEl.addEventListener('mousedown', (e) => {
            if (e.target.closest('button')) return; // No iniciar drag si es un botón
            e.preventDefault();
            handleStart(e.clientX);
        });

        rowEl.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                handleMove(e.clientX);
            }
        });

        rowEl.addEventListener('mouseup', () => {
            handleEnd();
        });

        rowEl.addEventListener('mouseleave', () => {
            if (isDragging) {
                handleEnd();
            }
        });

        // Reset al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!rowEl.contains(e.target)) {
                resetPosition();
            }
        }, true);
    }
};

