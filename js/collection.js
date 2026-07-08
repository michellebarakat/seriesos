// SeriesOS — Collection page
// Renders curated collection, handles filtering, and opens detail modal

import { tmdbApi } from "./api.js";
import { curatedCollection } from "./data.js";

class CollectionPage {
  constructor() {
    this.grid = document.getElementById("collectionGrid");
    this.filterBar = document.getElementById("filterBar");
    this.allItems = [];
    this.activeCategory = "All";

    this.modal = new bootstrap.Modal(document.getElementById("showModal"));

    this.bindFilters();
    this.checkURLCategory();
  }

  checkURLCategory() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) {
      this.activeCategory = cat;
      document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.category === cat);
      });
    }
  }

  bindFilters() {
    this.filterBar.addEventListener("click", (e) => {
      if (!e.target.classList.contains("filter-btn")) return;
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      this.activeCategory = e.target.dataset.category;
      this.renderGrid();
    });
  }

  async init() {
    this.showLoading();
    try {
      const merged = await Promise.all(
        curatedCollection.map(async (item) => {
          const match = await tmdbApi.findBestMatch(item.title);
          return {
            ...item,
            tmdb: match ? match.data : null,
            poster: match ? tmdbApi.getImageUrl(match.data.poster_path) : null,
            backdrop: match ? tmdbApi.getImageUrl(match.data.backdrop_path, tmdbApi.backdropBaseUrl) : null,
            rating: match ? (match.data.vote_average || 0).toFixed(1) : "N/A",
            year: match
              ? (match.data.first_air_date || match.data.release_date || "").slice(0, 4)
              : "",
            overview: match ? match.data.overview : "",
          };
        })
      );
      this.allItems = merged;
      this.renderGrid();
    } catch (err) {
      this.showError();
    }
  }

  renderGrid() {
    const filtered = this.activeCategory === "All"
      ? this.allItems
      : this.allItems.filter(item => item.category === this.activeCategory);

    if (filtered.length === 0) {
      this.grid.innerHTML = `
        <div class="col-12 text-center empty-state">
          <i class="bi bi-collection fs-1"></i>
          <p class="mt-3">No shows in this category yet.</p>
        </div>`;
      return;
    }

    this.grid.innerHTML = filtered.map(item => this.buildCard(item)).join("");

    this.grid.querySelectorAll(".show-card").forEach(card => {
      card.addEventListener("click", () => {
        const id = parseInt(card.dataset.id);
        const item = this.allItems.find(i => i.id === id);
        if (item) this.openModal(item);
      });
    });
  }

  buildCard(item) {
    return `
      <div class="col-6 col-md-4 col-lg-3">
        <div class="show-card" data-id="${item.id}">
          <img
            src="${item.poster || "assets/placeholder.jpg"}"
            alt="${item.title}"
            class="show-poster"
            onerror="this.src='assets/placeholder.jpg'"
          />
          <div class="show-card-body">
            <span class="show-category-badge">${item.category}</span>
            <h5 class="show-title">${item.title}</h5>
            <p class="show-blurb">${item.yourBlurb}</p>
            <p class="show-rating">
              <i class="bi bi-star-fill"></i> ${item.rating}
              ${item.year ? `<span class="text-muted ms-2">${item.year}</span>` : ""}
            </p>
          </div>
        </div>
      </div>`;
  }

  async openModal(item) {
    document.getElementById("modalTitle").textContent = item.title;
    document.getElementById("modalRating").innerHTML =
      `<i class="bi bi-star-fill"></i> ${item.rating} ${item.year ? "· " + item.year : ""}`;
    document.getElementById("modalCategory").textContent = item.category;
    document.getElementById("modalOverview").textContent =
      item.overview || "No overview available.";
    document.getElementById("modalReview").textContent = item.yourReview;

    document.getElementById("modalDetails").innerHTML = `
      <div class="spinner-border spinner-border-sm text-secondary" role="status"></div>
      <span class="ms-2 text-muted" style="font-size:0.85rem">Loading details...</span>`;
    document.getElementById("modalTrailer").innerHTML = "";

    const poster = document.getElementById("modalPoster");
    poster.src = item.poster || "assets/placeholder.jpg";
    poster.alt = item.title;

    const backdrop = document.getElementById("modalBackdrop");
    if (item.backdrop) {
      backdrop.src = item.backdrop;
      backdrop.style.display = "block";
    } else {
      backdrop.style.display = "none";
    }

    this.modal.show();

    try {
      const tmdbId = item.tmdb ? item.tmdb.id : null;
      const isMovie = item.tmdb && item.tmdb.release_date && !item.tmdb.first_air_date;

      if (!tmdbId) {
        document.getElementById("modalDetails").innerHTML = "";
        return;
      }

      if (isMovie) {
        const details = await tmdbApi.getMovieDetails(tmdbId);
        const runtime = tmdbApi.formatRuntime(details.runtime);
        document.getElementById("modalDetails").innerHTML = runtime
          ? `<span class="detail-chip"><i class="bi bi-clock"></i> ${runtime}</span>`
          : "";

        const trailerKey = await tmdbApi.getTrailer(tmdbId, "movie");
        if (trailerKey) {
          document.getElementById("modalTrailer").innerHTML = `
            <a href="https://www.youtube.com/watch?v=${trailerKey}" target="_blank" class="btn-trailer">
              <i class="bi bi-youtube"></i> Watch Trailer
            </a>`;
        }
      } else {
        const details = await tmdbApi.getTVDetails(tmdbId);
        const seasons = details.number_of_seasons || 0;
        const episodes = details.number_of_episodes || 0;
        const nextSeason = tmdbApi.getNextSeasonInfo(details);

        const seasonBreakdown = details.seasons
          ? details.seasons
              .filter(s => s.season_number > 0)
              .map(s => `S${s.season_number}: ${s.episode_count} eps`)
              .join(" · ")
          : "";

        let html = `
          <span class="detail-chip">
            <i class="bi bi-collection"></i> ${seasons} Season${seasons !== 1 ? "s" : ""}
          </span>
          <span class="detail-chip">
            <i class="bi bi-play-circle"></i> ${episodes} Episodes
          </span>`;

        if (nextSeason) {
          const airDate = new Date(nextSeason.air_date).toLocaleDateString("en-US", {
            month: "long", year: "numeric"
          });
          html += `
            <span class="detail-chip detail-chip--new">
              <i class="bi bi-calendar-check"></i> Season ${nextSeason.season_number} coming ${airDate}
            </span>`;
        }

        if (seasonBreakdown) {
          html += `<p class="season-breakdown mt-2">${seasonBreakdown}</p>`;
        }

        document.getElementById("modalDetails").innerHTML = html;

        const trailerKey = await tmdbApi.getTrailer(tmdbId, "tv");
        if (trailerKey) {
          document.getElementById("modalTrailer").innerHTML = `
            <a href="https://www.youtube.com/watch?v=${trailerKey}" target="_blank" class="btn-trailer">
              <i class="bi bi-youtube"></i> Watch Trailer
            </a>`;
        }
      }
    } catch (err) {
      document.getElementById("modalDetails").innerHTML = "";
    }
  }

  showLoading() {
    this.grid.innerHTML = `
      <div class="col-12 text-center loading-state">
        <div class="spinner-border" role="status"></div>
        <p class="mt-2">Loading your collection...</p>
      </div>`;
  }

  showError() {
    this.grid.innerHTML = `
      <div class="col-12 text-center error-state">
        <i class="bi bi-exclamation-circle fs-1"></i>
        <p class="mt-2">Something went wrong loading the collection.</p>
      </div>`;
  }
}

const page = new CollectionPage();
page.init();