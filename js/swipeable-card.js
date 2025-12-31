// Función helper para inicializar desde Blazor
window.initSwipeableCards = function(dotNetRef) {
    if (typeof window.swipeableCard !== 'undefined') {
        window.swipeableCard.initAll(dotNetRef);
    } else {
        console.error('swipeableCard no está disponible');
    }
};

window.swipeableCard = {
    _globalDotNetRef: null,
    
    initAll: function (dotNetRef) {
        console.log('swipeableCard.initAll llamado, dotNetRef:', dotNetRef);
        if (!dotNetRef) {
            console.error('swipeableCard.initAll: dotNetRef es null');
            return;
        }
        
        // Guardar referencia global como respaldo
        window.swipeableCard._globalDotNetRef = dotNetRef;
        
        // Buscar TODAS las cards, incluso si ya fueron inicializadas
        const cards = document.querySelectorAll('.measurement-card-grid');
        console.log(`Encontradas ${cards.length} cards en total`);
        
        cards.forEach(card => {
            const measurementId = card.getAttribute('data-measurement-id');
            if (measurementId) {
                console.log(`Inicializando/reinicializando card con ID: ${measurementId}`);
                // Remover atributo para permitir reinicialización
                card.removeAttribute('data-swipe-initialized');
                window.swipeableCard.init(card, dotNetRef, measurementId);
            }
        });
    },
    
    init: function (cardEl, dotNetRef, measurementId) {
        if (!cardEl) {
            console.log('swipeableCard: cardEl is null');
            return;
        }
        
        // Verificar que el elemento existe en el DOM
        if (!cardEl.parentElement) {
            console.log('swipeableCard: cardEl not in DOM');
            return;
        }
        
        // Remover inicialización anterior si existe para reinicializar
        // Esto permite reinicializar después de cambios en el DOM
        if (cardEl.hasAttribute('data-swipe-initialized')) {
            // Limpiar event listeners anteriores si es necesario
            const oldActions = cardEl.querySelector('.swipeable-actions');
            if (oldActions) {
                oldActions.remove();
            }
            cardEl.removeAttribute('data-swipe-initialized');
        }
        
        console.log('swipeableCard: inicializando para', measurementId);
        console.log('swipeableCard: dotNetRef recibido:', dotNetRef);

        // Guardar dotNetRef en el elemento para acceso posterior
        if (dotNetRef) {
            cardEl._dotNetRef = dotNetRef;
        } else {
            console.error('swipeableCard: dotNetRef es null al inicializar');
        }

        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        const threshold = 100; // Distancia mínima para mostrar opciones
        const maxSwipe = 200; // Distancia máxima de swipe
        let actionsContainer = null;

        // Crear contenedor de acciones si no existe
        if (!cardEl.querySelector('.swipeable-actions')) {
            actionsContainer = document.createElement('div');
            actionsContainer.className = 'swipeable-actions';
            actionsContainer.innerHTML = `
                <button class="swipe-action-btn swipe-action-delete" data-action="delete">
                    <span class="swipe-action-icon">🗑️</span>
                    <span class="swipe-action-label">Eliminar</span>
                </button>
                <button class="swipe-action-btn swipe-action-share" data-action="share">
                    <span class="swipe-action-icon">📥</span>
                    <span class="swipe-action-label">Descargar</span>
                </button>
            `;
            cardEl.style.position = 'relative';
            cardEl.style.overflow = 'hidden';
            cardEl.style.willChange = 'transform';
            cardEl.appendChild(actionsContainer);

            // Event listeners para los botones - usar el dotNetRef guardado
            actionsContainer.querySelector('[data-action="delete"]').addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('Botón eliminar clickeado, measurementId:', measurementId);
                
                // Usar el dotNetRef guardado en el elemento, o la referencia global como respaldo
                const ref = cardEl._dotNetRef || dotNetRef || window.swipeableCard._globalDotNetRef;
                
                if (!ref) {
                    console.error('dotNetRef es null - no se puede eliminar');
                    console.error('cardEl._dotNetRef:', cardEl._dotNetRef);
                    console.error('dotNetRef (closure):', dotNetRef);
                    console.error('_globalDotNetRef:', window.swipeableCard._globalDotNetRef);
                    alert('Error: No se puede conectar con la aplicación. Por favor, recarga la página.');
                    resetPosition();
                    return;
                }
                
                try {
                    console.log('Llamando a HandleSwipeDelete con ref:', ref);
                    const result = await ref.invokeMethodAsync('HandleSwipeDelete', measurementId);
                    console.log('HandleSwipeDelete completado, resultado:', result);
                    // Solo resetear posición después de que se complete la operación
                    resetPosition();
                } catch (error) {
                    console.error('Error al eliminar:', error);
                    console.error('Stack trace:', error.stack);
                    alert('Error al eliminar: ' + error.message);
                    resetPosition();
                }
            });

            actionsContainer.querySelector('[data-action="share"]').addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                // Usar el dotNetRef guardado en el elemento, o la referencia global como respaldo
                const ref = cardEl._dotNetRef || dotNetRef || window.swipeableCard._globalDotNetRef;
                
                if (!ref) {
                    console.error('dotNetRef es null - no se puede compartir');
                    alert('Error: No se puede conectar con la aplicación. Por favor, recarga la página.');
                    resetPosition();
                    return;
                }
                
                try {
                    await ref.invokeMethodAsync('HandleSwipeShare', measurementId);
                } catch (error) {
                    console.error('Error al compartir:', error);
                    alert('Error al generar PDF: ' + error.message);
                }
                resetPosition();
            });
        } else {
            actionsContainer = cardEl.querySelector('.swipeable-actions');
            // Actualizar el dotNetRef si ya existe el contenedor
            if (dotNetRef) {
                cardEl._dotNetRef = dotNetRef;
            }
        }

        const resetPosition = () => {
            cardEl.style.transform = 'translateX(0)';
            cardEl.style.transition = 'transform 0.3s ease';
            if (actionsContainer) {
                actionsContainer.style.opacity = '0';
                actionsContainer.style.right = '-200px';
                actionsContainer.style.left = '-200px';
                actionsContainer.style.transition = 'opacity 0.3s ease, right 0.3s ease, left 0.3s ease';
            }
            setTimeout(() => {
                cardEl.style.transition = '';
                if (actionsContainer) actionsContainer.style.transition = '';
            }, 300);
        };

        const handleStart = (clientX) => {
            startX = clientX;
            isDragging = true;
            cardEl.style.transition = '';
            if (actionsContainer) {
                actionsContainer.style.transition = '';
            }
            // Prevenir selección de texto mientras se desliza
            cardEl.style.userSelect = 'none';
        };

        const handleMove = (clientX) => {
            if (!isDragging) return;
            
            currentX = clientX - startX;
            const distance = Math.abs(currentX);
            const clampedDistance = Math.min(distance, maxSwipe);

            // Permitir deslizar hacia izquierda o derecha
            if (currentX < 0) {
                // Deslizar hacia la izquierda
                cardEl.style.transform = `translateX(${-clampedDistance}px)`;
                
                // Mostrar acciones con opacidad y posición
                if (actionsContainer) {
                    const opacity = Math.min(distance / threshold, 1);
                    actionsContainer.style.opacity = opacity.toString();
                    actionsContainer.style.right = `${-200 + clampedDistance}px`;
                    actionsContainer.style.left = 'auto';
                }
            } else if (currentX > 0) {
                // Deslizar hacia la derecha
                cardEl.style.transform = `translateX(${clampedDistance}px)`;
                
                // Mostrar acciones con opacidad y posición (a la izquierda)
                if (actionsContainer) {
                    const opacity = Math.min(distance / threshold, 1);
                    actionsContainer.style.opacity = opacity.toString();
                    actionsContainer.style.left = `${-200 + clampedDistance}px`;
                    actionsContainer.style.right = 'auto';
                }
            }
        };

        const handleEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            
            // Restaurar selección de texto
            cardEl.style.userSelect = '';

            // Si se deslizó lo suficiente, mantenerlo abierto, de lo contrario resetear
            if (Math.abs(currentX) >= threshold) {
                if (currentX < 0) {
                    // Deslizó hacia la izquierda
                    cardEl.style.transform = `translateX(-${maxSwipe}px)`;
                    if (actionsContainer) {
                        actionsContainer.style.opacity = '1';
                        actionsContainer.style.right = '0px';
                        actionsContainer.style.left = 'auto';
                        actionsContainer.style.transition = 'opacity 0.3s ease, right 0.3s ease';
                    }
                } else {
                    // Deslizó hacia la derecha
                    cardEl.style.transform = `translateX(${maxSwipe}px)`;
                    if (actionsContainer) {
                        actionsContainer.style.opacity = '1';
                        actionsContainer.style.left = '0px';
                        actionsContainer.style.right = 'auto';
                        actionsContainer.style.transition = 'opacity 0.3s ease, left 0.3s ease';
                    }
                }
                cardEl.style.transition = 'transform 0.3s ease';
            } else {
                resetPosition();
            }

            currentX = 0;
        };

        // Eventos táctiles para móvil
        cardEl.addEventListener('touchstart', (e) => {
            if (e.target.closest('button')) return; // No iniciar swipe si es un botón
            handleStart(e.touches[0].clientX);
        }, { passive: false });

        cardEl.addEventListener('touchmove', (e) => {
            if (isDragging) {
                e.preventDefault(); // Prevenir scroll mientras se desliza
                handleMove(e.touches[0].clientX);
            }
        }, { passive: false });

        cardEl.addEventListener('touchend', (e) => {
            if (isDragging) {
                e.preventDefault();
            }
            handleEnd();
        }, { passive: false });

        // Eventos de mouse para escritorio
        cardEl.addEventListener('mousedown', (e) => {
            if (e.target.closest('button')) return; // No iniciar swipe si es un botón
            e.preventDefault();
            handleStart(e.clientX);
        });

        cardEl.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                handleMove(e.clientX);
            }
        });

        cardEl.addEventListener('mouseup', () => {
            handleEnd();
        });

        cardEl.addEventListener('mouseleave', () => {
            if (isDragging) {
                handleEnd();
            }
        });

        // Reset al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!cardEl.contains(e.target)) {
                resetPosition();
            }
        }, true);
    }
};

