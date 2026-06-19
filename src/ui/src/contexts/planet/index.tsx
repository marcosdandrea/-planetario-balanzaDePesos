import React, { useState, useMemo, useCallback } from "react";
import { createContext } from "react";

type PlanetContextProps = {
    planetSelectedId: string | null;
    setPlanetSelectedId: (id: string | null) => void;
}

export const planetContext = createContext<PlanetContextProps | undefined>(undefined);

const PlanetContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [planetSelectedId, setPlanetSelectedId] = useState<string | null>("tierra");

    // Memoizar la función para evitar re-renders innecesarios
    const handleSetPlanetSelectedId = useCallback((id: string | null) => {
        setPlanetSelectedId(id);
    }, []);

    // Memoizar el valor del contexto para evitar re-renders innecesarios
    const providedValues: PlanetContextProps = useMemo(() => ({
        planetSelectedId,
        setPlanetSelectedId: handleSetPlanetSelectedId,
    }), [planetSelectedId, handleSetPlanetSelectedId]);

    return (
        <planetContext.Provider value={providedValues}>
            {children}
        </planetContext.Provider>
    );
}

export default PlanetContextProvider;