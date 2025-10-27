import Button from "../components/ActionButton.js";
import TextInput from "../components/InputMessageBar.js";
import Title from "../components/Title.js";
import { navigate } from "../router/Router.js";

const Login = () => {
    const loginPage = document.createElement("div");
    loginPage.classList.add("login-page");

    const form = document.createElement("form");
    form.classList.add("login-form");

    const title = Title("Bienvenido a Chat App");
    form.appendChild(title);

    const input = TextInput("Username","");
    form.appendChild(input);
    const btnLogin = Button({
        text: "Ingresar",
        icon: "",
        type: "submit"
    });

    form.onsubmit = (event) => {
        event.preventDefault();
        const username = input.value.trim();
        if (!username) return;

        navigate("/chat", { username });

    }

    form.appendChild(btnLogin);

    loginPage.appendChild(form);

    return loginPage;
}

export default Login;