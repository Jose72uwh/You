const TMDB_API_KEY = '1076ac03cba68c1680094495c8506ad7';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// User-defined series list - only these will be loaded.
// It is intentionally empty to allow the user to add series as they wish.
const USER_DEFINED_SERIES = [
    "Oji-san de Umeru Ana",
    "Asa made Shirudaku Oyakodon!!",
    "Overflow",
    "Busty High School Girls",
    "My Ideal Life in Another World",
    "Kanojo ga Separate o Matou Riyuu",
    "Akogare no Onna Joushi ga",
    "KURO GAL A LA CARTE",
    "ERORIMAN",
    "ORE GA KANOJO O OKASU WAKE",
    "Oni Chichi Harem",
    "Princess Burst!",
    "Moto Kare to wa Dekinakatta Sex Shite mo Ii Desu ka?",
    "Akane wa Tsumare Somerareru",
    "Kuraibito",
    "Love Me Kaede to Suzu The Animation",
    "Zutto Suki Datta",
    "Harem Camp"
];

const seriesData = {
    trending: [],
    newReleases: [],
    recommended: [], // This will remain unused based on current prompt
    recentlyAdded: []
};

let allUserSeriesData = []; // Store all fetched user series here

// Utility function to fetch from TMDB
async function fetchFromTMDB(endpoint, params = {}) {
    const url = new URL(`${TMDB_BASE_URL}/${endpoint}`);
    url.searchParams.append('api_key', TMDB_API_KEY);
    url.searchParams.append('language', 'es-ES');
    url.searchParams.append('include_adult', 'true'); // Include adult content
    
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    const response = await fetch(url);
    if (!response.ok) throw new Error('TMDB API error');
    return response.json();
}

// Fetch only user-defined series from TMDB once on initialization
async function fetchSeriesData() {
    try {
        allUserSeriesData = []; // Clear previous data
        
        if (USER_DEFINED_SERIES.length === 0) {
            console.warn('USER_DEFINED_SERIES is empty. No series will be displayed.');
            return;
        }

        // Search for each user-defined series
        for (const seriesName of USER_DEFINED_SERIES) {
            try {
                const searchResponse = await fetchFromTMDB('search/tv', {
                    query: seriesName,
                    include_adult: 'true'
                });
                
                if (searchResponse.results.length > 0) {
                    allUserSeriesData.push(formatSeriesData(searchResponse.results[0]));
                }
            } catch (error) {
                console.error(`Error fetching ${seriesName} from TMDB:`, error);
            }
        }
        console.log('All user-defined series fetched:', allUserSeriesData.length);
    } catch (error) {
        console.error('Initial error fetching all user-defined series data:', error);
    }
}

// Format TMDB series data to our format
function formatSeriesData(series) {
    return {
        id: series.id,
        title: series.name,
        rating: Math.round(series.vote_average * 10) / 10,
        image: series.poster_path 
            ? `https://image.tmdb.org/t/p/w400${series.poster_path}`
            : `https://via.placeholder.com/400x600/1a1a1a/ffffff?text=${encodeURIComponent(series.name)}`,
        overview: series.overview,
        releaseDate: series.first_air_date,
        adult: series.adult || false,
        backdrop_path: series.backdrop_path // Added for hero section
    };
}

// Function to distribute series into sections and populate them
function distributeAndPopulateSections() {
    const RECENTLY_ADDED_LIMIT = 5;
    const TRENDING_LIMIT = 4;
    const NEW_RELEASES_LIMIT = 3;

    if (allUserSeriesData.length === 0) {
        seriesData.recentlyAdded = [];
        seriesData.trending = [];
        seriesData.newReleases = [];
    } else {
        const shuffledForDisplay = [...allUserSeriesData].sort(() => Math.random() - 0.5);
        
        seriesData.recentlyAdded = shuffledForDisplay.splice(0, RECENTLY_ADDED_LIMIT);
        seriesData.trending = shuffledForDisplay.splice(0, TRENDING_LIMIT);
        seriesData.newReleases = shuffledForDisplay.splice(0, NEW_RELEASES_LIMIT);
    }
    
    populateSection('recentlyAdded', seriesData.recentlyAdded);
    populateSection('trendingSeries', seriesData.trending);
    populateSection('newReleases', seriesData.newReleases);
    
    // Re-setup lazy loading after new content is added
    setTimeout(setupLazyLoading, 100);
    
    console.log('Featured sections (Recently Added, Trending, New Releases) updated.');
}

