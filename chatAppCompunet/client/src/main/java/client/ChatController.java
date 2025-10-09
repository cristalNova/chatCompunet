package client;

import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.*;

import javax.sound.sampled.*;
import java.io.*;
import java.net.Socket;
import java.util.function.Consumer;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import shared.CallInfo;


/**
 * Simplified JavaFX controller that supports:
 * - connect to server and set username
 * - create/join group
 * - send message to user or group
 * - record a short voice note (5s) and send to user or group via TCP
 * - basic local history append (JSON)
 */
public class ChatController {

    @FXML private TextArea chatArea;
    @FXML private TextField nameField;
    @FXML private Button connectBtn;
    @FXML private TextField targetField;
    @FXML private ChoiceBox<String> targetType; // User or Group
    @FXML private TextField messageField;
    @FXML private Button sendBtn;
    @FXML private Button createGroupBtn;
    @FXML private Button joinGroupBtn;
    @FXML private Button recordVoiceBtn;
    @FXML private Button sendVoiceBtn;
    @FXML private Button startCall;
    @FXML private Button endCall;

    private Socket socket;
    private BufferedReader in;
    private PrintWriter out;
    private String username;
    private Consumer<String> uiUpdater;
    private File lastVoiceFile;
    private VoiceSender currentSender;
    private VoiceReceiver currentReceiver;
    private boolean inCall=false;

    private final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    private final File historyFile = new File("client_history_" + System.currentTimeMillis() + ".json");

    @FXML public void initialize() {
        targetType.getItems().addAll("user","group");
        targetType.setValue("user");
        sendBtn.setDisable(true);
        recordVoiceBtn.setDisable(true);
        sendVoiceBtn.setDisable(true);
        endCall.setDisable(true);
    }

    @FXML public void connect() {
        try {
            username = nameField.getText().trim();
            if (username.isEmpty()) return;
            socket = new Socket("localhost", 5000);
            in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            out = new PrintWriter(socket.getOutputStream(), true);


            String welcome = in.readLine();
            appendToChat(welcome);
            out.println(username);
            appendToChat("Connected as: " + username);


            new Thread(this::listenServer).start();

            sendBtn.setDisable(false);
            recordVoiceBtn.setDisable(false);
            connectBtn.setDisable(true);
            nameField.setDisable(true);
        } catch (Exception e) {
            appendToChat("Connection error: " + e.getMessage());
        }
    }

    private void listenServer() {
        try {
            String line;
            while ((line = in.readLine()) != null) {
                final String l = line;


                if (l.startsWith("/voicenote")) {
                    handleVoiceNote(l);
                    continue;
                }


                if (l.startsWith("/callok")) {
                    String[] parts = l.split(":");
                    if (parts.length == 4) {
                        String ip = parts[1];
                        int sendPort = Integer.parseInt(parts[2]);
                        int receivePort = Integer.parseInt(parts[3]);

                        Platform.runLater(() -> appendToChat("Llamada autorizada con " + ip));

                        try {
                            currentSender = new VoiceSender(ip, 6000);
                            new Thread(currentSender).start();

                            currentReceiver = new VoiceReceiver(6000);
                            new Thread(currentReceiver).start();

                            Platform.runLater(() -> {
                                endCall.setDisable(false);
                                appendToChat("Llamada en curso...");
                            });
                        } catch (Exception ex) {
                            Platform.runLater(() -> appendToChat("Error iniciando audio: " + ex.getMessage()));
                            ex.printStackTrace();
                        }
                    } else {
                        Platform.runLater(() -> appendToChat("Formato inválido en /callok: " + l));
                    }
                    continue;
                }

                if (l.startsWith("Incoming call from ")) {
                    String caller = l.substring(19);
                    String[] parts = l.split(":");
                    if (parts.length >= 4) {
                        String callerIP = parts[1];
                        int callerSendPort = Integer.parseInt(parts[2]);
                        int callerReceivePort = Integer.parseInt(parts[3]);

                        Platform.runLater(() -> {
                            try {
                                currentReceiver = new VoiceReceiver(callerReceivePort);
                                new Thread(currentReceiver).start();

                                currentSender = new VoiceSender(callerIP, callerSendPort);
                                new Thread(currentSender).start();

                                appendToChat(" Llamada aceptada con " + caller);
                                startCall.setDisable(true);
                                endCall.setDisable(false);
                            } catch (Exception e) {
                                appendToChat(" Error al iniciar la llamada: " + e.getMessage());
                            }
                        });
                    }
                    continue;
                }

                Platform.runLater(() -> appendToChat(l));
            }

        } catch (IOException e) {
            Platform.runLater(() -> appendToChat("Desconectado del servidor."));
        }
    }


