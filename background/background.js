// Comet Search Bar - Background Service Worker
// Handles omnibox functionality and search operations

// Search engine configurations
const SEARCH_ENGINES = {
  kagi: {
    name: 'Kagi',
    searchUrl: 'https://kagi.com/search?q=%s',
    suggestUrl: 'https://kagi.com/api/autosuggest?q=%s',
    // Kagi doesn't have a public suggest API, so we'll use Google's
    fallbackSuggestUrl: 'https://suggestqueries.google.com/complete/search?client=chrome&q=%s'
  },
  google: {
    name: 'Google',
    searchUrl: 'https://www.google.com/search?q=%s',
    suggestUrl: 'https://suggestqueries.google.com/complete/search?client=chrome&q=%s'
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    searchUrl: 'https://duckduckgo.com/?q=%s',
    suggestUrl: 'https://duckduckgo.com/ac/?q=%s&type=list'
  },
  yahoo: {
    name: 'Yahoo',
    searchUrl: 'https://search.yahoo.com/search?p=%s',
    suggestUrl: 'https://search.yahoo.com/sugg/gossip/gossip-us-ura/?command=%s&output=sd1'
  },
  ecosia: {
    name: 'Ecosia',
    searchUrl: 'https://www.ecosia.org/search?q=%s',
    suggestUrl: 'https://ac.ecosia.org/autocomplete?q=%s&type=list'
  }
};

// Default settings
const DEFAULT_SETTINGS = {
  searchEngine: 'kagi',
  showSuggestions: true,
  openInNewTab: false,
  maxSuggestions: 5
};

// Get current settings
async function getSettings() {
  try {
    const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    return result;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// Get search engine config
async function getSearchEngine() {
  const settings = await getSettings();
  return SEARCH_ENGINES[settings.searchEngine] || SEARCH_ENGINES.kagi;
}

// Fetch search suggestions
async function fetchSuggestions(query) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const settings = await getSettings();
  if (!settings.showSuggestions) {
    return [];
  }

  const engine = SEARCH_ENGINES[settings.searchEngine] || SEARCH_ENGINES.kagi;
  let suggestUrl = engine.suggestUrl || engine.fallbackSuggestUrl;

  // Kagi uses fallback since they don't have a public suggest API
  if (settings.searchEngine === 'kagi' && engine.fallbackSuggestUrl) {
    suggestUrl = engine.fallbackSuggestUrl;
  }

  if (!suggestUrl) {
    return [];
  }

  const url = suggestUrl.replace('%s', encodeURIComponent(query));

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Parse response based on search engine
    let suggestions = [];

    if (settings.searchEngine === 'duckduckgo') {
      // DuckDuckGo returns [query, [suggestions]]
      if (Array.isArray(data) && Array.isArray(data[1])) {
        suggestions = data[1];
      }
    } else if (settings.searchEngine === 'yahoo') {
      // Yahoo has a different format
      if (data.gossip && data.gossip.results) {
        suggestions = data.gossip.results.map(r => r.key);
      }
    } else if (settings.searchEngine === 'ecosia') {
      // Ecosia returns [query, [suggestions]]
      if (Array.isArray(data) && Array.isArray(data[1])) {
        suggestions = data[1];
      }
    } else {
      // Google format: [query, [suggestions], ...]
      if (Array.isArray(data) && Array.isArray(data[1])) {
        suggestions = data[1];
      }
    }

    // Limit suggestions
    return suggestions.slice(0, settings.maxSuggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
}

// Perform search
async function performSearch(query, openInNewTab = null) {
  if (!query || query.trim().length === 0) {
    return;
  }

  const settings = await getSettings();
  const engine = await getSearchEngine();
  const searchUrl = engine.searchUrl.replace('%s', encodeURIComponent(query.trim()));

  const shouldOpenInNewTab = openInNewTab !== null ? openInNewTab : settings.openInNewTab;

  if (shouldOpenInNewTab) {
    chrome.tabs.create({ url: searchUrl });
  } else {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab) {
      chrome.tabs.update(activeTab.id, { url: searchUrl });
    } else {
      chrome.tabs.create({ url: searchUrl });
    }
  }
}

// Omnibox event handlers

// Set default suggestion when user types the keyword
chrome.omnibox.setDefaultSuggestion({
  description: 'Search with Comet Search Bar: %s'
});

// Handle input changes in omnibox
chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  if (!text || text.trim().length === 0) {
    return;
  }

  try {
    const suggestions = await fetchSuggestions(text);
    const settings = await getSettings();
    const engineName = SEARCH_ENGINES[settings.searchEngine]?.name || 'Kagi';

    const omniboxSuggestions = suggestions.map(suggestion => ({
      content: suggestion,
      description: `${engineName}: ${escapeXml(suggestion)}`
    }));

    suggest(omniboxSuggestions);
  } catch (error) {
    console.error('Error in omnibox suggestions:', error);
  }
});

// Handle selection in omnibox
chrome.omnibox.onInputEntered.addListener(async (text, disposition) => {
  let openInNewTab = false;

  switch (disposition) {
    case 'newForegroundTab':
    case 'newBackgroundTab':
      openInNewTab = true;
      break;
    case 'currentTab':
    default:
      openInNewTab = false;
  }

  await performSearch(text, openInNewTab);
});

// Handle omnibox input started
chrome.omnibox.onInputStarted.addListener(async () => {
  const settings = await getSettings();
  const engineName = SEARCH_ENGINES[settings.searchEngine]?.name || 'Kagi';

  chrome.omnibox.setDefaultSuggestion({
    description: `Search ${engineName}: %s`
  });
});

// Escape XML special characters for omnibox description
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Message handler for popup communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'search') {
    performSearch(message.query, message.openInNewTab).then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Indicates async response
  }

  if (message.action === 'getSuggestions') {
    fetchSuggestions(message.query).then(suggestions => {
      sendResponse({ suggestions });
    }).catch(error => {
      sendResponse({ suggestions: [], error: error.message });
    });
    return true; // Indicates async response
  }

  if (message.action === 'getSettings') {
    getSettings().then(settings => {
      sendResponse(settings);
    }).catch(error => {
      sendResponse(DEFAULT_SETTINGS);
    });
    return true;
  }

  if (message.action === 'getSearchEngines') {
    sendResponse(SEARCH_ENGINES);
    return false;
  }
});

// Initialize on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set default settings
    await chrome.storage.sync.set(DEFAULT_SETTINGS);
    console.log('Comet Search Bar installed with default settings');
  }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SEARCH_ENGINES,
    DEFAULT_SETTINGS,
    fetchSuggestions,
    performSearch,
    getSettings,
    getSearchEngine
  };
}
