import { Routes } from '@angular/router';
import { LibComponent, LibComponent2, LibComponentF, LibComponentF2 } from '../../projects/lib/src/public-api';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'page1', component: LibComponent },
    { path: 'page2', component: LibComponent2 },
    { path: 'page1f', component: LibComponentF },
    { path: 'page2f', component: LibComponentF2 }
];
