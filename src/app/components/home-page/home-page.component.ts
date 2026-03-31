import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { MovieDataService } from '../../core/services/movieDataService.service';
import { Genre, Movie } from '../../models/movie.model';
import { MovieCardSkeletonComponent } from '../movie-card-skeleton/movie-card-skeleton.component';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { MovieFiltersComponent } from '../movie-filters/movie-filters.component';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MovieCardComponent,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MovieCardSkeletonComponent,
    MatButtonToggleModule,
    ReactiveFormsModule,
    MatSelectModule,
    MovieFiltersComponent,
  ],
})
export class HomePageComponent implements OnInit {
  private readonly movieDataService = inject(MovieDataService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly SCROLL_THRESHOLD = 300;
  private readonly MAX_API_PAGES = 500;
  public readonly skeletonItems = Array(20).fill(0);

  public readonly searchControl = new FormControl('');

  public movies = signal<Movie[]>([]);
  public genresMap = signal<Record<number, string>>({});
  public genresList = signal<Genre[]>([]);
  public isLoading = signal<boolean>(false);
  public loadingMode = signal<'classic' | 'infinite'>('classic');

  public pageIndex = signal<number>(0);
  public totalResults = signal<number>(0);
  public totalPages = signal<number>(0);

  public selectedGenre = signal<number | null>(null);
  public selectedSort = signal<string>('popularity.desc');
  public selectedYear = signal<number | null>(null);
  public selectedRating = signal<number | null>(null);
  public selectedCountry = signal<string | null>(null);

  public ngOnInit(): void {
    this.initGenres();
    this.initSearch();
  }

  private initGenres(): void {
    this.movieDataService
      .getGenres()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.genresList.set(data.genres);

        const map: Record<number, string> = {};
        data.genres.forEach((genre) => (map[genre.id] = genre.name));
        this.genresMap.set(map);

        this.loadData(1);
      });
  }

  private initSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => {
        if (query) this.clearAllFilters();

        this.movies.set([]);
        this.pageIndex.set(0);
        this.totalPages.set(0);
        this.loadData(1);
      });
  }

  public loadData(page: number): void {
    const query = this.searchControl.value;
    this.isLoading.set(true);

    const request$ = query
      ? this.movieDataService.searchMovies(query, page)
      : this.movieDataService.getMovies(
          this.selectedGenre(),
          this.selectedYear(),
          this.selectedRating(),
          this.selectedCountry(),
          this.selectedSort(),
          page,
        );

    request$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (data) => {
          if (this.loadingMode() === 'infinite' && page > 1) {
            this.movies.update((prev) => [...prev, ...data.results]);
          } else {
            this.movies.set(data.results || []);
          }

          this.pageIndex.set(page - 1);
          this.totalResults.set(Math.min(data.total_results, 10000));
          this.totalPages.set(Math.min(data.total_pages, this.MAX_API_PAGES));
        },
        error: (err) => console.error('Loading error:', err),
      });
  }

  @HostListener('window:scroll', [])
  public onWindowScroll(): void {
    const isInfiniteMode = this.loadingMode() === 'infinite';

    if (!isInfiniteMode || this.isLoading() || this.pageIndex() + 1 >= this.totalPages()) {
      return;
    }

    const currentScrollPosition = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const totalContentHeight = document.documentElement.scrollHeight;

    const isNearBottom =
      currentScrollPosition + windowHeight >= totalContentHeight - this.SCROLL_THRESHOLD;

    if (isNearBottom) {
      const nextPageToLoad = this.pageIndex() + 2;

      if (nextPageToLoad <= this.totalPages()) {
        this.loadData(nextPageToLoad);
      }
    }
  }

  public onModeChange(newMode: 'classic' | 'infinite'): void {
    this.loadingMode.set(newMode);
    this.movies.set([]);
    this.pageIndex.set(0);
    this.loadData(1);
  }

  public handlePageEvent(e: PageEvent): void {
    this.pageIndex.set(e.pageIndex);
    const pageToLoad = e.pageIndex + 1;
    this.loadData(pageToLoad);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  public isFiltersActive(): boolean {
    return (
      !!this.searchControl.value ||
      !!this.selectedGenre() ||
      !!this.selectedYear() ||
      !!this.selectedRating() ||
      !!this.selectedCountry() ||
      this.selectedSort() !== 'popularity.desc'
    );
  }

  public updateFilter<T>(filterSignal: WritableSignal<T>, value: T): void {
    filterSignal.set(value);
    this.movies.set([]);
    this.pageIndex.set(0);
    this.loadData(1);
  }

  public resetFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.clearAllFilters();
    this.movies.set([]);
    this.pageIndex.set(0);
    this.loadData(1);
  }

  private clearAllFilters(): void {
    this.selectedGenre.set(null);
    this.selectedSort.set('popularity.desc');
    this.selectedYear.set(null);
    this.selectedRating.set(null);
    this.selectedCountry.set(null);
  }
}
