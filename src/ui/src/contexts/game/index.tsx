import React, { createContext, useState } from "react";

type sprite = {
    id: string;
    src: string;
    loaded: boolean;
}

type GameContextType = {
    sprites: Record<string, sprite> | null;
    addSprite: (newSprite: sprite) => void;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

const GameContextProvider = ({ children }) => {
    const [sprites, setSprites] = useState<any>(null);

    const addSprite = (newSprite: sprite) => {
        setSprites((prevSprites: Record<string, sprite> | null) => {
            if (prevSprites) {
                return {
                    ...prevSprites,
                    [newSprite.id]: newSprite
                }
            } else {
                return {
                    [newSprite.id]: newSprite
                }
            }
        })
    }

    return (
        <GameContext.Provider value={{ sprites, addSprite }}>
            {children}
        </GameContext.Provider>
    );
}
 

export default GameContextProvider;
