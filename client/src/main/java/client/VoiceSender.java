package client;

import javax.sound.sampled.*;
import java.net.*;

public class VoiceSender implements Runnable {
    private String targetIP;
    private int targetPort;
    private boolean running = true;

    public VoiceSender(String targetIP, int targetPort) {
        this.targetIP = targetIP;
        this.targetPort = targetPort;
    }

    public void stop() {
        running = false;
    }

    @Override
    public void run() {
        TargetDataLine microphone = null;
        DatagramSocket socket = null;

        try {
            socket = new DatagramSocket();
            InetAddress ip = InetAddress.getByName(targetIP);


            AudioFormat format = new AudioFormat(44100.0f, 16, 1, true, false);
            DataLine.Info info = new DataLine.Info(TargetDataLine.class, format);

            microphone = (TargetDataLine) AudioSystem.getLine(info);
            microphone.open(format);
            microphone.start();



            byte[] buffer = new byte[1024];

            while (running) {
                int count = microphone.read(buffer, 0, buffer.length);
                if(count>0) {
                    DatagramPacket packet = new DatagramPacket(buffer, count, ip, targetPort);
                    socket.send(packet);
                }
            }

            microphone.stop();
            microphone.close();
            socket.close();
            System.out.println("Envío de audio detenido.");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}


