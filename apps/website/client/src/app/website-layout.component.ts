import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VertexLogoComponent } from '@vertex-cms/admin';
import { CmsMenuComponent } from './components/cms-menu.component';

@Component({
  selector: 'app-website-layout',
  standalone: true,
  imports: [RouterModule, VertexLogoComponent, CmsMenuComponent],
  templateUrl: './website-layout.component.html'
})
export class WebsiteLayoutComponent {}
