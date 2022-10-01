import { ChainablePromiseElement, ChainablePromiseArray } from 'webdriverio';

class Hero {
    static readonly TEST_TARGET: Hero = { id: 15, name: 'Magneta' };

    constructor(public id: number, public name: string) { }

    // Hero from hero list <li> element.
    static async fromLi(li: WebdriverIO.Element): Promise<Hero> {
        const stringsFromA = await li.$$('a').map(async (e) => e.getText());
        const strings = stringsFromA[0].split(' ');
        return { id: +strings[0], name: strings[1] };
    }

    // Hero id and name from the given detail element.
    static async fromDetail(detail: WebdriverIO.Element): Promise<Hero> {
        // Get hero id from the first <div>
        const id = await (await detail.$$('div'))[0].getText();
        // Get name from the h2
        const name = await detail.$('h2').getText();
        return {
            id: +id.slice(id.indexOf(' ') + 1),
            name: name.substring(0, name.lastIndexOf(' '))
        };
    }
}

const targetHeroDashboardIndex = 2;
const nameSuffix = 'X';
const newHeroName = Hero.TEST_TARGET.name + nameSuffix;

function getPageElts() {
    const navElts = $$('app-root nav a');

    return {
        navElts,

        appDashboard: $('app-root app-dashboard'),
        topHeroes: $$('app-root app-dashboard > div a'),

        appHeroesHref: navElts[1],
        appHeroes: $('app-root app-heroes'),
        allHeroes: $$('app-root app-heroes li'),

        heroDetail: $('app-root app-hero-detail > div'),

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
        const viewNames = await getPageElts().navElts.map(el => el!.getText());
        expect(viewNames).toEqual(expectedViewNames);
    });

    it('has dashboard as the active view', async () => {
        const page = getPageElts();
        await expect(page.appDashboard).toBePresent();
    });
});

describe('Dashboard tests', () => {
    before(() => browser.url(''));

    it('has top heroes', async () => {
        const page = getPageElts();
        await expect(page.topHeroes).toBeElementsArrayOfSize(4);
    });

    it(`selects and routes to ${Hero.TEST_TARGET.name} details`, dashboardSelectTargetHero);

    it(`updates hero name (${newHeroName}) in details view`, updateHeroNameInDetailView);

    it(`cancels and shows ${Hero.TEST_TARGET.name} in Dashboard`, async () => {
        await (await $('button=go back')).click();

        await browser.waitUntil(async () => {
            return await getPageElts().topHeroes.length > 0;
        });

        const targetHeroElt = (await getPageElts().topHeroes)[targetHeroDashboardIndex];
        expect(await targetHeroElt.getText()).toEqual(Hero.TEST_TARGET.name);
    });

    it(`selects and routes to ${Hero.TEST_TARGET.name} details`, dashboardSelectTargetHero);

    it(`updates hero name (${newHeroName}) in details view`, updateHeroNameInDetailView);

    it(`saves and shows ${newHeroName} in Dashboard`, async () => {
        await (await $('button=save')).click();

        await browser.waitUntil(async () => {
            return await getPageElts().topHeroes.length > 0;
        });

        const targetHeroElt = (await getPageElts().topHeroes)[targetHeroDashboardIndex];
        expect(await targetHeroElt.getText()).toEqual(newHeroName);
    });
});

describe('Heroes tests', () => {
    before(() => browser.url(''));

    it('can switch to Heroes view', async () => {
        await getPageElts().appHeroesHref.click();
        const page = getPageElts();
        await expect(page.appHeroes).toBePresent();
        await expect(page.allHeroes).toBeElementsArrayOfSize(9);
    });

    it('can route to hero details', async () => {
        await getHeroLiEltById(Hero.TEST_TARGET.id).click();

        const page = getPageElts();
        await expect(page.heroDetail).toBePresent();
        const hero = await Hero.fromDetail(await page.heroDetail);
        expect(hero.id).toEqual(Hero.TEST_TARGET.id);
        expect(hero.name).toEqual(Hero.TEST_TARGET.name.toUpperCase());
    });

    it(`updates hero name (${newHeroName}) in details view`, updateHeroNameInDetailView);

    it(`shows ${newHeroName} in Heroes list`, async () => {
        await $('button=save').click();
        const expectedText = `${Hero.TEST_TARGET.id} ${newHeroName}`;
        expect(await getHeroAEltById(Hero.TEST_TARGET.id).getText()).toEqual(expectedText);
    });

    it(`deletes ${newHeroName} from Heroes list`, async () => {
        const heroesBefore = await toHeroArray(getPageElts().allHeroes);
        const li = getHeroLiEltById(Hero.TEST_TARGET.id);
        await li.$('button=x').click();

        const page = getPageElts();
        await expect(page.appHeroes).toBePresent();
        expect(await page.allHeroes).toBeElementsArrayOfSize(8);
        const heroesAfter = await toHeroArray(page.allHeroes);
        // console.log(await Hero.fromLi(page.allHeroes[0]));
        const expectedHeroes = heroesBefore.filter(h => h.name !== newHeroName);
        expect(heroesAfter).toEqual(expectedHeroes);
        // expect(page.selectedHeroSubview.isPresent()).toBeFalsy();
    });

    it(`adds back ${Hero.TEST_TARGET.name}`, async () => {
        const addedHeroName = 'Magneta';
        const heroesBefore = await toHeroArray(getPageElts().allHeroes);
        const numHeroes = heroesBefore.length;

        await $('input').setValue(addedHeroName);
        await $('button=Add hero').click();

        let heroesAfter;
        await browser.waitUntil(async () => {
            const page = getPageElts();
            heroesAfter = await toHeroArray(page.allHeroes);
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

        const page = getPageElts();
        await expect(page.heroDetail).toBePresent();
        const hero2 = await Hero.fromDetail(await page.heroDetail);
        expect(hero2.id).toEqual(Hero.TEST_TARGET.id);
        expect(hero2.name).toEqual(Hero.TEST_TARGET.name.toUpperCase());
    });
});

async function expectHeading(hLevel: number, expectedText: string): Promise<void> {
    const hTag = `h${hLevel}`;
    const hText = await $(hTag).getText();
    expect(hText).toEqual(expectedText);
}

async function dashboardSelectTargetHero() {
    const targetHeroElt = (await getPageElts().topHeroes)[targetHeroDashboardIndex];
    expect(await targetHeroElt.getText()).toEqual(Hero.TEST_TARGET.name);
    await targetHeroElt.click();

    const page = getPageElts();
    await expect(page.heroDetail).toBePresent();

    const hero = await Hero.fromDetail(await page.heroDetail);
    expect(hero.id).toEqual(Hero.TEST_TARGET.id);
    expect(hero.name).toEqual(Hero.TEST_TARGET.name.toUpperCase());
}

async function updateHeroNameInDetailView() {
    // Assumes that the current view is the hero details view.
    await addToHeroName(nameSuffix);

    const page = getPageElts();
    const hero = await Hero.fromDetail(await page.heroDetail);
    expect(hero.id).toEqual(Hero.TEST_TARGET.id);
    expect(hero.name).toEqual(newHeroName.toUpperCase());
}

async function addToHeroName(text: string): Promise<void> {
    const input = $('input');
    await input.addValue(text);
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