    @FXML public void createGroup() {
        String g = targetField.getText().trim();
        if (g.isEmpty()) { appendToChat("Enter group name in target field"); return; }
        out.println("/create " + g);
    }

    @FXML public void joinGroup() {
        String g = targetField.getText().trim();
        if (g.isEmpty()) { appendToChat("Enter group name in target field"); return; }
        out.println("/join " + g);
    }

    @FXML public void sendMessage() {
        String target = targetField.getText().trim();
        String type = targetType.getValue();
        String msg = messageField.getText().trim();
        if (target.isEmpty() || msg.isEmpty()) { appendToChat("Target and message required"); return; }
        if (type.equals("user")) {
            out.println("/msg " + target + " " + msg);
        } else {
            out.println("/gmsg " + target + " " + msg);
        }
        appendHistory("TEXT", type + ":" + target, msg, null);
        messageField.clear();
    }

    @FXML public void recordVoice() {
        appendToChat("Iniciando grabacion de voz");
        AudioFormat fmt = new AudioFormat(44100.0f, 16, 1, true, false);
        try {

            DataLine.Info info = new DataLine.Info(TargetDataLine.class, fmt);
            if (!AudioSystem.isLineSupported(info)) {
                appendToChat("Microfono no soportado");
                return;
            }
            TargetDataLine mic = (TargetDataLine) AudioSystem.getLine(info);
            mic.open(fmt);
            mic.start();

            appendToChat("Grabando 5 segundos...");
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] buffer = new byte[4096];
            long end = System.currentTimeMillis() + 5000;

            while (System.currentTimeMillis() < end) {
                int r = mic.read(buffer, 0, buffer.length);
                if (r > 0) baos.write(buffer,0,r);
            }
            mic.stop();
            mic.close();

            byte[] audioData = baos.toByteArray();
            File tmp = File.createTempFile("voicenote_", ".wav");

            try (FileOutputStream fos = new FileOutputStream(tmp)) {
                writeWavHeader(fos, audioData.length, fmt);
                fos.write(audioData);
            }
            lastVoiceFile = tmp;
            appendToChat("Grabacion completa: " + tmp.getName());
            sendVoiceBtn.setDisable(false);
        } catch (Exception e) {
            appendToChat("Recording error: " + e.getMessage());
        }
    }

    @FXML public void sendVoiceNote() {
        if (lastVoiceFile == null || !lastVoiceFile.exists()) { appendToChat("No voice file recorded"); return; }
        String target = targetField.getText().trim();
        String type = targetType.getValue();
        if (target.isEmpty()) { appendToChat("Target required"); return; }
        try {

            byte[] rawData = java.nio.file.Files.readAllBytes(lastVoiceFile.toPath());
            AudioFormat format = new AudioFormat(44100.0f, 16, 1, true, false);

            ByteArrayOutputStream wavStream = new ByteArrayOutputStream();
            writeWavHeader(wavStream, rawData.length, format);
            wavStream.write(rawData);
            byte[] wavBytes = wavStream.toByteArray();


            out.println("/voicenote " + type + " " + target + " " + lastVoiceFile.getName() + " " + wavBytes.length);
            out.flush();

            socket.getOutputStream().write(wavBytes);
            socket.getOutputStream().flush();
            appendToChat("Sent voice note to " + type + ":" + target);
            appendHistory("AUDIO", type + ":" + target, "voice:" + lastVoiceFile.getName(), lastVoiceFile.getName());
        } catch (Exception e) {
            appendToChat("Send voice error: " + e.getMessage());
        }
    }

    public void startCall() {
        String target = targetField.getText().trim();
        String type = targetType.getValue() != null ? targetType.getValue().trim() : "";

        if (out == null || socket == null || socket.isClosed()) {
            appendToChat(" No estás conectado al servidor.");
            return;
        }

        if (target.isEmpty() || type.isEmpty()) {
            appendToChat("⚠ Debes seleccionar un usuario y el tipo de llamada.");
            return;
        }

        if (inCall) {
            appendToChat(" Ya hay una llamada activa.");
            return;
        }

        inCall = true;
        startCall.setDisable(true);
        appendToChat(" Solicitando llamada con " + target + "...");


        new Thread(() -> {
            if (type.equalsIgnoreCase("user")) {
                out.println("/call " + target);
            } else {
                out.println("/gcall " + target);
            }
        }).start();
    }




    @FXML public void endCall() {
        try {
            if (currentSender != null) {
                currentSender.stop();
                currentSender = null;
            }

            if (currentReceiver != null) {
                currentReceiver.stop();
                currentReceiver = null;
            }

            appendToChat("Llamada finalizada.");
            endCall.setDisable(true);
            startCall.setDisable(false);

            out.println("/endcall");

        } catch (Exception e) {
            appendToChat("Error al finalizar llamada: " + e.getMessage());
        }
    }

    private void appendToChat(String s) {
        chatArea.appendText(s + "\n");
    }

    private void appendHistory(String type, String target, String content, String audioFile) {
        try {
            HistoryRecord rec = new HistoryRecord(type, target, content, audioFile);
            java.util.List<HistoryRecord> list = new java.util.ArrayList<>();
            if (historyFile.exists()) {
                HistoryRecord[] arr = gson.fromJson(new FileReader(historyFile), HistoryRecord[].class);
                if (arr != null) list.addAll(java.util.Arrays.asList(arr));
            }
            list.add(rec);
            try (FileWriter fw = new FileWriter(historyFile)) {
                gson.toJson(list, fw);
            }
        } catch (Exception e) {
            appendToChat("History write error: " + e.getMessage());
        }
    }


    private void writeWavHeader(OutputStream out, int dataLen, AudioFormat fmt) throws IOException {
        int sampleRate = (int) fmt.getSampleRate();
        int channels = fmt.getChannels();
        int byteRate = sampleRate * channels * 16/8;
        DataOutputStream dos = new DataOutputStream(out);
        dos.writeBytes("RIFF");
        dos.writeInt(Integer.reverseBytes(36 + dataLen));
        dos.writeBytes("WAVE");
        dos.writeBytes("fmt ");
        dos.writeInt(Integer.reverseBytes(16));
        dos.writeShort(Short.reverseBytes((short)1));
        dos.writeShort(Short.reverseBytes((short)channels));
        dos.writeInt(Integer.reverseBytes(sampleRate));
        dos.writeInt(Integer.reverseBytes(byteRate));
        dos.writeShort(Short.reverseBytes((short)(channels * 16/8)));
        dos.writeShort(Short.reverseBytes((short)16));
        dos.writeBytes("data");
        dos.writeInt(Integer.reverseBytes(dataLen));
    }
    public void startListening() {
        new Thread(() -> {
            try {
                String line;
                while ((line = in.readLine()) != null) {
                    if (line.startsWith("/voicenote")) {
                        handleVoiceNote(line);
                    } else {
                        final String msg=line;
                        Platform.runLater(() -> appendToChat(msg));
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                Platform.runLater(() -> appendToChat("❌ Error en recepción: " + e.getMessage()));
            }
        }).start();
    }


    private void handleVoiceNote(String header) {
        try {

            String[] parts = header.split(" ");
            if (parts.length < 5) {
                System.err.println("Formato inválido de encabezado: " + header);
                return;
            }

            String type = parts[1];
            String sender = parts[2];
            String fileName = parts[3];
            int length = Integer.parseInt(parts[4]);

            appendToChat("📩 Recibiendo nota de voz de " + sender + " (" + length + " bytes)");

            byte[] audioBytes = new byte[length];
            InputStream is = socket.getInputStream();

            int totalRead = 0;
            while (totalRead < length) {
                int bytesRead = is.read(audioBytes, totalRead, length - totalRead);
                if (bytesRead == -1) break;
                totalRead += bytesRead;
            }


            receiveVoiceNote(fileName, audioBytes);

        } catch (Exception e) {
            e.printStackTrace();
            Platform.runLater(() -> appendToChat(" Error al recibir voz: " + e.getMessage()));
        }
    }

    private void receiveVoiceNote(String fileName, byte[] audioBytes) {
        try {
            File receivedFile = new File("received_" + fileName);
            try (FileOutputStream fos = new FileOutputStream(receivedFile)) {
                fos.write(audioBytes);
            }

            Platform.runLater(() -> appendToChat("Nota de voz recibida: " + fileName));

            AudioInputStream ais = AudioSystem.getAudioInputStream(receivedFile);
            Clip clip = AudioSystem.getClip();
            clip.open(ais);
            clip.start();

            Platform.runLater(() -> appendToChat("Reproduciendo nota de voz..."));

        } catch (Exception e) {
            Platform.runLater(() -> appendToChat(" Error al reproducir nota de voz: " + e.getMessage()));
            e.printStackTrace();
        }
    }

    static class HistoryRecord {
        String type; String target; String content; String audioFile; long timestamp = System.currentTimeMillis();
        HistoryRecord(String t, String tg, String c, String af) { type=t; target=tg; content=c; audioFile=af; }
    }
}
