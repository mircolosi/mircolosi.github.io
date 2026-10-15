/**
 * Publications Rendering and Batched Live Citations Script (Loaded from JSON)
 */

(function () {
  'use strict';

  function animateCount(badge, svgClone, target) {
    const duration = 900;
    const steps = Math.min(target, 60);
    const stepTime = Math.max(duration / steps, 16);
    let current = 0;

    function tick() {
      current = Math.min(current + Math.ceil(target / steps), target);
      badge.innerHTML = '';
      if (svgClone) badge.appendChild(svgClone.cloneNode(true));
      badge.appendChild(
        document.createTextNode(` ${current} citation${current !== 1 ? 's' : ''}`)
      );
      if (current < target) setTimeout(tick, stepTime);
    }
    tick();
  }

  function showSkeleton(badge, svgClone) {
    badge.classList.add('citation-loading');
    badge.innerHTML = '';
    if (svgClone) badge.appendChild(svgClone.cloneNode(true));
    const skel = document.createElement('span');
    skel.className = 'citation-skeleton';
    badge.appendChild(skel);
  }

  function showFallback(badge, svgClone, fallbackText) {
    badge.classList.remove('citation-loading');
    badge.innerHTML = '';
    if (svgClone) badge.appendChild(svgClone.cloneNode(true));
    badge.appendChild(document.createTextNode(` ${fallbackText}`));
    badge.title = 'Citation count (static — live fetch unavailable)';
  }

  async function fetchAndApplyBatch(publicationsData, container) {
    // Collect valid paper IDs and map them to their DOM badges
    const validPubs = publicationsData.filter(pub => pub.paperId);
    if (validPubs.length === 0) return;

    const paperIdMap = {};
    validPubs.forEach(pub => {
      const card = container.querySelector(`[data-pub-id="${pub.id}"]`);
      if (card) {
        const badge = card.querySelector('.citation-badge');
        if (badge) {
          paperIdMap[pub.paperId] = badge;
          const svgClone = badge.querySelector('svg') ? badge.querySelector('svg').cloneNode(true) : null;
          showSkeleton(badge, svgClone);
        }
      }
    });

    const idsToFetch = Object.keys(paperIdMap);
    if (idsToFetch.length === 0) return;

    try {
      const results = publicationsData;

      // The batch endpoint returns an array positionally matching the requested IDs (or null if missing)
      results.forEach((data, index) => {
        const requestedId = idsToFetch[index];
        const badge = paperIdMap[requestedId];
        if (!badge) return;

        const svgClone = badge.querySelector('svg') ? badge.querySelector('svg').cloneNode(true) : null;

        if (data && typeof data.citations === 'number') {
          badge.classList.remove('citation-loading');
          badge.title = 'Citations on Semantic Scholar (live)';
          animateCount(badge, svgClone, data.citations);
        } else {
          showFallback(badge, svgClone, '0 citations');
        }
      });
    } catch (err) {
      console.warn('[citations.js] Batch fetch failed:', err.message);
      // Fallback all loading badges if the batch request fails entirely
      Object.values(paperIdMap).forEach(badge => {
        const svgClone = badge.querySelector('svg') ? badge.querySelector('svg').cloneNode(true) : null;
        showFallback(badge, svgClone, '0 citations');
      });
    }
  }

  function renderPublications(publicationsData, filter = 'all') {
    const container = document.getElementById('publications-container');
    if (!container) return;

    container.innerHTML = '';

    const filteredData = publicationsData.filter(item => {
      if (filter === 'all') return true;
      return item.category === filter;
    });

    if (filteredData.length === 0) {
      container.innerHTML = '<p class="no-results">No publications found in this category.</p>';
      return;
    }

    // Sort by number of citations in descending order (highest first)
    filteredData.sort((a, b) => {
      const citationsA = a.citations || 0;
      const citationsB = b.citations || 0;
      return citationsB - citationsA;
    });

    filteredData.forEach(pub => {
      const article = document.createElement('article');
      article.className = 'publication-card';
      article.setAttribute('data-category', pub.category);
      article.setAttribute('data-pub-id', pub.id);

      const linksHtml = pub.links && pub.links.scholar && pub.links.scholar !== '#' ? `
        <div class="publication-actions">
          <a href="${pub.links.scholar}" target="_blank" class="publication-link">Google Scholar &rarr;</a>
        </div>
      ` : '';

      article.innerHTML = `
        <div class="publication-banner-header">
          <div class="publication-banner-top">
            <span class="publication-category-tag">${pub.banner}</span>
            <span class="citation-badge" title="Citations on Google Scholar">
              <svg viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              ...
            </span>
          </div>
          <h4 class="publication-title-header">${pub.title}</h4>
        </div>
        <div class="publication-body">
          <div class="publication-date">${pub.date}</div>
          <p class="publication-excerpt">
            ${pub.excerpt}
          </p>
          ${linksHtml}
        </div>
      `;

      container.appendChild(article);
    });

    // Trigger single batched fetch for currently rendered items that have paperIds
    fetchAndApplyBatch(filteredData, container);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('../resources/publications.json');
      const publicationsData = await response.json();

      const filterButtons = document.querySelectorAll('.filter-btn');

      filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          filterButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderPublications(publicationsData, btn.dataset.filter);
        });
      });

      // Initial render
      renderPublications(publicationsData, 'all');
    } catch (error) {
      console.error('Error loading publications.json:', error);
    }
  });
})();