# DeTLeng Automation

Client-facing website and independent inquiry service for the DeTLeng Automation Desk.

## Architecture

- `index.html` — GitHub Pages website at `https://automation.detleng.com`
- `api/` — Node.js inquiry API deployed as a separate Render Web Service
- Resend — sends the internal inquiry and visitor acknowledgement from the verified `mail.detleng.com` domain

The API is independent from the DeTLeng n8n learning project. It uses a dedicated, sending-only Resend API key.

## Render service

| Setting | Value |
| --- | --- |
| Name | `automation-detleng-api` |
| Root directory | `api` |
| Build command | `npm install` |
| Start command | `npm start` |
| Health check | `/health` |

Required environment variables are documented in `api/.env.example`. Never commit real API keys.

## Local verification

```bash
cd api
npm test
npm start
```
