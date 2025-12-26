const websocketEndpoint = 'wss://b3kg2sy7kg.execute-api.us-east-1.amazonaws.com/production/'; 
const apiKey = 'kVE3MmZaXg3u2igWjE5392om95UxlJ4yaqMSoTv6'; // This key needs to be enabled in your API Gateway stage settings

let websocket;
const messagesDiv = document.getElementById('messages');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');

function connect() {
    // For an API Key authenticated WebSocket API, the key can be automatically added 
    // as a 'x-api-key' header in the initial HTTP upgrade request if using a library like Amplify, 
    // but the standard W3C WebSocket client does not allow setting custom headers.
    // The typical approach for vanilla JS and API Gateway with API key is to use a query parameter.

    const urlWithApiKey = `${websocketEndpoint}?x-api-key=${encodeURIComponent(apiKey)}`;
    websocket = new WebSocket(urlWithApiKey); // Connect with API key as query parameter

    websocket.onopen = function(event) {
        logMessage('Connected to the chat', 'system');
        connectButton.disabled = true;
        disconnectButton.disabled = false;
        sendButton.disabled = false;
    };

    websocket.onmessage = function(event) {
        const messageData = JSON.parse(event.data);
        logMessage(messageData.message, messageData.sender);
    };

    websocket.onclose = function(event) {
        logMessage('Disconnected from the chat', 'system');
        connectButton.disabled = false;
        disconnectButton.disabled = true;
        sendButton.disabled = true;
    };

    websocket.onerror = function(error) {
        logMessage('WebSocket Error: ' + error.message, 'system');
    };
}

function disconnect() {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.close();
    }
}

function send() {
    const message = messageInput.value;
    const username = usernameInput.value || 'Anonymous';

    if (message && websocket.readyState === WebSocket.OPEN) {
        // AWS API Gateway routes messages based on the 'action' key in the body
        const data = {
            action: 'sendMessage', // Corresponds to the custom route in API Gateway
            message: `${username}: ${message}`
        };
        websocket.send(JSON.stringify(data));
        messageInput.value = '';
    }
}

function logMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>[${sender}]:</strong> ${message}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to the latest message
}

// Initial state
disconnectButton.disabled = true;
sendButton.disabled = true;
