import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthStore } from '../../../../core/auth/store/auth.store';
import { UiButtonComponent } from '../../../../shared/ui/button/ui-button.component';
import { UiCardComponent } from '../../../../shared/ui/card/ui-card.component';
import { UiPageHeaderComponent } from '../../../../shared/ui/page-header/ui-page-header.component';

type KpiCard = {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: string;
};

type ProjectItem = {
  name: string;
  client: string;
  progress: number;
  status: 'On Track' | 'At Risk' | 'Blocked';
  dueDate: string;
};

type ActivityItem = {
  icon: string;
  text: string;
  time: string;
};

@Component({
  selector: 'app-office-dashboard',
  imports: [UiPageHeaderComponent, UiCardComponent, UiButtonComponent],
  templateUrl: './office-dashboard.component.html',
  styleUrl: './office-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficeDashboardComponent {
  readonly currentUser;

  readonly kpis: KpiCard[] = [
    { title: 'Active Projects', value: '12', trend: '+2 this week', trendUp: true, icon: 'pi pi-folder-open' },
    { title: 'Unpaid Invoices', value: '7', trend: '-1 this week', trendUp: true, icon: 'pi pi-file' },
    { title: 'Overdue Tasks', value: '9', trend: '+3 this week', trendUp: false, icon: 'pi pi-clock' },
    { title: 'Team Utilization', value: '84%', trend: '+4%', trendUp: true, icon: 'pi pi-users' },
  ];

  readonly projects: ProjectItem[] = [
    {
      name: 'ERP Migration Wave 1',
      client: 'Al Noor Group',
      progress: 72,
      status: 'On Track',
      dueDate: 'Apr 12',
    },
    {
      name: 'Retail Analytics Dashboard',
      client: 'BrightMart',
      progress: 46,
      status: 'At Risk',
      dueDate: 'Apr 05',
    },
    {
      name: 'API Security Hardening',
      client: 'United Cargo',
      progress: 28,
      status: 'Blocked',
      dueDate: 'Apr 02',
    },
  ];

  readonly activities: ActivityItem[] = [
    { icon: 'pi pi-check-circle', text: 'Invoice INV-2026-031 marked as paid', time: '12 minutes ago' },
    { icon: 'pi pi-chart-line', text: 'Project "ERP Migration Wave 1" reached 72%', time: '48 minutes ago' },
    { icon: 'pi pi-user-plus', text: 'New client user invited for BrightMart', time: '2 hours ago' },
    { icon: 'pi pi-arrow-right-arrow-left', text: 'Task "Finalize milestone scope" moved to review', time: '3 hours ago' },
  ];

  constructor(authStore: AuthStore) {
    this.currentUser = authStore.currentUser;
  }
}
