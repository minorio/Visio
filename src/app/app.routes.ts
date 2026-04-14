import { Routes } from '@angular/router';
import { FavoritesPageComponent } from './components/favorites-page/favorites-page.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { MovieDetailsComponent } from './components/movie-details-page/movie-details-page.component';

export const routes: Routes = [
  { path: 'home', component: HomePageComponent },
  { path: 'movie/:id', component: MovieDetailsComponent },
  { path: 'favorites', component: FavoritesPageComponent },
  { path: '**', redirectTo: 'home' },
];
