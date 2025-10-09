package client;

import javax.sound.sampled.*;
import java.net.*;

public class VoiceReceiver implements Runnable {
    private int listenPort;
    private boolean running = true;
    private float gain = 2.0f;

    public VoiceReceiver(int listenPort) {
        this.listenPort = listenPort;
    }

    public void stop() {
        running = false;
    }

    @Override
    public void run() {
        try (DatagramSocket socket = new DatagramSocket(listenPort)) {
            byte[] buffer = new byte[1024];


            AudioFormat format = new AudioFormat(44100.0f, 16, 1, true, false);
            DataLine.Info info = new DataLine.Info(SourceDataLine.class, format);

            SourceDataLine speakers = (SourceDataLine) AudioSystem.getLine(info);
            speakers.open(format);
            speakers.start();

            System.out.println(" Altavoces listos con formato: " + format);

            while (running) {
                DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
                socket.receive(packet);


                byte[] audioData = packet.getData();
                int length = packet.getLength();
                for (int i = 0; i < length; i += 2) {
                    short sample = (short)((audioData[i+1] << 8) | (audioData[i] & 0xff));
                    sample = (short) Math.min(Math.max(sample * gain, Short.MIN_VALUE), Short.MAX_VALUE);
                    audioData[i] = (byte)(sample & 0xff);
                    audioData[i+1] = (byte)((sample >> 8) & 0xff);
                }

                speakers.write(audioData, 0, length);
            }

            speakers.drain();
            speakers.close();
            System.out.println("Recepción de audio detenida.");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

