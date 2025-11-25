package server.ice;

import com.zeroc.Ice.Current;
import Chat.*;
import server.services.ChatManager;

import java.util.ArrayList;
import java.util.List;

public class SubjectImpl implements Subject {
    
    private List<ObserverPrx> observers;
    private ChatManager chatManager;

    public SubjectImpl() {
        this.observers = new ArrayList<>();
    }

    @Override
    public void attachObserver(ObserverPrx obs, Current current) {
        System.out.println("[ICE] New observer connected: " + obs.ice_getIdentity());
        
        // Fijar el proxy a la conexión actual para callbacks bidireccionales
        ObserverPrx proxy = (ObserverPrx) obs.ice_fixed(current.con);
        observers.add(proxy);

        // Configurar callback cuando se cierre la conexión
        if (current.con != null) {
            current.con.setCloseCallback(connection -> {
                System.out.println("[ICE] Connection closed, removing observer: " + obs.ice_getIdentity());
                observers.remove(proxy);
                String username = proxy.ice_getIdentity().name;
                notifyUserDisconnected(username);
            });
        }
    }

    @Override
    public void detachObserver(ObserverPrx obs, Current current) {
        observers.remove(obs);
        System.out.println("[ICE] Observer detached: " + obs.ice_getIdentity());
    }

    // Métodos para notificar a todos los observers
    public void notifyNewMessage(MessageDTO msg) {
        List<ObserverPrx> disconnected = new ArrayList<>();
        
        for (ObserverPrx observer : observers) {
            try {
                observer.notifyNewMessage(msg);
            } catch (Exception e) {
                System.err.println("[ICE] Error notifying observer: " + e.getMessage());
                disconnected.add(observer);
            }
        }
        
        // Remover observers desconectados
        observers.removeAll(disconnected);
    }

    public void notifyUserConnected(String username) {
        List<ObserverPrx> disconnected = new ArrayList<>();
        
        for (ObserverPrx observer : observers) {
            try {
                observer.notifyUserConnected(username);
            } catch (Exception e) {
                System.err.println("[ICE] Error notifying observer: " + e.getMessage());
                disconnected.add(observer);
            }
        }
        
        observers.removeAll(disconnected);
    }

    public void notifyUserDisconnected(String username) {
        List<ObserverPrx> disconnected = new ArrayList<>();
        
        for (ObserverPrx observer : observers) {
            try {
                observer.notifyUserDisconnected(username);
            } catch (Exception e) {
                System.err.println("[ICE] Error notifying observer: " + e.getMessage());
                disconnected.add(observer);
            }
        }
        
        observers.removeAll(disconnected);
    }

    public void notifyGroupCreated(GroupDTO group) {
        List<ObserverPrx> disconnected = new ArrayList<>();
        
        for (ObserverPrx observer : observers) {
            try {
                observer.notifyGroupCreated(group);
            } catch (Exception e) {
                System.err.println("[ICE] Error notifying observer: " + e.getMessage());
                disconnected.add(observer);
            }
        }
        
        observers.removeAll(disconnected);
    }

    public void notifyCallStarted(String from, String to) {
        for (ObserverPrx obs : observers) {
            obs.notifyCallStartedAsync(from, to);
        }
    }

    public void notifyCallStopped(String from, String to) {
        for (ObserverPrx obs : observers) {
            obs.notifyCallStoppedAsync(from, to);
        }
    }

    public void notifyCallChunk(CallChunk chunk) {
        for (ObserverPrx obs : observers) {
            obs.notifyCallChunkAsync(chunk);
        }
    }
}
