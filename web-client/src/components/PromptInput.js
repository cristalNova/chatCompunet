const PromptInput = (message, onSubmit) => {
    // Contenedor del modal
    const modal = document.createElement("div");
    modal.classList.add("prompt-modal");

    const promptBox = document.createElement("div");
    promptBox.classList.add("prompt-box");

    const label = document.createElement("label");
    label.textContent = message;

    const input = document.createElement("input");
    input.type = "text";

    const btnSubmit = document.createElement("button");
    btnSubmit.textContent = "Aceptar";

    const btnCancel = document.createElement("button");
    btnCancel.textContent = "Cancelar";

    btnSubmit.addEventListener("click", () => {
        const value = input.value.trim();
        if (value) onSubmit(value);
        modal.remove();
    });

    btnCancel.addEventListener("click", () => modal.remove());

    promptBox.appendChild(label);
    promptBox.appendChild(input);
    promptBox.appendChild(btnSubmit);
    promptBox.appendChild(btnCancel);
    modal.appendChild(promptBox);
    document.body.appendChild(modal);
};

export default PromptInput;