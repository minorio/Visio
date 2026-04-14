import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { tap, withLatestFrom } from 'rxjs/operators';
import { FavoritesActions } from './favorites.actions';
import { selectAllFavorites } from './favorites.selectors';

@Injectable()
export class FavoritesEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);

  saveToLocalStorage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(FavoritesActions.addMovie, FavoritesActions.removeMovie),
        withLatestFrom(this.store.select(selectAllFavorites)),
        tap(([action, movies]) => {
          localStorage.setItem('favorites_movies', JSON.stringify(movies));
        }),
      ),
    { dispatch: false },
  );
}
