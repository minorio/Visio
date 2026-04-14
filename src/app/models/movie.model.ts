export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  overview: string;
  popularity: number;
  adult: boolean;
  video: boolean;
  original_language: string;
  original_title: string;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}
export interface Genre {
  id: number;
  name: string;
}

export interface GenreResponse {
  genres: Genre[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface MovieDetails extends Movie {
  tagline: string;
  runtime: number;
  budget: number;
  revenue: number;
  genres: Genre[];
  credits: {
    cast: CastMember[];
  };
  similar: {
    results: Movie[];
    total_pages: number;
    total_results: number;
  };
}

export interface SortOption {
  value: string;
  label: string;
}
