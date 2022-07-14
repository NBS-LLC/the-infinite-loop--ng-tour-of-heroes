const expectedH1 = 'Tour of Heroes';
const expectedTitle = `${expectedH1}`;
const targetHero = { id: 15, name: 'Magneta' };
const targetHeroDashboardIndex = 2;
const nameSuffix = 'X';
const newHeroName = targetHero.name + nameSuffix;

class Hero {
    constructor(public id: number, public name: string) { }

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

function getPageElts() {
    const navElts = $$('app-root nav a');

    return {
        navElts,
        appDashboard: $('app-root app-dashboard'),
        appHeroes: $('app-root app-heroes'),
        topHeroes: $$('app-root app-dashboard > div a'),
        heroDetail: $('app-root app-hero-detail > div'),
    };
}

describe('Initial page', () => {
    before(() => browser.url(''));

    it(`has title '${expectedTitle}'`, async () => {
        expect(await browser.getTitle()).toEqual(expectedTitle);
    });

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

    it(`selects and routes to ${targetHero.name} details`, dashboardSelectTargetHero);

    it(`updates hero name (${newHeroName}) in details view`, updateHeroNameInDetailView);

    it(`cancels and shows ${targetHero.name} in Dashboard`, async () => {
        await (await $('button=go back')).click();

        await browser.waitUntil(async () => {
            return await getPageElts().topHeroes.length > 0;
        });

        const targetHeroElt = (await getPageElts().topHeroes)[targetHeroDashboardIndex];
        expect(await targetHeroElt.getText()).toEqual(targetHero.name);
    });

    it(`selects and routes to ${targetHero.name} details`, dashboardSelectTargetHero);

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

async function expectHeading(hLevel: number, expectedText: string): Promise<void> {
    const hTag = `h${hLevel}`;
    const hText = await $(hTag).getText();
    expect(hText).toEqual(expectedText);
}

async function dashboardSelectTargetHero() {
    const targetHeroElt = (await getPageElts().topHeroes)[targetHeroDashboardIndex];
    expect(await targetHeroElt.getText()).toEqual(targetHero.name);
    await targetHeroElt.click();

    const page = getPageElts();
    await expect(page.heroDetail).toBePresent();

    const hero = await Hero.fromDetail(await page.heroDetail);
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(targetHero.name.toUpperCase());
}

async function updateHeroNameInDetailView() {
    // Assumes that the current view is the hero details view.
    await addToHeroName(nameSuffix);

    const page = getPageElts();
    const hero = await Hero.fromDetail(await page.heroDetail);
    expect(hero.id).toEqual(targetHero.id);
    expect(hero.name).toEqual(newHeroName.toUpperCase());
}

async function addToHeroName(text: string): Promise<void> {
    const input = $('input');
    await input.addValue(text);
}