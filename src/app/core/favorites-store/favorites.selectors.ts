import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FavoritesState } from './favorites.state';

export const selectFavoritesState = createFeatureSelector<FavoritesState>('favorites');
export const selectAllFavorites = createSelector(selectFavoritesState, (state) => state.movies);
export const selectFavoritesCount = createSelector(selectAllFavorites, (movies) => movies.length);
export const isMovieFavorite = (movieId: number) =>
  createSelector(selectAllFavorites, (movies) => movies.some((m) => m.id === movieId));
