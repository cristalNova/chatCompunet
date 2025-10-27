const express = require('express');
const net = require('net');
const cors = require('cors');


const socket = new net.Socket();
let connected = false;

socket.connect(5000, "127.0.0.1", () => {
    console.log("Conectado al servidor de Java");
    const message = {
        command: "HELLO",
        data: {}
    }
    socket.write(JSON.stringify(message) + "\n")
    socket.once("data", (data) => {
        console.log("Respuesta del servidor:", data.toString().trim());
    });
    connected = true;
})