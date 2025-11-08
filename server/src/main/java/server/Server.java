package server;

import java.io.*;
import java.net.*;
import java.util.*;
import java.util.concurrent.*;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import shared.CallInfo;
import server.model.HistoryRecord;
import server.services.*;

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
    private static final ChatManager chatManager = new ChatManager();

    public static void main(String[] args) throws Exception {
        System.out.println("Server starting on port " + PORT);
        ServerSocket serverSocket = new ServerSocket(PORT);

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try { 
                serverSocket.close(); 
            } catch (Exception e) {}
        }));

        while (true) {
            Socket s = serverSocket.accept();
            ClientHandler h = new ClientHandler(s,chatManager);
            h.start();
        }
    }

}
