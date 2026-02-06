import { Component, inject, AfterViewInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { VertexClientService } from '../../services/vertex-client.service';
import { VertexLogoComponent } from '../ui/vertex-logo.component';
import { AuthService } from '../../services/auth.service';
import { VertexThemeToggleComponent } from '../ui/vertex-theme-toggle.component';
import { VertexBreadcrumbComponent } from '../ui/vertex-breadcrumb.component';

declare const lucide: any;

@Component({
  selector: 'vertex-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, VertexLogoComponent, VertexThemeToggleComponent,
    VertexBreadcrumbComponent
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements AfterViewInit {
  cms = inject(VertexClientService);
  auth = inject(AuthService);

  // Computed user data - in a real app, this would come from an API
  // For now, we'll extract from token or use default
  currentUser = computed(() => {
    // In a real implementation, decode JWT token or fetch from API
    const userInfo = this.auth.getUserInfo();

    // For now, returning mock data - you can enhance this later
    return {
      name: userInfo.name || 'USER NAME',
      email: userInfo.email || 'email@vertex.cms'
    };
  });

  // Generate initials from name
  userInitials = computed(() => {
    const name = this.currentUser().name;
    return name
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  ngAfterViewInit() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
      try {
        lucide.createIcons({ nameAttr: 'data-lucide' });
      } catch (e) {
        console.warn('Lucide icons not initialized:', e);
      }
    }
  }

  logout() {
    this.auth.logout();
  }
}