# MQTT Logger

Simple cross-platform MQTT logger built with Electron.

## Features
- Connect to an MQTT broker by specifying IP, port and topic
- Display incoming messages in a table with timestamp, topic and payload
- Filter messages by keyword
- Export all logged messages to `data/log-export_YYYYMMDD.json`
- Persist settings between launches
- Logs all messages to `data/log.json`
- Windows build using electron-builder

## Development
```bash
npm install
npm start
```

## Build
```bash
npm run pack
```
