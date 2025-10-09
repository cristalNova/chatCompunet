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
        try (DatagramSocket socket = (listenPort == 0) ? new DatagramSocket() : new DatagramSocket(listenPort)) {

            // 👇 Si usamos 0, mostramos el puerto asignado automáticamente
            if (listenPort == 0) {
                listenPort = socket.getLocalPort();
                System.out.println("🎧 Puerto asignado automáticamente: " + listenPort);
            } else {
                System.out.println("🎧 Escuchando en puerto fijo: " + listenPort);
            }
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
                System.out.println("Prueba Prueba 123");
                System.out.println("Usando línea de salida: " + speakers.getLineInfo());



                byte[] audioData = packet.getData();
                int length = packet.getLength();
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

