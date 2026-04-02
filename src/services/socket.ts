import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export const connectSocket = (streamerId : number,onMessage :  any) =>{
    const socket = new SockJS("http://localhost:8080/ws");

    const stompClient = new Client({
        webSocketFactory : () => socket as any,
        debug : () => {},
        onConnect : () => {
            stompClient.subscribe(
                `/topic/donate/${streamerId}`,
                (message : any) => {
                    const body = JSON.parse(message.body);
                    onMessage(body);
                }
            )
        }

    })
    stompClient.activate();
}
