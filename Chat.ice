module Chat {

    sequence<byte> AudioBytes;

    //Estructura para representar un fragmento de llamada
    struct CallChunk {
        string from;
        string to;
        long seq;
        AudioBytes data;
        long timestamp;
    }
    
    // Estructura para representar un mensaje
    struct MessageDTO {
        string from;
        string to;
        string group;
        string message;
        string timestamp;
        string messageType; // "text", "voicenote"
        AudioBytes audio;
    }

    // Estructura para representar un usuario
    struct UserDTO {
        string username;
        bool online;
    }

    // Estructura para representar un grupo
    struct GroupDTO {
        string name;
        string description;
    }

    // Secuencias (arrays)
    sequence<MessageDTO> MessageList;
    sequence<UserDTO> UserList;
    sequence<GroupDTO> GroupList;

    // Interfaz principal del servicio de Chat
    interface ChatService {
        // Gestión de grupos
        bool createGroup(string groupName, string creator);
        bool joinGroup(string groupName, string username);
        GroupList getGroups();
        
        // Envío de mensajes
        bool sendMessage(string from, string to, string message);
        bool sendGroupMessage(string from, string group, string message);
        
        // Historial
        MessageList getHistory();
        
        // Usuarios conectados
        UserList getConnectedUsers();
        
        // Registro de usuario
        bool registerUser(string username);
    }

    // Interfaz Observer para recibir notificaciones en tiempo real
    interface Observer {
        void notifyNewMessage(MessageDTO msg);
        void notifyUserConnected(string username);
        void notifyUserDisconnected(string username);
        void notifyGroupCreated(GroupDTO group);

        void notifyCallChunk(CallChunk chunk); // cliente recibe chunks
        void notifyCallStarted(string from, string to);
        void notifyCallStopped(string from, string to);
    }

    // Interfaz Subject para gestionar observers
    interface Subject {
        void attachObserver(Observer* obs);
        void detachObserver(Observer* obs);
    }

    // Interfaz para manejo de audio/voz
    interface VoiceService {
        bool sendVoiceNote(string from, string to, string group, AudioBytes audioData);

        // Llamada en tiempo real (chunks)
        void startCall(string from, string to);
        void stopCall(string from, string to);
        void sendCallChunk(CallChunk chunk); // fire-and-forget
    }
}
