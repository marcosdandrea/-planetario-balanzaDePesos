import type { Socket } from 'socket.io';
import { Log } from '@utils/log.js';

const log = new Log('scale-listener', true);

/**
 * Listener para manejar los datos de la balanza
 * Este listener recibe datos de sensores externos (balanza) y los retransmite a los clientes
 */
export const scaleListeners = (socket: Socket) => {
    
    // Listener para datos de balanza recibidos de fuentes externas
    socket.on('scale-raw-data', (data) => {
        try {
            log.info('Raw scale data received:', data);
            
            // Procesar y validar los datos
            const weight = parseFloat(data.weight || data.value || data);
            
            if (isNaN(weight)) {
                log.warn('Invalid weight data received:', data);
                return;
            }
            
            // Retransmitir los datos procesados a todos los clientes conectados
            socket.broadcast.emit('scale-data', { weight });
            socket.emit('scale-data', { weight }); // También enviar al remitente
            
            log.debug(`Scale data processed and broadcasted: ${weight}kg`);
            
        } catch (error) {
            log.error('Error processing scale data:', error);
        }
    });

    // Listener para datos de peso directo (número simple)
    socket.on('weight-raw', (weight: number) => {
        try {
            log.info('Raw weight received:', weight);
            
            if (typeof weight !== 'number' || isNaN(weight)) {
                log.warn('Invalid weight value received:', weight);
                return;
            }
            
            // Retransmitir el peso a todos los clientes
            socket.broadcast.emit('weight-data', weight);
            socket.emit('weight-data', weight);
            
            log.debug(`Weight broadcasted: ${weight}kg`);
            
        } catch (error) {
            log.error('Error processing weight:', error);
        }
    });

    // Listener para estado de la balanza
    socket.on('scale-status', (status) => {
        log.info('Scale status updated:', status);
        socket.broadcast.emit('scale-status', status);
    });

    // Listener para calibración de la balanza
    socket.on('scale-calibrate', (calibrationData) => {
        log.info('Scale calibration request:', calibrationData);
        // Aquí se podría implementar lógica de calibración
        socket.emit('scale-calibration-response', { success: true });
    });

    // Notificar que los listeners de balanza están activos
    log.info(`Scale listeners registered for socket: ${socket.id}`);
};

/**
 * Función helper para simular datos de balanza durante testing
 * Solo para uso en desarrollo
 */
export const simulateScaleData = (socket: Socket) => {
    const interval = setInterval(() => {
        const randomWeight = Math.random() * 100;
        socket.emit('scale-data', { weight: randomWeight });
    }, 2000);

    // Limpiar intervalo cuando el socket se desconecte
    socket.on('disconnect', () => {
        clearInterval(interval);
    });

    return interval;
};