import Button from "./ActionButton.js";
import Text from "./Text.js";

const UserUpperBar = (username) => {
    const userUpperBar = document.createElement("div");
    userUpperBar.classList.add("user-upper-bar");
    const welcomeText  = Text("Estas conectado como: " + username);
    userUpperBar.appendChild(welcomeText);
    const btn = Button({
        text: "Desconectar",
        icon: "exit"
    });
    userUpperBar.appendChild(btn);
    return userUpperBar;
}

export default UserUpperBar;