import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { authGuard } from './auth.guard';
import { BookingComponent } from './components/booking/booking.component';
import { MyRequestsComponent } from './components/my-requests/my-requests.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'booking', component: BookingComponent, canActivate: [authGuard] },
  { path: 'my-requests', component: MyRequestsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
