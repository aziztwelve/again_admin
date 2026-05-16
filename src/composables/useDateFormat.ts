export function useDateFormat() {
    /**
     * Форматирует дату в российский формат
     * @param {string|Date} date - Дата в формате строки или объект Date
     * @param {boolean} [withTime=false] - Показывать время
     * @returns {string} Отформатированная дата в русском формате
     */
    const formatDateToRussian = (date: string | Date, withTime: boolean = false): string => {
        if (!date) return 'дата не указана';

        let dateObj: Date;

        if (typeof date === 'string') {
            // Проверяем формат DD.MM.YYYY HH:mm
            const regex = /^(\d{2})\.(\d{2})\.(\d{4})(?:[ T](\d{2}):(\d{2}))?$/;
            const match = date.match(regex);
            if (match) {
                const [, day, month, year, hour = '0', minute = '0'] = match;
                dateObj = new Date(
                    parseInt(year, 10),
                    parseInt(month, 10) - 1,
                    parseInt(day, 10),
                    parseInt(hour, 10),
                    parseInt(minute, 10)
                );
            } else {
                // Пробуем создать как ISO или обычную строку даты
                dateObj = new Date(date);
            }
        } else {
            dateObj = date;
        }

        if (isNaN(dateObj.getTime())) return 'неверная дата';

        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            ...(withTime && {
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        let formatted = dateObj.toLocaleDateString('ru-RU', options);

        // Если добавлено время, toLocaleDateString может возвращать "31 августа 2025 г., 12:34"
        // Для единообразия объединяем пробел перед "г." -> "г."
        formatted = formatted.replace(/\sг\./g, 'г.');

        // Сделать название месяца в нижнем регистре (если локаль вернула с заглавной буквы)
        formatted = formatted.replace(/(\s)([А-ЯЁ][а-яё]+)(\s|,|$)/, (_, p1, p2, p3) => {
            return p1 + p2.toLowerCase() + p3;
        });

        return formatted;
    }

    return {
        formatDateToRussian
    }
}