function createSeriesCard(series) {
    const year = series.releaseDate ? new Date(series.releaseDate).getFullYear() : 'N/A';
    const adultBadge = series.adult ? '<span style="color: var(--accent-primary); font-size: 0.75rem;">+18</span>' : '';
    const firstName = series.title.split(' ')[0];

    return `
        <div class="series-card-wrapper">
             <a href="go:${firstName}" class="series-card-link">
                <div class="series-card" data-id="${series.id}">
                    <div class="series-image">
                        <img class="lazy" 
                             data-src="${series.image}" 
                             alt="${series.title}"
                             loading="lazy">
                        ${adultBadge}
                        <div class="image-placeholder" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, #1a1a1a, #2a2a2a); display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-film" style="color: var(--text-muted); font-size: 2rem;"></i>
                        </div>
                    </div>
                    <div class="series-info">
                        <h3 class="series-title">${series.title}</h3>
                        <div class="series-meta">
                            <span>${year}</span>
                            <div class="series-rating">
                                <i class="fas fa-star"></i>
                                <span>${series.rating}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    `;
}

// Add intersection observer for lazy loading
function setupLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                
                if (src) {
                    const newImg = new Image();
                    newImg.onload = () => {
                        img.src = src;
                        img.classList.add('loaded');
                        img.classList.remove('lazy');
                        
                        // Hide placeholder
                        const placeholder = img.parentElement.querySelector('.image-placeholder');
                        if (placeholder) {
                            placeholder.style.display = 'none';
                        }
                    };
                    newImg.src = src;
                }
                
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    // Observe all lazy images
    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
}

function populateSection(sectionId, data) {
    const container = document.getElementById(sectionId);
    if (data.length === 0) {
        const sectionTitleElement = container.parentElement.querySelector('.section-title');
        const sectionTitle = sectionTitleElement ? sectionTitleElement.textContent : 'esta sección';
        container.innerHTML = `<p style="color: var(--text-muted); padding: 1rem 0;">No hay series en ${sectionTitle}.</p>`;
    } else {
        container.innerHTML = data.map(createSeriesCard).join('');
    }
}

// Enhanced search with TMDB
async function performSearch(query) {
    if (!query) {
        // If query is empty, show all user-defined series (similar to "Ver todo")
        displaySearchResults(allUserSeriesData, 'Todos los Hentai');
        return;
    }

    const lowerCaseQuery = query.toLowerCase();
    
    // Filter allUserSeriesData instead of fetching from TMDB
    const results = allUserSeriesData.filter(series => 
        series.title.toLowerCase().includes(lowerCaseQuery) ||
        (series.overview && series.overview.toLowerCase().includes(lowerCaseQuery))
    );

    displaySearchResults(results, query);
}

function displaySearchResults(results, query = '') {
    const searchContainer = document.querySelector('.search-container');
    
    const existingResults = searchContainer.querySelector('.search-results');
    if (existingResults) existingResults.remove();
    
    const suggestionsSection = document.querySelector('.search-suggestions');
    if (suggestionsSection) {
        suggestionsSection.style.display = (results.length > 0 || query) ? 'none' : 'block';
    }

    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'search-results';
    
    if (results.length === 0) {
        resultsDiv.innerHTML = `
            <p style="text-align: center; color: var(--text-secondary); margin-top: 2rem;">
                No se encontraron resultados para "${query}".
            </p>
        `;
    } else {
        resultsDiv.innerHTML = `
            <h3 style="margin: 2rem 0 1rem; color: var(--text-primary);">
                Resultados (${results.length})${query ? ` para "${query}"` : ''}
            </h3>
            <div class="series-grid">
                ${results.map(createSeriesCard).join('')}
            </div>
        `;
    }
    
    searchContainer.appendChild(resultsDiv);
    
    // Re-setup lazy loading for new search results
    setTimeout(setupLazyLoading, 100);
}

// Update init function to include lazy loading
async function init() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('hidden');

    const sections = ['trendingSeries', 'newReleases', 'recentlyAdded'];
    sections.forEach(sectionId => {
        const container = document.getElementById(sectionId);
        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">Cargando series...</div>';
    });

    await fetchSeriesData();
    distributeAndPopulateSections();
    await updateHeroSection();

    // Setup lazy loading after content is populated
    setTimeout(setupLazyLoading, 100);

    setupSearch();
    setupViewAllHentaiLinks();

    loadingOverlay.classList.add('hidden');
}

// Update hero section image lazy loading
async function updateHeroSection() {
    const heroContent = document.querySelector('.hero-content');
    const heroVisual = document.querySelector('.hero-visual');
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    const heroImage = document.querySelector('.hero-image');
    const heroPlayButton = document.getElementById('heroPlayButton');

    heroTitle.textContent = 'Bienvenido a SeriesFlix';
    heroDescription.textContent = 'Explora un universo de series y películas. Usa la búsqueda para encontrar tu próximo programa favorito o agrega títulos a tu colección.';
    heroImage.style.backgroundImage = 'none';
    heroImage.style.backgroundColor = 'var(--bg-tertiary)';
    heroContent.querySelector('.hero-actions').style.display = 'flex';
    if (heroPlayButton) heroPlayButton.style.display = 'none';

    if (allUserSeriesData.length > 0) {
        try {
            const seriesToFeature = allUserSeriesData[Math.floor(Math.random() * allUserSeriesData.length)];

            if (seriesToFeature) {
                heroTitle.textContent = seriesToFeature.title;
                heroDescription.textContent = seriesToFeature.overview ? seriesToFeature.overview.substring(0, 150) + '...' : 'No hay descripción disponible.';
                
                // Use lazy loading for hero image
                if (seriesToFeature.backdrop_path) {
                    heroImage.style.backgroundImage = `url(https://image.tmdb.org/t/p/w1280${seriesToFeature.backdrop_path})`;
                } else if (seriesToFeature.image) {
                    heroImage.style.backgroundImage = `url(${seriesToFeature.image})`;
                }
                
                if (heroPlayButton) {
                    heroPlayButton.style.display = 'flex';
                    const firstName = seriesToFeature.title.split(' ')[0];
                    heroPlayButton.href = `go:${firstName}`;
                }
            }
        } catch (error) {
            console.error('Error updating hero:', error);
        }
    }
}

