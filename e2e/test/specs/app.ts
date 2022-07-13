const expectedH1 = 'Tour of Heroes';
const expectedTitle = `${expectedH1}`;

function getPageElts() {
    const navElts = $$('app-root nav a');

    return {
        navElts,
        appDashboard: $('app-root app-dashboard'),
        appHeroes: $('app-root app-heroes'),
    };
}

describe('Initial page', () => {
    beforeEach(() => browser.url(''));

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
        await expect(await page.appDashboard).toBePresent();
    });
});

async function expectHeading(hLevel: number, expectedText: string): Promise<void> {
    const hTag = `h${hLevel}`;
    const hText = await $(hTag).getText();
    expect(hText).toEqual(expectedText);
}