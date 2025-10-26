import Button from "../components/ActionButton.js";
import TextInput from "../components/InputMessageBar.js";
import Title from "../components/Title.js";

const Login = () => {
    const loginPage = document.createElement("div");
    loginPage.classList.add("login-page");

    const form = document.createElement("form");
    form.classList.add("login-form");

    const title = Title("Welcome to Chat App");
    form.appendChild(title);

    const input = TextInput("Username","");
    form.appendChild(input);
    const btnLogin = Button({
        text: "Log In",
        icon: "",
        type: "submit"
    });
    form.appendChild(btnLogin);
    
    loginPage.appendChild(form);

    return loginPage;
}

export default Login;