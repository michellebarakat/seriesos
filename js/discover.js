// SeriesOS — Discover page
// TMDB-powered search with TV/Movie toggle and pagination

import { tmdbApi } from "./api.js";

class DiscoverPage {
  constructor() {
    this.grid = document.getElementById("discoverGrid");
    this.searchInput = document.getElementById("searchInput");
    this.typeFilter = document.getElementById("typeFilter");
    this.resultsLabel = document.getElementById("resultsLabel");
    this.prevBtn = document.getElementById("prevBtn");
    this.nextBtn = document.getElementById("nextBtn");
    this.pageInfo = document.getElementById("pageInfo");
    this.modal = new bootstrap.Modal(document.getElementById("discoverModal"));

    this.currentType = "tv";
    this.currentPage = 1;
    this.currentQuery = "";
    this.searchTimer = null;

    this.bindEvents();
  }

  bindEvents() {
    // Live search with debounce (waits 500ms after typing stops)
    this.searchInput.addEventListener("input", () => {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.currentQuery = this.searchInput.value.trim();
        this.currentPage = 1;
        this.load();
      }, 500);
    });

    // TV / Movie toggle
    this.typeFilter.addEventListener("click", (e) => {
      if (!e.target.classList.contains("filter-btn")) return;
      document.querySelectorAll("#typeFilter .filter-btn")
        .forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      this.currentType = e.target.dataset.type;
      this.currentPage = 1;
      this.load();
    });

    // Pagination
    this.prevBtn.addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.load();
      }
    });

    this.nextBtn.addEventListener("click", () => {
      this.currentPage++;
      this.load();
    });
  }

  async load() {
    this.showLoading();
    try {
      let results;
      if (this.currentQuery) {
        results = this.currentType === "tv"
          ? await tmdbApi.searchTV(this.currentQuery)
          : await tmdbApi.searchMovie(this.currentQuery);
        this.resultsLabel.textContent =
          `Showing results for "${this.currentQuery}"`;
      } else {
        results = await tmdbApi.getPopularTV(this.currentPage);
        this.resultsLabel.textContent =
          `Showing popular ${this.currentType === "tv" ? "TV shows" : "movies"}`;
      }

      this.updatePagination();

      if (!results || results.length === 0) {
        this.showEmpty();
        return;
      }

      this.renderGrid(results);
    } catch (err) {
      this.showError();
    }
  }

  renderGrid(results) {
    this.grid.innerHTML = results.map(item => this.buildCard(item)).join("");

    this.grid.querySelectorAll(".show-card").forEach((card, i) => {
      card.addEventListener("click", () => this.openModal(results[i]));
    });
  }

  buildCard(item) {
    const title = item.name || item.title || "Unknown";
    const poster = item.poster_path
      ? tmdbApi.getImageUrl(item.poster_path)
      : "assets/placeholder.jpg";
    const rating = item.vote_average
      ? item.vote_average.toFixed(1)
      : "N/A";
    const year = (item.first_air_date || item.release_date || "").slice(0, 4);

    return `
      <div class="col-6 col-md-4 col-lg-3">
        <div class="show-card">
          <img
            src="${poster}"
            alt="${title}"
            class="show-poster"
            onerror="this.src='assets/placeholder.jpg'"
          />
          <div class="show-card-body">
            <h5 class="show-title">${title}</h5>
            <p class="show-rating">
              <i class="bi bi-star-fill"></i> ${rating}
              ${year ? `<span class="text-muted ms-2">${year}</span>` : ""}
            </p>
          </div>
        </div>
      </div>`;
  }

  async openModal(item) {
    const title = item.name || item.title || "Unknown";
    const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
    const year = (item.first_air_date || item.release_date || "").slice(0, 4);
    const isMovie = !item.first_air_date;

    document.getElementById("discModalTitle").textContent = title;
    document.getElementById("discModalRating").innerHTML =
      `<i class="bi bi-star-fill"></i> ${rating} · ${year}`;
    document.getElementById("discModalType").textContent = isMovie ? "Movie" : "TV Show";
    document.getElementById("discModalOverview").textContent =
      item.overview || "No overview available.";
    document.getElementById("discModalDetails").innerHTML = `
      <div class="spinner-border spinner-border-sm text-secondary" role="status"></div>
      <span class="ms-2 text-muted" style="font-size:0.85rem">Loading details...</span>`;

    const poster = document.getElementById("discModalPoster");
    poster.src = item.poster_path
      ? tmdbApi.getImageUrl(item.poster_path)
      : "assets/placeholder.jpg";
    poster.alt = title;

    const backdrop = document.getElementById("discModalBackdrop");
    if (item.backdrop_path) {
      backdrop.src = tmdbApi.getImageUrl(item.backdrop_path, tmdbApi.backdropBaseUrl);
      backdrop.style.display = "block";
    } else {
      backdrop.style.display = "none";
    }

    this.modal.show();

    // Fetch full details after modal opens
    try {
      if (isMovie) {
        const details = await tmdbApi.getMovieDetails(item.id);
        const runtime = tmdbApi.formatRuntime(details.runtime);
        document.getElementById("discModalDetails").innerHTML = runtime
          ? `<span class="detail-chip"><i class="bi bi-clock"></i> ${runtime}</span>`
          : "";
      } else {
        const details = await tmdbApi.getTVDetails(item.id);
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

        document.getElementById("discModalDetails").innerHTML = html;
      }
    } catch (err) {
      document.getElementById("discModalDetails").innerHTML = "";
    }
  }

  updatePagination() {
    this.pageInfo.textContent = `Page ${this.currentPage}`;
    this.prevBtn.disabled = this.currentPage === 1;
  }

  showLoading() {
    this.grid.innerHTML = `
      <div class="col-12 text-center loading-state">
        <div class="spinner-border" role="status"></div>
        <p class="mt-2">Loading...</p>
      </div>`;
  }

  showError() {
    this.grid.innerHTML = `
      <div class="col-12 text-center error-state">
        <i class="bi bi-exclamation-circle fs-1"></i>
        <p class="mt-2">Something went wrong. Try again.</p>
      </div>`;
  }

  showEmpty() {
    this.grid.innerHTML = `
      <div class="col-12 text-center empty-state">
        <i class="bi bi-search fs-1"></i>
        <p class="mt-3">No results found for "${this.currentQuery}".</p>
      </div>`;
  }
}

const page = new DiscoverPage();
page.load();