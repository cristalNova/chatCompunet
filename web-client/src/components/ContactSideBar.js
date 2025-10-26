import Button from "./ActionButton.js";
import ContactList from "./ContactList.js";
import Subtitle from "./Subtitle.js";
import Title from "./Title.js"

const ContactSideBar = () => {
    const sideBar = document.createElement("div");
    const userSection = document.createElement("div");
    userSection.classList.add("contact-section");
    const groupSection = document.createElement("div");
    groupSection.classList.add("contact-section");


    const title =  Title("Contactos");
    const subtitle1 = Subtitle("Usuarios");
    const divGroupHeader = document.createElement("div");
    divGroupHeader.classList.add("group-header");
    const subtitle2 = Subtitle("Grupos");
    const btnAddGroup = Button({
        text: "",
        icon: "add"
    });
    divGroupHeader.appendChild(subtitle2);
    divGroupHeader.appendChild(btnAddGroup);

    const userContactList = ContactList();
    const groupContactList = ContactList();

    userSection.appendChild(subtitle1);
    userSection.appendChild(userContactList);

    groupSection.appendChild(divGroupHeader);
    groupSection.appendChild(groupContactList);

    sideBar.appendChild(title);
    sideBar.appendChild(userSection);
    sideBar.appendChild(groupSection);

    sideBar.classList.add("contact-sidebar");

    return sideBar;
}

export default ContactSideBar;