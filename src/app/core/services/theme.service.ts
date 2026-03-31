import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>('light');

  theme$ = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme('light');
  }

  get currentTheme(): Theme {
    return 'light';
  }

  get isDark(): boolean {
    return false;
  }

  setTheme(_theme: Theme): void {
    // Dark mode disabled — always light
  }

  toggleTheme(): void {
    // Dark mode disabled
  }

  private applyTheme(_theme: Theme): void {
    const root = document.documentElement;
    root.classList.remove('dark-theme');
    root.classList.add('light-theme');

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', '#48BB78');
    }
  }
}
