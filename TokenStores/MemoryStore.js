let Data = {};

class MemoryStore {
    set = async (key, data) => {
        Data[key] = data;
    }

    get = async (key) => {
        return Data[key];
    }

    delete = async (key) => {
        delete Data[key];
    }
}

module.exports = MemoryStore;
