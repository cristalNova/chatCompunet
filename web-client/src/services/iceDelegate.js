// IceDelegate.js - Maneja la conexión Ice y las llamadas RPC

import Subscriber from './subscriber.js';

export class IceDelegate {
    constructor() {
        this.communicator = Ice.initialize();
        this.chatService = null;
        this.subject = null;
        this.subscriber = new Subscriber(this);
        this.callbacks = [];
        this.currentUser = null;
    }

    async init(username) {
        if (this.chatService) {
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
}

// Instancia singleton
const iceDelegate = new IceDelegate();
export default iceDelegate;
