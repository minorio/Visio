import { DecimalPipe, Location, SlicePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { finalize, switchMap } from 'rxjs';
import { HorizontalScroll } from '../../core/directives/horizontal-scroll.directive';
import { FavoritesActions } from '../../core/favorites-store/favorites.actions';
import {
  isMovieFavorite,
  selectAllFavorites,
} from '../../core/favorites-store/favorites.selectors';
import { MovieDataService } from '../../core/services/movieDataService.service';
import { Genre, Movie, MovieDetails } from '../../models/movie.model';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { MovieDetailsSkeletonComponent } from '../movie-details-skeleton/movie-details-skeleton.component';

@Component({
  selector: 'movie-details-page',
  imports: [
    SlicePipe,
    DecimalPipe,
    MatIconModule,
    MovieCardComponent,
    MatButtonModule,
    RouterModule,
    HorizontalScroll,
    MovieDetailsSkeletonComponent,
  ],
  templateUrl: './movie-details-page.component.html',
  styleUrl: './movie-details-page.component.scss',
})
export class MovieDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private movieService = inject(MovieDataService);
  private location = inject(Location);
  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);
  public movieDetails = signal<MovieDetails | null>(null);
  public isLoading = signal(true);
  public genresMap = signal<Record<number, string>>({});
  public readonly favorites = this.store.selectSignal(selectAllFavorites);
  public movie = signal<Movie | null>(null);
  public isFavorite = computed(() => {
    const details = this.movieDetails();
    return details ? this.store.selectSignal(isMovieFavorite(details.id))() : false;
  });

  public ngOnInit(): void {
    this.movieService
      .getGenres()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((genreData) => {
          const map: Record<number, string> = {};
          genreData.genres.forEach((genre: Genre) => (map[genre.id] = genre.name));
          this.genresMap.set(map);

          return this.route.paramMap;
        }),
      )
      .subscribe((params: ParamMap) => {
        const id = params.get('id');
        if (id) {
          window.scrollTo({ top: 0, behavior: 'instant' });
          this.resetHorizontalScrolls();

          this.loadMovieDetails(id);
        }
      });
  }

  private loadMovieDetails(id: string): void {
    this.isLoading.set(true);
    this.movieService
      .getMovieDetails(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe((data: MovieDetails) => this.movieDetails.set(data));
  }

  private resetHorizontalScrolls(): void {
    const scrollers = document.querySelectorAll<HTMLElement>('.cast__list, .similar__list');
    scrollers.forEach((el) => (el.scrollLeft = 0));
  }

  public onToggleFavorite(): void {
    const details = this.movieDetails();
    if (!details) return;

    if (this.isFavorite()) {
      this.store.dispatch(FavoritesActions.removeMovie({ movieId: details.id }));
    } else {
      const movieToSave: Movie = {
        ...details,
        genre_ids: details.genres.map((genre) => genre.id),
      };
      this.store.dispatch(FavoritesActions.addMovie({ movie: movieToSave }));
    }
  }

  public goBack(): void {
    this.location.back();
  }
}
