export function usePriceFormatter() {
    const formatPrice = (
        price: string | number,
        currency: string = '₽'
    ): string => {
        if (price === null || price === undefined || price === '') {
            return `0${currency}`;
        }

        const num = Number(price);
        if (isNaN(num)) {
            return `0${currency}`;
        }

        return `${num.toLocaleString('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })}${currency}`;
    };

    return { formatPrice };
}
