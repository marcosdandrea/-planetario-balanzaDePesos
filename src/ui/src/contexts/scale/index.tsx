import React, { useState } from "react";
import { createContext } from "react";

type ScaleContextProps = {
    planetSelectedId: string | null;
    setPlanetSelectedId?: (id: string | null) => void;
}

export const scaleContext = createContext<ScaleContextProps | undefined>(undefined);

const ScaleContextProvider = ({ children }) => {
    const [planetSelectedId, setPlanetSelectedId] = useState<string | null>(null);


    const providedValues: ScaleContextProps = {
        planetSelectedId,
        setPlanetSelectedId,
    };

    return (
        <scaleContext.Provider value={providedValues}>
            {children}
        </scaleContext.Provider>
    );
}
 
export default ScaleContextProvider;