import { DecimalPipe, SlicePipe } from '@angular/common';
import { Component, computed, inject, Input, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { FavoritesActions } from '../../core/favorites-store/favorites.actions';
import { isMovieFavorite } from '../../core/favorites-store/favorites.selectors';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
  imports: [MatCardModule, MatIconModule, DecimalPipe, SlicePipe, RouterModule],
})
export class MovieCardComponent {
  private store = inject(Store);
  public movieSignal = signal<Movie | null>(null);
  @Input() public genres: Record<number, string> = {};
  @Input() public set movie(value: Movie) {
    this.movieSignal.set(value);
  }
  public isFavorite = computed(() => {
    const movie = this.movieSignal();
    return movie ? this.store.selectSignal(isMovieFavorite(movie.id))() : false;
  });

  public onToggleFavorite(event: Event) {
    event.stopPropagation();
    const movie = this.movieSignal();
    if (!movie) return;

    if (this.isFavorite()) {
      this.store.dispatch(FavoritesActions.removeMovie({ movieId: movie.id }));
    } else {
      this.store.dispatch(FavoritesActions.addMovie({ movie }));
    }
  }

  public getMovieGenre(movie: Movie): string {
    const ids = movie.genre_ids;
    if (!ids || !Array.isArray(ids) || ids.length === 0) return 'Movie';

    return ids
      .map((id: number) => this.genres[id])
      .filter((name: string) => !!name)
      .join(', ');
  }
}
