import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { VertexClientService } from '../../services/vertex-client.service';

@Component({
  selector: 'vertex-dasboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    DASHBOARD WORKS
  `
})

export class DashboardComponent {
//   cms = inject(VertexClientService);
}