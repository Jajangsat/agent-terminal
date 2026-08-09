# AGENT_TERMINAL

> OpenAI-compatible agent web interface with brutalism design.

![Brutalism](https://img.shields.io/badge/style-BRUTALISM-00ff41)
![API](https://img.shields.io/badge/API-OpenAI%20Compatible-0066ff)
![License](https://img.shields.io/badge/license-MIT-ffaa00)

## Features

- **Chat Interface** — Full conversation with any OpenAI-compatible API
- **Image Generation** — DALL-E or compatible image models
- **Session History** — Persistent chat sessions (localStorage)
- **Dark/Light Mode** — Toggle between themes
- **Connection Test** — Verify API configuration instantly
- **Responsive** — Works on desktop and mobile
- **Zero Dependencies** — Pure HTML/CSS/JS, no frameworks

## Quick Start

1. **Clone or download** this repo
2. Go to **Settings → Pages**
3. Set source to **main** branch, **/ (root)** folder
4. Visit `https://username.github.io/repo-name`

## Configuration

Click the gear icon (⚙) in the header to configure:

| Field | Description | Example |
|-------|-------------|---------|
| API_BASE_URL | Your provider's endpoint | `https://api.openai.com/v1` |
| API_KEY | Your secret key | `sk-...` |
| CHAT_MODEL | Model for conversations | `gpt-4o` |
| IMAGE_MODEL | Model for image gen | `dall-e-3` |
| SYSTEM_PROMPT | Agent personality/goals | Custom prompt |
| TEMPERATURE | Response randomness (0-2) | `0.7` |

## Compatible Providers

- OpenAI (api.openai.com)
- Together AI
- OpenRouter
- Groq
- Any OpenAI-compatible endpoint

## Security Note

⚠️ API keys are stored in **browser localStorage** (client-side only). 
Never share your URL or deploy with keys hardcoded.

For production use, consider:
- Using a serverless proxy (Vercel/Netlify Functions)
- Adding password protection
- Rate limiting

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+Enter` | Send message |
| `Shift+Enter` | New line |

## Customization

Edit `style.css` to modify:
- Colors (CSS variables in `:root`)
- Border thickness
- Font families
- Shadows and brutalism intensity

## License

MIT — Use freely, modify wildly, share boldly.
