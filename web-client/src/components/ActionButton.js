const Button = (config) => {
    const btn = document.createElement("button");
    btn.classList.add("action-btn");

    if (config.text) {
        const textElement = document.createElement("span");
        textElement.textContent = config.text;
        btn.appendChild(textElement);
    }
    
    if (config.icon) {
        const iconElement = document.createElement("img");
        iconElement.classList.add("btn-icon");
        iconElement.src = `./src/assets/icons/${config.icon}.svg`;
        iconElement.alt = config.text || "";
        btn.appendChild(iconElement);
    } 
    
    return btn;
}

export default Button;