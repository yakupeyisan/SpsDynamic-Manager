import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-branding',
  imports: [RouterModule, CommonModule],
  template: `
    <a [routerLink]="['/']" class="branding-link">
      <img
        [src]="logoUrl"
        class="branding-logo"
        alt="logo"
      />
    </a>
  `,
  styles: [`
    .branding-link {
      display: flex;
      align-items: center;
      text-decoration: none;
    }
    
    .branding-logo {
      max-width: 140px;
      max-height: 50px;
      width: auto;
      height: auto;
      object-fit: contain;
    }
  `]
})
export class BrandingComponent {
  options = this.settings.getOptions();
  readonly logoUrl = environment.logoUrl;
  
  constructor(private settings: CoreService) {} 
}
