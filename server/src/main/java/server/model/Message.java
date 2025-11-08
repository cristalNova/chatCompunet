package server.model;

public class Message {

    private User sender;
    private String content;
    private MessageType type; 
    private byte[] audioData;
    private long timestamp = System.currentTimeMillis();

    
    public Message(User sender, String content, MessageType type, Long timestamp) {
        this.sender = sender;
        this.content = content;
        this.type = type;
        this.audioData = null;
        this.timestamp = timestamp;
    }

    public Message(User sender, String content, MessageType type, byte[] audioData, Long timestamp) {
        this.sender = sender;
        this.content = content;
        this.type = type;
        this.audioData = audioData;
        this.timestamp = timestamp;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }

    public byte[] getAudioData() {
        return audioData;
    }

    public void setAudioData(byte[] audioData) {
        this.audioData = audioData;
    }    
    
}
