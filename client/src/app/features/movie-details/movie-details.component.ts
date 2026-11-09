
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../app/core/services/api.service';
import { Movie } from '../../../../app/shared/models/movies.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.scss',
})
export class MovieDetailsComponent implements OnInit {
  movie: Movie | null = null;
  isInMyList = false;
  isLoading = true;
  isUpdatingList = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');

    if (!movieId) {
      this.errorMessage = 'Movie not found.';
      this.isLoading = false;
      return;
    }

    this.loadMovie(movieId);
    this.loadWatchlist(movieId);
  }

  private loadMovie(id: string): void {
    this.apiService.getMovie(id).subscribe({
      next: (response) => {
        this.movie = response.movie;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load movie:', error);
        this.errorMessage = 'Unable to load this movie.';
        this.isLoading = false;
      },
    });
  }

  private loadWatchlist(movieId: string): void {
    this.apiService.getWatchlist().subscribe({
      next: (response) => {
        this.isInMyList = response.watchlist.some(
          (movie) => movie._id === movieId
        );
      },
      error: (error) => {
        console.error('Failed to load watchlist:', error);
      },
    });
  }

  toggleMyList(): void {
    if (!this.movie || this.isUpdatingList) {
      return;
    }

    this.isUpdatingList = true;

    const request$ = this.isInMyList
      ? this.apiService.removeFromWatchlist(this.movie._id)
      : this.apiService.addToWatchlist(this.movie._id);

    request$
      .pipe(finalize(() => {
        this.isUpdatingList = false;
      }))
      .subscribe({
        next: () => {
          this.isInMyList = !this.isInMyList;
        },
        error: (error) => {
          console.error('Failed to update watchlist:', error);
          this.errorMessage = 'Could not update My List.';
        },
      });
  }

  playMovie(): void {
    if (!this.movie?.videoUrl) {
      this.errorMessage = 'No video is available for this title yet.';
      return;
    }
  
    this.router.navigate(['/watch', this.movie._id]);
  }
  
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
