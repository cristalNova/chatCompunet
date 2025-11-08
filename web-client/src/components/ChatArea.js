const ChatArea = () => {
    const chatArea = document.createElement("div");
    chatArea.classList.add("chat-area");

    
    const messagesContainer = document.createElement("div");
    messagesContainer.classList.add("messages-container");
    chatArea.appendChild(messagesContainer);

    
    return { chatArea, messagesContainer };
}

export default ChatArea;
