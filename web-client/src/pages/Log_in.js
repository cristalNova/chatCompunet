import Button from "../components/ActionButton.js";
import TextInput from "../components/InputMessageBar.js";
import Title from "../components/Title.js";
import { navigate } from "../router/Router.js";
import iceDelegate from "../services/iceDelegate.js";

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

    form.onsubmit = async (event) => {
        event.preventDefault();
        const username = input.value.trim();
        if (!username) return;

        try {
            // Conectar via Ice en lugar de HTTP
            console.log('[Login] Connecting to Ice server...');
            await iceDelegate.init(username);
            console.log('[Login] Connected successfully!');
            
            // Navegar al chat
            navigate("/chat", { username });
        } catch (error) {
            console.error('[Login] Error connecting to Ice:', error);
            alert('Error al conectar con el servidor Ice. Verifica que el servidor esté corriendo.');
        }
    }

    form.appendChild(btnLogin);

    loginPage.appendChild(form);

    return loginPage;
}

export default Login;