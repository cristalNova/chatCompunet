// delegate.js
let ws = null;
let subscribers = [];
let reconnecting = false;

const delegate = {
  init() {
    if (ws && ws.readyState === WebSocket.OPEN) return;

    console.log("🔌 Conectando WebSocket...");

    ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => {
      console.log("🟢 WebSocket conectado");
      reconnecting = false;
    };

    ws.onmessage = (event) => {
      // Todo lo que venga es texto JSON
      try {
        const json = JSON.parse(event.data);
        notifySubscribers(json);
      } catch (err) {
        console.warn("No se pudo parsear mensaje WS:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("❌ Error en WebSocket:", err);
    };

    ws.onclose = () => {
      console.warn("⚠️ WebSocket cerrado.");
      if (!reconnecting) {
        reconnecting = true;
        setTimeout(() => {
          console.log("🔄 Reintentando conexión...");
          delegate.init();
        }, 1500);
      }
    };
  },

  publish(payload) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log("⛔ WebSocket no está listo, reintentando…");
      this.init();
      setTimeout(() => this.publish(payload), 500);
      return;
    }

    ws.send(JSON.stringify(payload));
  },

  subscribe(callback) {
    if (typeof callback === "function") {
      subscribers.push(callback);
    }
  }
};

function notifySubscribers(data) {
  subscribers.forEach((cb) => cb(data));
}

export default delegate;

