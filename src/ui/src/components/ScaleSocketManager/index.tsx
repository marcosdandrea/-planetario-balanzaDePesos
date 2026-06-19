import React from 'react';
import useScaleSocket from '@hooks/useScaleSocket';

/**
 * Componente wrapper que inicializa la comunicación por socket para la balanza
 * Este componente no renderiza nada, solo maneja la lógica de comunicación
 */
const ScaleSocketManager = ({ children }: { children: React.ReactNode }) => {
    // Inicializar la comunicación por socket
    useScaleSocket();
    
    return <>{children}</>;
};

export default ScaleSocketManager;