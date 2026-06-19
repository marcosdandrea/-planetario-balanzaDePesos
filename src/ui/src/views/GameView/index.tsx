import React from "react";
import AspectRatio from "@components/AspectRatio";
import ScaleValueContextProvider from "@contexts/scaleValue";
import GameContextProvider from "@contexts/game";
import PlanetContextProvider from "@contexts/planet";
import ScaleSocketManager from "@components/ScaleSocketManager";
import Game from "./components/Game";

const GameView = () => {
    return (
        <AspectRatio aspectRatio={9 / 16} aspectRatioString="9:16">
            {/* GameContext: Para sprites y carga de assets */}
            <GameContextProvider>
                {/* PlanetContext: AISLADO - Solo para selección de planetas */}
                <PlanetContextProvider>
                    {/* ScaleValueContext: AISLADO - Solo para valor de balanza */}
                    <ScaleValueContextProvider>
                        <ScaleSocketManager>
                            <Game/>
                        </ScaleSocketManager>
                    </ScaleValueContextProvider>
                </PlanetContextProvider>
            </GameContextProvider>
        </AspectRatio>
    );
}

export default GameView;