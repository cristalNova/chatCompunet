import Button from "./ActionButton.js";
import TextInput from "./InputMessageBar.js";
import iceDelegate from "../services/iceDelegate.js";

const OutputBar = (currentUser, messagesContainer, allMessages) => {
    let targetUser = null;
    let isGroup = false;

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

    inputMessageBar.value = "";
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Preparar payload para el servidor
    const payload = {
        command: isGroup ? "gmsg" : "msg",  
        from: currentUser,
        to: isGroup ? null : targetUser,   
        group: isGroup ? targetUser : null,
        message: message
    };



   try {
        if (isGroup) {
            await iceDelegate.sendGroupMessage(targetUser, message);
        } else {
            await iceDelegate.sendMessage(targetUser, message);
        }
        console.log("Mensaje enviado via Ice");
    } catch (err) {
        console.error("Error completo:", err);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
    }
});

// Método para cambiar el target
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

