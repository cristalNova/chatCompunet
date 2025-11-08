package server.model;

public class HistoryRecord {
    private String type; // TEXT / AUDIO / SYSTEM
    private String target; // user or group or ALL
    private String content; // text or audio filename marker
    private String audioFile; // optional
    private long timestamp = System.currentTimeMillis();

    public HistoryRecord(String type, String target, String content, String audioFile) {
        this.type = type; this.target = target; this.content = content; this.audioFile = audioFile;
    }
    
}
