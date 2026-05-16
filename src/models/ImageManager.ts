import type {ImageModel} from "@/models/ImageModel";

export class ImageManager {
  private images: ImageModel[] = [];
  private baseURL: string = '/product/image';

  constructor(initialImages: ImageModel[] = []) {
    this.images = [...initialImages];
    this.normalizePositions();
  }

  // add new image
  addImage(image: ImageModel): void {
    image.position = this.images.length > 0
      ? Math.max(...this.images.map(img => img.position)) + 1
      : 0;
    this.images.push(image);
  }

  // Remove image by ID
  removeImage(id: number): void {
    this.images = this.images.filter(img => img.id !== id);
    this.normalizePositions();
  }

  // Update image position
  updateImagePosition(id: number, newPosition: number): void {
    if (newPosition < 0 || newPosition >= this.images.length) return;

    const currentIndex = this.images.findIndex(img => img.id === id);
    if (currentIndex === -1) return;

    const [movedImage] = this.images.splice(currentIndex, 1);
    this.images.splice(newPosition, 0, movedImage);
    this.normalizePositions();
  }

  // Move image up
  moveUp(id: number): void {
    const index = this.images.findIndex(img => img.id === id);
    if (index > 0) {
      this.updateImagePosition(id, index - 1);
    }
  }

  // Move image down
  moveDown(id: number): void {
    const index = this.images.findIndex(img => img.id === id);
    if (index < this.images.length - 1) {
      this.updateImagePosition(id, index + 1);
    }
  }

  // Get all images sorted by position
  getAllImages(): ImageModel[] {
    return [...this.images].sort((a, b) => a.position - b.position);
  }

  // Normalize positions to be sequential (0, 1, 2, ...)
  normalizePositions(): void {
    this.images.forEach((img, index) => {
      img.position = index;
    });
  }


  setImages(newImages: ImageModel[]): void {
    this.images = [...newImages];
    this.normalizePositions();
  }


  // Get image by ID
  getImageById(id: number): ImageModel | undefined {
    return this.images.find(img => img.id === id);
  }

  // Replace image keeping the same position
  replaceImage(id: number, newImage: ImageModel): void {
    const index = this.images.findIndex(img => img.id === id);
    if (index !== -1) {
      newImage.position = this.images[index].position;
      this.images[index] = newImage;
    }
  }

  // Clear all images
  clear(): void {
    this.images = [];
  }
}
