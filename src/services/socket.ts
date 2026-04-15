import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";

export const connectSocket = (
    streamerId: number,
    onMessage: (data: any) => void
) => {
    const socket = new SockJS("http://localhost:8080/ws");


    const stompClient = new Client({
        webSocketFactory: () => socket as any,

        reconnectDelay: 5000,

        onConnect: () => {
            const subscription = stompClient.subscribe(
                `/topic/donate/${streamerId}`,
                (message: IMessage) => {
                    const body = JSON.parse(message.body);
                    onMessage(body);
                }
            );

            console.log(streamerId)

            stompClient.onDisconnect = () => {
                subscription.unsubscribe();
            };
        },

        onStompError: (frame) => {
            console.error("STOMP error:", frame);
        },

        onWebSocketClose: () => {
            console.warn("WebSocket closed");
        }
    });

    stompClient.activate();

    return () => {
        stompClient.deactivate();
    };
};