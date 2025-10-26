import { routes } from "./router/Routes.js";

function renderApp() {
  const appDiv = document.getElementById('app');
  appDiv.innerHTML = ''; 
  appDiv.appendChild(routes);
}

renderApp();
