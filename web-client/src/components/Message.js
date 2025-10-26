import DataFrame from "./DataframeMessage.js";
import Text from "./Text.js";

const Message  = (message,dataframe,type) =>{
    const messageContainer = document.createElement("div");
    const text = Text(message);
    const dataframe = DataFrame(dataframe);
    messageContainer.appendChild(messageContainer);
    messageContainer.appendChild(dataframe);
    messageContainer.classList.add("message");
    if(type === 'user'){
        messageContainer.classList.add("user-message");
    }
    if(type === 'system'){
        messageContainer.classList.add("system-message");
    }
    return messageContainer;
}

export default Message;