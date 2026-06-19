import { Socket } from "socket.io";
import { scaleListeners } from "./scale.listener";

export const appListeners = (socket: Socket | Error) => {
    if (socket instanceof Error) {
        console.error("Socket connection error:", socket.message);
        return;
    }
    
    // Registrar listeners de la balanza
    scaleListeners(socket);

    socket.on('ping', () => {
        console.log ('Received ping from client');
    });

    // Aquí puedes agregar lógica adicional para manejar la comunicación IPC
}