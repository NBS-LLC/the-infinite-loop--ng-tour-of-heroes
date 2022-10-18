class NavigationComponent {
    get allLinks() { return $$('[data-testid*="navlink-"]') }
    get heroesLink() { return $('[data-testid="navlink-heroes"]'); }

    async goToHeroesPage() {
        await this.heroesLink.click();
    }
}

export const navigationComponent = new NavigationComponent();