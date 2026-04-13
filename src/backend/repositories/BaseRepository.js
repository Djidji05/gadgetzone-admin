export default class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async findAll(options = {}) {
        return await this.model.findAll(options);
    }

    async findAndCount(options = {}) {
        const queryOptions = { ...options };
        if (queryOptions.page) {
            const limit = parseInt(queryOptions.limit) || 10;
            const page = parseInt(queryOptions.page) || 1;
            queryOptions.offset = (page - 1) * limit;
            queryOptions.limit = limit;
            delete queryOptions.page;
        }
        return await this.model.findAndCountAll(queryOptions);
    }

    async findById(id, options = {}) {
        return await this.model.findByPk(id, options);
    }

    async findOne(options = {}) {
        return await this.model.findOne(options);
    }

    async create(data, options = {}) {
        return await this.model.create(data, options);
    }

    async update(id, data, options = {}) {
        const record = await this.findById(id);
        if (!record) return null;
        return await record.update(data, options);
    }

    async delete(id, options = {}) {
        const record = await this.findById(id);
        if (!record) return false;
        await record.destroy(options);
        return true;
    }

    async count(options = {}) {
        return await this.model.count(options);
    }
}
