export const Router = (paths) => {

    const route = window.location.pathname;

    const state = window.history.state || {};

    const routeComponent = paths[route] || (() => {
        const notFound = document.createElement("p");
        notFound.innerText = "404 - Not Found";
        return notFound;
    });

    return routeComponent(state);

};

export const navigate = (path, params = {}) => {
    window.history.pushState(params, "", path);
    window.renderApp();
};