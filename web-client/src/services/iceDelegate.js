// IceDelegate.js - Maneja la conexión Ice y las llamadas RPC

import ContactSideBar from '../components/ContactSideBar.js';
import Subscriber from './subscriber.js';

export class IceDelegate {
    constructor() {
        this.communicator = Ice.initialize();
        this.chatService = null;
        this.subject = null;
        this.subscriber = new Subscriber(this);
        this.callbacks = [];
        this.currentUser = null;  
        this.voiceService = null;    
        this.callCallbacks = {
            onChunk: [],
            onStart: [],
            onStop: []
        };  
    }


    async init(username) {
        if (this.chatService) {
            return; // Ya inicializado
        }

        if (this.voiceService) {
            return; // Ya inicializado
        }

        try {
            console.log('[Ice] Connecting to Ice server...');
            this.currentUser = username;

            const hostname = 'localhost';
            const port = 9099;

            // Conectar al ChatService
            const chatServiceProxy = this.communicator.stringToProxy(
                `ChatService:ws -h ${hostname} -p ${port}`
            );
            this.chatService = Chat.ChatServicePrx.uncheckedCast(chatServiceProxy);

            console.log('[Ice] ChatService proxy created:', this.chatService);


            const baseVoice = this.communicator.stringToProxy(
                `VoiceService:ws -h ${hostname} -p ${port}`
            );
            console.log("Base proxy voiceService:", baseVoice);

            this.voiceService = Chat.VoiceServicePrx.uncheckedCast(baseVoice);
            console.log("VoiceService proxy:", this.voiceService);



            // Conectar al Subject para callbacks
            const subjectProxy = this.communicator.stringToProxy(
                `Subject:ws -h ${hostname} -p ${port}`
            );
            this.subject = Chat.SubjectPrx.uncheckedCast(subjectProxy);

            console.log('[Ice] Subject proxy created:', this.subject);

            // Configurar callbacks bidireccionales
            console.log('[Ice] Setting up bidirectional callbacks...');
            const adapter = await this.communicator.createObjectAdapter('');
            
            // Obtener la conexión y asociar el adapter
            const connection = await this.subject.ice_getConnection();
            connection.setAdapter(adapter);
            
            // Crear el proxy del Observer y registrarlo
            const observerProxy = Chat.ObserverPrx.uncheckedCast(
                adapter.addWithUUID(this.subscriber)
            );
            
            console.log('[Ice] Attaching observer to subject...');
            await this.subject.attachObserver(observerProxy);
            console.log('[Ice] Observer attached successfully');

            // Registrar usuario en el servidor
            console.log('[Ice] Registering user:', username);
            const result = await this.chatService.registerUser(username);
            console.log('[Ice] Register result:', result);

            console.log('[Ice] Successfully connected to Ice server with callbacks enabled');
            return true;

        } catch (error) {
            console.error('[Ice] Error connecting to Ice server:', error);
            throw error;
        }
    }

    // ========== Métodos de ChatService ==========

    async createGroup(groupName) {
        if (!this.chatService) {
            throw new Error('Ice not initialized');
        }
        console.log('[Ice] Creating group:', groupName);
        return await this.chatService.createGroup(groupName, this.currentUser);
    }

    async joinGroup(groupName) {
        if (!this.chatService) {
            throw new Error('Ice not initialized');
        }
        console.log('[Ice] Joining group:', groupName);
        return await this.chatService.joinGroup(groupName, this.currentUser);
    }

    async getGroups() {
        if (!this.chatService) {
            throw new Error('Ice not initialized');
        }
        console.log('[Ice] Getting groups list');
        return await this.chatService.getGroups();
    }

    async sendMessage(to, message) {
        if (!this.chatService) {
            throw new Error('Ice not initialized');
        }
        console.log('[Ice] Sending message to:', to);
        return await this.chatService.sendMessage(this.currentUser, to, message);
    }

    async sendGroupMessage(group, message) {
        if (!this.chatService) {
            throw new Error('Ice not initialized');
        }
        console.log('[Ice] Sending group message to:', group);
        return await this.chatService.sendGroupMessage(this.currentUser, group, message);
    }

