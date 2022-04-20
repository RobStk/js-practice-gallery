class PixabayQuery {
    constructor(params) {
        this.#url = "https://pixabay.com/api/";
        if (!(params instanceof Object)) {
            if (params) {
                return console.error("Incorrect argument in PixabayQuery constructor. Argument must be an Object");
            }
            params = {};
        }
        if (!params.key) {
            return console.error("No pixabay key");
        }
        this.#params = params;
    }
    #url;
    #params;

    async getData() {
        let params = "";
        let prefix = "?";
        for (const [key, val] of Object.entries(this.#params)) {
            params += prefix + key + "=" + val;
            prefix = "&";
        }
        const query = this.#url + params;
        //console.log(query);
        try {
            const data = await fetch(query);
            if (!data.ok) {
                throw new Error(`Http error ${data.status}`);
            }
            const jsonData = await data.json();
            //console.log(jsonData);
            return jsonData;
        } catch (error) {
            console.log(error);
        }
    }
}

export { PixabayQuery };