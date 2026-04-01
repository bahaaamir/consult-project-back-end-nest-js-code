import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Tooltip } from 'primeng/tooltip';

import { AuthService } from '../../auth/auth.service';
import { AuthStore } from '../../auth/store/auth.store';
import { UserRole } from '../../auth/models/auth.models';
import { ThemeToggleComponent } from '../../../shared/ui/theme-toggle/theme-toggle.component';

type NavItem = {
  label: string;
  icon: string;
  route: string;
  exact: boolean;
};

@Component({
  selector: 'app-shell-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Tooltip, ThemeToggleComponent],
  templateUrl: './app-shell-layout.component.html',
  styleUrl: './app-shell-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);

  readonly currentUser = this.authStore.currentUser;
  readonly sidebarCollapsed = signal(false);
  readonly mobileSidebarOpen = signal(false);

  readonly navItems = computed<NavItem[]>(() => {
    const role = this.currentUser()?.role;
    const items: NavItem[] = [
      { label: 'Dashboard', icon: 'pi pi-objects-column', route: '/', exact: true },
    ];

    if (!role) return items;

    switch (role) {
      case UserRole.SUPER_ADMIN:
        items.push(
          { label: 'Offices', icon: 'pi pi-building', route: '/offices', exact: false },
          { label: 'Users', icon: 'pi pi-users', route: '/users', exact: false },
          { label: 'Settings', icon: 'pi pi-cog', route: '/settings', exact: false },
        );
        break;
      case UserRole.OWNER:
      case UserRole.MANAGER:
        items.push(
          { label: 'Projects', icon: 'pi pi-folder', route: '/projects', exact: false },
          { label: 'Invoices', icon: 'pi pi-file', route: '/invoices', exact: false },
          { label: 'Team', icon: 'pi pi-users', route: '/team', exact: false },
          { label: 'Settings', icon: 'pi pi-cog', route: '/settings', exact: false },
        );
        break;
      case UserRole.EMPLOYEE:
        items.push(
          { label: 'My Tasks', icon: 'pi pi-check-square', route: '/tasks', exact: false },
          { label: 'Timesheets', icon: 'pi pi-clock', route: '/timesheets', exact: false },
          { label: 'Settings', icon: 'pi pi-cog', route: '/settings', exact: false },
        );
        break;
      case UserRole.CLIENT_OWNER:
      case UserRole.CLIENT_EMPLOYEE:
        items.push(
          { label: 'Projects', icon: 'pi pi-folder', route: '/projects', exact: false },
          { label: 'Invoices', icon: 'pi pi-file', route: '/invoices', exact: false },
        );
        break;
    }

    return items;
  });

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update((v) => !v);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  logout(): Promise<void> {
    return this.authService.logout();
  }
}
