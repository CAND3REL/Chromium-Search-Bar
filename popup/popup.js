// Comet Search Bar - Popup Script

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const clearBtn = document.getElementById('clear-btn');
const settingsBtn = document.getElementById('settings-btn');
const suggestionsContainer = document.getElementById('suggestions-container');
const suggestionsList = document.getElementById('suggestions-list');
const engineNameEl = document.getElementById('engine-name');

// State
let suggestions = [];
let selectedIndex = -1;
let debounceTimer = null;
let currentSettings = null;

// Search engine names
const ENGINE_NAMES = {
  kagi: 'Kagi',
  google: 'Google',
  duckduckgo: 'DuckDuckGo',
  yahoo: 'Yahoo',
  ecosia: 'Ecosia'
};

// Initialize
async function init() {
  await loadSettings();
  setupEventListeners();
  searchInput.focus();
}

// Load settings
async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    currentSettings = response;
    updateEngineDisplay();
  } catch (error) {
    console.error('Error loading settings:', error);
    engineNameEl.textContent = 'Kagi';
  }
}

// Update engine display
function updateEngineDisplay() {
  if (currentSettings && currentSettings.searchEngine) {
    engineNameEl.textContent = ENGINE_NAMES[currentSettings.searchEngine] || 'Kagi';
  }
}

// Setup event listeners
function setupEventListeners() {
  // Search input events
  searchInput.addEventListener('input', handleInput);
  searchInput.addEventListener('keydown', handleKeyDown);
  searchInput.addEventListener('focus', () => {
    if (suggestions.length > 0) {
      showSuggestions();
    }
  });

  // Button events
  searchBtn.addEventListener('click', performSearch);
  clearBtn.addEventListener('click', clearSearch);
  settingsBtn.addEventListener('click', openSettings);

  // Click outside to close suggestions
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box') && !e.target.closest('.suggestions-container')) {
      hideSuggestions();
    }
  });
}

// Handle input changes
function handleInput(e) {
  const query = e.target.value;

  // Toggle clear button visibility
  clearBtn.classList.toggle('visible', query.length > 0);

  // Debounce suggestion fetching
  clearTimeout(debounceTimer);

  if (query.trim().length === 0) {
    hideSuggestions();
    suggestions = [];
    return;
  }

  debounceTimer = setTimeout(() => {
    fetchSuggestions(query);
  }, 200);
}

// Fetch suggestions from background
async function fetchSuggestions(query) {
  if (query.trim().length === 0) return;

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getSuggestions',
      query: query
    });

    if (response && response.suggestions) {
      suggestions = response.suggestions;
      renderSuggestions();
    }
  } catch (error) {
    console.error('Error fetching suggestions:', error);
  }
}

// Render suggestions
function renderSuggestions() {
  if (suggestions.length === 0) {
    hideSuggestions();
    return;
  }

  suggestionsList.innerHTML = suggestions.map((suggestion, index) => `
    <li class="suggestion-item ${index === selectedIndex ? 'selected' : ''}" data-index="${index}">
      <svg class="suggestion-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="M21 21l-4.35-4.35"></path>
      </svg>
      <span class="suggestion-text">${escapeHtml(suggestion)}</span>
    </li>
  `).join('');

  // Add click handlers
  suggestionsList.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.dataset.index);
      selectSuggestion(index);
    });

    item.addEventListener('mouseenter', () => {
      selectedIndex = parseInt(item.dataset.index);
      updateSelectedSuggestion();
    });
  });

  showSuggestions();
}

// Show suggestions
function showSuggestions() {
  suggestionsContainer.classList.remove('hidden');
}

// Hide suggestions
function hideSuggestions() {
  suggestionsContainer.classList.add('hidden');
  selectedIndex = -1;
}

// Update selected suggestion visually
function updateSelectedSuggestion() {
  suggestionsList.querySelectorAll('.suggestion-item').forEach((item, index) => {
    item.classList.toggle('selected', index === selectedIndex);
  });
}

// Select a suggestion
function selectSuggestion(index) {
  if (index >= 0 && index < suggestions.length) {
    searchInput.value = suggestions[index];
    clearBtn.classList.add('visible');
    hideSuggestions();
    performSearch();
  }
}

// Handle keyboard navigation
function handleKeyDown(e) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      if (suggestions.length > 0) {
        selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
        updateSelectedSuggestion();
        scrollToSelected();
      }
      break;

    case 'ArrowUp':
      e.preventDefault();
      if (suggestions.length > 0) {
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelectedSuggestion();
        scrollToSelected();
      }
      break;

    case 'Enter':
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        selectSuggestion(selectedIndex);
      } else {
        performSearch();
      }
      break;

    case 'Escape':
      if (suggestions.length > 0 && !suggestionsContainer.classList.contains('hidden')) {
        hideSuggestions();
      } else {
        window.close();
      }
      break;

    case 'Tab':
      if (suggestions.length > 0 && selectedIndex >= 0) {
        e.preventDefault();
        searchInput.value = suggestions[selectedIndex];
        clearBtn.classList.add('visible');
      }
      break;
  }
}

// Scroll to selected suggestion
function scrollToSelected() {
  const selected = suggestionsList.querySelector('.suggestion-item.selected');
  if (selected) {
    selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// Perform search
async function performSearch() {
  const query = searchInput.value.trim();

  if (query.length === 0) {
    searchInput.focus();
    return;
  }

  try {
    // Check if Ctrl/Cmd is held for new tab
    const openInNewTab = false; // Popup always opens in current tab by default

    await chrome.runtime.sendMessage({
      action: 'search',
      query: query,
      openInNewTab: openInNewTab
    });

    window.close();
  } catch (error) {
    console.error('Error performing search:', error);
  }
}

// Clear search
function clearSearch() {
  searchInput.value = '';
  clearBtn.classList.remove('visible');
  hideSuggestions();
  suggestions = [];
  searchInput.focus();
}

// Open settings
function openSettings() {
  chrome.runtime.openOptionsPage();
  window.close();
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
