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
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

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
            Gson gson = new Gson();
            try {
                JsonObject obj = gson.fromJson(line, JsonObject.class);
                handleJsonCommand(obj);
            } catch (Exception e) {
                send("Invalid JSON format");
            }
        }

        } catch (IOException e) {
            // ignore
        } finally {
            try { socket.close(); } catch (Exception ex) {}
            chatManager.unregister(username);
        }
    }

    private void handleJsonCommand(JsonObject obj) {
    String cmd = obj.get("command").getAsString();
    switch (cmd) {
        case "create":
            String group = obj.get("group").getAsString();
            chatManager.createGroup(group);
            send("{\"status\":\"ok\",\"message\":\"Group created: " + group + "\"}");
            break;
        case "join":
            String g = obj.get("group").getAsString();
            chatManager.joinGroup(g, username);
            send("{\"status\":\"ok\",\"message\":\"Joined group: " + g + "\"}");
            break;
        case "msg":
            String target = obj.get("to").getAsString();
            String msg = obj.get("message").getAsString();
            chatManager.sendToUser(target, username + ": " + msg);
            System.out.println("Mensaje enviado a " + target);

            send("{\"status\":\"ok\",\"message\":\"Mensaje enviado a " + target + "\"}");
            break;
        case "gmsg":
            String groupName = obj.get("group").getAsString();
            String message = obj.get("message").getAsString();
            chatManager.sendToGroup(groupName, username + ": " + message);
            send("{\"status\":\"ok\",\"message\":\"Mensaje enviado al grupo " + groupName + "\"}");
            break;
        case "listGroups":
            JsonObject response = new JsonObject();
            JsonArray groupArray = new JsonArray();

            chatManager.getGroups().forEach((grpName, members) -> {
                JsonObject gs = new JsonObject();
                gs.addProperty("name", grpName);

                JsonArray memArr = new JsonArray();
                members.forEach(member -> memArr.add(new JsonPrimitive(member)));

                gs.add("members", memArr);
                groupArray.add(gs);
            });

            response.add("groups", groupArray);
            send(response.toString());
            break;
            


        default:
            send("{\"status\":\"error\",\"message\":\"Unknown command: " + cmd + "\"}");
    }
}

    
}
