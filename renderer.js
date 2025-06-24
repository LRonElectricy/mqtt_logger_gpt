const { ipcRenderer } = require('electron');
const mqtt = require('mqtt');

let client = null;
let messages = [];

const ipInput = document.getElementById('ip');
const portInput = document.getElementById('port');
const topicInput = document.getElementById('topic');
const filterInput = document.getElementById('filter');
const tableBody = document.getElementById('table-body');

async function loadSettings() {
  const settings = await ipcRenderer.invoke('get-settings');
  ipInput.value = settings.ip || 'localhost';
  portInput.value = settings.port || 1883;
  topicInput.value = settings.topic || '';
}

function addRow(entry) {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${entry.timestamp}</td><td>${entry.topic}</td><td>${JSON.stringify(entry.payload)}</td>`;
  tableBody.appendChild(tr);
}

function renderTable() {
  tableBody.innerHTML = '';
  const filter = filterInput.value.toLowerCase();
  messages.filter(m => JSON.stringify(m).toLowerCase().includes(filter)).forEach(addRow);
}

async function connect() {
  if (client) {
    client.end(true);
  }
  const ip = ipInput.value || 'localhost';
  const port = portInput.value || 1883;
  const topic = topicInput.value;
  ipcRenderer.invoke('save-setting','ip',ip);
  ipcRenderer.invoke('save-setting','port',port);
  ipcRenderer.invoke('save-setting','topic',topic);
  const url = `mqtt://${ip}:${port}`;
  client = mqtt.connect(url);
  client.on('connect', () => {
    client.subscribe(topic);
  });
  client.on('message', async (topic, message) => {
    let payload;
    try { payload = JSON.parse(message.toString()); } catch(e) { payload = message.toString(); }
    const entry = { timestamp: new Date().toISOString(), topic, payload };
    messages.push(entry);
    renderTable();
    await ipcRenderer.invoke('append-log', entry);
  });
}

document.getElementById('connect').addEventListener('click', connect);
filterInput.addEventListener('input', renderTable);
document.getElementById('export').addEventListener('click', async () => {
  const path = await ipcRenderer.invoke('export-log');
  alert('Exported to '+path);
});
document.getElementById('clear').addEventListener('click', () => {
  messages = [];
  renderTable();
});

loadSettings();
