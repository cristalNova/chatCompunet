import Button from "../components/ActionButton.js";
import TextInput from "../components/InputMessageBar.js";
import Title from "../components/Title.js";

const Login = () => {
    const loginPage = document.createElement("div");
    loginPage.classList.add("login-page");
    const title = Title("Welcome to Chat App");
    loginPage.appendChild(title);
    const input = TextInput("Username","");
    loginPage.appendChild(input);
    const btnLogin = Button("Log In");
    loginPage.appendChild(btnLogin);

    return loginPage;
}

export default Login;