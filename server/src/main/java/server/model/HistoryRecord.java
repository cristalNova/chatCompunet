package server.model;

public class HistoryRecord {
    private String type; // TEXT / AUDIO / SYSTEM
    private String target; // user or group or ALL
    private String content; // text or audio filename marker
    private byte[] audioFile; // optional
    private long timestamp = System.currentTimeMillis();

    public HistoryRecord(String type, String target, String content, byte[] audioFile) {
        this.type = type; 
        this.target = target; 
        this.content = content; 
        this.audioFile = audioFile;
    }

    public String getType() {
        return type;
    }

    public String getTarget() {
        return target;
    }

    public String getContent() {
        return content;
    }

    public byte[] getAudioFile() {
        return audioFile;
    }

    public long getTimestamp() {
        return timestamp;
    }

    
    
}
