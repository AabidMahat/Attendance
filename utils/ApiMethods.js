class apiFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        const queryObj = { ...this.queryString };
        const excludeData = ['page', 'sort', 'limit', 'field'];

        excludeData.forEach((el) => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);

        queryStr = queryStr.replace(
            /\b(gre|gt|lte|le)\b/g,
            (match) => `$${match}`
        );
        const parseQuery = JSON.parse(queryStr);
        this.query = this.query.find(parseQuery);

        return this;
    }
}
module.exports = apiFeatures;
