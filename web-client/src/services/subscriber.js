// Subscriber.js - Implementa Observer para recibir notificaciones del servidor

export default class Subscriber extends Chat.Observer {
    constructor(delegate) {
        super();
        this.delegate = delegate;
    }

    // Callback cuando llega un nuevo mensaje
    notifyNewMessage(msg, current) {
        console.log('[Ice Observer] New message received:', msg);
        this.delegate.handleNewMessage(msg);
    }

    // Callback cuando un usuario se conecta
    notifyUserConnected(username, current) {
        console.log('[Ice Observer] User connected:', username);
        this.delegate.handleUserConnected(username);
    }

    // Callback cuando un usuario se desconecta
    notifyUserDisconnected(username, current) {
        console.log('[Ice Observer] User disconnected:', username);
        this.delegate.handleUserDisconnected(username);
    }

    // Callback cuando se crea un grupo
    notifyGroupCreated(group, current) {
        console.log('[Ice Observer] Group created:', group);
        this.delegate.handleGroupCreated(group);
    }

    notifyCallStarted(from, to, current) {
        console.log("[Ice Observer] CALL STARTED", from, to);
        this.delegate.dispatchCallStart(from, to);
    }

    notifyCallStopped(from, to, current) {
        console.log("[Ice Observer] CALL STOPPED", from, to);
        this.delegate.dispatchCallStop(from, to);
    }

    // Subscriber.js
    notifyCallChunk(chunk, current) {
        console.log("[Ice Observer] Chunk recibido:", chunk);

        // Verificar que el chunk tenga datos
        if (!chunk || !chunk.data || chunk.data.length === 0) {
            console.warn("Chunk invalido o vacio:", chunk);
            return;
        }

        // El campo correcto es 'data', no 'audioData'
        this.delegate.dispatchChunk(chunk.data);
    }
}
