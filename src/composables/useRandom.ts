export function useRandom() {
    /**
     * Returns a random integer between min and max (inclusive)
     */
    function getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Returns a random float between min and max (excluding max)
     */
    function getRandomFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    /**
     * Returns a random alphanumeric string of a given length (default is 8)
     */
    function getRandomString(length = 8): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    return {
        getRandomInt,
        getRandomFloat,
        getRandomString
    };
}
