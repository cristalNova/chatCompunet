package shared;

public class CallInfo {
    private String ip;
    private int sendPort;
    private int receivePort;

    public CallInfo() {}

    public CallInfo(String ip, int sendPort, int receivePort) {
        this.ip = ip;
        this.sendPort = sendPort;
        this.receivePort = receivePort;
    }

    // Getters y setters
    public String getIp() { return ip; }
    public void setIp(String ip) { this.ip = ip; }

    public int getSendPort() { return sendPort; }
    public void setSendPort(int sendPort) { this.sendPort = sendPort; }

    public int getReceivePort() { return receivePort; }
    public void setReceivePort(int receivePort) { this.receivePort = receivePort; }
}
