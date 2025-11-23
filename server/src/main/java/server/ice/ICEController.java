package server.ice;

import com.zeroc.Ice.Communicator;
import com.zeroc.Ice.ObjectAdapter;
import com.zeroc.Ice.Util;
import server.services.ChatManager;

public class ICEController {

    public void init(ChatManager chatManager, String[] configs) {
        try {
            // Inicializar comunicador Ice
            Communicator communicator = Util.initialize(configs);
            
            // Configurar pool de threads del servidor
            communicator.getProperties().setProperty("Ice.ThreadPool.Server.Size", "10");
            
            // Crear implementaciones de los servants
            SubjectImpl subjectImpl = new SubjectImpl();
            ChatServiceImpl chatServiceImpl = new ChatServiceImpl(chatManager, subjectImpl);
            VoiceServiceImpl voiceServiceImpl = new VoiceServiceImpl(chatManager, subjectImpl);
            
            // Crear adapter con soporte para WebSockets
            ObjectAdapter adapter = communicator.createObjectAdapterWithEndpoints(
                "ChatIceService", 
                "ws -h localhost -p 9099"
            );
            
            // Registrar los servants
            adapter.add(chatServiceImpl, Util.stringToIdentity("ChatService"));
            adapter.add(subjectImpl, Util.stringToIdentity("Subject"));
            adapter.add(voiceServiceImpl, Util.stringToIdentity("VoiceService"));

            
            // Activar adapter
            adapter.activate();
            
            System.out.println("===========================================");
            System.out.println("Ice Server started on ws://localhost:9099");
            System.out.println("ChatService: ChatService");
            System.out.println("Subject: Subject");
            System.out.println("===========================================");
            
            // Esperar indefinidamente
            communicator.waitForShutdown();
            
        } catch (Exception e) {
            System.err.println("[ICE] Error initializing Ice server: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
