import ChatArea from "../components/ChatArea.js";
import ContactSideBar from "../components/ContactSideBar.js";
import OutputBar from "../components/OutputBar.js";
import UserUpperBar from "../components/UserUpperBar.js";

const ChatPage = async (params = {}) => {
    const chatPage = document.createElement("div");
    chatPage.classList.add("chat-page");

    const username = params.username || "Invitado";
    let targetUser = null;
    let isGroup = false; // <-- nueva variable
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

    rightSide.appendChild(userUpperBar);
    rightSide.appendChild(chatArea);
    rightSide.appendChild(outputBar);
    chatPage.appendChild(rightSide);

    const displayFilteredMessages = (target, group = false) => {
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
            const response = await fetch("http://localhost:3000/api/history");
            const messages = await response.json();
            allMessages = messages;

            if (targetUser) displayFilteredMessages(targetUser, isGroup); 
        } catch (err) {
            console.error("Error cargando historial:", err);
        }
    };

    setInterval(refreshMessages, 2000);
    await refreshMessages();

    return chatPage;
};

export default ChatPage;
