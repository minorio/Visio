import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Movie } from './../../models/movie.model';

export const FavoritesActions = createActionGroup({
  source: 'Favorites',
  events: {
    'Add Movie': props<{ movie: Movie }>(),
    'Remove Movie': props<{ movieId: number }>(),
    'Load Favorites': props<{ movies: Movie[] }>(),
    'Clear All': emptyProps(),
  },
});
