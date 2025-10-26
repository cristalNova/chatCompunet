import ChatArea from "../components/ChatArea.js";
import ContactSideBar from "../components/ContactSideBar.js";
import OutputBar from "../components/OutputBar.js";
import UserUpperBar from "../components/UserUpperBar.js";

const ChatPage = () => {
    const chatPage = document.createElement("div");
    chatPage.classList.add("chat-page");

    const contactSideBar = ContactSideBar();
    chatPage.appendChild(contactSideBar);
    const rightSide = document.createElement("div");
    rightSide.classList.add("right-side-chat");
    const userUpperBar = UserUpperBar();
    const chatArea = ChatArea();
    const outputBar = OutputBar();
    rightSide.appendChild(userUpperBar);
    rightSide.appendChild(chatArea);
    rightSide.appendChild(outputBar);
    chatPage.appendChild(rightSide); 

    return chatPage;
}

export default ChatPage;