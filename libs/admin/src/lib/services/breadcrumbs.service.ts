import { Injectable, signal, inject } from '@angular/core';
import { Router, NavigationEnd, ActivatedRouteSnapshot, Data } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BreadcrumbItem } from '../components/ui/vertex-breadcrumb.component';
import { VertexClientService } from './vertex-client.service';

export interface BreadcrumbData {
  label: string | ((snapshot: any) => string);
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbsService {
  private router = inject(Router);
  private cms = inject(VertexClientService);

  // Signal that holds the current breadcrumb items
  breadcrumbs = signal<BreadcrumbItem[]>([]);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const root = this.router.routerState.snapshot.root;
      const breadcrumbs: BreadcrumbItem[] = [];
      this.addBreadcrumb(root, [], breadcrumbs);
      this.breadcrumbs.set(breadcrumbs);
    });
  }

  private addBreadcrumb(route: ActivatedRouteSnapshot | null, parentUrl: string[], breadcrumbs: BreadcrumbItem[]) {
    if (route) {
      // Construct route URL
      const routeUrl = parentUrl.concat(route.url.map(url => url.path));

      // console.log(routeUrl);
      // console.log(route.firstChild);
      
      const data = route.data as Data;
      const breadcrumbData = data['breadcrumb'] as BreadcrumbData | undefined;

      if (breadcrumbData) {
        let label = typeof breadcrumbData.label === 'function' 
          ? breadcrumbData.label(route) 
          : breadcrumbData.label;


        // Interpolate parameters (:slug, :id)
        const isSlug = label.includes(':slug');

        if (label !== null && label !== '') {
          label = this.interpolateParams(label, route.params);
        
          // Resolve collection display names if applicable
          if(isSlug){
            label = this.resolveCollectionName(label, route.params);
          }
        console.log(label)


          breadcrumbs.push({
            label,
            route: '/' + routeUrl.join('/')
          });
        }
      }

      // Recursive call for the next route element
      if (route.firstChild) {
        this.addBreadcrumb(route.firstChild, routeUrl, breadcrumbs);
      }
    }
  }

  /**
   * Replaces route parameter placeholders like :slug or :id with actual values
   */
  private interpolateParams(label: string, params: any): string {
    let result = label;
    Object.keys(params).forEach(key => {
      const paramValue = params[key];
      result = result.replace(`:${key}`, paramValue);
      result = result.replace(`{${key}}`, paramValue);
    });
    return result;
  }

  /**
   * Resolves collection slugs to their display names
   */
  private resolveCollectionName(label: string, params: any): string {
    if (params['slug']) {
      const slug = params['slug'];
      const collections = this.cms.collections();
      const collection = collections.find(c => c.slug === slug);
      
      if (collection) {
        return collection.pluralName || 
               collection.singularName || 
               this.capitalizeFirst(slug);
      }
    }
    return label;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
