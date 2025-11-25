import Button from "./ActionButton.js";
import ContactList from "./ContactList.js";
import Subtitle from "./Subtitle.js";
import Title from "./Title.js";
import PromptInput from "./PromptInput.js";
import iceDelegate from "../services/iceDelegate.js";

const ContactSideBar = (onSelectUser, registeredUser) => {
    const sideBar = document.createElement("div");
    sideBar.classList.add("contact-sidebar");

    // Sección usuarios
    const userSection = document.createElement("div");
    userSection.classList.add("contact-section");

    const title = Title("Contactos");
    const subtitleUsers = Subtitle("Usuarios");
    const userContactList = ContactList();
    userContactList.id = "user-contact-list";

    userSection.appendChild(subtitleUsers);
    userSection.appendChild(userContactList);

    // Sección grupos
    const groupSection = document.createElement("div");
    groupSection.classList.add("contact-section");

    const divGroupHeader = document.createElement("div");
    divGroupHeader.classList.add("group-header");

    const subtitleGroups = Subtitle("Grupos");
    const btnAddGroup = Button({ text: "", icon: "add" });

    divGroupHeader.appendChild(subtitleGroups);
    divGroupHeader.appendChild(btnAddGroup);

    const groupContactList = ContactList();
    groupSection.appendChild(divGroupHeader);
    groupSection.appendChild(groupContactList);

    sideBar.appendChild(title);
    sideBar.appendChild(userSection);
    sideBar.appendChild(groupSection);

    let selectedUserItem = null;
    let selectedGroupItem = null;

    
    const updateUsers = async () => {
        try {
            const usersDTO = await iceDelegate.getConnectedUsers();
            console.log("USERS DTO FROM SERVER:", usersDTO);

            const users = usersDTO.map(u => u.username);
            userContactList.innerHTML = "";
            users.forEach(u => {
                const li = document.createElement("li");
                li.textContent = u;
                li.classList.add("contact-item");
                li.addEventListener("click", () => {
                    if (selectedUserItem) selectedUserItem.classList.remove("selected");
                    if (selectedGroupItem) {
                        selectedGroupItem.classList.remove("selected");
                        selectedGroupItem = null;
                    }
                    
                    // Seleccionar nuevo item
                    li.classList.add("selected");
                    selectedUserItem = li;
                    
                    console.log("Usuario seleccionado:", u);
                    onSelectUser?.(u, false);
                });
                userContactList.appendChild(li);
            });
        } catch (err) {
            console.error("Error cargando usuarios:", err);
        }
    };

    
    const updateGroups = async () => {
        try {
            const groupsDTO = await iceDelegate.getGroups();
            groupContactList.innerHTML = "";

            groupsDTO.forEach(group => {
                const li = document.createElement("li");
                li.classList.add("contact-item");

                // Por ahora asumimos que el usuario es miembro (Ice no retorna members aún)
                const isMember = true;

                if (isMember) {
                    li.textContent = group.name;
                    li.addEventListener("click", () => {
                        if (selectedGroupItem) selectedGroupItem.classList.remove("selected");
                        if (selectedUserItem) {
                            selectedUserItem.classList.remove("selected");
                            selectedUserItem = null;
                        }
                        
                        // Seleccionar nuevo item
                        li.classList.add("selected");
                        selectedGroupItem = li;
                        
                        console.log("Grupo seleccionado:", group.name);
                        onSelectUser?.(group.name, true);
                    });
                } else {
                    li.innerHTML = group.name + " ";
                    const joinBtn = Button({ text: "Join", icon: "add" });
                    joinBtn.addEventListener("click", async (e) => {
                        e.stopPropagation();
                        try {
                            await iceDelegate.joinGroup(group.name);
                            console.log("Joined group:", group.name);
                            updateGroups();
                        } catch (err) {
                            console.error("Error uniendo grupo:", err);
                        }
                    });
                    li.appendChild(joinBtn);
                }

                groupContactList.appendChild(li);
            });
        } catch (err) {
            console.error("Error cargando grupos:", err);
        }
    };

    // Botón crear grupo
    btnAddGroup.addEventListener("click", () => {
        if (!registeredUser) {
            alert("Usuario no registrado. No se puede crear el grupo.");
            return;
        }

        PromptInput("Nombre del grupo:", async (groupName) => {
            if (!groupName) return;

            try {
                const result = await iceDelegate.createGroup(groupName);
                console.log("Grupo creado:", result);
                updateGroups();
            } catch (err) {
                console.error("Error creando grupo:", err);
            }
        });
    });

    // Cargar inicial de usuarios y grupos
    updateUsers();
    updateGroups();

    // Exponer funciones para actualizar desde callbacks
    sideBar.updateUsers = updateUsers;
    sideBar.updateGroups = updateGroups;

    return sideBar;
};

export default ContactSideBar;
