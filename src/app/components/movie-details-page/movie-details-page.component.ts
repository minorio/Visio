import { DecimalPipe, Location, SlicePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { HorizontalScroll } from '../../core/directives/horizontal-scroll.directive';
import { MovieDataService } from '../../core/services/movieDataService.service';
import { Genre, MovieDetails } from '../../models/movie.model';
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
  private readonly destroyRef = inject(DestroyRef);
  public movie = signal<MovieDetails | null>(null);
  public isLoading = signal(true);
  public genresMap = signal<Record<number, string>>({});

  ngOnInit(): void {
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
      .subscribe((data: MovieDetails) => this.movie.set(data));
  }

  private resetHorizontalScrolls(): void {
    const scrollers = document.querySelectorAll<HTMLElement>('.cast__list, .similar__list');
    scrollers.forEach((el) => (el.scrollLeft = 0));
  }

  public goBack(): void {
    this.location.back();
  }
}
