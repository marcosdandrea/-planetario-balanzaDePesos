import React from "react";
import AspectRatio from "@components/AspectRatio";
import ScaleContextProvider from "@contexts/scale";
import GameContextProvider from "@contexts/game";
import Game from "./components/Game";

const GameView = () => {
    return (
        <AspectRatio aspectRatio={9 / 16} aspectRatioString="9:16">
            <GameContextProvider>
                <ScaleContextProvider>
                    <Game/>
                </ScaleContextProvider>
            </GameContextProvider>
        </AspectRatio>
    );
}

export default GameView;