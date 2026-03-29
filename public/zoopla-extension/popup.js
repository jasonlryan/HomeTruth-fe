
document.addEventListener("DOMContentLoaded", () => {
  const status = document.getElementById("status");
  const loginScreen = document.getElementById("login-screen");
  const propertyContent = document.getElementById("property-content");
  const loginBtn = document.getElementById("login-btn");

  chrome.storage.local.get(null, (data) => {
  });

  chrome.storage.local.get(["authToken", "lastPropertyUrl"], (result) => {
    const { authToken, lastPropertyUrl } = result;

    if (authToken) {
      // Hide status banner when logged in and showing property
      status.classList.add("hidden");
      loginScreen.classList.add("hidden");

      if (lastPropertyUrl) {
        const shortUrl = lastPropertyUrl.replace(/^https?:\/\//, "").split("?")[0];
        // const propertyIdMatch = lastPropertyUrl.match(/details\/(\d+)/);
        // const propertyId = propertyIdMatch ? propertyIdMatch[1] : null;
        const propertyId = "18856213";


        // Show loading state while fetching property data
        propertyContent.innerHTML = `
  <h2 class="property-title">Bookmark this Property</h2>
  <div class="property-card">
    <div class="property-header">
      <button class="settings-btn">⚙️</button>
    </div>
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading property details...</p>
    </div>
  </div>
`;

        // Get property data from storage (set by content script)
        chrome.storage.local.get(['propertyData'], (result) => {
          const propertyData = result.propertyData || {};

          // Extract property details with fallbacks
          const propertyTitle = propertyData.title || 'Property Details';
          const propertyPrice = propertyData.price || 'Price not available';
          const propertyLocation = propertyData.location || 'Location not available';
          const propertyImage = 'https://lid.zoocdn.com/u/1200/900/7b41f3f501d1def2e91779f831fb1ed522363653.jpg:p';
          const propertyType = propertyData.type || '';
          const bedrooms = propertyData.bedrooms || '';
          const bathrooms = propertyData.bathrooms || '';

          propertyContent.innerHTML = `
            <div class="property-card">
              <div class="property-header">
                <h2 class="property-title">Bookmark this Property</h2>
                <button class="settings-btn">⚙️</button>
              </div>
              
              <div class="property-image">
                <img src="${propertyImage}" alt="Property" onerror="this.src='https://lid.zoocdn.com/u/1200/900/7b41f3f501d1def2e91779f831fb1ed522363653.jpg:p'" />
              </div>

              <div class="property-details">
                <h3 class="property-name">${propertyTitle}</h3>
                <p class="property-location">${propertyLocation} • ${propertyPrice}</p>
                ${propertyType || bedrooms || bathrooms ? `<p class="property-specs">${[propertyType, bedrooms, bathrooms].filter(Boolean).join(' • ')}</p>` : ''}
              </div>

            <div class="ai-section">
              <div class="ai-input-container">
                <input type="text" id="ai-input" class="ai-input-field" placeholder="Ask HomeTruth..." />
                <button class="ai-submit-btn" id="ai-submit">✨</button>
              </div>
            </div>

            <div class="tags-section">
              <label class="tags-label">Add a tag or label</label>
              <input type="text" id="tag-input" class="tag-input-field" placeholder="e.g., Near Park, Budget Fit" />
              <div class="tags-container" id="tags-container">
                <span class="tag-pill sample-tag">Green Area</span>
                <span class="tag-pill sample-tag">Balcony</span>
                <span class="tag-pill sample-tag">Quiet Zone</span>
              </div>
            </div>

            <div class="status-section" id="bookmark-status">
              <div class="good-deal">✓ Good Deal</div>
            </div>

            <button id="bookmark-btn" class="save-button">Save to MyHT Dashboard</button>
          </div>
        `;

          // Handle tag input
          const tagInput = document.getElementById("tag-input");
          const tagsContainer = document.getElementById("tags-container");
          let customTags = [];

          // Remove sample tags when user starts adding custom ones
          const sampleTags = document.querySelectorAll('.sample-tag');

          tagInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && tagInput.value.trim()) {
              const tag = tagInput.value.trim();
              if (!customTags.includes(tag)) {
                // Clear sample tags on first custom tag
                if (customTags.length === 0) {
                  sampleTags.forEach(tag => tag.remove());
                }

                customTags.push(tag);
                const tagPill = document.createElement("span");
                tagPill.className = "tag-pill custom-tag";
                tagPill.innerHTML = `${tag} <span class="tag-remove">×</span>`;

                // Add remove functionality
                tagPill.querySelector('.tag-remove').addEventListener('click', () => {
                  customTags = customTags.filter(t => t !== tag);
                  tagPill.remove();

                  // Show sample tags if no custom tags
                  if (customTags.length === 0) {
                    tagsContainer.innerHTML = `
                    <span class="tag-pill sample-tag">Green Area</span>
                    <span class="tag-pill sample-tag">Balcony</span>
                    <span class="tag-pill sample-tag">Quiet Zone</span>
                  `;
                  }
                });

                tagsContainer.appendChild(tagPill);
              }
              tagInput.value = "";
            }
          });

          // Handle AI input
          const aiInput = document.getElementById("ai-input");
          const aiSubmit = document.getElementById("ai-submit");

          const handleAISubmit = () => {
            if (aiInput.value.trim()) {
              aiSubmit.textContent = "⏳";
              aiInput.disabled = true;

              // Simulate AI response
              setTimeout(() => {
                const responses = [
                  "This property offers great value for Wimbledon area!",
                  "Transport links are excellent with nearby tube station.",
                  "The balcony adds significant appeal for this price range.",
                  "Area has good schools and family-friendly amenities."
                ];
                const response = responses[Math.floor(Math.random() * responses.length)];

                // Show AI response
                const aiResponse = document.createElement('div');
                aiResponse.className = 'ai-response';
                aiResponse.innerHTML = `<strong>AI:</strong> ${response}`;
                aiInput.parentNode.insertAdjacentElement('afterend', aiResponse);

                aiInput.value = "";
                aiInput.disabled = false;
                aiSubmit.textContent = "✨";
              }, 1500);
            }
          };

          aiSubmit.addEventListener("click", handleAISubmit);
          aiInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleAISubmit();
          });

          // Handle bookmark
          const bookmarkBtn = document.getElementById("bookmark-btn");
          const statusSection = document.getElementById("bookmark-status");

          bookmarkBtn.addEventListener("click", () => {
            if (!propertyId) {
              statusSection.innerHTML = '<div class="error-message">❌ Unable to extract property ID.</div>';
              return;
            }

            bookmarkBtn.textContent = "⏳ Saving...";
            bookmarkBtn.disabled = true;
            bookmarkBtn.classList.add('loading');

            const allTags = customTags.length > 0 ? customTags : ['Green Area', 'Balcony', 'Quiet Zone'];

            fetch("https://hometruth.ohtplayground.com:8005/api/properties/bookmark", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `${authToken}`
              },
              body: JSON.stringify({
                propertyId,
                tags: allTags,
                notes: aiInput.value.trim(),
                url: lastPropertyUrl,
                propertyData: {
                  title: propertyTitle,
                  price: propertyPrice,
                  location: propertyLocation,
                  image: propertyImage,
                  type: propertyType,
                  bedrooms: bedrooms,
                  bathrooms: bathrooms
                }
              })
            })
              .then(res => res.json())
              .then(data => {
                statusSection.innerHTML = '<div class="success-message">✅ Saved to Dashboard!</div>';
                bookmarkBtn.textContent = "✓ Saved to MyHT Dashboard";
                bookmarkBtn.classList.add('saved');

                // Auto-close popup after success
                setTimeout(() => {
                  window.close();
                }, 2000);
              })
              .catch(err => {
                console.error("❌ Bookmark failed:", err);
                statusSection.innerHTML = '<div class="error-message">❌ Failed to save property.</div>';
                bookmarkBtn.textContent = "Save to MyHT Dashboard";
                bookmarkBtn.disabled = false;
                bookmarkBtn.classList.remove('loading');
              });
          });
        });
      } else {
        propertyContent.innerHTML = `
          <div class="no-property">
            <div class="no-property-icon">🏠</div>
            <h3>No Property Selected</h3>
            <p>Visit a Zoopla property page to start tracking!</p>
          </div>
        `;
      }

    } else {
      // Show status banner only when not logged in
      status.textContent = "❌ Not logged in";
      status.style.background = "#fed7d7";
      status.style.color = "#9b2c2c";
      status.classList.remove("hidden");
      loginScreen.classList.remove("hidden");
      propertyContent.innerHTML = "";
    }
  });

  loginBtn.addEventListener("click", () => {
    const redirectUri = `chrome-extension://${chrome.runtime.id}/auth.html`;
    const loginUrl = `https://hometruth.ohtplayground.com/login?redirect_uri=${encodeURIComponent(redirectUri)}`;

    chrome.identity.launchWebAuthFlow(
      {
        url: loginUrl,
        interactive: true
      },
      (redirectedTo) => {
        if (chrome.runtime.lastError) {
          console.warn("⚠️ Login warning:", chrome.runtime.lastError.message);
          chrome.storage.local.get("authToken", (data) => {
            if (!data.authToken) {
              console.error("❌ Login truly failed.");
              status.textContent = "❌ Login failed";
            } else {
              window.location.reload(); // Refresh the popup
            }
          });
          return;
        }

        const token = redirectedTo?.match(/access_token=([^&]+)/)?.[1];
        if (token) {
          chrome.storage.local.set({ authToken: token }, () => {
            window.location.reload(); // Rzefresh the popup to show logged-in state
          });
        }
      }
    );
  });

  // Close button functionality
  const closeBtn = document.getElementById("close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      window.close();
    });
  }
});