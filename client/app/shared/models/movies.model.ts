
export interface Movie {
    _id: string;
    title: string;
    description: string;
    releaseYear: number;
    genres: string[];
    posterUrl?: string;
    backdropUrl?: string;
    trailerUrl?: string;
    videoUrl?: string;
    rating: number;
  }
  
  export interface MoviesResponse {
    success: boolean;
    count: number;
    movies: Movie[];
  }
  