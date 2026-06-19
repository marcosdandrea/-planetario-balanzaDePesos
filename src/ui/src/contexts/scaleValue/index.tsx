import React, { useState, useRef, useCallback } from "react";
import { createContext } from "react";

type ScaleValueContextProps = {
    scaleValue: number;
    updateScaleValue: (value: number) => void;
    maxValue: number;
    isAwaitingScale: boolean;
    setAwaitingScale: (value: boolean) => void;
}

export const scaleValueContext = createContext<ScaleValueContextProps | undefined>(undefined);

/**
 * Contexto aislado SOLO para el valor de la balanza
 * Este contexto está diseñado para tener el mínimo impacto de re-renders
 */
const ScaleValueContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [scaleValue, setScaleValue] = useState<number>(0);
    const [isAwaitingScale, setIsAwaitingScale] = useState<boolean>(false);
    const maxValue = 100;
    
    // Usar useRef para evitar re-renders en los callbacks
    const scaleValueRef = useRef(scaleValue);
    
    // Función optimizada que no cambia de referencia
    const updateScaleValue = useCallback((value: number) => {
        const clampedValue = Math.min(Math.max(value, 0), maxValue);
        scaleValueRef.current = clampedValue;
        setScaleValue(clampedValue);
    }, [maxValue]);

    // Solo cambiar el contexto cuando realmente cambie el valor
    const contextValue = React.useMemo(() => ({
        scaleValue,
        updateScaleValue,
        maxValue,
        isAwaitingScale,
        setAwaitingScale: setIsAwaitingScale
    }), [scaleValue, updateScaleValue, maxValue, isAwaitingScale]);

    return (
        <scaleValueContext.Provider value={contextValue}>
            {children}
        </scaleValueContext.Provider>
    );
}

export default ScaleValueContextProvider;