import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Genre } from '../../models/movie.model';

@Component({
  selector: 'movie-filters',
  imports: [MatIconModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './movie-filters.component.html',
  styleUrl: './movie-filters.component.scss',
})
export class MovieFiltersComponent implements OnInit {
  @Input() genres: Genre[] = [];

  @Input() selectedGenre: number | null = null;
  @Input() selectedSort: string = 'popularity.desc';
  @Input() selectedYear: number | null = null;
  @Input() selectedRating: number | null = null;
  @Input() selectedCountry: string | null = null;

  @Input() isDisabled: boolean = false;
  @Input() isResetDisabled: boolean = true;

  @Output() genreChanged = new EventEmitter<number | null>();
  @Output() sortChanged = new EventEmitter<string>();
  @Output() yearChanged = new EventEmitter<number | null>();
  @Output() ratingChanged = new EventEmitter<number | null>();
  @Output() countryChanged = new EventEmitter<string | null>();
  @Output() resetAll = new EventEmitter<void>();

  public readonly sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Top Rated' },
    { value: 'primary_release_date.desc', label: 'Newest' },
    { value: 'revenue.desc', label: 'Top Lifetime Grosses' },
  ];
  public readonly yearsList: number[] = [];
  public readonly ratingOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  public readonly countryOptions = [
    { value: 'US', label: 'USA' },
    { value: 'GB', label: 'Great Britain' },
    { value: 'DE', label: 'Germany' },
    { value: 'ES', label: 'Spain' },
    { value: 'IT', label: 'Italy' },
    { value: 'TR', label: 'Turkey' },
    { value: 'FR', label: 'France' },
    { value: 'KR', label: 'South Korea' },
    { value: 'CN', label: 'China' },
    { value: 'JP', label: 'Japan' },
    { value: 'BY', label: 'Belarus' },
    { value: 'RU', label: 'Russia' },
  ];

  public ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1950; year--) {
      this.yearsList.push(year);
    }
  }
}
