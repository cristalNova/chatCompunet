import { urls } from "./router/Routes.js";
import { Router } from "./router/Router.js";

function renderApp() {
  const appDiv = document.getElementById('app');
  appDiv.innerHTML = ''; 

  const currentRouteComponent = Router(urls);
  appDiv.appendChild(currentRouteComponent);
}

window.renderApp = renderApp;

window.addEventListener('popstate', () => {
  renderApp();
});

renderApp();
