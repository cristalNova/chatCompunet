const Text = (content) => {
    const text = document.createElement("p");
    text.textContent=content;
    text.classList.add("text");
    return text;
}

export default Text;