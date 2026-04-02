import { Component } from '@angular/core';
import { MovieCardSkeletonComponent } from '../movie-card-skeleton/movie-card-skeleton.component';

@Component({
  selector: 'movie-details-skeleton',
  imports: [MovieCardSkeletonComponent],
  templateUrl: './movie-details-skeleton.component.html',
  styleUrl: './movie-details-skeleton.component.scss',
})
export class MovieDetailsSkeletonComponent {}
