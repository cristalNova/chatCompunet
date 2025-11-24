import Contact from "./Contact.js";

const ContactList = () => {
    const listContainer = document.createElement("ul");
    listContainer.classList.add("contact-list");    
    return listContainer;
}

const AddContact = (contactList, contactName,) => {
    const contact = Contact(contactName);
    contactList.appendChild(contact);
}

export default ContactList;