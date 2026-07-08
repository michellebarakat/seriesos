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

  getImageUrl(path, base = this.imageBaseUrl) {
    if (!path) return null;
    return `${base}${path}`;
  }

  async searchTV(query) {
    const url = `${this.baseUrl}/search/tv?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB search failed: ${response.status}`);
    const data = await response.json();
    return data.results;
  }

  async searchMovie(query) {
    const url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB search failed: ${response.status}`);
    const data = await response.json();
    return data.results;
  }

  async getTVDetails(id) {
    const url = `${this.baseUrl}/tv/${id}?api_key=${this.apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB details fetch failed: ${response.status}`);
    return await response.json();
  }

  async getPopularTV(page = 1) {
    const url = `${this.baseUrl}/tv/popular?api_key=${this.apiKey}&page=${page}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB popular fetch failed: ${response.status}`);
    const data = await response.json();
    return data.results;
  }

  async getPopularMovies(page = 1) {
    const url = `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&page=${page}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB popular movies fetch failed: ${response.status}`);
    const data = await response.json();
    return data.results;
  }

  async findBestMatch(title) {
    try {
      const tvResults = await this.searchTV(title);
      if (tvResults && tvResults.length > 0) return { type: "tv", data: tvResults[0] };
      const movieResults = await this.searchMovie(title);
      if (movieResults && movieResults.length > 0) return { type: "movie", data: movieResults[0] };
      return null;
    } catch (error) {
      console.error(`Failed to find match for "${title}":`, error);
      return null;
    }
  }

  async getMovieDetails(id) {
    const url = `${this.baseUrl}/movie/${id}?api_key=${this.apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB movie details failed: ${response.status}`);
    return await response.json();
  }

  getNextSeasonInfo(details) {
    if (!details.seasons) return null;
    const today = new Date();
    const upcoming = details.seasons.find(s =>
      s.season_number > 0 && s.air_date && new Date(s.air_date) > today
    );
    return upcoming ? upcoming : null;
  }

  formatRuntime(minutes) {
    if (!minutes) return null;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  }

  async getTrailer(id, type = "tv") {
    const url = `${this.baseUrl}/${type}/${id}/videos?api_key=${this.apiKey}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    const trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");
    return trailer ? trailer.key : null;
  }

  // Get similar TV shows — returns top 4 results
  async getSimilarTV(id) {
    const url = `${this.baseUrl}/tv/${id}/similar?api_key=${this.apiKey}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.results.slice(0, 4);
  }
}

const tmdbApi = new TMDBApi(TMDB_API_KEY);
export { TMDBApi, tmdbApi };