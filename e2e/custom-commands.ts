import { ChainablePromiseElement, ChainablePromiseArray } from 'webdriverio';

declare global {
    /**
     * Generate a selector for a test id.
     * @param testId The test id for the element.
     * @returns The selector based on the test id.
     */
    var byTestId: (testId: string) => string;

    namespace WebdriverIO {
        interface Browser {
            /**
             * Try to locate an element using a Test Id.
             * @param testId The Test Id of the element.
             */
            testId$: (testId: string) => ChainablePromiseElement<WebdriverIO.Element>;

            /**
             * Try to locate a collection of elements that use the same Test Id.
             * @param testId The Test Id of the elements.
             */
            testId$$: (testId: string) => ChainablePromiseArray<WebdriverIO.ElementArray>;
        }

        interface Element {
            /**
             * Use an existing element to locate another element using a Test Id.
             * @param testId The Test Id of the element.
             */
            testId$: (testId: string) => ChainablePromiseElement<WebdriverIO.Element>;

            /**
             * Use an existing element to locate a collection of elements using the same Test Id.
             * @param testId The Test Id of the elements.
             */
            testId$$: (testId: string) => ChainablePromiseArray<WebdriverIO.ElementArray>;
        }
    }
}

export function addCustomCommands(): void {
    browser.addCommand('testId$', function (testId: string) {
        return browser.$(getTestIdSelector(testId));
    });

    browser.addCommand('testId$', function (this: WebdriverIO.Element, testId: string) {
        return this.$(getTestIdSelector(testId));
    }, true);

    browser.addCommand('testId$$', function (testId: string) {
        return browser.$$(getTestIdSelector(testId));
    });

    browser.addCommand('testId$$', function (this: WebdriverIO.Element, testId: string) {
        return this.$$(getTestIdSelector(testId));
    }, true);
}

export function overwriteCommands(): void {
    const byTestId = function (originalFunc: Function, selector: string) {
        const isTestIdSelector = typeof selector === 'string' && selector.startsWith('testid=');

        if (isTestIdSelector) {
            const testId = selector.split('testid=')[1];
            const testIdSelector = `[data-testid="${testId}"]`;
            console.debug('Test Id Selector: ' + testIdSelector);
            return originalFunc(testIdSelector);
        }

        return originalFunc(selector);
    };

    browser.overwriteCommand('$', byTestId);
    browser.overwriteCommand('$', byTestId, true);
    browser.overwriteCommand('$$', byTestId);
    browser.overwriteCommand('$$', byTestId, true);
}

export function addGlobalCommands(): void {
    global.byTestId = function (testId: string): string {
        return getTestIdSelector(testId);
    };
}

function getTestIdSelector(testId: string): string {
    return `[data-testid="${testId}"]`;
}