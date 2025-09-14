/// <reference types="vite/client" />

declare global {
    interface Window {
        searchWebSocket: WebSocket | null;
    }
}

export { };
