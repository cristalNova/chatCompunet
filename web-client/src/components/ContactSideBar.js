import Button from "./ActionButton.js";
import ContactList from "./ContactList.js";
import Subtitle from "./Subtitle.js";
import Title from "./Title.js";
import PromptInput from "./PromptInput.js";

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
            const res = await fetch("http://localhost:3000/api/users");
            const users = await res.json();
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
            const res = await fetch("http://localhost:3000/api/groups");
            const groups = await res.json();
            groupContactList.innerHTML = "";

            groups.forEach(group => {
                const li = document.createElement("li");
                li.classList.add("contact-item");

                const isMember = group.members.includes(registeredUser);

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
                            const res = await fetch("http://localhost:3000/api/message", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    command: "join",
                                    from: registeredUser,
                                    group: group.name
                                })
                            });
                            const result = await res.json();
                            console.log("Joined group:", result);
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
                const res = await fetch("http://localhost:3000/api/message", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        command: "create",
                        from: registeredUser,
                        group: groupName
                    })
                });
                const result = await res.json();
                console.log("Grupo creado:", result);
                updateGroups();
            } catch (err) {
                console.error("Error creando grupo:", err);
            }
        });
    });

    updateUsers();
    updateGroups();
    setInterval(updateUsers, 5000);
    setInterval(updateGroups, 5000);

    return sideBar;
};

export default ContactSideBar;
