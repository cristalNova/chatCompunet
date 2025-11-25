import ChatArea from "../components/ChatArea.js";
import ContactSideBar from "../components/ContactSideBar.js";
import OutputBar from "../components/OutputBar.js";
import UserUpperBar from "../components/UserUpperBar.js";
import iceDelegate from "../services/iceDelegate.js";

const ChatPage = async (params = {}) => {
    const chatPage = document.createElement("div");
    chatPage.classList.add("chat-page");


    const username = params.username || "Invitado";
    let targetUser = null;
    let isGroup = false; 
    let allMessages = [];

    const handleUserSelect = (user, group = false) => {
        targetUser = user;
        isGroup = group;

        userUpperBar.querySelector(".target-username")?.remove();
        const targetLabel = document.createElement("span");
        targetLabel.classList.add("target-username");
        targetLabel.textContent = group ? `Grupo: ${targetUser}` : `Chat con: ${targetUser}`;
        userUpperBar.appendChild(targetLabel);

        outputBar.setTarget(targetUser, isGroup);
        displayFilteredMessages(targetUser, isGroup);
    };

    const contactSideBar = ContactSideBar(handleUserSelect, username);
    chatPage.appendChild(contactSideBar);

    const rightSide = document.createElement("div");
    rightSide.classList.add("right-side-chat");

    const userUpperBar = UserUpperBar(username);
    const { chatArea, messagesContainer } = ChatArea();
    const outputBar = OutputBar(username, messagesContainer, allMessages);


    const displayFilteredMessages = (target, group = false) => {
        messagesContainer.innerHTML = "";
        if (!target) return;

        console.log('[Chat] Displaying messages for:', target, 'isGroup:', group, 'Total messages:', allMessages.length);

        allMessages.forEach((msg, index) => {
            console.log(`[Chat] Message ${index}:`, msg);
            
            // Soporte para MessageDTO de Ice
            const messageText = msg.message || msg.content || '';
            const messageFrom = msg.from || '';
            const messageTo = msg.to || '';
            const messageGroup = msg.group || '';
            const messageType = msg.messageType || 'text';

            if (group) {
                // Mensaje de grupo
                if (messageGroup !== target) return;
            } else {
                // Mensaje directo
                const isFromTarget = messageFrom === target && (messageTo === username || messageTo === '');
                const isToTarget = messageFrom === username && messageTo === target;
                if (!(isFromTarget || isToTarget)) return;
            }

            const msgDiv = document.createElement("div");
            const isSent = messageFrom === username;
            msgDiv.classList.add("chat-message", isSent ? "sent" : "received");
            
            if (messageType === "voicenote" && msg.audio && msg.audio.length > 0) {
                console.log('[Chat] Rendering voice note, audio length:', msg.audio.length);
                
                const nameSpan = document.createElement("span");
                nameSpan.textContent = `${messageFrom}: `;
                nameSpan.style.fontWeight = "bold";
                msgDiv.appendChild(nameSpan);
                
                const blob = new Blob([msg.audio], { type: "audio/webm" });
                const url = URL.createObjectURL(blob);
                
                const audio = document.createElement("audio");
                audio.controls = true;
                audio.src = url;
                audio.style.width = "100%";
                audio.style.maxWidth = "300px";
                audio.style.marginTop = "5px";
                
                // Liberar el URL cuando el audio se elimine
                audio.addEventListener('pause', () => {
                    if (audio.ended) {
                        URL.revokeObjectURL(url);
                    }
                });
                
                msgDiv.appendChild(document.createElement("br"));
                msgDiv.appendChild(audio);
            } else {
                // Mensaje de texto normal
                msgDiv.textContent = `${messageFrom}: ${messageText}`;
            }
            
            messagesContainer.appendChild(msgDiv);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    rightSide.appendChild(userUpperBar);
    rightSide.appendChild(chatArea);
    rightSide.appendChild(outputBar);
    chatPage.appendChild(rightSide);

   
    const displayFilteredMessagesO = (target, group = false) => {
        messagesContainer.innerHTML = "";
        if (!target) return;

        allMessages.forEach(msg => {
            if (msg.type !== "TEXT") return;

            let content = msg.content;
            let from = "";
            let to = msg.target;

            if (content.includes(":")) {
                const parts = content.split(":");
                from = parts[0].trim();
                content = parts.slice(1).join(":").trim();
            }

            if (group) {
                if (to !== target) return;
            } else {
                if (!((from === username && to === target) || (from === target && to === username))) return;
            }

            const msgDiv = document.createElement("div");
            const isSent = from === username;
            msgDiv.classList.add("chat-message", isSent ? "sent" : "received");
            msgDiv.textContent = content;
            messagesContainer.appendChild(msgDiv);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    
    const refreshMessages = async () => {
        try {
            const messages = await iceDelegate.getHistory();
            
            // Solo actualizar si no hay mensajes locales o si recibimos más del servidor
            if (allMessages.length === 0 || messages.length > allMessages.length) {
                allMessages = messages;
                if (targetUser) displayFilteredMessages(targetUser, isGroup);
            }
        } catch (err) {
            console.error("Error cargando historial:", err);
        }
    };

    // Suscribirse a callbacks en tiempo real
    const handleRealtimeMessage = (msg) => {
        console.log('[Chat] Real-time message received:', msg);
        
        // Verificar si el mensaje ya existe (evitar duplicados)
        const exists = allMessages.some(m => 
            m.from === msg.from && 
            m.timestamp === msg.timestamp && 
            m.message === msg.message
        );
        
        if (!exists) {
            allMessages.push(msg);
            if (targetUser) {
                // Actualizar solo si el mensaje es para el chat actual
                const isForCurrentChat = isGroup 
                    ? msg.group === targetUser 
                    : (msg.from === targetUser || msg.to === targetUser);
                
                if (isForCurrentChat) {
                    displayFilteredMessages(targetUser, isGroup);
                }
            }
        }
    };

    const handleRealtimeUserConnected = (username) => {
        console.log('[Chat] User connected:', username);
        // Actualizar la lista de usuarios
        if (contactSideBar.updateUsers) {
            contactSideBar.updateUsers();
        }
    };

    const handleRealtimeGroupCreated = (group) => {
        console.log('[Chat] Group created:', group);
        // Actualizar la lista de grupos
        if (contactSideBar.updateGroups) {
            contactSideBar.updateGroups();
        }
    };

    // Registrar callbacks
    iceDelegate.subscribe({
        onMessage: handleRealtimeMessage,
        onUserConnected: handleRealtimeUserConnected,
        onGroupCreated: handleRealtimeGroupCreated
    });

    // Cargar historial inicial solo una vez
    await refreshMessages();

    return chatPage;
};

export default ChatPage;
