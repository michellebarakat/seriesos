// SeriesOS — TMDB API wrapper
// Handles all communication with The Movie Database API.
import { TMDB_API_KEY } from "./config.js";

class TMDBApi {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.themoviedb.org/3";
    this.imageBaseUrl = "https://image.tmdb.org/t/p/w500";
    this.backdropBaseUrl = "https://image.tmdb.org/t/p/original";
  }

  // Build a full image URL from a TMDB path (poster_path or backdrop_path)
  getImageUrl(path, base = this.imageBaseUrl) {
    if (!path) return null;
    return `${base}${path}`;
  }

  // Search TV shows by title — used for curated collection lookups and Discover search
  async searchTV(query) {
    const url = `${this.baseUrl}/search/tv?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB search failed: ${response.status}`);
    }
    const data = await response.json();
    return data.results;
  }

  // Search movies by title — fallback for items not found in TV search
  async searchMovie(query) {
    const url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB search failed: ${response.status}`);
    }
    const data = await response.json();
    return data.results;
  }

  // Get full details for a specific TV show by its TMDB id
  async getTVDetails(id) {
    const url = `${this.baseUrl}/tv/${id}?api_key=${this.apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB details fetch failed: ${response.status}`);
    }
    return await response.json();
  }

  // Get popular/trending TV shows — used to populate the Discover page by default
  async getPopularTV(page = 1) {
    const url = `${this.baseUrl}/tv/popular?api_key=${this.apiKey}&page=${page}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB popular fetch failed: ${response.status}`);
    }
    const data = await response.json();
    return data.results;
  }

  // Helper: find the best match for a curated title, trying TV first then Movie
  async findBestMatch(title) {
    try {
      const tvResults = await this.searchTV(title);
      if (tvResults && tvResults.length > 0) {
        return { type: "tv", data: tvResults[0] };
      }
      const movieResults = await this.searchMovie(title);
      if (movieResults && movieResults.length > 0) {
        return { type: "movie", data: movieResults[0] };
      }
      return null;
    } catch (error) {
      console.error(`Failed to find match for "${title}":`, error);
      return null;
    }
  }
}

const tmdbApi = new TMDBApi(TMDB_API_KEY);
export { TMDBApi, tmdbApi };