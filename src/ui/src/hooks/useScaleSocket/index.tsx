import { useContext, useEffect } from 'react';
import { SocketContext } from '@contexts/socket';
import { scaleValueContext } from '@contexts/scaleValue';

/**
 * Hook personalizado para manejar los datos de la balanza recibidos por socket
 * Este hook separa la lógica de comunicación por socket del contexto de la balanza
 */
export const useScaleSocket = () => {
    const { socket } = useContext(SocketContext) || {};
    const { updateScaleValue, setAwaitingScale } = useContext(scaleValueContext)!;

    useEffect(() => {
        if (!socket) return;

        const handleScaleData = (data: { weight: number } | number) => {
            // Manejar tanto objetos con peso como valores numéricos directos
            const weight = typeof data === 'number' ? data : data.weight;

            if (!Number.isFinite(weight)) return;
            if (weight === 0) {
                setAwaitingScale(false);
            } else {
                setAwaitingScale(false);
            }
            updateScaleValue(weight);
            console.log('Scale data applied:', weight);
        };

        const handleScaleWaiting = () => {
            setAwaitingScale(true);
        };

        // Escuchar múltiples nombres de eventos por si el servidor usa diferentes nombres
        const eventNames = ['scale-data', 'weight-data', 'balance-data', 'sensor-data'];
        
        eventNames.forEach(eventName => {
            socket.on(eventName, handleScaleData);
        });

        socket.on('waiting', handleScaleWaiting);
        socket.on('scale-waiting', handleScaleWaiting);

        return () => {
            eventNames.forEach(eventName => {
                socket.off(eventName, handleScaleData);
            });
            socket.off('waiting', handleScaleWaiting);
            socket.off('scale-waiting', handleScaleWaiting);
        };
    }, [socket, setAwaitingScale, updateScaleValue]);
};

export default useScaleSocket;