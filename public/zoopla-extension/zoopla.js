console.log("✅ zoopla.js loaded");

// Function to extract property data from the page
function extractPropertyData() {
  const propertyData = {};

  try {
    // Extract title - try multiple selectors
    const titleSelectors = [
      'h1[data-testid="listing-details-page-title"]',
      'h1.ui-title',
      'h1',
      '[data-testid="listing-summary-address"]'
    ];
    
    for (const selector of titleSelectors) {
      const titleElement = document.querySelector(selector);
      if (titleElement && titleElement.textContent.trim()) {
        propertyData.title = titleElement.textContent.trim();
        break;
      }
    }

    // Extract price - try multiple selectors
    const priceSelectors = [
      '[data-testid="listing-summary-price"] p',
      '.ui-pricing__main-price',
      '.listing-summary-price',
      'p[data-testid="price"]',
      '[class*="price"]'
    ];
    
    for (const selector of priceSelectors) {
      const priceElement = document.querySelector(selector);
      if (priceElement && priceElement.textContent.trim()) {
        propertyData.price = priceElement.textContent.trim();
        break;
      }
    }

    // Extract location/address
    const locationSelectors = [
      '[data-testid="listing-summary-address"]',
      '.ui-listing-summary__address',
      '.listing-summary-address',
      'address',
      '[class*="address"]'
    ];
    
    for (const selector of locationSelectors) {
      const locationElement = document.querySelector(selector);
      if (locationElement && locationElement.textContent.trim()) {
        propertyData.location = locationElement.textContent.trim();
        break;
      }
    }

    // Extract main property image
    const imageSelectors = [
      '[data-testid="gallery-main-image"] img',
      '.listing-gallery img',
      '.ui-gallery__main-image img',
      '.gallery-main img',
      'img[src*="zoopla"]'
    ];
    
    for (const selector of imageSelectors) {
      const imageElement = document.querySelector(selector);
      if (imageElement && imageElement.src) {
        propertyData.image = imageElement.src;
        break;
      }
    }

    // Extract property type
    const typeSelectors = [
      '[data-testid="listing-summary-property-type"]',
      '.ui-listing-summary__property-type',
      '.listing-summary-property-type'
    ];
    
    for (const selector of typeSelectors) {
      const typeElement = document.querySelector(selector);
      if (typeElement && typeElement.textContent.trim()) {
        propertyData.type = typeElement.textContent.trim();
        break;
      }
    }

    // Extract bedrooms
    const bedroomSelectors = [
      '[data-testid="listing-summary-beds"]',
      '.ui-listing-summary__beds',
      '[class*="bed"]'
    ];
    
    for (const selector of bedroomSelectors) {
      const bedroomElement = document.querySelector(selector);
      if (bedroomElement && bedroomElement.textContent.trim()) {
        const bedroomText = bedroomElement.textContent.trim();
        if (bedroomText.includes('bed')) {
          propertyData.bedrooms = bedroomText;
          break;
        }
      }
    }

    // Extract bathrooms
    const bathroomSelectors = [
      '[data-testid="listing-summary-baths"]',
      '.ui-listing-summary__baths',
      '[class*="bath"]'
    ];
    
    for (const selector of bathroomSelectors) {
      const bathroomElement = document.querySelector(selector);
      if (bathroomElement && bathroomElement.textContent.trim()) {
        const bathroomText = bathroomElement.textContent.trim();
        if (bathroomText.includes('bath')) {
          propertyData.bathrooms = bathroomText;
          break;
        }
      }
    }

    // Try to get URL-based data as fallback
    const url = window.location.href;
    const urlMatch = url.match(/\/details\/(\d+)\/(.*)/);
    if (urlMatch && !propertyData.title) {
      const urlSlug = urlMatch[2];
      const formattedTitle = urlSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace(/\//g, ', ');
      propertyData.title = formattedTitle;
    }

    console.log("🔍 Extracted property data:", propertyData);
    return propertyData;

  } catch (error) {
    console.error("❌ Error extracting property data:", error);
    return {};
  }
}

// Function to store property data
function storePropertyData(url) {
  const propertyData = extractPropertyData();
  
  chrome.storage.local.set({ 
    propertyData: propertyData,
    lastPropertyUrl: url,
    extractedAt: Date.now()
  }, () => {
    console.log("💾 Property data stored:", propertyData);
  });
}

// Listen for property clicks
document.addEventListener("click", function (e) {
  const card = e.target.closest("a[href*='/details/']");
  if (card && card.href) {
    console.log("🟢 Property clicked:", card.href);
    
    chrome.runtime.sendMessage({
      type: "PROPERTY_CLICKED",
      url: card.href
    });
    
    // Store the clicked property URL, data will be extracted when page loads
    chrome.storage.local.set({ lastPropertyUrl: card.href });
  }
});

// Extract property data when on a property details page
function checkAndExtractPropertyData() {
  const url = window.location.href;
  if (url.includes('/details/')) {
    console.log("📄 On property details page, extracting data...");
    
    // Wait a bit for dynamic content to load
    setTimeout(() => {
      storePropertyData(url);
    }, 1000);
    
    // Also extract after a longer delay to catch lazy-loaded content
    setTimeout(() => {
      storePropertyData(url);
    }, 3000);
  }
}

// Extract data on page load
document.addEventListener("DOMContentLoaded", checkAndExtractPropertyData);

// Also run immediately in case DOMContentLoaded already fired
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", checkAndExtractPropertyData);
} else {
  checkAndExtractPropertyData();
}

// Watch for dynamic content changes (SPA behavior)
const observer = new MutationObserver((mutations) => {
  console.log("🔁 DOM updated");
  
  // Check if we're on a new property page
  const url = window.location.href;
  if (url.includes('/details/')) {
    // Debounce the extraction to avoid too many calls
    clearTimeout(window.extractionTimeout);
    window.extractionTimeout = setTimeout(() => {
      storePropertyData(url);
    }, 500);
  }
});

observer.observe(document.body, { 
  childList: true, 
  subtree: true,
  attributes: false,
  characterData: false
});

// Listen for URL changes (for SPA navigation)
let currentUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    console.log("🔄 URL changed to:", currentUrl);
    
    if (currentUrl.includes('/details/')) {
      setTimeout(() => {
        storePropertyData(currentUrl);
      }, 1000);
    }
  }
}, 1000);