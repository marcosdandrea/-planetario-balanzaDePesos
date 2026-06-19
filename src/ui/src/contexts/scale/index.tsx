import React, { useState, useMemo, useCallback } from "react";
import { createContext } from "react";

type ScaleContextProps = {
    scaleValue: number;
    setScaleValue: (value: number) => void;
    maxValue: number;
}

export const scaleContext = createContext<ScaleContextProps | undefined>(undefined);

const ScaleContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [scaleValue, setScaleValue] = useState<number>(0);
    
    const maxValue = 100;

    // Memoizar la función para evitar re-renders innecesarios
    const handleSetScaleValue = useCallback((value: number) => {
        setScaleValue(Math.min(Math.max(value, 0), maxValue));
    }, [maxValue]);

    // Memoizar el valor del contexto para evitar re-renders innecesarios
    const providedValues: ScaleContextProps = useMemo(() => ({
        scaleValue,
        setScaleValue: handleSetScaleValue,
        maxValue
    }), [scaleValue, handleSetScaleValue, maxValue]);

    return (
        <scaleContext.Provider value={providedValues}>
            {children}
        </scaleContext.Provider>
    );
}
 
export default ScaleContextProvider;