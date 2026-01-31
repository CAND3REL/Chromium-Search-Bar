# Chromium Search Bar

A browser extension that brings back the classic dedicated search bar experience to Chromium-based browsers.

## Why This Extension?

Modern browsers have merged the search bar with the address bar (URL bar), creating a single "omnibox." While this saves space, many users prefer having a separate, dedicated search bar for quick web searches without interfering with URL entry. This extension restores that functionality by providing a dedicated search interface with live suggestions, configurable search engines, and quick keyboard access.

## Features

- **Multiple Search Engines**: Choose from Kagi (default), Google, DuckDuckGo, Yahoo, or Ecosia
- **Live Search Suggestions**: Get real-time search suggestions as you type
- **Open in New Tab**: Optionally open search results in a new tab (configurable in settings)
- **Omnibox Integration**: Type `k` followed by a space in the URL bar for quick search access
- **Keyboard Shortcuts**: Press `Ctrl+Shift+K` (or `Cmd+Shift+K` on Mac) to open the search popup
- **Modern Dark Theme**: Clean, modern interface
- **Customizable Settings**: Configure search engine, suggestion count, new tab behavior, and more
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Installation

### From Release (.zip)

1. Download the latest `.zip` file from the [Releases](../../releases) page
2. Extract the zip file to a folder on your computer
3. Open your Chromium-based browser (Chrome, Edge, Brave, Vivaldi, etc.)
4. Navigate to `chrome://extensions/`
5. Enable "Developer mode" (toggle in the top-right corner)
6. Click "Load unpacked"
7. Select the extracted folder

### From Source

1. Clone or download this repository
2. Open your Chromium-based browser
3. Navigate to `chrome://extensions/`
4. Enable "Developer mode" (toggle in the top-right corner)
5. Click "Load unpacked"
6. Select the repository folder (containing `manifest.json`)

## Usage

### Popup Search Bar
- Click the extension icon in the toolbar to open the search popup
- Or use the keyboard shortcut `Ctrl+Shift+K` / `Cmd+Shift+K`

### Omnibox Search
1. Type `k` in the URL bar
2. Press `Space` or `Tab`
3. Type your search query
4. Press `Enter` to search

### Settings
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

Chrome extensions cannot inject UI directly into the browser toolbar (next to the URL bar) due to browser security restrictions. This extension provides the closest possible experience through:

1. **Popup UI**: A dedicated search interface accessible via icon click or keyboard shortcut
2. **Omnibox API**: Keyword-triggered search with suggestions directly in the URL bar

### Permissions

- `storage`: Save user preferences
- `host_permissions`: Fetch search suggestions from search engines

## Development

### Project Structure

```
chromium-search-bar/
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

## Compatibility

This extension is compatible with all Chromium-based browsers, including:
- Google Chrome
- Microsoft Edge
- Brave
- Vivaldi
- Opera
- And other Chromium derivatives

## License

MIT License - Feel free to use and modify as needed.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
