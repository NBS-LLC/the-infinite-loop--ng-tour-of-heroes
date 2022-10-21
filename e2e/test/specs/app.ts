import { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';
import { dashboardComponent } from '../pages/dashboard-component';
import { heroDetailComponent } from '../pages/hero-detail-component';
import { heroesComponent } from '../pages/heroes-component';
import { navigationComponent } from '../pages/navigation-component';
import { Hero } from '../support/hero';

function getPageElts() {
    return {
        searchBox: $('#search-box'),
        searchResults: $$('.search-result li')
    };
}

describe('Initial page', () => {
    before(() => browser.url(''));

    const expectedTitle = 'Tour of Heroes';
    it(`has title '${expectedTitle}'`, async () => {
        expect(await browser.getTitle()).toEqual(expectedTitle);
    });

    const expectedH1 = 'Tour of Heroes';
    it(`has h1 '${expectedH1}'`, async () => {
        await expectHeading(1, expectedH1);
    });

    const expectedViewNames = ['Dashboard', 'Heroes'];
    it(`has views ${expectedViewNames}`, async () => {
        await expect(navigationComponent.element).toBeDisplayed();
        await expect(navigationComponent.allLinks).toBeElementsArrayOfSize(expectedViewNames.length);
        const viewNames = await navigationComponent.allLinks.map(el => el!.getText());
        expect(viewNames).toEqual(expectedViewNames);
    });

    it('has dashboard as the active view', async () => {
        await expect(dashboardComponent.element).toBeDisplayed();
    });
});

describe('Dashboard tests', () => {
    before(() => browser.url(''));

    it('has top heroes', async () => {
        await expect(dashboardComponent.topHeroes).toBeElementsArrayOfSize(4);
    });

    it(`selects and routes to ${Hero.TEST_TARGET.name} details`, dashboardSelectTargetHero);

    it(`updates hero name (${Hero.TEST_RENAME.name}) in details view`, updateHeroNameInDetailView);

    it(`cancels and shows ${Hero.TEST_TARGET.name} in Dashboard`, async () => {
        await (await $('button=go back')).click();
        await expect(dashboardComponent.topHeroes).toBeElementsArrayOfSize({ gte: 1 });
        await expectDashboardToHaveHero(Hero.TEST_TARGET);
    });

    it(`selects and routes to ${Hero.TEST_TARGET.name} details`, dashboardSelectTargetHero);

    it(`updates hero name (${Hero.TEST_RENAME.name}) in details view`, updateHeroNameInDetailView);

    it(`saves and shows ${Hero.TEST_RENAME.name} in Dashboard`, async () => {
        await (await $('button=save')).click();
        await expect(dashboardComponent.topHeroes).toBeElementsArrayOfSize({ gte: 1 });
        await expectDashboardToHaveHero(Hero.TEST_RENAME);
    });
});

describe('Heroes tests', () => {
    before(() => browser.url(''));

    it('can switch to Heroes view', async () => {
        await navigationComponent.goToHeroesPage();
        await expect(heroesComponent.element).toBeDisplayed();
        await expect(heroesComponent.allHeroes).toBeElementsArrayOfSize(9);
    });

    it('can route to hero details', async () => {
        await getHeroLiEltById(Hero.TEST_TARGET.id).click();

        await expect(heroDetailComponent.element).toBeDisplayed();
        const hero = await Hero.fromDetails(await heroDetailComponent.details);
        expect(hero.id).toEqual(Hero.TEST_TARGET.id);
        expect(hero.name).toEqual(Hero.TEST_TARGET.name.toUpperCase());
    });

    it(`updates hero name (${Hero.TEST_RENAME.name}) in details view`, updateHeroNameInDetailView);

    it(`shows ${Hero.TEST_RENAME.name} in Heroes list`, async () => {
        await $('button=save').click();
        const expectedText = `${Hero.TEST_TARGET.id}${Hero.TEST_RENAME.name}`;
        expect(await getHeroAEltById(Hero.TEST_TARGET.id).getText()).toEqual(expectedText);
    });

    it(`deletes ${Hero.TEST_RENAME.name} from Heroes list`, async () => {
        const heroesBefore = await toHeroArray(heroesComponent.allHeroes);
        const li = getHeroLiEltById(Hero.TEST_TARGET.id);
        await li.$('button=x').click();

        await expect(heroesComponent.element).toBeDisplayed();
        await expect(heroesComponent.allHeroes).toBeElementsArrayOfSize(8);
        const heroesAfter = await toHeroArray(heroesComponent.allHeroes);
        // console.log(await Hero.fromLi(page.allHeroes[0]));
        const expectedHeroes = heroesBefore.filter(h => h.name !== Hero.TEST_RENAME.name);
        expect(heroesAfter).toEqual(expectedHeroes);
        // expect(page.selectedHeroSubview.isPresent()).toBeFalsy();
    });

    it(`adds back ${Hero.TEST_TARGET.name}`, async () => {
        const addedHeroName = 'Magneta';
        const heroesBefore = await toHeroArray(heroesComponent.allHeroes);
        const numHeroes = heroesBefore.length;

        await $('input').setValue(addedHeroName);
        await $('button=Add hero').click();

        let heroesAfter;
        await browser.waitUntil(async () => {
            heroesAfter = await toHeroArray(heroesComponent.allHeroes);
            return heroesAfter.length == numHeroes + 1;
        });

        expect(heroesAfter.slice(0, numHeroes)).toEqual(heroesBefore);

        const maxId = heroesBefore[heroesBefore.length - 1].id;
        expect(heroesAfter[numHeroes]).toEqual({ id: maxId + 1, name: addedHeroName });
    });

    it('displays correctly styled buttons', async () => {
        const buttons = await $$('button=x');

        for (const button of buttons) {
            // Inherited styles from styles.css
            expect((await button.getCSSProperty('font-family')).parsed.string).toBe('arial, helvetica, sans-serif');
            expect((await button.getCSSProperty('border')).value).toContain('none');
            expect((await button.getCSSProperty('padding')).value).toBe('1px 10px 3px 10px');
            expect((await button.getCSSProperty('border-radius')).value).toBe('4px');
            // Styles defined in heroes.component.css
            expect((await button.getCSSProperty('left')).value).toBe('210px');
            expect((await button.getCSSProperty('top')).value).toBe('5px');
        }

        const addButton = $('button=Add hero');
        // Inherited styles from styles.css
        expect((await addButton.getCSSProperty('font-family')).parsed.string).toBe('arial, helvetica, sans-serif');
        expect((await addButton.getCSSProperty('border')).value).toContain('none');
        expect((await addButton.getCSSProperty('padding')).value).toBe('8px 24px');
        expect((await addButton.getCSSProperty('border-radius')).value).toBe('4px');
    });
});

describe('Progressive hero search', () => {
    before(() => browser.url(''));

    it(`searches for 'Ma'`, async () => {
        await getPageElts().searchBox.setValue('Ma');
        await browser.pause(1000);
        await expect(getPageElts().searchResults).toBeElementsArrayOfSize(4);
    });

    it(`continues search with 'g'`, async () => {
        await getPageElts().searchBox.addValue('g');
        await browser.pause(1000);
        await expect(getPageElts().searchResults).toBeElementsArrayOfSize(2);
    });

    it(`continues search with 'n' and gets ${Hero.TEST_TARGET.name}`, async () => {
        await getPageElts().searchBox.addValue('n');
        await browser.pause(1000);
        const page = getPageElts();
        await expect(page.searchResults).toBeElementsArrayOfSize(1);
        const hero = page.searchResults[0];
        expect(await hero.getText()).toEqual(Hero.TEST_TARGET.name);
    });

    it(`navigates to ${Hero.TEST_TARGET.name} details view`, async () => {
        const hero = getPageElts().searchResults[0];
        expect(await hero.getText()).toEqual(Hero.TEST_TARGET.name);
        await hero.click();

        await expect(heroDetailComponent.element).toBeDisplayed();
        const hero2 = await Hero.fromDetails(await heroDetailComponent.details);
        expect(hero2.id).toEqual(Hero.TEST_TARGET.id);
        expect(hero2.name).toEqual(Hero.TEST_TARGET.name.toUpperCase());
    });
});

async function expectHeading(hLevel: number, expectedText: string): Promise<void> {
    const hTag = `h${hLevel}`;
    const hText = await $(hTag).getText();
    expect(hText).toEqual(expectedText);
}

/**
 * Try to get a hero element from the dashboard.
 * 
 * @param name The hero's name.
 * @throws Error if the hero element cannot be found.
 */
async function getDashboardHeroByName(name: string) {
    let hero: WebdriverIO.Element;

    await browser.waitUntil(async () => {
        const topHeroes = await dashboardComponent.topHeroes;
        for (const topHero of topHeroes) {
            if (await topHero.getText() == name) {
                hero = topHero;
                return true;
            }
        }
        return false;
    }, { timeoutMsg: `hero (${name}) was not found on the dashboard` });

    return hero;
}

/**
 * Expect the dashboard view to have a specific Hero.
 * 
 * @param hero The hero that is expected on the dashboard.
 */
async function expectDashboardToHaveHero(hero: Hero) {
    await getDashboardHeroByName(hero.name);
}

async function dashboardSelectTargetHero() {
    const targetHeroElt = await getDashboardHeroByName(Hero.TEST_TARGET.name);
    expect(await targetHeroElt.getText()).toEqual(Hero.TEST_TARGET.name);
    await targetHeroElt.click();

    await expect(heroDetailComponent.element).toBeDisplayed();
    const hero = await Hero.fromDetails(await heroDetailComponent.details);
    expect(hero.id).toEqual(Hero.TEST_TARGET.id);
    expect(hero.name).toEqual(Hero.TEST_TARGET.name.toUpperCase());
}

async function updateHeroNameInDetailView() {
    // Assumes that the current view is the hero details view.
    await renameHero(Hero.TEST_RENAME.name);

    const hero = await Hero.fromDetails(await heroDetailComponent.details);
    expect(hero.id).toEqual(Hero.TEST_RENAME.id);
    expect(hero.name).toEqual(Hero.TEST_RENAME.name.toUpperCase());
}

/**
 * Rename an existing hero.
 * 
 * @param name The new name of the Hero.
 */
async function renameHero(name: string): Promise<void> {
    const input = $('input');
    await input.setValue(name);
}

function getHeroLiEltById(id: number): ChainablePromiseElement<WebdriverIO.Element> {
    const spanForId = $('span.badge=' + id.toString());
    return spanForId.$('../..');
}

function getHeroAEltById(id: number): ChainablePromiseElement<WebdriverIO.Element> {
    const spanForId = $('span.badge=' + id.toString());
    return spanForId.$('..');
}

async function toHeroArray(allHeroes: ChainablePromiseArray<WebdriverIO.ElementArray>): Promise<Hero[]> {
    return allHeroes.map(hero => Hero.fromLi(hero!));
}