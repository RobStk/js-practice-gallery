import { PixabayQuery } from "./pixabay-query.js";
require('fslightbox');

class PixabayGallery {
    constructor(containerElement, pixabayKey, params) {

        if (!(params instanceof Object)) {
            if (params) {
                return console.error("Incorrect argument in PixabayQuery constructor. Argument must be an Object");
            }
            params = {};
        }
        this.#pixabayParams = params;

        params.key = pixabayKey;
        this.#pixabayParams = params;
        if (!this.#pixabayParams.page) {
            this.#pixabayParams.page = 1;
        }
        if (!this.#pixabayParams.per_page) {
            this.#pixabayParams.per_page = 20;
        }
        this.#numberOfPages = 0;

        // DOM
        this.#containerElement = containerElement;
        this.#searchFormElement = containerElement.querySelector('.search');
        if (!this.#searchFormElement) {
            this.#searchFormElement = document.createElement("form");
            this.#searchFormElement.classList.add("search");
            this.#containerElement.appendChild(this.#searchFormElement);
        }
        this.#searchInputElement = this.#searchFormElement.querySelector(".search-input");
        if (!this.#searchInputElement) {
            this.#searchInputElement = document.createElement("input");
            this.#searchInputElement.setAttribute("type", "text");
            this.#searchInputElement.classList.add("search-input");
            this.#searchFormElement.appendChild(this.#searchInputElement);
        }
        this.#searchInputElement.setAttribute("placeholder", "Szukaj grafik na pixabay.com");
        this.#searchButtonElement = this.#searchFormElement.querySelector(".search-btn");
        if (!this.#searchButtonElement) {
            this.#searchButtonElement = document.createElement("input");
            this.#searchButtonElement.setAttribute("type", "submit");
            this.#searchButtonElement.classList.add("search-btn");
            this.#searchButtonElement.value = "Szukaj";
            this.#searchFormElement.appendChild(this.#searchButtonElement);
        }

        this.#galleryBottom = this.#containerElement.querySelector(".gallery-bottom");
        if (!this.#galleryBottom) {
            this.#galleryBottom = document.createElement("div");
            this.#galleryBottom.classList.add("gallery-bottom");
            this.#containerElement.appendChild(this.#galleryBottom);
        }
        this.#prevPageButton = document.createElement("button");
        this.#prevPageButton.classList.add("gallery-bottom-btn");
        this.#prevPageButton.setAttribute("id", "prevPageButton");
        this.#prevPageButton.textContent = "<";
        this.#prevPageButton.disabled = true;
        this.#nextPageButton = document.createElement("button");
        this.#nextPageButton.classList.add("gallery-bottom-btn");
        this.#nextPageButton.setAttribute("id", "nextPageButton");
        this.#nextPageButton.textContent = ">";
        this.#nextPageButton.disabled = true;
        this.#galleryBottom.appendChild(this.#prevPageButton);
        this.#galleryBottom.appendChild(this.#nextPageButton);

        this.#galleryListElement = this.#containerElement.querySelector(".gallery-list");
        if (!this.#galleryListElement) {
            this.#galleryListElement = document.createElement("div");
            this.#galleryListElement.classList.add("gallery-list");
            this.#containerElement.insertBefore(this.#galleryListElement, this.#galleryBottom);
        }

        this.lightbox = new FsLightbox();

        this.#addListeners();
    }

    #containerElement;
    #searchFormElement;
    #searchInputElement;
    #searchButtonElement;
    #galleryListElement;
    #galleryBottom;
    #nextPageButton;
    #prevPageButton;
    #pixabayParams;
    #picturesDataObj;
    #picturesArr;
    #numberOfPages

    #submitSearching(event) {
        event.preventDefault();
        this.#pixabayParams.page = 1;
        this.#createGalleryPage();
    }

    async #createGalleryPage() {
        this.#parseSearchingTerms();
        try {
            await this.#getPics();
            this.#createGalleryList();
        } catch (error) {
            console.error(error);
            this.#galleryListElement.innerHTML = "<div><h2>Ooops, coś poszło nie tak :(</h2></div>";
        }
    }

    #parseSearchingTerms() {
        const inputValue = this.#searchInputElement.value;
        const termsArr = inputValue.split(" ");
        let termsString = "";
        for (let index = 0; index < termsArr.length; index++) {
            termsString += termsArr[index];
            if (index != (termsArr.length - 1)) {
                termsString += "+";
            }
        }
        this.#pixabayParams.q = termsString;
    }

    async #getPics() {
        const pixabayQuery = new PixabayQuery(this.#pixabayParams);
        this.#picturesDataObj = await pixabayQuery.getData();
        this.#picturesArr = this.#picturesDataObj.hits;
        this.#numberOfPages = this.#picturesDataObj.totalHits / this.#pixabayParams.per_page;
        this.#numberOfPages = Math.floor(this.#numberOfPages);
        if (this.#picturesDataObj.totalHits % this.#pixabayParams.per_page > 0) {
            this.#numberOfPages++;
        }
    }

    #createGalleryList() {

        this.#galleryListElement.innerHTML = "";

        this.#picturesArr.forEach(picture => {
            const img = document.createElement("img");
            const src = picture.largeImageURL;
            const alt = picture.tags;
            img.setAttribute("src", src);
            img.classList.add("gallery-image");
            img.setAttribute("alt", alt);

            const a = document.createElement("a");
            const href = src;
            a.setAttribute("href", href);
            a.classList.add("gallery-element");
            a.classList.add("is-loading");
            a.appendChild(img);
            img.onload = () => a.classList.remove("is-loading");
            this.#galleryListElement.appendChild(a);
        });

        if (this.#picturesArr.length == 0) {
            this.#galleryListElement.innerHTML = "<h3>Brak wyników :(</h3>";
        }

        this.#prevPageButton.disabled = true;
        this.#nextPageButton.disabled = true;
        if (this.#pixabayParams.page > 1) {
            this.#prevPageButton.disabled = false;
        }
        if (this.#pixabayParams.page < this.#numberOfPages) {
            this.#nextPageButton.disabled = false;
        }
        this.#implementLightbox(this.#galleryListElement);
    }

    #goToPrevPage() {
        if (this.#pixabayParams.page > 1) {
            this.#pixabayParams.page--;
            this.#createGalleryPage();
        }
    }

    #goToNextPage() {
        if (this.#pixabayParams.page < this.#numberOfPages) {
            this.#pixabayParams.page++;
            this.#createGalleryPage();
        }
    }

    #addListeners() {
        this.#searchFormElement.addEventListener("submit", this.#submitSearching.bind(this));
        this.#prevPageButton.addEventListener("click", this.#goToPrevPage.bind(this));
        this.#nextPageButton.addEventListener("click", this.#goToNextPage.bind(this));
    }

    #implementLightbox(galeryContainerElement) {
        const pics = galeryContainerElement.querySelectorAll("a");
        pics.forEach(pic => {
            pic.setAttribute("data-fslightbox", "gallery");
        });
        refreshFsLightbox();
    }
}

export { PixabayGallery };