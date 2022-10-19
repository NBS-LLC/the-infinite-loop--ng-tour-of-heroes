export { }

declare global {
    /**
     * Creates an element selector based on a test id.
     * @param testId The test id.
     * @param options (Optional) Allows for further configuration of the selector.
     * @param options.partial True if a partial match is allowed.
     * @returns The element selector as a string.
     */
    const byTestId: (testId: string, options?: { partial: boolean }) => string;
}