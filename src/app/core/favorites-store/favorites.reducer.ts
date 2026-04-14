import { createReducer, on } from '@ngrx/store';
import { FavoritesActions } from './favorites.actions';
import { initialState } from './favorites.state';

export const favoritesReducer = createReducer(
  initialState,
  on(FavoritesActions.addMovie, (state, { movie }) => {
    const exists = state.movies.some((m) => m.id === movie.id);
    if (exists) return state;

    return {
      ...state,
      movies: [movie, ...state.movies],
    };
  }),
  on(FavoritesActions.removeMovie, (state, { movieId }) => ({
    ...state,
    movies: state.movies.filter((m) => m.id !== movieId),
  })),
  on(FavoritesActions.loadFavorites, (state, { movies }) => ({
    ...state,
    movies: movies || [],
  })),
);
