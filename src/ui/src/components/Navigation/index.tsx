import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameView from "@views/GameView";
import PanelView from "@views/PanelView";
import IpcContextProvider from "@contexts/ipc";
import SocketContextProvider from "@contexts/socket";

const Navigation = () => {
    return ( 
        <BrowserRouter>
            <IpcContextProvider>
                <SocketContextProvider>
                    <Routes>
                        <Route path="/" element={<GameView />} />
                        <Route path="/panel" element={<PanelView />} />
                    </Routes>
                </SocketContextProvider>
            </IpcContextProvider>
        </BrowserRouter>
    );
}

export default Navigation;