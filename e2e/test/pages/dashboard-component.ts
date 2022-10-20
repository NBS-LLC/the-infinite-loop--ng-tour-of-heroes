class DashboardComponent {
    get element() { return $('app-root app-dashboard'); }
    get topHeroes() { return $$(byTestId('top-heroes-item-', { partial: true })) }
}

export const dashboardComponent = new DashboardComponent();