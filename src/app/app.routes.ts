import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'characters',
    loadComponent: () =>
      import('./features/star-wars/components/character-list/character-list.component').then(
        m => m.CharacterListComponent
      ),
  },
  { path: '**', redirectTo: 'home' },
];
