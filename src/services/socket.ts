import SockJS from "sockjs-client";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";

let stompClient: Client | null = null;
let isConnected = false;
let pendingSubscribes: (() => void)[] = [];

const WS_URL = "http://localhost:8080/ws";

export const connectWebSocket = () => {
    if (stompClient) return stompClient;

    stompClient = new Client({
        webSocketFactory: () => new SockJS(WS_URL) as any,
        reconnectDelay: 5000,

        onConnect: () => {
            console.log("WebSocket connected");

            isConnected = true;

            pendingSubscribes.forEach((callback) => callback());
            pendingSubscribes = [];
        },

        onDisconnect: () => {
            console.log("WebSocket disconnected");
            isConnected = false;
        },

        onStompError: (frame) => {
            console.error("STOMP error:", frame);
        },

        onWebSocketClose: () => {
            console.warn("WebSocket closed");
            isConnected = false;
        }
    });

    stompClient.activate();

    return stompClient;
};

const subscribeWhenConnected = (
    callback: () => StompSubscription
): (() => void) => {
    connectWebSocket();

    let subscription: StompSubscription | null = null;
    let unsubscribed = false;

    const doSubscribe = () => {
        if (unsubscribed || !stompClient || !isConnected) return;
        subscription = callback();
    };

    if (isConnected) {
        doSubscribe();
    } else {
        pendingSubscribes.push(doSubscribe);
    }

    return () => {
        unsubscribed = true;
        pendingSubscribes = pendingSubscribes.filter((item) => item !== doSubscribe);
        subscription?.unsubscribe();
        subscription = null;
    };
};

export const subscribeDonate = (
    streamerId: number,
    onMessage: (data: any) => void
): (() => void) => {
    return subscribeWhenConnected(() => {
        return stompClient!.subscribe(
            `/topic/donate/${streamerId}`,
            (message: IMessage) => {
                const body = JSON.parse(message.body);
                onMessage(body);
            }
        );
    });
};

export const subscribePayment = (
    donationId: number,
    onSuccess: (data: any) => void
): (() => void) => {
    console.log(donationId)
    return subscribeWhenConnected(() => {
        return stompClient!.subscribe(
            `/topic/payment/${donationId}`,
            (message: IMessage) => {
                const body = JSON.parse(message.body);

                if (body.status === "SUCCESS") {
                    onSuccess(body);
                }
            }
        );
    });
};

export const disconnectWebSocket = () => {
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
        isConnected = false;
        pendingSubscribes = [];
    }
};
