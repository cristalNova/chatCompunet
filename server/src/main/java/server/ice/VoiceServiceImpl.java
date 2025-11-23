package server.ice;

import com.zeroc.Ice.Current;
import Chat.*;
import server.model.HistoryRecord;
import server.services.ChatManager;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import server.model.HistoryRecord;

public class VoiceServiceImpl implements VoiceService {

    private final SubjectImpl subject;
    private final ChatManager chatManager;

    public VoiceServiceImpl(ChatManager chatManager, SubjectImpl subject) {
        this.subject = subject;
        this.chatManager = chatManager;
    }

    @Override
    public boolean sendVoiceNote(String from, String to, String group, byte[] audioData, Current current) {

        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

        MessageDTO msg = new MessageDTO(
                from,
                to,
                group,
                from + "[voice note]",
                timestamp,
                "voicenote",
                audioData
                
        );

        
        if (group.equals("")) {
            chatManager.appendHistory(new HistoryRecord("AUDIO", to, from + ":[voice note]", audioData));
        } else{
            chatManager.appendHistory(new HistoryRecord("AUDIO", group, from + ":[voice note]", audioData));
        }
        
        subject.notifyNewMessage(msg);

        return true;
    }

    @Override
    public void startCall(String from, String to, Current current) {
        subject.notifyCallStarted(from, to);
    }

    @Override
    public void stopCall(String from, String to, Current current) {
        subject.notifyCallStopped(from, to);
    }

    @Override
    public void sendCallChunk(CallChunk chunk, Current current) {
        // Reenviar (broadcast) a observers; puedes filtrar por destinatario
        subject.notifyCallChunk(chunk);
    }
}

