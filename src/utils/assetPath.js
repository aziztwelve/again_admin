export const assetPath = (path) => {
    const baseUrl = process.env.BASE_URL || '/admin/';
    // Если путь уже начинается с /, не добавляй baseUrl
    if (path.startsWith('/')) {
        return baseUrl + path.slice(1);
    }
    return baseUrl + path;
}