package server.ice;

import com.zeroc.Ice.Current;
import Chat.*;
import server.services.ChatManager;
import server.model.Message;
import server.model.User;
import server.model.HistoryRecord;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ChatServiceImpl implements ChatService {
    
    private final ChatManager chatManager;
    private final SubjectImpl subject;
    private final List<MessageDTO> messageHistory; // Historial en memoria
    
    public ChatServiceImpl(ChatManager chatManager, SubjectImpl subject) {
        this.chatManager = chatManager;
        this.subject = subject;
        this.messageHistory = new ArrayList<>();
    }

    @Override
    public boolean createGroup(String groupName, String creator, Current current) {
        System.out.println("[ICE] Creating group: " + groupName + " by " + creator);
        chatManager.createGroup(groupName);
        
        // Notificar a todos los observers
        GroupDTO groupDTO = new GroupDTO(groupName, "Created by " + creator);
        subject.notifyGroupCreated(groupDTO);
        
        return true;
    }

    @Override
    public boolean joinGroup(String groupName, String username, Current current) {
        System.out.println("[ICE] User " + username + " joining group: " + groupName);
        return chatManager.joinGroup(groupName, username);
    }

    @Override
    public GroupDTO[] getGroups(Current current) {
        System.out.println("[ICE] Getting groups list");
        var groups = chatManager.getGroups();
        
        return groups.entrySet().stream()
            .map(entry -> {
                String groupName = entry.getKey();
                var members = entry.getValue();
                String desc = "Members: " + String.join(", ", members);
                return new GroupDTO(groupName, desc);
            })
            .toArray(GroupDTO[]::new);
    }

    @Override
    public boolean sendMessage(String from, String to, String message, Current current) {
        System.out.println("[ICE] Sending message from " + from + " to " + to);
        
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        MessageDTO messageDTO = new MessageDTO(from, to, "", message, timestamp, "text");
        
        // Guardar en historial
        messageHistory.add(messageDTO);
        
        // Notificar a los observers
        subject.notifyNewMessage(messageDTO);
        
        // Enviar a usuario específico
        chatManager.sendToUser(to, from + ": " + message);
        
        return true;
    }

    @Override
    public boolean sendGroupMessage(String from, String group, String message, Current current) {
        System.out.println("[ICE] Sending group message from " + from + " to group " + group);
        
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        MessageDTO messageDTO = new MessageDTO(from, "", group, message, timestamp, "text");
        
        // Guardar en historial
        messageHistory.add(messageDTO);
        
        // Notificar a los observers
        subject.notifyNewMessage(messageDTO);
        
        // Enviar al grupo
        chatManager.sendToGroup(group, from + ": " + message);
        
        return true;
    }

    @Override
    public MessageDTO[] getHistory(Current current) {
        System.out.println("[ICE] Getting message history");
        return messageHistory.toArray(new MessageDTO[0]);
    }

    @Override
    public UserDTO[] getConnectedUsers(Current current) {
        System.out.println("[ICE] Getting connected users");
        var clients = chatManager.getClients();
        
        return clients.keySet().stream()
            .map(username -> new UserDTO(username, true))
            .toArray(UserDTO[]::new);
    }

    @Override
    public boolean registerUser(String username, Current current) {
        System.out.println("[ICE] Registering user: " + username);
        
        // Notificar a todos que un nuevo usuario se conectó
        subject.notifyUserConnected(username);
        
        return true;
    }
}
