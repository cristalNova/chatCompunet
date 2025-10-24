package server.services;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.Reader;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import server.model.HistoryRecord;

public class ChatManager {

    private Map<String, ClientHandler> clients = new ConcurrentHashMap<>();
    private Map<String, Set<String>> groups = new ConcurrentHashMap<>();
    private static final File historyFile = new File("server_chat_history.json");
    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();

    public Map<String, ClientHandler> getClients() {
        return clients;
    }

    public Map<String, Set<String>> getGroups() {
        return groups;
    }

    public void register(String username, ClientHandler handler) {
        clients.put(username, handler);
        broadcastSystem(username + " has joined");
    }

    public void unregister(String username) {
        clients.remove(username);
        broadcastSystem(username + " has left");
        groups.values().forEach(set -> set.remove(username));
    }

    public void createGroup(String group) {
        groups.putIfAbsent(group, ConcurrentHashMap.newKeySet());
    }

    public boolean joinGroup(String group, String user) {
        groups.putIfAbsent(group, ConcurrentHashMap.newKeySet());
        return groups.get(group).add(user);
    }

    public void broadcastSystem(String msg) {
        String out = "[SYSTEM] " + msg;
        for (ClientHandler h : clients.values()) h.send(out);
        appendHistory(new HistoryRecord("SYSTEM", "ALL", msg, null));
    }

    public void sendToUser(String user, String msg) {
        ClientHandler h = clients.get(user);
        if (h != null) {
            h.send(msg);
        }
        appendHistory(new HistoryRecord("TEXT", user, msg, null));
    }

    public void sendToGroup(String group, String msg) {
        Set<String> members = groups.get(group);
        if (members != null) {
            for (String u : members) {
                ClientHandler h = clients.get(u);
                if (h != null) h.send(msg);
            }
        }
        appendHistory(new HistoryRecord("TEXT", group, msg, null));
    }

    public void appendHistory(HistoryRecord rec) {
        try {
            List<HistoryRecord> list = new ArrayList<>();
            if (historyFile.exists()) {
                try (Reader r = new FileReader(historyFile)) {
                    HistoryRecord[] arr = gson.fromJson(r, HistoryRecord[].class);
                    if (arr != null) list.addAll(Arrays.asList(arr));
                }
            }
            list.add(rec);
            try (Writer w = new FileWriter(historyFile)) {
                gson.toJson(list, w);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
}
