const MESSAGE_LENGTH = 1024;

function processImage() {
    const fileInput = document.getElementById('fileInput');
    const keyInput = document.getElementById('keyInput');
    const operation = document.querySelector('input[name="operation"]:checked').value;
    const resultDiv = document.getElementById('result');

    if (!fileInput.files.length || !keyInput.value) {
        alert('Please provide an image and a key.');
        return;
    }

    const file = fileInput.files[0];
    const key = parseInt(keyInput.value, 10);

    const reader = new FileReader();
    reader.onload = function(event) {
        const imageData = new Uint8Array(event.target.result);
        const processedData = processImageData(imageData, key, operation);
        displayResult(processedData);
    };
    reader.readAsArrayBuffer(file);
}

function processImageWithMessage() {
    const fileInput = document.getElementById('fileInput');
    const keyInput = document.getElementById('keyInput');
    const messageInput = document.getElementById('messageInput');
    const operation = document.querySelector('input[name="operation"]:checked').value;
    const resultDiv = document.getElementById('result');

    if (!fileInput.files.length || !keyInput.value) {
        alert('Please provide an image and a key.');
        return;
    }

    const file = fileInput.files[0];
    const key = parseInt(keyInput.value, 10);
    const message = messageInput.value || '';

    const reader = new FileReader();
    reader.onload = function(event) {
        const imageData = new Uint8Array(event.target.result);
        let processedData;

        if (operation === 'encrypt') {
            processedData = embedMessage(imageData, message);
            processedData = processImageData(processedData, key, 'encrypt');
        } else {
            processedData = processImageData(imageData, key, 'decrypt');
            const extractedMessage = extractMessage(processedData);
            displayResult(processedData, extractedMessage);
            return;
        }

        displayResult(processedData);
    };
    reader.readAsArrayBuffer(file);
}

function processImageData(data, key, operation) {
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        result[i] = data[i] ^ key;
    }
    return result;
}

function embedMessage(imageData, message) {
    const messageBytes = new TextEncoder().encode(message);
    const paddedMessage = new Uint8Array(MESSAGE_LENGTH);
    paddedMessage.set(messageBytes);

    const result = new Uint8Array(imageData.length + MESSAGE_LENGTH);
    result.set(imageData);
    result.set(paddedMessage, imageData.length);
    return result;
}

function extractMessage(imageData) {
    const messageBytes = new Uint8Array(MESSAGE_LENGTH);
    messageBytes.set(imageData.slice(imageData.length - MESSAGE_LENGTH));
    return new TextDecoder().decode(messageBytes).trim();
}

function displayResult(data, extractedMessage = '') {
    const resultDiv = document.getElementById('result');
    const blob = new Blob([data], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);

    const resultHtml = `
        <div class="text-center">
            <img src="${url}" alt="Processed Image" class="img-fluid" />
        </div>
        ${extractedMessage ? `<div class="text-center mt-3"><p><strong>Embedded Message:</strong> ${extractedMessage}</p></div>` : ''}
        <div class="text-center mt-3">
            <a href="${url}" class="btn btn-primary" download>Download Image</a>
        </div>
    `;

    resultDiv.innerHTML = resultHtml;
}
