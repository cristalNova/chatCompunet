import Text from "./Text.js";

const Contact = (contactName) => {
    const contactContainer = document.createElement("div");
    contactContainer.classList.add("contact-card");
    const text = Text(contactName);
    contactContainer.appendChild(text);
    return contactContainer;
}

export default Contact;