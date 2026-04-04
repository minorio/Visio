import { Component, HostListener, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [MatIconModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public scrollOffset = signal(0);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const offset = window.scrollY;
    document.documentElement.style.setProperty('--scroll-offset', offset.toString());
  }
}