// Add menu toggle functionality
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });
}

function showMainContent() {
    document.querySelector('.hero').style.display = 'flex';
    document.querySelectorAll('.featured-section').forEach(el => {
        el.style.display = 'block';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    init(); // This will handle initial data fetch, distribution, section population, and hero update.
    setupMobileMenu(); // This can run independently
    
    // Update hero section every 30 seconds
    setInterval(updateHeroSection, 30000); 

    // Update Trending and New Releases sections every minute
    setInterval(distributeAndPopulateSections, 60000); // 60 seconds * 1000 ms
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const linkText = link.textContent.trim();
        if (linkText === 'Inicio') {
            e.preventDefault(); // Prevent default for 'Inicio' to stay on SPA mode
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            showMainContent();
        }
        // For mobile menu: close menu on any link click (even if navigating away)
        const navLinks = document.querySelector('.nav-links');
        const menuToggle = document.getElementById('menuToggle');
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroImg = document.querySelector('.hero-image');
    if (heroImg) {
        heroImg.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

function setupSearch() {
    const searchToggle = document.getElementById('searchToggle');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');
    const searchSubmit = document.querySelector('.search-submit');
    const suggestionTags = document.querySelectorAll('.suggestion-tag');
    const searchHeaderTitle = searchOverlay.querySelector('.search-header h2'); // Get the header title element

    searchToggle.addEventListener('click', () => {
        openSearch();
        // When opening search, if input is empty, show all user series data
        if (!searchInput.value.trim()) {
            displaySearchResults(allUserSeriesData, 'Todos los Hentai');
        }
    });

    searchClose.addEventListener('click', closeSearch);
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) closeSearch();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            closeSearch();
        }
    });

    searchSubmit.addEventListener('click', () => performSearch(searchInput.value.trim()));
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch(searchInput.value.trim());
    });
    
    // Add input event listener for live search (similar to suggest_series.html)
    let searchTimeout = null;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        const query = searchInput.value.trim();
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300); // Debounce search to prevent too many calls
    });

    suggestionTags.forEach(tag => {
        tag.addEventListener('click', () => {
            searchInput.value = tag.textContent;
            searchInput.focus();
            performSearch(tag.textContent);
        });
    });

    function openSearch() {
        searchOverlay.classList.add('active');
        searchInput.focus();
        searchHeaderTitle.textContent = ''; // Clear header on open, unless explicitly set by "Ver todo"
    }

    function closeSearch() {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        const existingResults = document.querySelector('.search-results');
        if (existingResults) existingResults.remove();
        
        // Show popular searches again
        const suggestionsSection = document.querySelector('.search-suggestions');
        if (suggestionsSection) {
            suggestionsSection.style.display = 'block';
        }
        // Reset search header title on close
        searchHeaderTitle.textContent = ''; // Clear header
    }
}

function setupViewAllHentaiLinks() {
    const viewAllLinks = document.querySelectorAll('.see-all-link[data-action="view-all-hentai"]');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const searchHeaderTitle = searchOverlay.querySelector('.search-header h2'); // Get the header title element

    viewAllLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            searchOverlay.classList.add('active');
            searchInput.value = ''; // Clear existing search
            displaySearchResults(allUserSeriesData, 'Todos los Hentai'); // Display all user-defined series
            // Update search header to reflect "All Hentai" context
            searchHeaderTitle.textContent = 'Todos los Hentai';
        });
    });

    // Ensure search header reverts when search is closed or a new search is performed
    const searchClose = document.getElementById('searchClose');
    const searchSubmit = document.querySelector('.search-submit');
    const suggestionTags = document.querySelectorAll('.suggestion-tag');

    searchClose.addEventListener('click', () => {
        searchHeaderTitle.textContent = ''; // Clear header
    });

    searchSubmit.addEventListener('click', () => {
        searchHeaderTitle.textContent = ''; // Clear header
    });

    suggestionTags.forEach(tag => {
        tag.addEventListener('click', () => {
            searchHeaderTitle.textContent = ''; // Clear header
        });
    });
}