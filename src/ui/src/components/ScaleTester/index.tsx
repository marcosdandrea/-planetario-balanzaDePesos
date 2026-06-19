import React, { useContext, useState } from 'react';
import { scaleValueContext } from '@contexts/scaleValue';
import { SocketContext } from '@contexts/socket';

/**
 * Componente de testing para simular datos de la balanza
 * Este componente solo debe usarse durante el desarrollo
 */
const ScaleTester = () => {
    const { scaleValue, updateScaleValue, maxValue } = useContext(scaleValueContext)!;
    const { socket, isConnected } = useContext(SocketContext) || {};
    const [inputValue, setInputValue] = useState(scaleValue.toString());

    const handleManualInput = () => {
        const value = parseFloat(inputValue);
        if (!isNaN(value)) {
            updateScaleValue(value);
        }
    };

    // Solo mostrar en desarrollo - comentar esta línea para habilitar en producción
    // if (false) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 9999,
            fontSize: '12px',
            minWidth: '200px'
        }}>
            <h4>Scale Tester (Dev Only)</h4>
            <p>Current Value: {scaleValue.toFixed(2)}</p>
            <p>Socket: {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
            
            <div style={{ marginTop: '10px' }}>
                <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    style={{ width: '80px', marginRight: '5px' }}
                    max={maxValue}
                    min={0}
                />
                <button onClick={handleManualInput} style={{ fontSize: '10px' }}>
                    Set
                </button>
            </div>
            
        </div>
    );
};

export default ScaleTester;