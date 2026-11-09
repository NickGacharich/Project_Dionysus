
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Movie,
  MoviesResponse,
} from '../../shared/models/movies.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getHealth(): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.get<{
      success: boolean;
      message: string;
    }>(`${this.apiUrl}/health`);
  }

  getMovies(): Observable<MoviesResponse> {
    return this.http.get<MoviesResponse>(
      `${this.apiUrl}/movies`
    );
  }

  getMovie(id: string): Observable<{
    success: boolean;
    movie: Movie;
  }> {
    return this.http.get<{
      success: boolean;
      movie: Movie;
    }>(`${this.apiUrl}/movies/${id}`);
  }


  getWatchlist(): Observable<{
    success: boolean;
    watchlist: Movie[];
  }> {
    return this.http.get<{
      success: boolean;
      watchlist: Movie[];
    }>(`${this.apiUrl}/watchlist`);
  }

  addToWatchlist(movieId: string): Observable<unknown> {
    return this.http.post(
      `${this.apiUrl}/watchlist/${movieId}`,
      {}
    );
  }

  removeFromWatchlist(movieId: string): Observable<unknown> {
    return this.http.delete(
      `${this.apiUrl}/watchlist/${movieId}`
    );
  }

  getContinueWatching(): Observable<{
    success: boolean;
    progress: {
      _id: string;
      movie: Movie;
      currentTime: number;
      duration: number;
      completed: boolean;
      lastWatchedAt: string;
    }[];
  }> {
    return this.http.get<{
      success: boolean;
      progress: {
        _id: string;
        movie: Movie;
        currentTime: number;
        duration: number;
        completed: boolean;
        lastWatchedAt: string;
      }[];
    }>(`${this.apiUrl}/progress`);
  }
  
  savePlaybackProgress(
    movieId: string,
    currentTime: number,
    duration: number
  ): Observable<unknown> {
    return this.http.put(
      `${this.apiUrl}/progress/${movieId}`,
      { currentTime, duration }
    );
  }

  removeFromContinueWatching(movieId: string): Observable<unknown> {
    return this.http.delete(
      `${this.apiUrl}/progress/${movieId}`
    );
  }
}
