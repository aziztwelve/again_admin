export class ImageModel {

    id: number | null;
    file: File | null;
    path: string | null;
    position: number;


    constructor({id = null, file = null, path = '', position = 0}: {
        id?: number | null,
        file?: File | null,
        path?: string,
        position?: number
    } = {}) {
        this.id = id;
        this.file = file;
        this.path = path || '';
        this.position = position;
    }

    static fromJSON(json: { id: number, path: string, position?: number, file: File }): ImageModel {
        return new ImageModel({
            id: json.id,
            path: json.path,
            position: json.position || 0,
            file: json.file
        });
    }

    toJSON() {
        return {
            id: this.id,
            path: this.path,
            position: this.position
        };
    }

    toFormData() {
        return {
            file: this.file,
            name: this.path
        };
    }


    imageURL(imageSize: { value: string }): string {
        if (this.file) {
            return URL.createObjectURL(this.file);
        }
        return `${process.env.VUE_APP_BASE_URL}/image/products/${imageSize.value ? imageSize.value + '_' : ''}${this.path}`;
    }
}
