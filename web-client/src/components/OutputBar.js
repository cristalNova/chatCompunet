import Button from "./ActionButton.js";
import TextInput from "./InputMessageBar.js";
import iceDelegate from "../services/iceDelegate.js";

const OutputBar = (currentUser, messagesContainer, allMessages) => {
  let targetUser = null;
  let isGroup = false;


  const outputBar = document.createElement("div");
  outputBar.classList.add("output-bar");

  const inputMessageBar = TextInput("Escribe tu mensaje...", "");
  outputBar.appendChild(inputMessageBar);

  const buttons = document.createElement("div");
  buttons.classList.add("output-buttons");

  const sendButton = Button({ text: "", icon: "send" });
  const callButton = Button({ text: "", icon: "phone" });
  const audioButton = Button({ text: "", icon: "microphone" });
   buttons.appendChild(sendButton);
buttons.appendChild(callButton);
buttons.appendChild(audioButton);

outputBar.appendChild(buttons);

    sendButton.addEventListener("click", async () => {
        const message = inputMessageBar.value.trim();
        
        
        
        if (!message || !targetUser) {
            console.log("No se puede enviar - falta mensaje o target");
            return;
        }

        const msgDiv = document.createElement("div");
        msgDiv.classList.add("chat-message", "sent");
        msgDiv.textContent = message;
        messagesContainer.appendChild(msgDiv);


        allMessages.push({
            type: "TEXT",
            from: currentUser,
            to: isGroup ? null : targetUser,
            group: isGroup ? targetUser : null,
            content: message,
            isGroup: isGroup
        });

        inputMessageBar.value = "";
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Preparar payload para el servidor
        const payload = {
            command: isGroup ? "gmsg" : "msg",  
            from: currentUser,
            to: isGroup ? null : targetUser,   
            group: isGroup ? targetUser : null,
            message: message
        };



        try {
            if (isGroup) {
                await iceDelegate.sendGroupMessage(targetUser, message);
            } else {
                await iceDelegate.sendMessage(targetUser, message);
            }
            console.log("Mensaje enviado via Ice");
        } catch (err) {
            console.error("Error completo:", err);
            console.error("Error message:", err.message);
            console.error("Error stack:", err.stack);
        }
    });

    let mediaRecorder = null;
    let audioChunks = [];
    let recording = false;
    let stream = null;

    audioButton.addEventListener("click", async () => {
        
        if (!recording) {
            recording = true;
            audioButton.classList.add("recording");

            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (err) {
                console.error("No se pudo acceder al micrófono:", err);
                recording = false;
                audioButton.classList.remove("recording");
                return;
            }

            mediaRecorder = new MediaRecorder(stream);

            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {

                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                    console.log("Micrófono cerrado");
                }

                const blob = new Blob(audioChunks, { type: 'audio/webm' });
                const arrayBuffer = await blob.arrayBuffer();
                const audioBytes = new Uint8Array(arrayBuffer);
                recording = false;


                if (!iceDelegate.voiceService) {
                    console.error("VoiceService NO está inicializado aún");
                    return;
                }

                try {
                    await iceDelegate.voiceService.sendVoiceNote(
                        currentUser,
                        targetUser,
                        isGroup ? targetUser : "",
                        audioBytes
                    );
                    console.log("Audio enviado!");
                } catch (err) {
                    console.error("Error enviando audio:", err);
                }
            };

            mediaRecorder.start();
            console.log("Grabación iniciada...");
        }
        else {
            recording = false;
            audioButton.classList.remove("recording");

            if (mediaRecorder && mediaRecorder.state === "recording") {
                mediaRecorder.stop();
                console.log("Grabación detenida");
            } else {
                console.warn("mediaRecorder no estaba grabando. Estado:", mediaRecorder?.state);
            }
        }
    });

    // ======== Call Button - llamadas en tiempo real ========
    // OutputBar.js - Reemplaza todo el código del callButton

    let calling = false;
    let micStream = null;
    let audioContext = null;
    let mediaStreamSource = null;
    let audioWorkletNode = null;
    let seq = 0;

    callButton.addEventListener("click", async () => {
        if (!targetUser) {
            alert("Selecciona alguien para llamar");
            return;
        }

        if (!calling) {
            calling = true;
            callButton.classList.add("recording");
            console.log("[CALL] Iniciando captura de audio...");

            try {
                // Notificar inicio de llamada
                await iceDelegate.startCall(currentUser.toString(), targetUser.toString());

                // Obtener micrófono
                micStream = await navigator.mediaDevices.getUserMedia({ 
                    audio: {
                        channelCount: 1,
                        sampleRate: 44100,
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });

                // Crear AudioContext
                audioContext = new AudioContext({ sampleRate: 44100 });

                // Crear el código del AudioWorklet como Blob
                const processorCode = `
                    class AudioCaptureProcessor extends AudioWorkletProcessor {
                        constructor() {
                            super();
                            this.bufferSize = 8192;
                            this.buffer = new Float32Array(this.bufferSize);
                            this.bufferIndex = 0;
                        }

                        process(inputs, outputs, parameters) {
                            const input = inputs[0];
                            
                            if (input.length > 0) {
                                const inputChannel = input[0];
                                
                                for (let i = 0; i < inputChannel.length; i++) {
                                    this.buffer[this.bufferIndex++] = inputChannel[i];
                                    
                                    if (this.bufferIndex >= this.bufferSize) {
                                        // Convertir Float32 a PCM16
                                        const pcm16Array = new Int16Array(this.bufferSize);
                                        for (let j = 0; j < this.bufferSize; j++) {
                                            const sample = Math.max(-1, Math.min(1, this.buffer[j]));
                                            pcm16Array[j] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                                        }
                                        
                                        // Enviar al thread principal
                                        this.port.postMessage({
                                            audioData: pcm16Array.buffer
                                        }, [pcm16Array.buffer]);
                                        
                                        this.bufferIndex = 0;
                                    }
                                }
                            }
                            
                            return true;
                        }
                    }
                    registerProcessor('audio-capture-processor', AudioCaptureProcessor);
                `;

                // Crear Blob URL
                const blob = new Blob([processorCode], { type: 'application/javascript' });
                const processorUrl = URL.createObjectURL(blob);

                // Cargar el AudioWorklet
                await audioContext.audioWorklet.addModule(processorUrl);
                URL.revokeObjectURL(processorUrl);

                // Crear nodo AudioWorklet
                audioWorkletNode = new AudioWorkletNode(audioContext, 'audio-capture-processor');

                seq = 0;

                // Escuchar mensajes del AudioWorklet
                audioWorkletNode.port.onmessage = async (event) => {
                    const audioData = event.data.audioData;
                    const buffer = new Uint8Array(audioData);

                    if (buffer.length > 0) {
                        seq++;

                        const chunk = {
                            from: currentUser.toString(),
                            to: targetUser.toString(),
                            seq: new Ice.Long(0, seq),
                            data: buffer,
                            timestamp: new Ice.Long(0, seq)
                        };

                        try {
                            await iceDelegate.sendCallChunk(chunk);
                            
                            if (seq % 20 === 0) {
                                console.log(`Enviados ${seq} chunks (${buffer.length} bytes/chunk)`);
                            }
                        } catch (err) {
                            console.error("Error enviando chunk:", err);
                        }
                    }
                };

                // Conectar el flujo de audio
                mediaStreamSource = audioContext.createMediaStreamSource(micStream);
                mediaStreamSource.connect(audioWorkletNode);
                audioWorkletNode.connect(audioContext.destination);

                console.log("Captura iniciada correctamente");

            } catch (err) {
                console.error("Error iniciando captura:", err);
                calling = false;
                callButton.classList.remove("recording");
            }

        } else {
            // ========== DETENER LLAMADA ==========
            calling = false;
            callButton.classList.remove("recording");
            console.log("[CALL] Deteniendo captura...");

            try {
                await iceDelegate.stopCall(currentUser.toString(), targetUser.toString());

                // Desconectar y limpiar AudioWorklet
                if (audioWorkletNode) {
                    audioWorkletNode.port.onmessage = null;
                    audioWorkletNode.disconnect();
                    audioWorkletNode = null;
                }

                if (mediaStreamSource) {
                    mediaStreamSource.disconnect();
                    mediaStreamSource = null;
                }

                if (audioContext) {
                    await audioContext.close();
                    audioContext = null;
                }

                if (micStream) {
                    micStream.getTracks().forEach(track => track.stop());
                    micStream = null;
                }

                console.log("Captura detenida y recursos liberados");

            } catch (err) {
                console.error("Error deteniendo captura:", err);
            }
        }
    });

    // Método para cambiar el target
    outputBar.setTarget = (newTarget, group = false) => {        
        targetUser = newTarget;
        isGroup = group;        

        inputMessageBar.value = "";
        inputMessageBar.disabled = !targetUser;
        inputMessageBar.placeholder = targetUser 
            ? `Escribe tu mensaje... (${group ? 'Grupo: ' + targetUser : 'Privado: ' + targetUser})`
            : "Selecciona un chat para enviar mensajes";
    };

    return outputBar;
};

export default OutputBar;

