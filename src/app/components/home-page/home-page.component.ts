import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { MovieDataService } from '../../core/services/movieDataService.service';
import { Genre, Movie } from '../../models/movie.model';
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
  ],
})
export class HomePageComponent implements OnInit {
  private readonly movieDataService = inject(MovieDataService);
  private readonly destroyRef = inject(DestroyRef);
  public movies = signal<Movie[]>([]);
  public genresMap = signal<Record<number, string>>({});
  public isLoading = signal<boolean>(false);

  public ngOnInit(): void {
    this.movieDataService
      .getGenres()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        const map: Record<number, string> = {};
        data.genres.forEach((genre: Genre) => (map[genre.id] = genre.name));
        this.genresMap.set(map);

        this.loadData();
      });
  }

  public loadData(): void {
    this.isLoading.set(true);
    this.movieDataService
      .getPopularMovies()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (data) => {
          this.movies.set(data || []);
        },
        error: (err) => console.error('Ошибка загрузки:', err),
      });
  }
}
