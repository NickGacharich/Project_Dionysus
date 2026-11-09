
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService } from '../../../../app/core/services/api.service';
import { AuthService } from '../../core/services/auth.services';
import { Movie } from '../../../../app/shared/models/movies.model';

interface Title {
  id: string;
  name: string;
  year: number;
  genre: string;
  type: 'Movie' | 'TV Show';
  rating: string;
  description: string;
  poster: string;
  featured?: boolean;
}

interface ContinueWatchingItem {
  _id: string;
  movie: Movie;
  currentTime: number;
  duration: number;
  completed: boolean;
  lastWatchedAt: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  searchQuery = '';
  activeCategory = 'Home';
  watchlistLoading = false;
  profileMenuOpen = false;
  username = '';
  displayName = '';
  userEmail = '';
  avatar = 'avatar-1';
  removingProgressId: string | null = null;

  titles: Title[] = [];
  continueWatching: ContinueWatchingItem[] = [];
  myList: string[] = this.loadMyList();

  isLoading = true;
  errorMessage = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
  
    if (user) {
      this.username = user.username;
      this.displayName = user.displayName || user.username;
      this.userEmail = user.email;
      this.avatar = user.avatar || 'avatar-1';
    }
  
    this.loadMovies();
    this.loadWatchlist();
    this.loadContinueWatching();
  }

  private loadMovies(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getMovies().subscribe({
      next: (response) => {
        this.titles = response.movies.map((movie: Movie) =>
          this.mapMovie(movie)
        );

        // Feature The Dark Knight, or use the first available movie.
        const featured =
          this.titles.find(
            (title) => title.name === 'The Dark Knight'
          ) ?? this.titles[0];

        if (featured) {
          featured.featured = true;
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load movies:', error);
        this.errorMessage =
          'Unable to load movies. Please try again.';
        this.isLoading = false;
      },
    });
  }

  private loadWatchlist(): void {
    this.apiService.getWatchlist().subscribe({
      next: (response) => {
        this.myList = response.watchlist.map((movie) => movie._id);
      },
      error: (error) => {
        console.error('Failed to load watchlist:', error);
      },
    });
  }

  private loadContinueWatching(): void {
    this.apiService.getContinueWatching().subscribe({
      next: (response) => {
        this.continueWatching = response.progress.filter(
          (item) =>
            item.movie &&
            !item.completed &&
            item.duration > 0
        );
      },
      error: (error) => {
        console.error('Failed to load Continue Watching:', error);
      },
    });
  }

  get avatarEmoji(): string {
    const avatars: Record<string, string> = {
      'avatar-1': '🧙',
      'avatar-2': '🦇',
      'avatar-3': '🐺',
      'avatar-4': '🦊',
      'avatar-5': '👹',
      'avatar-6': '🦉',
      'avatar-7': '🗡️',
      'avatar-8': '🐉',
    };
  
    return avatars[this.avatar] || '🧙';
  }

  getProgressPercentage(item: ContinueWatchingItem): number {
    if (!item.duration || item.duration <= 0) {
      return 0;
    }
  
    return Math.min(
      100,
      Math.max(0, (item.currentTime / item.duration) * 100)
    );
  }
  
  getRemainingTime(item: ContinueWatchingItem): string {
    const remainingSeconds = Math.max(
      0,
      item.duration - item.currentTime
    );
  
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
  
    if (remainingMinutes < 1) {
      return 'Less than 1 min left';
    }
  
    return `${remainingMinutes} min left`;
  }

  removeFromContinueWatching(item: ContinueWatchingItem): void {
    if (this.removingProgressId) {
      return;
    }
  
    this.removingProgressId = item.movie._id;
  
    this.apiService
      .removeFromContinueWatching(item.movie._id)
      .pipe(
        finalize(() => {
          this.removingProgressId = null;
        })
      )
      .subscribe({
        next: () => {
          this.continueWatching = this.continueWatching.filter(
            (progress) => progress.movie._id !== item.movie._id
          );
        },
        error: (error) => {
          console.error('Failed to remove playback progress:', error);
          this.errorMessage =
            'Could not remove this movie from Continue Watching.';
        },
      });
  }

  private mapMovie(movie: Movie): Title {
    return {
      id: movie._id,
      name: movie.title,
      year: movie.releaseYear,
      genre: movie.genres?.join(', ') || 'Uncategorized',
      type: 'Movie',
      rating: `${movie.rating}/10`,
      description: movie.description,
      poster: movie.posterUrl || '',
    };
  }

  get featuredTitle(): Title {
    return (
      this.titles.find((title) => title.featured) ??
      this.titles[0] ?? {
        id: '',
        name: 'Welcome to Dionysus',
        year: new Date().getFullYear(),
        genre: 'Discover',
        type: 'Movie',
        rating: '',
        description: 'Your next favorite story awaits.',
        poster: '',
      }
    );
  }

  get visibleTitles(): Title[] {
    let result = this.titles;
    const query = this.searchQuery.trim().toLowerCase();

    if (this.activeCategory === 'Movies') {
      result = result.filter((title) => title.type === 'Movie');
    } else if (this.activeCategory === 'TV Shows') {
      result = result.filter((title) => title.type === 'TV Show');
    } else if (this.activeCategory === 'My List') {
      result = result.filter((title) =>
        this.myList.includes(title.id)
      );
    }

    if (query) {
      result = result.filter((title) =>
        `${title.name} ${title.genre} ${title.year}`
          .toLowerCase()
          .includes(query)
      );
    }

    return result;
  }

  get genreGroups(): { genre: string; titles: Title[] }[] {
    const groups = new Map<string, Title[]>();
  
    for (const title of this.visibleTitles) {
      const genres = title.genre
        .split(',')
        .map((genre) => genre.trim())
        .filter(Boolean);
  
      for (const genre of genres) {
        if (!groups.has(genre)) {
          groups.set(genre, []);
        }
  
        groups.get(genre)!.push(title);
      }
    }
  
    return Array.from(groups.entries())
      .map(([genre, titles]) => ({ genre, titles }))
      .sort((a, b) => a.genre.localeCompare(b.genre));
  }
  
  get featuredInList(): boolean {
    return (
      !!this.featuredTitle.id &&
      this.myList.includes(this.featuredTitle.id)
    );
  }

  toggleMyList(title: Title): void {
    if (!title.id || this.watchlistLoading) {
      return;
    }
  
    this.watchlistLoading = true;
  
    const alreadySaved = this.myList.includes(title.id);
  
    const request$ = alreadySaved
      ? this.apiService.removeFromWatchlist(title.id)
      : this.apiService.addToWatchlist(title.id);
  
    request$
      .pipe(finalize(() => {
        this.watchlistLoading = false;
      }))
      .subscribe({
        next: () => {
          this.myList = alreadySaved
            ? this.myList.filter((id) => id !== title.id)
            : [...this.myList, title.id];
  
          this.saveMyList();
        },
        error: (error) => {
          console.error('Failed to update watchlist:', error);
          this.errorMessage =
            'Could not update My List. Please try again.';
        },
      });
  }

  selectCategory(category: string): void {
    this.activeCategory = category;
    this.searchQuery = '';
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }
  
  openProfile(): void {
    this.profileMenuOpen = false;
    this.router.navigate(['/profile']);
  }
  
  openAccountSettings(): void {
    this.profileMenuOpen = false;
    this.router.navigate(['/account-settings']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private loadMyList(): string[] {
    try {
      const saved = localStorage.getItem('dionysus_my_list');
      const parsed: unknown = saved ? JSON.parse(saved) : [];

      return Array.isArray(parsed)
        ? parsed.filter(
            (id): id is string => typeof id === 'string'
          )
        : [];
    } catch {
      return [];
    }
  }

  private saveMyList(): void {
    localStorage.setItem(
      'dionysus_my_list',
      JSON.stringify(this.myList)
    );
  }
}
