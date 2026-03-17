import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs';
import { GenreResponse, MovieResponse } from '../../models/movie.model';
import { TMDB_CONFIG } from '../configs/api.config';
@Injectable({
  providedIn: 'root',
})
export class MovieDataService {
  constructor(private http: HttpClient) {}

  public getPopularMovies() {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${TMDB_CONFIG.token}`,
      accept: 'application/json',
    });

    return this.http.get<MovieResponse>(`${TMDB_CONFIG.baseUrl}/movie/popular`, { headers }).pipe(
      tap((res) => console.log(res)),
      map((res) => res.results),
    );
  }
  getGenres() {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${TMDB_CONFIG.token}`,
      accept: 'application/json',
    });
    return this.http.get<GenreResponse>(`${TMDB_CONFIG.baseUrl}/genre/movie/list`, {
      headers,
    });
  }
}
