import Ice from "ice";
import ChatApp from "./generated/ChatApp.js";

let communicator = null;
let audioPrx = null;
let adapter = null;
let observerPrx = null;

export async function initAudioICE(username, onNewAudioCallback) {
    communicator = Ice.initialize();

    // Debe coincidir con tu backend Java
    const base = communicator.stringToProxy("AudioService:ws -h localhost -p 10000");
    audioPrx = await ChatApp.ChatApp.AudioServicePrx.checkedCast(base);

    // crear observer
    adapter = communicator.createObjectAdapter("");
    const observer = new AudioObserver(onNewAudioCallback);
    observerPrx = ChatApp.ChatApp.AudioObserverPrx.uncheckedCast(
        adapter.add(observer)
    );
    adapter.activate();

    // registrar observer con el server ICE
    await audioPrx.subscribe(observerPrx, username);

    console.log("🎧 ICE Audio conectado OK");
}

class AudioObserver extends ChatApp.ChatApp.AudioObserver {
    constructor(callback) {
        super();
        this.callback = callback;
    }

    async onNewAudio(from, to, isGroup, base64) {
        this.callback({ from, to, isGroup, base64 });
    }
}

// enviar audio a Java
export async function sendAudioICE({ from, to, isGroup, base64 }) {
    if (!audioPrx) {
        console.error("AudioService no inicializado");
        return;
    }

    await audioPrx.sendAudio(from, to, isGroup, base64);
}

