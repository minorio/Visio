import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
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

const COUNTRY_TO_LANG_MAP: Record<string, string> = {
  US: 'en',
  GB: 'en',
  DE: 'de',
  ES: 'es',
  IT: 'it',
  TR: 'tr',
  FR: 'fr',
  KR: 'ko',
  CN: 'zh',
  JP: 'ja',
  BY: 'be',
  RU: 'ru',
};

@Component({
  selector: 'favorites-page',
  standalone: true,
  imports: [
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
  public readonly genresList = signal<Genre[]>([]);
  public readonly favoriteMovies = this.store.selectSignal(selectAllFavorites);

  public readonly searchControl = new FormControl('');
  public readonly selectedSort = signal<string>('popularity.desc');
  public readonly searchQuery = signal<string>('');
  public readonly selectedGenre = signal<number | null>(null);
  public readonly selectedYear = signal<number | null>(null);
  public readonly selectedRating = signal<number | null>(null);
  public readonly selectedCountry = signal<string | null>(null);

  public readonly favoriteSortOptions: SortOption[] = [
    { value: 'date_added', label: 'Recently Added' },
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Top Rated' },
    { value: 'primary_release_date.desc', label: 'Newest' },
  ];

  public readonly isResetDisabled = computed(() => {
    return (
      !this.searchQuery() &&
      this.selectedGenre() === null &&
      this.selectedYear() === null &&
      this.selectedRating() === null &&
      this.selectedCountry() === null &&
      this.selectedSort() === 'popularity.desc'
    );
  });

  public readonly filteredMovies = computed(() => {
    let movies = [...this.favoriteMovies()];
    const query = this.searchQuery().toLowerCase();

    if (query) {
      movies = movies.filter((movie) => movie.title.toLowerCase().includes(query));
    }

    const genre = this.selectedGenre();
    if (genre !== null) {
      movies = movies.filter((movie) => movie.genre_ids?.includes(genre));
    }

    const year = this.selectedYear();
    if (year !== null) {
      movies = movies.filter((movie) => new Date(movie.release_date).getFullYear() === year);
    }

    const rating = this.selectedRating();
    if (rating !== null) {
      movies = movies.filter((movie) => movie.vote_average >= rating);
    }

    const country = this.selectedCountry();
    if (country !== null) {
      const targetLang = COUNTRY_TO_LANG_MAP[country];
      if (targetLang) {
        movies = movies.filter((movie) => movie.original_language === targetLang);
      }
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

  public ngOnInit(): void {
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
        this.genresList.set(data.genres);

        const map: Record<number, string> = {};
        data.genres.forEach((genre: Genre) => (map[genre.id] = genre.name));
        this.genresMap.set(map);
      });
  }

  public updateFilter<T>(filterSignal: WritableSignal<T>, value: T): void {
    filterSignal.set(value);
  }

  public resetFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.searchQuery.set('');
    this.clearAllFilters();
  }

  private clearAllFilters(): void {
    this.selectedGenre.set(null);
    this.selectedSort.set('popularity.desc');
    this.selectedYear.set(null);
    this.selectedRating.set(null);
    this.selectedCountry.set(null);
  }
}
