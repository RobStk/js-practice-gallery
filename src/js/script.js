import { PixabayGallery } from "./pixabay-gallery.js";

function main() {
    const pixabayparams = {
        per_page: 15
    }
    const pixabayKey = "26697532-21467332a697cc6e91bb1981e";
    const galleryContainer = document.querySelector('.gallery');
    const pixabayGallery = new PixabayGallery(galleryContainer, pixabayKey, pixabayparams);
}

main();