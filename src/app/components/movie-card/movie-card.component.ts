import { DecimalPipe, SlicePipe } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
  imports: [MatCardModule, MatIconModule, DecimalPipe, SlicePipe, RouterModule],
})
export class MovieCardComponent {
  public isFavorite: boolean = false;
  public movieSignal = signal<Movie | null>(null);
  @Input() public genres: Record<number, string> = {};
  @Input() public set movie(value: Movie) {
    this.movieSignal.set(value);
  }
  public toggleFavorite(event: Event) {
    event.stopPropagation();
    this.isFavorite = !this.isFavorite;
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
