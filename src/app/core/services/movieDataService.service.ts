import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GenreResponse, MovieResponse } from '../../models/movie.model';
import { TMDB_CONFIG } from '../configs/api.config';

@Injectable({
  providedIn: 'root',
})
export class MovieDataService {
  constructor(private http: HttpClient) {}

  public getPopularMovies(page: number = 1) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${TMDB_CONFIG.token}`,
      accept: 'application/json',
    });

    return this.http.get<MovieResponse>(`${TMDB_CONFIG.baseUrl}/movie/popular`, {
      headers,
      params: { page: page.toString() },
    });
  }
  public searchMovies(query: string, page: number = 1) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${TMDB_CONFIG.token}`,
      accept: 'application/json',
    });

    return this.http.get<MovieResponse>(`${TMDB_CONFIG.baseUrl}/search/movie`, {
      headers,
      params: {
        query: query,
        page: page.toString(),
      },
    });
  }

  public getGenres() {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${TMDB_CONFIG.token}`,
      accept: 'application/json',
    });
    return this.http.get<GenreResponse>(`${TMDB_CONFIG.baseUrl}/genre/movie/list`, {
      headers,
    });
  }
}
