// Player.js
const Player = () => {
  const container = document.createElement("div");
  container.classList.add("player-container");

  const audioCtx = new AudioContext();

  const playBase64 = async (base64String) => {
    try {
      const arrayBuffer = base64ToArrayBuffer(base64String);
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
    } catch (err) {
      console.error("Error reproduciendo audio:", err);
    }
  };

  const base64ToArrayBuffer = (base64) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  return {
    element: container,
    playBase64
  };
};

export default Player;



