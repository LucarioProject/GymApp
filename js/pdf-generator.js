window.pdfGenerator = {
    generateMeasurementPDF: async function (measurementData) {
        // Cargar jsPDF dinámicamente si no está disponible
        if (typeof window.jspdf === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Configuración de colores modernos
        const primaryColor = [99, 102, 241]; // #6366f1
        const lightGray = [241, 245, 249]; // #f1f5f9
        const darkGray = [30, 41, 59]; // #1e293b
        const mediumGray = [148, 163, 184]; // #94a3b8
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 25;
        let yPos = margin;

        // Header con fondo de color
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 50, 'F');
        
        // Título principal
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('Medición Corporal', pageWidth / 2, 30, { align: 'center' });
        
        // Subtítulo
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(255, 255, 255);
        doc.text('Gym App - Control de Mediciones', pageWidth / 2, 40, { align: 'center' });
        
        yPos = 65;

        // Card de información principal
        doc.setFillColor(...lightGray);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 35, 3, 3, 'F');
        
        // Fecha
        doc.setTextColor(...darkGray);
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.text('FECHA', margin + 8, yPos + 8);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(11);
        doc.text(measurementData.date, margin + 8, yPos + 15);
        
        // Descripción
        const descX = margin + 100;
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.text('DESCRIPCIÓN', descX, yPos + 8);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        const descLines = doc.splitTextToSize(measurementData.description || 'Sin descripción', pageWidth - descX - margin - 8);
        doc.text(descLines, descX, yPos + 15);
        
        yPos += 50;

        // Sección de mediciones detalladas
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...darkGray);
        doc.text('Mediciones Detalladas', margin, yPos);
        yPos += 12;

        // Grid de mediciones con estilo moderno
        const measurements = [
            { label: 'Peso', value: measurementData.peso, icon: '⚖️', unit: 'kg' },
            { label: 'Grasa Corporal', value: measurementData.grasaCorporal, icon: '📊', unit: '%' },
            { label: 'Masa Muscular', value: measurementData.masaMuscular, icon: '💪', unit: 'kg' },
            { label: 'Grasa Visceral', value: measurementData.grasaVisceral, icon: '🫀', unit: 'nivel' },
            { label: 'Brazo Derecho', value: measurementData.brazoDerecho, icon: '💪', unit: 'cm' },
            { label: 'Brazo Izquierdo', value: measurementData.brazoIzquierdo, icon: '💪', unit: 'cm' },
            { label: 'Antebrazo Derecho', value: measurementData.antebrazoDerecho, icon: '👊', unit: 'cm' },
            { label: 'Antebrazo Izquierdo', value: measurementData.antebrazoIzquierdo, icon: '👊', unit: 'cm' },
            { label: 'Pecho y Espalda', value: measurementData.pechoEspalda, icon: '🏋️', unit: 'cm' },
            { label: 'Cintura', value: measurementData.cintura, icon: '📏', unit: 'cm' },
            { label: 'Glúteos', value: measurementData.gluteos, icon: '🎯', unit: 'cm' },
            { label: 'Pierna Derecha', value: measurementData.piernaDerecha, icon: '🦵', unit: 'cm' },
            { label: 'Pierna Izquierda', value: measurementData.piernaIzquierda, icon: '🦵', unit: 'cm' },
            { label: 'Pantorrilla Derecha', value: measurementData.pantorrillaDerecha, icon: '👣', unit: 'cm' },
            { label: 'Pantorrilla Izquierda', value: measurementData.pantorrillaIzquierda, icon: '👣', unit: 'cm' },
            { label: 'Hombros', value: measurementData.hombros, icon: '🤲', unit: 'cm' }
        ];

        const cardWidth = (pageWidth - margin * 2 - 10) / 2; // 2 columnas con espacio entre ellas
        const cardHeight = 18;
        let col = 0;
        let row = 0;

        measurements.forEach((m, index) => {
            if (yPos + cardHeight > pageHeight - 40) {
                doc.addPage();
                yPos = margin;
                row = 0;
            }

            const xPos = margin + col * (cardWidth + 10);
            
            // Fondo de card con color suave
            doc.setFillColor(...lightGray);
            doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 2, 2, 'F');
            
            // Borde sutil
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.5);
            doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 2, 2);
            
            // Contenido de la card
            doc.setFontSize(8);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(...mediumGray);
            doc.text(m.label.toUpperCase(), xPos + 5, yPos + 7);
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(...primaryColor);
            const unit = m.unit || 'cm';
            const value = m.value !== null && m.value !== undefined ? m.value.toFixed(1) + ' ' + unit : 'N/A';
            doc.text(value, xPos + 5, yPos + 14);
            
            // Cambiar de columna
            col++;
            if (col >= 2) {
                col = 0;
                row++;
                yPos += cardHeight + 8;
            }
        });

        // Ajustar posición si quedó en medio de una fila
        if (col !== 0) {
            yPos += cardHeight + 8;
        }

        yPos += 10;

        // Sección de resumen con estilo destacado
        if (yPos > pageHeight - 50) {
            doc.addPage();
            yPos = margin;
        }

        doc.setFillColor(...primaryColor);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 30, 3, 3, 'F');
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('Resumen', margin + 10, yPos + 12);
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text('Promedio Brazos: ' + measurementData.promedioBrazos, margin + 10, yPos + 22);
        doc.text('Promedio Piernas: ' + measurementData.promedioPiernas, margin + 100, yPos + 22);
        
        yPos += 40;

        // Footer
        const footerY = pageHeight - 15;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(margin, footerY, pageWidth - margin, footerY);
        
        doc.setFontSize(8);
        doc.setTextColor(...mediumGray);
        doc.setFont(undefined, 'normal');
        doc.text('Generado por Gym App', pageWidth / 2, footerY + 8, { align: 'center' });

        // Generar blob
        const pdfBlob = doc.output('blob');
        return URL.createObjectURL(pdfBlob);
    },

    sharePDF: async function (pdfUrl, measurementDate) {
        try {
            const response = await fetch(pdfUrl);
            const blob = await response.blob();
            const file = new File([blob], `medicion_${measurementDate.replace(/[\/\s:]/g, '_')}.pdf`, { type: 'application/pdf' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Medición Corporal',
                    text: 'Compartir medición corporal',
                    files: [file]
                });
                return true;
            } else {
                // Fallback: descargar el archivo
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = `medicion_${measurementDate.replace(/[\/\s:]/g, '_')}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return false;
            }
        } catch (error) {
            console.error('Error al compartir PDF:', error);
            // Fallback: descargar el archivo
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `medicion_${measurementDate.replace(/[\/\s:]/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return false;
        }
    },

    downloadPDF: function (pdfUrl, measurementDate) {
        // Descargar directamente el PDF
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `medicion_${measurementDate.replace(/[\/\s:]/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpiar el objeto URL después de un tiempo
        setTimeout(() => {
            URL.revokeObjectURL(pdfUrl);
        }, 1000);
    },

    shareViaWhatsApp: function (pdfUrl, measurementDate) {
        // Para WhatsApp, primero descargamos el PDF y luego compartimos el enlace
        // O mejor, compartimos como archivo si es posible
        const whatsappUrl = `https://wa.me/?text=Medición Corporal - ${measurementDate}`;
        window.open(whatsappUrl, '_blank');
        
        // También intentamos compartir el archivo
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `medicion_${measurementDate.replace(/[\/\s:]/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, 500);
    }
};

// Función helper para generar y descargar PDF desde C#
window.generateAndDownloadPDF = async function (measurementData, measurementDate) {
    try {
        if (typeof window.pdfGenerator === 'undefined') {
            throw new Error('pdfGenerator no está disponible');
        }
        const pdfUrl = await window.pdfGenerator.generateMeasurementPDF(measurementData);
        window.pdfGenerator.downloadPDF(pdfUrl, measurementDate);
    } catch (error) {
        console.error('Error al generar PDF:', error);
        alert('Error al generar el PDF: ' + error.message);
    }
};

