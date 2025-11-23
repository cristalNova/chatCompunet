// Router.js
export const Router = async (paths) => {
    const route = window.location.pathname;
    const state = window.history.state || {};

    const routeComponent = paths[route] || (() => {
        const notFound = document.createElement("p");
        notFound.innerText = "404 - Not Found";
        return notFound;
    });

    return await routeComponent(state);
};

// Exportar navigate para poder usarlo en Login.js
export const navigate = (path, params = {}) => {
    window.history.pushState(params, "", path);
    window.renderApp();
};
