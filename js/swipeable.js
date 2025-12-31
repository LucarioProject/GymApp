window.swipeable = {
    init: function (containerEl, contentEl, deleteEl) {
        // Blazor automáticamente convierte ElementReference a elementos DOM
        if (!containerEl || !contentEl || !deleteEl) return;

        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        const threshold = 80;

        const resetPosition = () => {
            contentEl.style.transform = 'translateX(0)';
            contentEl.style.transition = 'transform 0.3s ease';
            deleteEl.style.opacity = '0';
            deleteEl.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                contentEl.style.transition = '';
                deleteEl.style.transition = '';
            }, 300);
        };

        const handleStart = (clientX) => {
            startX = clientX;
            isDragging = true;
            contentEl.style.transition = '';
            deleteEl.style.transition = '';
        };

        const handleMove = (clientX) => {
            if (!isDragging) return;
            
            currentX = clientX - startX;

            // Only allow swiping to the left (negative X)
            if (currentX < 0) {
                const distance = Math.abs(currentX);
                contentEl.style.transform = `translateX(${currentX}px)`;
                
                // Show delete area with opacity
                const opacity = Math.min(distance / threshold, 1);
                deleteEl.style.opacity = opacity.toString();
            }
        };

        const handleEnd = () => {
            if (!isDragging) return;
            isDragging = false;

            // If swiped enough, keep it open, otherwise reset
            if (Math.abs(currentX) >= threshold) {
                contentEl.style.transform = `translateX(-${threshold}px)`;
                contentEl.style.transition = 'transform 0.3s ease';
                deleteEl.style.opacity = '1';
                deleteEl.style.transition = 'opacity 0.3s ease';
            } else {
                resetPosition();
            }

            currentX = 0;
        };

        // Touch events for mobile
        containerEl.addEventListener('touchstart', (e) => {
            handleStart(e.touches[0].clientX);
        }, { passive: true });

        containerEl.addEventListener('touchmove', (e) => {
            handleMove(e.touches[0].clientX);
        }, { passive: true });

        containerEl.addEventListener('touchend', () => {
            handleEnd();
        }, { passive: true });

        // Mouse events for desktop
        containerEl.addEventListener('mousedown', (e) => {
            e.preventDefault();
            handleStart(e.clientX);
        });

        containerEl.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                handleMove(e.clientX);
            }
        });

        containerEl.addEventListener('mouseup', () => {
            handleEnd();
        });

        containerEl.addEventListener('mouseleave', () => {
            if (isDragging) {
                handleEnd();
            }
        });

        // Reset on click outside
        document.addEventListener('click', (e) => {
            if (!containerEl.contains(e.target)) {
                resetPosition();
            }
        }, true);
    }
};
