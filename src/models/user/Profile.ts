export class UserProfile {
    public id: number | null;
    public user_id: number | null;
    public first_name: string | null;
    public last_name: string | null;
    public middle_name: string | null;
    public phone: string | null;
    public address: string | null;
    public birthday: string | null;
    public image: string | null;
    public delivery_country_id: number | null;
    public delivery_city_id: number | null;
    public delivery_region: string | null;
    public delivery_street: string | null;
    public delivery_house: string | null;
    public delivery_apartment: string | null;
    public delivery_postal_code: string | null;

    constructor(data: Partial<UserProfile> = {}) {
        this.id = data.id ?? null;
        this.user_id = data.user_id ?? null;
        this.first_name = data.first_name ?? null;
        this.last_name = data.last_name ?? null;
        this.middle_name = data.middle_name ?? null;
        this.phone = data.phone ?? null;
        this.address = data.address ?? null;
        this.birthday = data.birthday ?? null;
        this.image = data.image ?? null;
        this.delivery_country_id = data.delivery_country_id ?? null;
        this.delivery_city_id = data.delivery_city_id ?? null;
        this.delivery_region = data.delivery_region ?? null;
        this.delivery_street = data.delivery_street ?? null;
        this.delivery_house = data.delivery_house ?? null;
        this.delivery_apartment = data.delivery_apartment ?? null;
        this.delivery_postal_code = data.delivery_postal_code ?? null;
    }

    /**
     * Создает экземпляр UserProfile из JSON-данных
     * @param json - Входные данные в формате JSON
     * @returns Новый экземпляр UserProfile
     */
    public static fromJSON(json: any): UserProfile {
        return new UserProfile({
            id: json.id ?? null,
            user_id: json.user_id ?? null,
            first_name: json.first_name ?? null,
            last_name: json.last_name ?? null,
            middle_name: json.middle_name ?? null,
            phone: json.phone ?? null,
            address: json.address ?? null,
            birthday: json.birthday ?? null,
            image: json.image ? `${process.env.VUE_APP_BASE_URL}/users/get-profile/image?path=${json.image}` : '',
            delivery_country_id: json.delivery_country_id ?? null,
            delivery_city_id: json.delivery_city_id ?? null,
            delivery_region: json.delivery_region ?? null,
            delivery_street: json.delivery_street ?? null,
            delivery_house: json.delivery_house ?? null,
            delivery_apartment: json.delivery_apartment ?? null,
            delivery_postal_code: json.delivery_postal_code ?? null,
        });
    }

    /**
     * Преобразует экземпляр UserProfile в JSON-объект
     * @returns Объект с данными профиля
     */
    public toJSON(): any {
        return {
            id: this.id,
            user_id: this.user_id,
            first_name: this.first_name,
            last_name: this.last_name,
            middle_name: this.middle_name,
            phone: this.phone,
            address: this.address,
            birthday: this.birthday,
            delivery_country_id: this.delivery_country_id,
            delivery_city_id: this.delivery_city_id,
            delivery_region: this.delivery_region,
            delivery_street: this.delivery_street,
            delivery_house: this.delivery_house,
            delivery_apartment: this.delivery_apartment,
            delivery_postal_code: this.delivery_postal_code,
        };
    }

    /**
     * Полное имя пользователя (last_name first_name middle_name)
     */
    get fullName(): string | null {
        const parts = [this.last_name, this.first_name, this.middle_name]
            .filter((v): v is string => !!v && typeof v === 'string');
        return parts.length ? parts.join(' ') : null;
    }


    /**
     * Проверяет, есть ли основные данные профиля
     */
    get hasProfileData(): boolean {
        return !!this.first_name || !!this.last_name || !!this.phone || !!this.address;
    }
}