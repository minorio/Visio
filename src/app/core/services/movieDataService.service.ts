import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenreResponse, MovieDetails, MovieResponse } from '../../models/movie.model';
import { TMDB_CONFIG } from '../configs/api.config';

@Injectable({
  providedIn: 'root',
})
export class MovieDataService {
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${TMDB_CONFIG.token}`,
      accept: 'application/json',
    });
  }

  public searchMovies(query: string, page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(`${TMDB_CONFIG.baseUrl}/search/movie`, {
      headers: this.getHeaders(),
      params: {
        query,
        page: page.toString(),
      },
    });
  }

  public getGenres(): Observable<GenreResponse> {
    return this.http.get<GenreResponse>(`${TMDB_CONFIG.baseUrl}/genre/movie/list`, {
      headers: this.getHeaders(),
    });
  }

  public getMovies(
    genreId: number | null,
    year: number | null = null,
    rating: number | null = null,
    country: string | null = null,
    sortBy: string = 'popularity.desc',
    page: number = 1,
  ): Observable<MovieResponse> {
    let params: Record<string, string> = {
      page: page.toString(),
      sort_by: sortBy,
      'vote_count.gte': '200',
    };

    if (genreId) params['with_genres'] = genreId.toString();
    if (year) params['primary_release_year'] = year.toString();
    if (rating) params['vote_average.gte'] = rating.toString();
    if (country) params['with_origin_country'] = country;

    return this.http.get<MovieResponse>(`${TMDB_CONFIG.baseUrl}/discover/movie`, {
      headers: this.getHeaders(),
      params,
    });
  }

  public getMovieDetails(id: string): Observable<MovieDetails> {
    return this.http.get<MovieDetails>(`${TMDB_CONFIG.baseUrl}/movie/${id}`, {
      headers: this.getHeaders(),
      params: {
        append_to_response: 'credits,similar',
      },
    });
  }
}
