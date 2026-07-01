// SeriesOS — Home page script
// Fetches poster + rating for 4 featured curated picks and renders them

import { tmdbApi } from "./api.js";
import { curatedCollection } from "./data.js";

// IDs of the 4 items to feature on the home page
const FEATURED_IDS = [1, 6, 13, 21];

class HomePage {
  constructor() {
    this.featuredGrid = document.getElementById("featuredGrid");
    this.featured = curatedCollection.filter(item =>
      FEATURED_IDS.includes(item.id)
    );
  }

  async init() {
    this.showLoading();
    try {
      const cards = await Promise.all(
        this.featured.map(item => this.fetchAndBuild(item))
      );
      this.featuredGrid.innerHTML = cards.join("");
    } catch (err) {
      this.showError();
    }
  }

  async fetchAndBuild(item) {
    const match = await tmdbApi.findBestMatch(item.title);
    const poster = match
      ? tmdbApi.getImageUrl(match.data.poster_path)
      : null;
    const rating = match
      ? (match.data.vote_average || 0).toFixed(1)
      : "N/A";
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
      </div>
    `;
  }

  showLoading() {
    this.featuredGrid.innerHTML = `
      <div class="col-12 text-center loading-state">
        <div class="spinner-border text-primary" role="status"></div>
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