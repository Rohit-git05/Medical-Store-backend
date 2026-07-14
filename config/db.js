const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Global mock database data path
const dbPath = path.join(__dirname, '../db.json');

// Helper to load/save JSON database
const loadDB = () => {
  if (!fs.existsSync(dbPath)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (err) {
    return {};
  }
};

const saveDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
};

// Check if we should force mock database mode
// We check if USE_MOCK_DB env var is set, or if MONGODB_URI is not configured
const shouldMock = process.env.USE_MOCK_DB === 'true' || !process.env.MONGODB_URI;

if (shouldMock) {
  activateMockDB();
}

async function connectDB() {
  if (shouldMock) {
    console.log('Using local mock memory database. Connection active.');
    return;
  }

  try {
    const connStr = process.env.MONGODB_URI;
    await mongoose.connect(connStr);
    console.log(`Connected to MongoDB Atlas: ${mongoose.connection.host}`);
  } catch (error) {
    console.warn('MongoDB Atlas connection failed. Activating local mock DB fallback...');
    activateMockDB();
  }
}

function activateMockDB() {
  console.log('--- Mock Mongoose DB Activated ---');
  
  // Initialize mock collections
  const mockDB = loadDB();
  
  // Patch mongoose methods
  mongoose.connect = () => Promise.resolve({ connection: { host: 'MockInMemoryDB' } });
  mongoose.disconnect = () => Promise.resolve();
  
  // Dummy ObjectId generator
  mongoose.Types = {
    ObjectId: function(id) {
      this.id = id || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      this.toString = () => this.id;
      return this;
    }
  };
  
  const models = {};
  const preSaveHooks = {};
  const methods = {};
  const statics = {};

  // Schema builder mock
  mongoose.Schema = function(definition) {
    this.definition = definition;
    this.pre = (event, fn) => {
      if (!this._preHooks) this._preHooks = {};
      this._preHooks[event] = fn;
    };
    this.post = () => {};
    this.methods = {};
    this.statics = {};
  };
  
  mongoose.Schema.Types = {
    ObjectId: 'ObjectId'
  };

  // Mock Query class to support populations, sorts, limits, skips
  class MockQuery {
    constructor(results, modelName) {
      this.results = results;
      this.modelName = modelName;
      this._populates = [];
      this._sort = null;
      this._limit = null;
      this._skip = null;
    }

    populate(path, select) {
      this._populates.push({ path, select });
      return this;
    }

    sort(sortObj) {
      this._sort = sortObj;
      return this;
    }

    limit(num) {
      this._limit = num;
      return this;
    }

    skip(num) {
      this._skip = num;
      return this;
    }

    select(fields) {
      return this;
    }

    // Helper to run query logic
    async exec() {
      let data = [...this.results];

      // Perform populate
      const db = loadDB();
      for (const pop of this._populates) {
        const targetModelName = pop.path.charAt(0).toUpperCase() + pop.path.slice(1);
        const refCollection = db[targetModelName] || [];

        data = data.map(item => {
          const refId = item[pop.path];
          if (refId) {
            const refObj = refCollection.find(r => r._id === refId.toString());
            if (refObj) {
              const populated = { _id: refObj._id };
              if (pop.select) {
                pop.select.split(' ').forEach(f => {
                  if (f) populated[f] = refObj[f];
                });
              } else {
                Object.assign(populated, refObj);
              }
              return { ...item, [pop.path]: populated };
            }
          }
          return item;
        });
      }

      // Perform Sorting
      if (this._sort) {
        const key = Object.keys(this._sort)[0];
        const dir = this._sort[key];
        data.sort((a, b) => {
          if (a[key] < b[key]) return dir === 1 ? -1 : 1;
          if (a[key] > b[key]) return dir === 1 ? 1 : -1;
          return 0;
        });
      }

      // Perform Skip/Limit
      if (this._skip !== null) {
        data = data.slice(this._skip);
      }
      if (this._limit !== null) {
        data = data.slice(0, this._limit);
      }

      return data;
    }

    then(onResolve, onReject) {
      return this.exec().then(onResolve, onReject);
    }
  }

  // Model creation patch
  mongoose.model = function(name, schema) {
    if (models[name]) return models[name];

    // Store pre-save hooks
    if (schema && schema._preHooks) {
      preSaveHooks[name] = schema._preHooks;
    }
    if (schema && schema.methods) {
      methods[name] = schema.methods;
    }
    if (schema && schema.statics) {
      statics[name] = schema.statics;
    }

    // Dynamic model implementation class
    class MockModel {
      constructor(data) {
        Object.assign(this, data);
        if (!this._id) {
          this._id = new mongoose.Types.ObjectId().id;
        }
        
        // Bind methods
        if (methods[name]) {
          for (const mKey in methods[name]) {
            this[mKey] = methods[name][mKey].bind(this);
          }
        }
      }

      isModified(path) {
        return true;
      }

      static get collectionName() {
        return name;
      }

      // Static queries
      static find(filter = {}) {
        const db = loadDB();
        let items = db[name] || [];

        // Apply filters
        if (filter && Object.keys(filter).length > 0) {
          items = items.filter(item => {
            for (const key in filter) {
              const val = filter[key];

              // Handle $or query
              if (key === '$or') {
                return val.some(subFilter => {
                  return Object.keys(subFilter).every(subKey => {
                    const subVal = subFilter[subKey];
                    if (subVal && subVal.$regex) {
                      const regex = new RegExp(subVal.$regex, subVal.$options || '');
                      return regex.test(item[subKey] || '');
                    }
                    return item[subKey] === subVal;
                  });
                });
              }

              // Handle regex
              if (val && val.$regex) {
                const regex = new RegExp(val.$regex, val.$options || '');
                if (!regex.test(item[key] || '')) return false;
                continue;
              }

              // Handle comparison $lte, $gte
              if (val && typeof val === 'object') {
                if (val.$gte !== undefined && item[key] < val.$gte) return false;
                if (val.$lte !== undefined && item[key] > val.$lte) return false;
                if (val.$gt !== undefined && item[key] <= val.$gt) return false;
                if (val.$lt !== undefined && item[key] >= val.$lt) return false;
                continue;
              }

              // Direct match
              if (item[key] !== val) return false;
            }
            return true;
          });
        }

        return new MockQuery(items, name);
      }

      static findOne(filter = {}) {
        const query = MockModel.find(filter);
        query.execOriginal = query.exec;
        query.exec = async () => {
          const arr = await query.execOriginal();
          return arr.length > 0 ? new MockModel(arr[0]) : null;
        };
        return query;
      }

      static findById(id) {
        return MockModel.findOne({ _id: id });
      }

      static async countDocuments(filter = {}) {
        const items = await MockModel.find(filter).exec();
        return items.length;
      }

      static async create(data) {
        const db = loadDB();
        if (!db[name]) db[name] = [];

        const createOne = async (obj) => {
          const inst = new MockModel(obj);
          
          // Run pre-save hooks (like bcrypt password hashing)
          if (preSaveHooks[name] && preSaveHooks[name]['save']) {
            const hook = preSaveHooks[name]['save'];
            await new Promise((resolve, reject) => {
              let resolved = false;
              const next = (err) => {
                if (resolved) return;
                resolved = true;
                if (err) reject(err);
                else resolve();
              };
              const res = hook.call(inst, next);
              if (res && typeof res.then === 'function') {
                res.then(() => next()).catch(reject);
              }
            });
          }

          db[name].push(JSON.parse(JSON.stringify(inst)));
          return inst;
        };

        let result;
        if (Array.isArray(data)) {
          result = [];
          for (const item of data) {
            result.push(await createOne(item));
          }
        } else {
          result = await createOne(data);
        }

        saveDB(db);
        return result;
      }

      static async findByIdAndUpdate(id, update, options = {}) {
        const db = loadDB();
        const collection = db[name] || [];
        const idx = collection.findIndex(item => item._id === id);
        
        if (idx === -1) return null;

        const updatedObj = { ...collection[idx], ...update };
        collection[idx] = updatedObj;
        
        db[name] = collection;
        saveDB(db);
        return new MockModel(updatedObj);
      }

      static async updateMany(filter = {}, update = {}) {
        const items = await MockModel.find(filter).exec();
        const db = loadDB();
        const collection = db[name] || [];

        for (const item of items) {
          const idx = collection.findIndex(c => c._id === item._id);
          if (idx > -1) {
            collection[idx] = { ...collection[idx], ...update };
          }
        }

        db[name] = collection;
        saveDB(db);
        return { modifiedCount: items.length };
      }

      static async deleteMany(filter = {}) {
        const items = await MockModel.find(filter).exec();
        const db = loadDB();
        let collection = db[name] || [];

        const idsToRemove = items.map(i => i._id);
        collection = collection.filter(c => !idsToRemove.includes(c._id));

        db[name] = collection;
        saveDB(db);
        return { deletedCount: items.length };
      }

      // Instance save method
      async save() {
        const db = loadDB();
        if (!db[name]) db[name] = [];

        // Run pre-save hooks (like password hashing)
        if (preSaveHooks[name] && preSaveHooks[name]['save']) {
          const hook = preSaveHooks[name]['save'];
          await new Promise((resolve, reject) => {
            let resolved = false;
            const next = (err) => {
              if (resolved) return;
              resolved = true;
              if (err) reject(err);
              else resolve();
            };
            const res = hook.call(this, next);
            if (res && typeof res.then === 'function') {
              res.then(() => next()).catch(reject);
            }
          });
        }

        const collection = db[name];
        const idx = collection.findIndex(item => item._id === this._id);

        const cleanData = JSON.parse(JSON.stringify(this));

        if (idx > -1) {
          collection[idx] = cleanData;
        } else {
          collection.push(cleanData);
        }

        db[name] = collection;
        saveDB(db);
        return this;
      }

      // Instance delete method
      async deleteOne() {
        const db = loadDB();
        if (!db[name]) return;

        db[name] = db[name].filter(item => item._id !== this._id);
        saveDB(db);
      }
    }

    // Bind statics
    if (statics[name]) {
      for (const sKey in statics[name]) {
        MockModel[sKey] = statics[name][sKey].bind(MockModel);
      }
    }

    models[name] = MockModel;
    return MockModel;
  };
}

module.exports = connectDB;
