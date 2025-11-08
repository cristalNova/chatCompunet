import Contact from "./Contact.js";

const ContactList = () => {
    const listContainer = document.createElement("div");
    listContainer.classList.add("contact-list");    
    return listContainer;
}

const AddContact = (contactList, contactName,) => {
    const contact = Contact(contactName);
    contactList.appendChild(contact);
}

export default ContactList;