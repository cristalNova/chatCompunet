package client;

import javax.sound.sampled.*;
import java.net.*;

public class VoiceSender implements Runnable{
    private String targetIP;
    private int targetPort;
    private boolean running = true;

    public VoiceSender(String targetIP, int targetPort) {
        this.targetIP = targetIP;
        this.targetPort = targetPort;
    }

    public void stop() { running = false; }

    @Override
    public void run() {
        TargetDataLine microphone = null;
        DatagramSocket socket = null;
        DatagramPacket packet = null;
        try {
            socket = new DatagramSocket();
            InetAddress ip = InetAddress.getByName(targetIP);

            AudioFormat format = new AudioFormat(44100, 16, 1, true, true);
            DataLine.Info info = new DataLine.Info(TargetDataLine.class, format);
            microphone = (TargetDataLine) AudioSystem.getLine(info);
            microphone.open(format);
            microphone.start();

            byte[] buffer = new byte[1024];

            while (running) {
                int count = microphone.read(buffer, 0, buffer.length);
                if (count > 0) {
                    packet = new DatagramPacket(buffer, count, ip, targetPort);
                    socket.send(packet);
                }
            }

            microphone.close();
            socket.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
