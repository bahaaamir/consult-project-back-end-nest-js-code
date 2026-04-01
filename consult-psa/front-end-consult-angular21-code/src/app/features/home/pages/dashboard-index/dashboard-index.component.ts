import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthStore } from '../../../../core/auth/store/auth.store';
import { UserRole } from '../../../../core/auth/models/auth.models';
import { SuperAdminDashboard } from '../super-admin-dashboard/super-admin-dashboard';
import { OfficeDashboardComponent } from '../office-dashboard/office-dashboard.component';
import { EmployeeDashboard } from '../employee-dashboard/employee-dashboard';
import { ClientDashboard } from '../client-dashboard/client-dashboard';

@Component({
  selector: 'app-dashboard-index',
  imports: [SuperAdminDashboard, OfficeDashboardComponent, EmployeeDashboard, ClientDashboard],
  templateUrl: './dashboard-index.component.html',
  styleUrl: './dashboard-index.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardIndexComponent {
  private readonly authStore = inject(AuthStore);
  readonly roles = UserRole;
  readonly role = () => this.authStore.currentUser()?.role;
}
