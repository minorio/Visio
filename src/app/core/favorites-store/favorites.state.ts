import { Movie } from './../../models/movie.model';

export interface FavoritesState {
  movies: Movie[];
}

export const initialState: FavoritesState = {
  movies: [],
};
