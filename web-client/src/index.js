import { urls } from "./router/Routes.js";
import { Router } from "./router/Router.js";

async function renderApp() {
  const appDiv = document.getElementById('app');
  appDiv.innerHTML = ''; 

  const currentRouteComponent = await Router(urls); // ⚠️ await aquí
  appDiv.appendChild(currentRouteComponent);
}

window.renderApp = renderApp;

window.addEventListener('popstate', () => {
  renderApp();
});

renderApp();
