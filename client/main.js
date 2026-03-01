let ws;
let keyPair;
let chat = document.getElementById('chat');

(async () => {
  await sodium.ready;
  keyPair = sodium.crypto_box_keypair();
  ws = new WebSocket(`ws://${window.location.hostname}:3000`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.cipher && data.nonce && data.publicKey) {
      const decrypted = sodium.crypto_box_open_easy(
        sodium.from_base64(data.cipher),
        sodium.from_base64(data.nonce),
        sodium.from_base64(data.publicKey),
        keyPair.privateKey
      );
      chat.innerHTML += `<div>${sodium.to_string(decrypted)}</div>`;
      chat.scrollTop = chat.scrollHeight;
    }
  };
})();

function sendMessage() {
  const input = document.getElementById('message');
  const text = input.value;
  if (!text) return;
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  // For demo, encrypt to self (should use recipient's public key in real app)
  const cipher = sodium.crypto_box_easy(
    sodium.from_string(text),
    nonce,
    keyPair.publicKey,
    keyPair.privateKey
  );
  ws.send(JSON.stringify({
    cipher: sodium.to_base64(cipher),
    nonce: sodium.to_base64(nonce),
    publicKey: sodium.to_base64(keyPair.publicKey)
  }));
  input.value = '';
}
