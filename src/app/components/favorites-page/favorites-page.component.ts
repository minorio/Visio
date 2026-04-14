import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { selectAllFavorites } from '../../core/favorites-store/favorites.selectors';
import { MovieDataService } from '../../core/services/movieDataService.service';
import { Genre, SortOption } from '../../models/movie.model';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { MovieFiltersComponent } from '../movie-filters/movie-filters.component';

@Component({
  selector: 'favorites-page',
  standalone: true,
  imports: [
    CommonModule,
    MovieCardComponent,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatSelectModule,
    MovieFiltersComponent,
    ReactiveFormsModule,
    MatInputModule,
  ],
  templateUrl: './favorites-page.component.html',
  styleUrl: './favorites-page.component.scss',
})
export class FavoritesPageComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);
  private readonly movieDataService = inject(MovieDataService);
  public readonly genresMap = signal<Record<number, string>>({});
  public readonly selectedSort = signal<string>('date_added');
  public readonly searchQuery = signal<string>('');
  public readonly favoriteMovies = this.store.selectSignal(selectAllFavorites);
  public readonly searchControl = new FormControl('');

  public readonly favoriteSortOptions: SortOption[] = [
    { value: 'date_added', label: 'Recently Added' },
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Top Rated' },
    { value: 'primary_release_date.desc', label: 'Newest' },
  ];

  public readonly isResetDisabled = computed(
    () => !this.searchQuery() && this.selectedSort() === 'date_added',
  );

  public readonly filteredMovies = computed(() => {
    let movies = [...this.favoriteMovies()];
    const query = this.searchQuery().toLowerCase();

    if (query) {
      movies = movies.filter((movie) => movie.title.toLowerCase().includes(query));
    }

    const sortType = this.selectedSort();
    if (sortType === 'date_added') return movies;

    return movies.sort((a, b) => {
      switch (sortType) {
        case 'vote_average.desc':
          return b.vote_average - a.vote_average;
        case 'popularity.desc':
          return b.popularity - a.popularity;
        case 'primary_release_date.desc':
          return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
        default:
          return 0;
      }
    });
  });

  public ngOnInit() {
    this.initGenres();
    this.initSearch();
  }

  private initSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => this.searchQuery.set(query || ''));
  }

  private initGenres(): void {
    this.movieDataService
      .getGenres()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        const map: Record<number, string> = {};
        data.genres.forEach((genre: Genre) => (map[genre.id] = genre.name));
        this.genresMap.set(map);
      });
  }

  public resetFilters() {
    this.searchControl.setValue('');
    this.selectedSort.set('date_added');
  }
}
