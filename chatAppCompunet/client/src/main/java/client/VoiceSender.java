package client;

import javax.sound.sampled.*;
import java.net.*;

public class VoiceSender implements Runnable {
    private String targetIP;
    private int targetPort;
    private boolean running = true;
    private float gain = 2.0f; // Factor de aumento de volumen (2.0 = +6dB)

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

            // ✅ Formato que funciona en tu micrófono
            AudioFormat format = new AudioFormat(44100.0f, 16, 1, true, false);
            DataLine.Info info = new DataLine.Info(TargetDataLine.class, format);

            microphone = (TargetDataLine) AudioSystem.getLine(info);
            microphone.open(format);
            microphone.start();

            System.out.println("🎤 Micrófono listo con formato: " + format);

            byte[] buffer = new byte[1024];

            while (running) {
                int count = microphone.read(buffer, 0, buffer.length);
                if (count > 0) {
                    // 🔊 Amplificar audio antes de enviarlo
                    for (int i = 0; i < count; i += 2) {
                        short sample = (short)((buffer[i+1] << 8) | (buffer[i] & 0xff));
                        sample = (short) Math.min(Math.max(sample * gain, Short.MIN_VALUE), Short.MAX_VALUE);
                        buffer[i] = (byte)(sample & 0xff);
                        buffer[i+1] = (byte)((sample >> 8) & 0xff);
                    }

                    DatagramPacket packet = new DatagramPacket(buffer, count, ip, targetPort);
                    socket.send(packet);
                }
            }

            microphone.close();
            socket.close();
            System.out.println("🛑 Envío de audio detenido.");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}


