import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'client';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  ngOnInit() {
    if (this.isBrowser) {
      const savedTheme = localStorage.getItem('vertex-theme');
      if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
      }
    }
  }
}