    async getHistory() {
        if (!this.chatService) {
            throw new Error('Ice not initialized');
        }
        console.log('[Ice] Getting message history');
        return await this.chatService.getHistory();
    }

    async getConnectedUsers() {
        if (!this.chatService) {
            throw new Error('Ice not initialized');
        }
        console.log('[Ice] Getting connected users');
        return await this.chatService.getConnectedUsers();
    }

    // ========== Callbacks desde Observer ==========

    handleNewMessage(msg) {
        console.log('[Ice] Message received via callback:', msg);
        this.callbacks.forEach(callback => {
            if (callback.onMessage) {
                callback.onMessage(msg);
            }
        });
    }

    handleUserConnected(username) {
        console.log('[Ice] User connected via callback:', username);
        this.callbacks.forEach(callback => {
            if (callback.onUserConnected) {
                callback.onUserConnected(username);
            }
        });
    }

    handleUserDisconnected(username) {
        console.log('[Ice] User disconnected via callback:', username);
        this.callbacks.forEach(callback => {
            if (callback.onUserDisconnected) {
                callback.onUserDisconnected(username);
            }
        });
    }

    handleGroupCreated(group) {
        console.log('[Ice] Group created via callback:', group);
        this.callbacks.forEach(callback => {
            if (callback.onGroupCreated) {
                callback.onGroupCreated(group);
            }
        });
    }

    // ========== VoiceService ==========

    async startCall(from, to) {
        return await this.voiceService.startCall(from, to);
    }

    async stopCall(from, to) {
        return await this.voiceService.stopCall(from, to);
    }

    async sendCallChunk(chunkData) {
        if (!this.voiceService) {
            throw new Error('VoiceService not initialized');
        }

        // Crear instancia de CallChunk correctamente
        const chunk = new Chat.CallChunk();
        chunk.from = chunkData.from;
        chunk.to = chunkData.to;
        chunk.seq = chunkData.seq;
        chunk.data = chunkData.data;        
        chunk.timestamp = chunkData.timestamp;

        console.log(`[Ice] Enviando chunk: seq=${chunk.seq}, bytes=${chunk.data.length}`);
        
        return await this.voiceService.sendCallChunk(chunk);
    }

    // ========== DISPATCH desde Subscriber ==========

    dispatchChunk(uint8Array) {
        this.callCallbacks.onChunk.forEach(cb => cb(uint8Array));
    }

    dispatchCallStart(from, to) {
        this.callCallbacks.onStart.forEach(cb => cb(from, to));
    }

    dispatchCallStop(from, to) {
        this.callCallbacks.onStop.forEach(cb => cb(from, to));
    }

    // ========== REGISTRO DE CALLBACKS ==========

    onCallChunk(cb) {
        this.callCallbacks.onChunk.push(cb);
    }

    onCallStart(cb) {
        this.callCallbacks.onStart.push(cb);
    }

    onCallStop(cb) {
        this.callCallbacks.onStop.push(cb);
    }

    // ========== Suscripción a eventos ==========

    subscribe(callback) {
        this.callbacks.push(callback);
    }

    unsubscribe(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
        }
    }

    setupAudioPlayer() {
        // Solo se llama una vez
        if (this._audioSetupDone) return;
        this._audioSetupDone = true;

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });

        const convertPCM16ToFloat32 = (bytes) => {
            const view = new DataView(bytes.buffer);
            const out = new Float32Array(bytes.length / 2);
            for (let i = 0; i < out.length; i++) {
                out[i] = view.getInt16(i * 2, true) / 32768;
            }
            return out;
        };

        const playPCM = (floatArray) => {
            const buffer = audioCtx.createBuffer(1, floatArray.length, 44100);
            buffer.copyToChannel(floatArray, 0);
            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start();
        };

        this.onCallChunk((bytes) => {
            const float = convertPCM16ToFloat32(bytes);
            playPCM(float);
        });
    }

}

// Instancia singleton
const iceDelegate = new IceDelegate();
export default iceDelegate;
