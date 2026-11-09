
import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../app/core/services/api.service';
import { Movie } from '../../../../app/shared/models/movies.model';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  movie: Movie | null = null;
  loading = true;
  errorMessage = '';
  isPlaying = false;
  isMuted = false;
  savedPosition = 0;
  showResumePrompt = false;
  private lastSavedTime = 0;
  private resumePosition = 0;
  currentTime = 0;
  duration = 0;
  volume = 1;
  playbackRate = 1;

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }

    const video = this.videoElement?.nativeElement;
    if (!video) return;

    switch (event.key.toLowerCase()) {
      case ' ':
      case 'k':
        event.preventDefault();
        this.togglePlay();
        break;
      case 'arrowleft':
        this.skip(-10);
        break;
      case 'arrowright':
        this.skip(10);
        break;
      case 'm':
        this.toggleMute();
        break;
      case 'f':
        this.toggleFullscreen();
        break;
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'No movie was specified.';
      this.loading = false;
      return;
    }

    this.apiService.getMovie(id).subscribe({
      next: (response) => {
        this.movie = response.movie;
        this.apiService.getContinueWatching().subscribe({
          next: (progressResponse) => {
            console.log('Movie ID:', id);
  console.log('Progress response:', progressResponse);

  const savedProgress = progressResponse.progress.find(
            (item) => item.movie?._id === id && !item.completed);

            console.log('Matched saved progress:', savedProgress);

            if (savedProgress && savedProgress.currentTime > 1) {
              this.resumePosition = savedProgress.currentTime;
              this.savedPosition = savedProgress.currentTime;
              this.showResumePrompt = true;

              console.log('Resume prompt enabled:', this.showResumePrompt);
            }
          },
          error: (error) => {
            console.error('Failed to load playback progress:', error);
          },
        });

        this.loading = false;

        if (!this.movie.videoUrl) {
          this.errorMessage = 'No video is available for this title yet.';
        }
      },
      error: () => {
        this.errorMessage = 'Unable to load this video.';
        this.loading = false;
      },
    });

    window.addEventListener('keydown', this.onKeyDown);
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    this.saveProgress();
  }

  togglePlay(): void {
    const video = this.videoElement?.nativeElement;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {
        this.errorMessage = 'Playback failed. Please try again.';
      });
    } else {
      video.pause();
    }
  }

  onPlay(): void {
    this.isPlaying = true;
    this.errorMessage = '';
  }

  onPause(): void {
    this.isPlaying = false;
    this.saveProgress();
  }

  onTimeUpdate(): void {
    const video = this.videoElement.nativeElement;
    this.currentTime = video.currentTime;
  
    if (Math.abs(video.currentTime - this.lastSavedTime) >= 10) {
      this.saveProgress();
    }
  }

  onLoadedMetadata(): void {
  const video = this.videoElement.nativeElement;

  this.duration = video.duration;
  video.volume = this.volume;

  if (
    this.resumePosition > 0 &&
    this.resumePosition < video.duration
  ) {
    this.showResumePrompt = true;
  }
}

  onVideoError(): void {
    this.errorMessage = 'The video could not be loaded.';
  }

  seek(value: number | string): void {
    const video = this.videoElement?.nativeElement;
    if (!video) return;

    video.currentTime = Number(value);
    this.currentTime = video.currentTime;
  }

  skip(seconds: number): void {
    const video = this.videoElement?.nativeElement;
    if (!video) return;

    video.currentTime = Math.max(
      0,
      Math.min(video.duration || 0, video.currentTime + seconds)
    );
  }

  changeVolume(value: number | string): void {
    this.volume = Number(value);
    const video = this.videoElement?.nativeElement;

    if (video) {
      video.volume = this.volume;
      video.muted = this.volume === 0;
      this.isMuted = video.muted;
    }
  }

  toggleMute(): void {
    const video = this.videoElement?.nativeElement;
    if (!video) return;

    video.muted = !video.muted;
    this.isMuted = video.muted;
  }

  changeSpeed(value: number | string): void {
    this.playbackRate = Number(value);

    if (this.videoElement) {
      this.videoElement.nativeElement.playbackRate = this.playbackRate;
    }
  }

  resumeWatching(): void {
    const video = this.videoElement?.nativeElement;
    if (!video || !this.resumePosition) return;
  
    video.currentTime = this.resumePosition;
    this.currentTime = this.resumePosition;
    this.showResumePrompt = false;
    this.resumePosition = 0;
  
    video.play().catch(() => {
      this.errorMessage = 'Playback failed. Press Play to try again.';
    });
  }
  
  startFromBeginning(): void {
    const video = this.videoElement?.nativeElement;
    if (!video) return;
  
    video.currentTime = 0;
    this.currentTime = 0;
    this.resumePosition = 0;
    this.showResumePrompt = false;
  }
  
  private saveProgress(force = false): void {
    if (!this.movie || !this.videoElement) return;
  
    const video = this.videoElement.nativeElement;
  
    if (
      !Number.isFinite(video.currentTime) ||
      !Number.isFinite(video.duration) ||
      video.duration <= 0 ||
      video.currentTime < 0
    ) {
      return;
    }
  
    if (!force && Math.abs(video.currentTime - this.lastSavedTime) < 1) {
      return;
    }
  
    this.lastSavedTime = video.currentTime;
  
    this.apiService
      .savePlaybackProgress(
        this.movie._id,
        video.currentTime,
        video.duration
      )
      .subscribe({
        error: (error) => {
          console.error('Failed to save playback progress:', error);
          this.lastSavedTime = 0;
        },
      });
  }

  onVideoEnded(): void {
    const video = this.videoElement?.nativeElement;
    if (!video || !this.movie) return;
  
    this.currentTime = video.duration;
    this.duration = video.duration;
  
    // Force the final progress update.
    this.saveProgress(true);
  
    this.isPlaying = false;
    this.showResumePrompt = false;
    this.resumePosition = 0;
    this.savedPosition = 0;
  
    console.log('Video completed:', this.movie.title);
  }

  toggleFullscreen(): void {
    const video = this.videoElement?.nativeElement;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  }

  formatTime(seconds: number): string {
    if (!Number.isFinite(seconds)) return '0:00';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  goBack(): void {
    if (this.movie) {
      this.router.navigate(['/movie', this.movie._id]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
