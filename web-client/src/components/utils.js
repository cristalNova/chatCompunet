export const addUserToList = (username) => {
    const list = document.getElementById("user-list");
    if (!list) return;
    if ([...list.children].some(li => li.textContent === username)) return;

    const li = document.createElement("li");
    li.textContent = username;
    li.id = `user-${username}`;
    list.appendChild(li);
};

export const removeUserFromList = (username) => {
    const li = document.getElementById(`user-${username}`);
    if (li) li.remove();
};
