# Comet Search Bar

A dedicated search bar extension for Comet Browser (and other Chromium-based browsers) that brings back the classic separate search bar experience.

## Features

- **Multiple Search Engines**: Choose from Kagi (default), Google, DuckDuckGo, Yahoo, or Ecosia
- **Live Search Suggestions**: Get real-time search suggestions as you type
- **Omnibox Integration**: Type `k` followed by a space in the URL bar for quick search access
- **Keyboard Shortcuts**: Press `Ctrl+Shift+K` (or `Cmd+Shift+K` on Mac) to open the search popup
- **Modern Dark Theme**: Clean, modern interface that matches Comet Browser's aesthetic
- **Customizable Settings**: Configure suggestion count, new tab behavior, and more

## Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Open your Chromium-based browser (Comet, Chrome, Edge, etc.)
3. Navigate to `chrome://extensions/`
4. Enable "Developer mode" (toggle in the top-right corner)
5. Click "Load unpacked"
6. Select the extension directory

### Usage

#### Popup Search Bar
- Click the extension icon in the toolbar to open the search popup
- Or use the keyboard shortcut `Ctrl+Shift+K` / `Cmd+Shift+K`

#### Omnibox Search
1. Type `k` in the URL bar
2. Press `Space` or `Tab`
3. Type your search query
4. Press `Enter` to search

#### Settings
- Click the gear icon in the popup, or
- Right-click the extension icon and select "Options"

## Configuration

### Search Engines

| Engine | Description |
|--------|-------------|
| **Kagi** (default) | Privacy-focused premium search engine |
| **Google** | Most comprehensive search results |
| **DuckDuckGo** | Privacy-focused, no tracking |
| **Yahoo** | Classic search engine |
| **Ecosia** | Eco-friendly, plants trees with ad revenue |

### Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Show Suggestions | Display search suggestions as you type | On |
| Open in New Tab | Open search results in a new tab | Off |
| Max Suggestions | Number of suggestions to display | 5 |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+K` / `Cmd+Shift+K` | Open search popup |
| `k` + `Space` (in URL bar) | Activate omnibox search |
| `Enter` | Perform search |
| `↑` / `↓` | Navigate suggestions |
| `Tab` | Autocomplete with selected suggestion |
| `Escape` | Close suggestions / popup |

## Technical Notes

### Browser Limitations

Chrome extensions cannot inject UI directly into the browser toolbar (next to the URL bar). This extension provides the closest possible experience through:

1. **Popup UI**: A dedicated search interface accessible via icon click or keyboard shortcut
2. **Omnibox API**: Keyword-triggered search with suggestions directly in the URL bar

### Permissions

- `storage`: Save user preferences
- `host_permissions`: Fetch search suggestions from search engines

## Development

### Project Structure

```
comet-search-bar/
├── manifest.json          # Extension manifest (MV3)
├── background/
│   └── background.js      # Service worker for omnibox and search
├── popup/
│   ├── popup.html         # Popup UI structure
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic
├── options/
│   ├── options.html       # Settings page structure
│   ├── options.css        # Settings page styles
│   └── options.js         # Settings logic
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

### Building Icons

Run the icon generator script if you need to regenerate icons:

```bash
node generate-icons.js
```

## License

MIT License - Feel free to use and modify as needed.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
