package server.model;
import java.util.ArrayList;
import java.util.List;

public class User {
    private List<HistoryRecord> historyRecord;
    private String name;
    
    public User(String name) {
        this.historyRecord = new ArrayList<>();
        this.name = name;
    }

    public List<HistoryRecord> getHistoryRecord() {
        return historyRecord;
    }

    public void setHistoryRecord(List<HistoryRecord> historyRecord) {
        this.historyRecord = historyRecord;
    }

    public void addRecord(HistoryRecord record){
        this.historyRecord.add(record);
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
