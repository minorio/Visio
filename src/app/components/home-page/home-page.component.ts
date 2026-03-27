import { CommonModule } from '@angular/common';
import { Component, DestroyRef, HostListener, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { MovieDataService } from '../../core/services/movieDataService.service';
import { Genre, Movie } from '../../models/movie.model';
import { MovieCardSkeletonComponent } from '../movie-card-skeleton/movie-card-skeleton.component';
import { MovieCardComponent } from '../movie-card/movie-card.component';

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
  ],
})
export class HomePageComponent implements OnInit {
  private readonly movieDataService = inject(MovieDataService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly SCROLL_THRESHOLD = 300;
  public readonly skeletonItems = Array(20).fill(0);
  public readonly searchControl = new FormControl('');

  public movies = signal<Movie[]>([]);
  public genresMap = signal<Record<number, string>>({});
  public isLoading = signal<boolean>(false);
  public loadingMode = signal<'classic' | 'infinite'>('classic');
  public pageIndex = signal<number>(0);
  public totalResults = signal<number>(0);
  public totalPages = signal<number>(0);

  public ngOnInit(): void {
    this.movieDataService
      .getGenres()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        const map: Record<number, string> = {};
        data.genres.forEach((genre: Genre) => (map[genre.id] = genre.name));
        this.genresMap.set(map);

        this.loadData(1);
      });
    this.initSearch();
  }

  public loadData(page: number): void {
    const query = this.searchControl.value;
    this.isLoading.set(true);

    const request$ = query
      ? this.movieDataService.searchMovies(query, page)
      : this.movieDataService.getPopularMovies(page);

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

          const maxResults = Math.min(data.total_results, 10000);
          this.totalResults.set(maxResults);

          const pages = Math.min(data.total_pages, 500);
          this.totalPages.set(pages);
        },
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

  private initSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.movies.set([]);
        this.pageIndex.set(0);
        this.totalPages.set(0);
        this.loadData(1);
      });
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
}
