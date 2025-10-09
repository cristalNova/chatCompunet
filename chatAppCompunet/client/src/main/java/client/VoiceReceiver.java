package client;

import javax.sound.sampled.*;
import java.net.*;

public class VoiceReceiver implements Runnable {
    private int listenPort;
    private boolean running = true;

    public VoiceReceiver(int listenPort) {
        this.listenPort = listenPort;
    }

    public void stop() {
        running = false;
    }

    @Override
    public void run() {
        DatagramSocket socket = null;
        SourceDataLine speakers = null;
        try {
            socket = new DatagramSocket(listenPort);
            byte[] buffer = new byte[1024];

            AudioFormat format = new AudioFormat(44100, 16, 1, true, true);
            DataLine.Info info = new DataLine.Info(SourceDataLine.class, format);
            speakers = (SourceDataLine) AudioSystem.getLine(info);
            speakers.open(format);
            speakers.start();

            while (running) {
                DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
                socket.receive(packet);

                speakers.write(packet.getData(), 0, packet.getLength());
            }

            speakers.drain();
            speakers.close();
            socket.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
