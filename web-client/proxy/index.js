import express from "express";
import net from "net";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const historyFile = path.join(__dirname, "../../server_chat_history.json");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "../")));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../index.html")));
app.get("/chat", (req, res) => res.sendFile(path.join(__dirname, "../index.html")));

const connectedUsers = new Map();

function createJavaSocket(username) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();

    socket.connect(5000, "127.0.0.1", () => {
      console.log(`Usuario ${username} conectado al servidor Java`);
      socket.write(username + "\n");
      connectedUsers.set(username, socket);
      resolve(socket);
    });

    socket.on("data", (data) => {
      console.log(`Mensaje desde Java para ${username}:`, data.toString());
    });

    socket.on("error", (err) => {
      console.error(`Error con Java para ${username}:`, err.message);
      connectedUsers.delete(username);
    });

    socket.on("close", () => {
      console.log(`Conexión cerrada para ${username}`);
      connectedUsers.delete(username);
    });
  });
}

// Endpoints API
app.get("/api/users", (req, res) => {
  res.json(Array.from(connectedUsers.keys()));
});

app.get("/api/groups", async (req, res) => {
    try {
        const anyUserSocket = Array.from(connectedUsers.values())[0];
        if (!anyUserSocket) return res.json([]);

        const onData = (data) => {
            try {
                const response = JSON.parse(data.toString().trim());
                res.json(response.groups || []);
            } catch (e) {
                res.json([]);
            }
            anyUserSocket.removeListener("data", onData);
        };

        anyUserSocket.on("data", onData);

        const payload = { command: "listGroups", from: "proxyServer" };
        anyUserSocket.write(JSON.stringify(payload) + "\n");

    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});



app.get("/api/history", (req, res) => {
  if (!fs.existsSync(historyFile)) return res.json([]);
  try {
    const data = fs.readFileSync(historyFile, "utf8");
    const messages = JSON.parse(data);
    res.json(messages);
  } catch (err) {
    console.error("Error leyendo historial:", err);
    res.status(500).json({ error: "No se pudo leer el historial" });
  }
});

app.post("/api/register", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username requerido" });

  if (connectedUsers.has(username)) {
    return res.status(400).json({ error: "Usuario ya registrado" });
  }

  try {
    await createJavaSocket(username);
    res.json({ status: "ok", message: `Usuario ${username} registrado y conectado al servidor Java` });
  } catch (err) {
    res.status(500).json({ error: "No se pudo conectar al servidor Java" });
  }
});

app.post("/api/message", (req, res) => {
  const { from, to, group, message, command } = req.body;
  if (!connectedUsers.has(from)) return res.status(400).json({ error: "Usuario no registrado" });

  const socket = connectedUsers.get(from);
  const payload = { from, to, group: group || null, message, command };
  const jsonMsg = JSON.stringify(payload);

  const onData = (data) => {
    const response = data.toString().trim();
    res.json({ reply: response });
    socket.removeListener("data", onData);
  };

  socket.on("data", onData);
  socket.write(jsonMsg + "\n");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor Node escuchando en http://localhost:${PORT}`);
  console.log(`Frontend disponible en http://localhost:${PORT}`);
});
