import Button from "./ActionButton.js";
import TextInput from "./InputMessageBar.js";

const OutputBar = () => {
    const outputBar = document.createElement("div");
    outputBar.classList.add("output-bar");

    const inputMessageBar = TextInput("Escribe tu mensaje...","");
    outputBar.appendChild(inputMessageBar);
    const buttons = document.createElement("div");
    buttons.classList.add("output-buttons");
    const sendButton = Button({
        text: "",
        icon: "send"
    });
    buttons.appendChild(sendButton);
    const callButton = Button({
        text: "",
        icon: "phone"
    });
    buttons.appendChild(callButton);
    const audioButton = Button({
        text: "",
        icon: "microphone"
    });
    buttons.appendChild(audioButton);
    outputBar.appendChild(buttons);

    return outputBar;
}

export default OutputBar;