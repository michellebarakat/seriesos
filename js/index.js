// SeriesOS — Home page script
// Fetches featured picks and rotates hero background every 10 seconds

import { tmdbApi } from "./api.js";
import { curatedCollection } from "./data.js";

// IDs of the 4 items to feature on the home page
const FEATURED_IDS = [1, 6, 13, 21];

// Show titles to pull backdrops from for the rotating hero
const HERO_BACKDROP_TITLES = [
  "Stranger Things",
  "Breaking Bad",
  "Money Heist",
  "Queen of Tears",
  "Outer Banks",
  "Suits",
];

class HomePage {
  constructor() {
    this.featuredGrid = document.getElementById("featuredGrid");
    this.heroSection = document.querySelector(".hero-section");
    this.featured = curatedCollection.filter(item =>
      FEATURED_IDS.includes(item.id)
    );
    this.backdropUrls = [];
    this.currentBackdrop = 0;
  }

  async init() {
    this.showLoading();
    await Promise.all([
      this.loadFeatured(),
      this.loadBackdrops(),
    ]);
  }

  // Load featured cards
  async loadFeatured() {
    try {
      const cards = await Promise.all(
        this.featured.map(item => this.fetchAndBuild(item))
      );
      this.featuredGrid.innerHTML = cards.join("");
    } catch (err) {
      this.showError();
    }
  }

  // Fetch backdrops for hero rotation
  async loadBackdrops() {
    try {
      const results = await Promise.all(
        HERO_BACKDROP_TITLES.map(title => tmdbApi.findBestMatch(title))
      );
      this.backdropUrls = results
        .filter(r => r && r.data.backdrop_path)
        .map(r => tmdbApi.getImageUrl(r.data.backdrop_path, tmdbApi.backdropBaseUrl));

      if (this.backdropUrls.length > 0) {
        this.setHeroBackground(this.backdropUrls[0]);
        setInterval(() => this.rotateBackdrop(), 10000);
      }
    } catch (err) {
      console.error("Failed to load hero backdrops:", err);
    }
  }

  rotateBackdrop() {
    this.currentBackdrop = (this.currentBackdrop + 1) % this.backdropUrls.length;
    this.setHeroBackground(this.backdropUrls[this.currentBackdrop]);
  }

  setHeroBackground(url) {
    // Smooth fade transition by briefly dropping opacity
    this.heroSection.style.transition = "background-image 0s, opacity 0.8s ease";
    this.heroSection.style.opacity = "0";
    setTimeout(() => {
      this.heroSection.style.backgroundImage = `
        linear-gradient(135deg, rgba(229,9,20,0.15) 0%, rgba(10,10,15,0.8) 50%, rgba(22,33,62,0.4) 100%),
        url('${url}')
      `;
      this.heroSection.style.backgroundSize = "cover";
      this.heroSection.style.backgroundPosition = "center";
      this.heroSection.style.opacity = "1";
    }, 400);
  }

  async fetchAndBuild(item) {
    const match = await tmdbApi.findBestMatch(item.title);
    const poster = match ? tmdbApi.getImageUrl(match.data.poster_path) : null;
    const rating = match ? (match.data.vote_average || 0).toFixed(1) : "N/A";
    const year = match
      ? (match.data.first_air_date || match.data.release_date || "").slice(0, 4)
      : "";

    return `
      <div class="col-6 col-md-3">
        <div class="featured-card">
          <img
            src="${poster || "assets/placeholder.jpg"}"
            alt="${item.title}"
            class="featured-poster"
            onerror="this.src='assets/placeholder.jpg'"
          />
          <div class="featured-info">
            <span class="featured-rating">
              <i class="bi bi-star-fill"></i> ${rating}
            </span>
            <h5 class="featured-title">${item.title}</h5>
            <p class="featured-blurb">${item.yourBlurb}</p>
          </div>
        </div>
      </div>`;
  }

  showLoading() {
    this.featuredGrid.innerHTML = `
      <div class="col-12 text-center loading-state">
        <div class="spinner-border" role="status"></div>
        <p class="mt-2">Loading picks...</p>
      </div>`;
  }

  showError() {
    this.featuredGrid.innerHTML = `
      <div class="col-12 text-center error-state">
        <i class="bi bi-exclamation-circle fs-1"></i>
        <p class="mt-2">Couldn't load featured picks. Check your connection.</p>
      </div>`;
  }
}

const homePage = new HomePage();
homePage.init();