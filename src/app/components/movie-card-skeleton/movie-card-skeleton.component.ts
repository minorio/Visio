import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'movie-card-skeleton',
  templateUrl: './movie-card-skeleton.component.html',
  styleUrls: ['./movie-card-skeleton.component.scss'],
  imports: [MatCardModule],
})
export class MovieCardSkeletonComponent {}
