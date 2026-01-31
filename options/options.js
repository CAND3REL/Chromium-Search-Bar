// Comet Search Bar - Options Page Script

// Search engines configuration
const SEARCH_ENGINES = {
  kagi: {
    name: 'Kagi',
    icon: '🔶',
    color: '#ff8c00'
  },
  google: {
    name: 'Google',
    icon: '🔍',
    color: '#4285f4'
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    icon: '🦆',
    color: '#de5833'
  },
  yahoo: {
    name: 'Yahoo',
    icon: '📧',
    color: '#6001d2'
  },
  ecosia: {
    name: 'Ecosia',
    icon: '🌳',
    color: '#36acb8'
  }
};

// Default settings
const DEFAULT_SETTINGS = {
  searchEngine: 'kagi',
  showSuggestions: true,
  openInNewTab: false,
  maxSuggestions: 5
};

// DOM Elements
let engineGrid;
let showSuggestionsToggle;
let openNewTabToggle;
let maxSuggestionsSelect;
let statusMessage;
let shortcutsLink;

// Current settings
let currentSettings = { ...DEFAULT_SETTINGS };

// Initialize
function init() {
  // Get DOM elements
  engineGrid = document.getElementById('engine-grid');
  showSuggestionsToggle = document.getElementById('show-suggestions');
  openNewTabToggle = document.getElementById('open-new-tab');
  maxSuggestionsSelect = document.getElementById('max-suggestions');
  statusMessage = document.getElementById('status-message');
  shortcutsLink = document.getElementById('shortcuts-link');

  // Setup
  renderEngineOptions();
  loadSettings();
  setupEventListeners();
}

// Render search engine options
function renderEngineOptions() {
  engineGrid.innerHTML = Object.entries(SEARCH_ENGINES).map(([key, engine]) => `
    <label class="engine-option" data-engine="${key}">
      <input type="radio" name="search-engine" value="${key}">
      <div class="engine-icon" style="color: ${engine.color}">${engine.icon}</div>
      <div class="engine-name">${engine.name}</div>
    </label>
  `).join('');
}

// Load settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    currentSettings = result;
    updateUI();
  } catch (error) {
    console.error('Error loading settings:', error);
    updateUI();
  }
}

// Update UI with current settings
function updateUI() {
  // Update engine selection
  const engineOptions = engineGrid.querySelectorAll('.engine-option');
  engineOptions.forEach(option => {
    const engine = option.dataset.engine;
    const radio = option.querySelector('input[type="radio"]');

    if (engine === currentSettings.searchEngine) {
      option.classList.add('selected');
      radio.checked = true;
    } else {
      option.classList.remove('selected');
      radio.checked = false;
    }
  });

  // Update toggles
  showSuggestionsToggle.checked = currentSettings.showSuggestions;
  openNewTabToggle.checked = currentSettings.openInNewTab;

  // Update select
  maxSuggestionsSelect.value = currentSettings.maxSuggestions.toString();
}

// Setup event listeners
function setupEventListeners() {
  // Engine selection
  engineGrid.addEventListener('click', (e) => {
    const option = e.target.closest('.engine-option');
    if (option) {
      const engine = option.dataset.engine;
      selectEngine(engine);
    }
  });

  // Toggles
  showSuggestionsToggle.addEventListener('change', () => {
    saveSettings({ showSuggestions: showSuggestionsToggle.checked });
  });

  openNewTabToggle.addEventListener('change', () => {
    saveSettings({ openInNewTab: openNewTabToggle.checked });
  });

  // Select
  maxSuggestionsSelect.addEventListener('change', () => {
    saveSettings({ maxSuggestions: parseInt(maxSuggestionsSelect.value) });
  });

  // Shortcuts link
  shortcutsLink.addEventListener('click', (e) => {
    e.preventDefault();
    // Try to open shortcuts page
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });
}

// Select search engine
function selectEngine(engine) {
  if (!SEARCH_ENGINES[engine]) return;

  // Update UI
  const engineOptions = engineGrid.querySelectorAll('.engine-option');
  engineOptions.forEach(option => {
    const isSelected = option.dataset.engine === engine;
    option.classList.toggle('selected', isSelected);
    option.querySelector('input[type="radio"]').checked = isSelected;
  });

  // Save
  saveSettings({ searchEngine: engine });
}

// Save settings
async function saveSettings(updates) {
  try {
    currentSettings = { ...currentSettings, ...updates };
    await chrome.storage.sync.set(currentSettings);
    showStatusMessage();
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Show status message
function showStatusMessage() {
  statusMessage.classList.add('visible');

  // Hide after 2 seconds
  setTimeout(() => {
    statusMessage.classList.remove('visible');
  }, 2000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
