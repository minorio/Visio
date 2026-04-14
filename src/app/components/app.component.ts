import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { FavoritesActions } from '../core/favorites-store/favorites.actions';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private store = inject(Store);

  ngOnInit() {
    const saved = localStorage.getItem('favorites_movies');
    if (saved) {
      const movies = JSON.parse(saved);
      this.store.dispatch(FavoritesActions.loadFavorites({ movies }));
    }
  }
}
