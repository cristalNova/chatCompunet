import  Chat from "../pages/Chat.js";
import  Log_in  from "../pages/Log_in.js";
import { Router } from "./Router.js";

export const urls = {
    "/": Log_in,
    "/chat": Chat,
}

export const routes = Router(urls);