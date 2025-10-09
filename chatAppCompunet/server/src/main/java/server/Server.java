package server;

import java.io.*;
import java.net.*;
import java.util.*;
import java.util.concurrent.*;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import shared.CallInfo;

/**
 * Simple multi-threaded TCP chat server with groups and voice-note transfer via TCP.
 * Protocol:
 *  - Client connects and first line it sends is the username.
 *  - Afterwards, clients send text commands or plain messages.
 * Commands (sent as a single line starting with '/'):
 *  /create <groupName>
 *  /join <groupName>
 *  /msg <user> <message>
 *  /gmsg <group> <message>
 *  /voicenote <type:user|group> <target> <filename> <bytesLength>
 *    (after this line the client sends exactly bytesLength bytes of audio data)
 */
public class Server {
    private static final int PORT = 5000;
    private static final Map<String, ClientHandler> clients = new ConcurrentHashMap<>();
    private static final Map<String, Set<String>> groups = new ConcurrentHashMap<>();
    private static final File historyFile = new File("server_chat_history.json");
    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();

    public static void main(String[] args) throws Exception {
        System.out.println("Server starting on port " + PORT);
        ServerSocket serverSocket = new ServerSocket(PORT);
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try { serverSocket.close(); } catch (Exception e) {}
        }));

        while (true) {
            Socket s = serverSocket.accept();
            ClientHandler h = new ClientHandler(s);
            h.start();
        }
    }

    static void register(String username, ClientHandler handler) {
        clients.put(username, handler);
        broadcastSystem(username + " has joined");
    }

    static void unregister(String username) {
        clients.remove(username);
        broadcastSystem(username + " has left");
        groups.values().forEach(set -> set.remove(username));
    }

    static void createGroup(String group) {
        groups.putIfAbsent(group, ConcurrentHashMap.newKeySet());
    }

    static boolean joinGroup(String group, String user) {
        groups.putIfAbsent(group, ConcurrentHashMap.newKeySet());
        return groups.get(group).add(user);
    }

    static void broadcastSystem(String msg) {
        String out = "[SYSTEM] " + msg;
        for (ClientHandler h : clients.values()) h.send(out);
        appendHistory(new HistoryRecord("SYSTEM", "ALL", msg, null));
    }

    static void sendToUser(String user, String msg) {
        ClientHandler h = clients.get(user);
        if (h != null) {
            h.send(msg);
        }
        appendHistory(new HistoryRecord("TEXT", user, msg, null));
    }

    static void sendToGroup(String group, String msg) {
        Set<String> members = groups.get(group);
        if (members != null) {
            for (String u : members) {
                ClientHandler h = clients.get(u);
                if (h != null) h.send(msg);
            }
        }
        appendHistory(new HistoryRecord("TEXT", group, msg, null));
    }

    static void appendHistory(HistoryRecord rec) {
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


    static class ClientHandler extends Thread {
        private final Socket socket;
        private String username;
        private BufferedReader in;
        private PrintWriter out;
        private BufferedWriter writer;



        ClientHandler(Socket s) {
            this.socket = s;
        }

        void send(String msg) {
            if (out != null) {
                out.println(msg);
                out.flush();
            }
        }

        public void run() {
            try {
                in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                out = new PrintWriter(socket.getOutputStream(), true);
                writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));

                out.println("Welcome! Send your username:");
                username = in.readLine();
                if (username == null || username.isBlank()) {
                    socket.close();
                    return;
                }
                register(username, this);
                out.println("Hello " + username + ". You can use /create, /join, /msg, /gmsg, /voicenote commands.");

                String line;
                while ((line = in.readLine()) != null) {
                    if (line.isBlank()) continue;
                    if (line.startsWith("/")) handleCommand(line);
                    else {
                        broadcastSystem(username + ": " + line);
                    }
                }
            } catch (IOException e) {
                // ignore
            } finally {
                try { socket.close(); } catch (Exception ex) {}
                unregister(username);
            }
        }

        void handleCommand(String line) throws IOException {
            String[] parts = line.split(" ", 3);
            String cmd = parts[0].toLowerCase();
            switch (cmd) {
                case "/create": {
                    if (parts.length < 2) { send("Usage: /create <group>"); return; }
                    String g = parts[1];
                    createGroup(g);
                    send("Group created: " + g);
                    break;
                }
                case "/join": {
                    if (parts.length < 2) { send("Usage: /join <group>"); return; }
                    String g = parts[1];
                    joinGroup(g, username);
                    send("Joined group: " + g);
                    break;
                }
                case "/msg": {
                    if (parts.length < 3) { send("Usage: /msg <user> <message>"); return; }
                    String target = parts[1];
                    String msg = username + ": " + parts[2];
                    sendToUser(target, msg);
                    break;
                }
                case "/gmsg": {
                    if (parts.length < 3) { send("Usage: /gmsg <group> <message>"); return; }
                    String group = parts[1];
                    String msg = username + ": " + parts[2];
                    sendToGroup(group, msg);
                    break;
                }
                case "/voicenote": {
                    // /voicenote <type:user|group> <target> <filename> <bytes>
                    String[] p = line.split(" ", 5);
                    if (p.length < 5) { send("Usage: /voicenote <type> <target> <filename> <bytes>"); return; }
                    String type = p[1], target = p[2], filename = p[3]; int bytes = Integer.parseInt(p[4]);
                    InputStream is = socket.getInputStream();
                    byte[] data = is.readNBytes(bytes);
                    // save file
                    File f = new File("history_audio_" + System.currentTimeMillis() + "_" + filename);
                    try (FileOutputStream fos = new FileOutputStream(f)) { fos.write(data); }
                    String notice = "[VOICE NOTE] from " + username + " -> " + target + " saved as " + f.getName();
                    if (type.equalsIgnoreCase("user")) {
                        ClientHandler targetHandler = clients.get(target);
                        if (targetHandler != null) {
                            targetHandler.send("/voicenote user " + username + " " + filename + " " + bytes);
                            targetHandler.socket.getOutputStream().write(data);
                            targetHandler.socket.getOutputStream().flush();
                        }
                    } else {
                        Set<String> members = groups.get(target);
                        if (members != null) {
                            for (String member : members) {
                                if (member.equals(username)) continue;
                                ClientHandler h = clients.get(member);
                                if (h != null) {
                                    h.send("/voicenote group " + username + " " + filename + " " + bytes);
                                    h.socket.getOutputStream().write(data);
                                    h.socket.getOutputStream().flush();
                                }
                            }
                        }
                    }

                    appendHistory(new HistoryRecord("AUDIO", target, "voice:" + f.getName(), f.getName()));
                    System.out.println("[SERVER] Voice note from " + username + " sent to " + target);
                    break;
                }
                case "/call": {
                    if (parts.length < 2) {
                        send("Usage: /call <user>");
                        return;
                    }
                    String target = parts[1];
                    ClientHandler targetHandler = clients.get(target);
                    if (targetHandler == null) {
                        send("User not found: " + target);
                        return;
                    }

                    String ip = targetHandler.socket.getInetAddress().getHostAddress();
                    int sendPort = 6001;
                    int receivePort = 6000;


                    targetHandler.writer.write("Incoming call from " + username + ":" + ip + ":" + sendPort + ":" + receivePort);
                    targetHandler.writer.newLine();
                    targetHandler.writer.flush();

                    writer.write(ip+ ":"+sendPort+ ":"+receivePort);
                    writer.newLine();
                    writer.flush();
                    break;
                }
                case "/gcall": {
                    if (parts.length < 2) {
                        send("Usage: /gcall <group>");
                        return;
                    }
                    String groupName = parts[1];
                    Set<String> members = groups.get(groupName);
                    if (members == null || members.isEmpty()) {
                        send("Group not found or empty: " + groupName);
                        return;
                    }

                    List<CallInfo> infos = new ArrayList<>();
                    for (String member : members) {
                        if (member.equals(username)) continue;
                        ClientHandler h = clients.get(member);
                        if (h != null) {
                            String ip = h.socket.getInetAddress().getHostAddress();
                            int sendPort = 6001;
                            int receivePort = 6000;
                            infos.add(new CallInfo(ip, sendPort, receivePort));

                            h.send("Incoming group call from " + username + " in group " + groupName);
                        }
                    }

                    String jsonList = new Gson().toJson(infos);
                    send(jsonList);
                    break;
                }
                default: send("Unknown command: " + cmd); break;
            }
        }
    }

    static class HistoryRecord {
        String type; // TEXT / AUDIO / SYSTEM
        String target; // user or group or ALL
        String content; // text or audio filename marker
        String audioFile; // optional
        long timestamp = System.currentTimeMillis();

        HistoryRecord(String type, String target, String content, String audioFile) {
            this.type = type; this.target = target; this.content = content; this.audioFile = audioFile;
        }
    }
}
