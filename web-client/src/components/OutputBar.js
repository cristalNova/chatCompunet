import Button from "./ActionButton.js";
import TextInput from "./InputMessageBar.js";
import delegate from './../services/delegate.js';

const OutputBar = (currentUser, messagesContainer, allMessages) => {
  let targetUser = null;
  let isGroup = false;

  console.log("OutputBar cargado — ejecutando delegate.init()");
  delegate.init();

  setTimeout(() => {
    delegate.publish({
      type: "REGISTER",
      username: currentUser
    });
    console.log("WS REGISTER enviado:", currentUser);
  }, 300);

  const outputBar = document.createElement("div");
  outputBar.classList.add("output-bar");

  const inputMessageBar = TextInput("Escribe tu mensaje...", "");
  outputBar.appendChild(inputMessageBar);

  const buttons = document.createElement("div");
  buttons.classList.add("output-buttons");

  const sendButton = Button({ text: "", icon: "send" });
  const callButton = Button({ text: "", icon: "phone" });
  const audioButton = Button({ text: "", icon: "microphone" });

  buttons.appendChild(sendButton);
  buttons.appendChild(callButton);
  buttons.appendChild(audioButton);
  outputBar.appendChild(buttons);

  // TEXTO (lo dejas igual con fetch hacia tu API)
  sendButton.addEventListener("click", async () => {
    const message = inputMessageBar.value.trim();

    if (!message || !targetUser) {
      console.log("No se puede enviar - falta mensaje o target");
      return;
    }

    const msgDiv = document.createElement("div");
    msgDiv.classList.add("chat-message", "sent");
    msgDiv.textContent = message;
    messagesContainer.appendChild(msgDiv);

    allMessages.push({
      type: "TEXT",
      from: currentUser,
      to: isGroup ? null : targetUser,
      group: isGroup ? targetUser : null,
      content: message,
      isGroup: isGroup
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    inputMessageBar.value = "";

    const payload = {
      command: isGroup ? "gmsg" : "msg",
      from: currentUser,
      to: isGroup ? null : targetUser,
      group: isGroup ? targetUser : null,
      message: message
    };

    try {
      await fetch("http://localhost:3000/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
  });

  // 🎤 AUDIO
  let mediaRecorder = null;

  audioButton.addEventListener("click", async () => {
    if (!targetUser) {
      alert("Selecciona un usuario para enviar audio");
      return;
    }

    // Si ya está grabando → detener
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      audioButton.classList.remove("recording-active");
      console.log("Grabación detenida");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus"
      });

      mediaRecorder.ondataavailable = (event) => {
        console.log("🎤 DATA RECIBIDA Blob:", event.data.size);

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(",")[1]; // quitamos "data:audio/...;base64,"

          // Mostrar burbuja en el chat del emisor
          const audioMsg = document.createElement("div");
          audioMsg.classList.add("chat-message", "sent");
          audioMsg.textContent = "Nota de voz (toca para reproducir)";
          audioMsg.style.cursor = "pointer";

          // Local: reproducir directamente
          audioMsg.onclick = () => {
            if (window.player && window.player.playBase64) {
              window.player.playBase64(base64);
            }
          };

          messagesContainer.appendChild(audioMsg);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;

          allMessages.push({
            type: "AUDIO",
            from: currentUser,
            to: isGroup ? null : targetUser,
            group: isGroup ? targetUser : null,
            content: "AudioMessage",
            isGroup: isGroup,
            raw: base64
          });

          // Enviar por WebSocket al destinatario
          delegate.publish({
            type: "AUDIO",
            from: currentUser,
            to: targetUser,
            isGroup: isGroup,
            data: base64
          });
          
        };

        reader.readAsDataURL(event.data);
      };

      mediaRecorder.onstop = () => {
        console.log("📥 onstop → fin de la grabación");
      };

      mediaRecorder.start();   
      audioButton.classList.add("recording-active");
      console.log("Grabando audio...");

    } catch (err) {
      console.error("Error al iniciar micrófono:", err);
    }
  });

  outputBar.setTarget = (newTarget, group = false) => {
    targetUser = newTarget;
    isGroup = group;

    inputMessageBar.value = "";
    inputMessageBar.disabled = !targetUser;

    inputMessageBar.placeholder = targetUser
      ? `Escribe tu mensaje... (${group ? 'Grupo: ' + targetUser : 'Privado: ' + targetUser})`
      : "Selecciona un chat para enviar mensajes";
  };

  return outputBar;
};

export default OutputBar;

