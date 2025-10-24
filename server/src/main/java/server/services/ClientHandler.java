package server.services;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import com.google.gson.Gson;

import server.model.HistoryRecord;
import shared.CallInfo;

public class ClientHandler extends Thread{

    private final Socket socket;
    private String username;
    private BufferedReader in;
    private PrintWriter out;
    private BufferedWriter writer;
    private ChatManager chatManager;

    public ClientHandler(Socket s, ChatManager chatManager) {
        this.socket = s;
        this.chatManager = chatManager;
    }

    public void send(String msg) {
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
            chatManager.register(username, this);
            out.println("Hello " + username + ". You can use /create, /join, /msg, /gmsg, /voicenote commands.");

            String line;
            while ((line = in.readLine()) != null) {
                if (line.isBlank()) continue;
                if (line.startsWith("/")) handleCommand(line);
                else {
                    chatManager.broadcastSystem(username + ": " + line);
                }
            }
        } catch (IOException e) {
            // ignore
        } finally {
            try { socket.close(); } catch (Exception ex) {}
            chatManager.unregister(username);
        }
    }

    private void handleCommand(String line) throws IOException {
        String[] parts = line.split(" ", 3);
        String cmd = parts[0].toLowerCase();
        switch (cmd) {
            case "/create": {
                if (parts.length < 2) { send("Usage: /create <group>"); return; }
                String g = parts[1];
                chatManager.createGroup(g);
                send("Group created: " + g);
                break;
            }
            case "/join": {
                if (parts.length < 2) { send("Usage: /join <group>"); return; }
                String g = parts[1];
                chatManager.joinGroup(g, username);
                send("Joined group: " + g);
                break;
            }
            case "/msg": {
                    if (parts.length < 3) { send("Usage: /msg <user> <message>"); return; }
                    String target = parts[1];
                    String msg = username + ": " + parts[2];
                    chatManager.sendToUser(target, msg);
                    break;
                }
            case "/gmsg": {
                    if (parts.length < 3) { send("Usage: /gmsg <group> <message>"); return; }
                    String group = parts[1];
                    String msg = username + ": " + parts[2];
                    chatManager.sendToGroup(group, msg);
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
                        ClientHandler targetHandler = chatManager.getClients().get(target);
                        if (targetHandler != null) {
                            targetHandler.send("/voicenote user " + username + " " + filename + " " + bytes);
                            targetHandler.socket.getOutputStream().write(data);
                            targetHandler.socket.getOutputStream().flush();
                        }
                    } else {
                        Set<String> members = chatManager.getGroups().get(target);
                        if (members != null) {
                            for (String member : members) {
                                if (member.equals(username)) continue;
                                ClientHandler h = chatManager.getClients().get(member);
                                if (h != null) {
                                    h.send("/voicenote group " + username + " " + filename + " " + bytes);
                                    h.socket.getOutputStream().write(data);
                                    h.socket.getOutputStream().flush();
                                }
                            }
                        }
                    }

                    chatManager.appendHistory(new HistoryRecord("AUDIO", target, "voice:" + f.getName(), f.getName()));
                    System.out.println("[SERVER] Voice note from " + username + " sent to " + target);
                    break;
                }
            case "/call": {
                    if (parts.length < 2) {
                        send("Usage: /call <user>");
                        return;
                    }
                    String target = parts[1];
                    ClientHandler targetHandler = chatManager.getClients().get(target);
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

                    writer.write("/callok:"+ip+ ":"+sendPort+ ":"+receivePort);
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
                    Set<String> members = chatManager.getGroups().get(groupName);
                    if (members == null || members.isEmpty()) {
                        send("Group not found or empty: " + groupName);
                        return;
                    }

                    List<CallInfo> infos = new ArrayList<>();
                    for (String member : members) {
                        if (member.equals(username)) continue;
                        ClientHandler h = chatManager.getClients().get(member);
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
