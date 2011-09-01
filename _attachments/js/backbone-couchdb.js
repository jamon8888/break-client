(function() {
  /*
  (c) 2011 Jan Monschke
  v1.0
  backbone-couchdb.js is licensed under the MIT license.
  */  var con;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Backbone.couch_connector = con = {
    config: {
      db_name: "backbone_connect",
      ddoc_name: "backbone_example",
      view_name: "byCollection",
      global_changes: false,
      base_url: null
    },
    helpers: {
      extract_collection_name: function(model) {
        var _name, _splitted;
        if (model == null) {
          throw new Error("No model has been passed");
        }
        if (!(((model.collection != null) && (model.collection.url != null)) || (model.url != null))) {
          return "";
        }
        if (model.url != null) {
          _name = _.isFunction(model.url) ? model.url() : model.url;
        } else {
          _name = _.isFunction(model.collection.url) ? model.collection.url() : model.collection.url;
        }
        if (_name[0] === "/") {
          _name = _name.slice(1, _name.length);
        }
        _splitted = _name.split("/");
        _name = _splitted.length > 0 ? _splitted[0] : _name;
        _name = _name.replace("/", "");
        return _name;
      },
      make_db: function() {
        var db;
        db = $.couch.db(con.config.db_name);
        if (con.config.base_url != null) {
          db.uri = "" + con.config.base_url + "/" + con.config.db_name + "/";
        }
        return db;
      }
    },
    read: function(model, opts) {
      var query;
      if (model.models) {
        query = con.read_collection(model, opts);
        return query;
      } else {
        return con.read_model(model, opts);
      }
    },
    read_collection: function(coll, opts) {
      var endkey, group, group_level, include_docs, keys, limit, options, skip, startkey, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _view;
      _view = this.config.view_name;
      keys = [this.helpers.extract_collection_name(coll)];
      if (coll.db != null) {
        if (coll.db.changes || this.config.global_changes) {
          coll.listen_to_changes();
        }
        if (coll.db.view != null) {
          _view = coll.db.view;
          keys = (_ref = coll.db.keys) != null ? _ref : null;
          startkey = (_ref2 = coll.db.startkey) != null ? _ref2 : null;
          endkey = (_ref3 = coll.db.endkey) != null ? _ref3 : null;
          limit = (_ref4 = coll.db.limit) != null ? _ref4 : null;
          skip = (_ref5 = coll.db.skip) != null ? _ref5 : null;
          group = (_ref6 = coll.db.group) != null ? _ref6 : false;
          group_level = (_ref7 = coll.db.group_level) != null ? _ref7 : null;
          include_docs = (_ref8 = coll.db.include_docs) != null ? _ref8 : null;
        }
      }
      options = {
        success: __bind(function(data) {
          var doc, row, _i, _j, _len, _len2, _ref10, _ref9, _temp;
          _temp = [];
          if (include_docs) {
            _ref9 = data.rows;
            for (_i = 0, _len = _ref9.length; _i < _len; _i++) {
              row = _ref9[_i];
              _temp.push(row.doc);
            }
          } else {
            _ref10 = data.rows;
            for (_j = 0, _len2 = _ref10.length; _j < _len2; _j++) {
              doc = _ref10[_j];
              _temp.push(doc.value);
            }
          }
          return opts.success(_temp);
        }, this),
        error: function() {
          return opts.error();
        }
      };
      if (keys) {
        options.keys = keys;
      }
      if (startkey) {
        options.startkey = startkey;
      }
      if (endkey) {
        options.endkey = endkey;
      }
      if (limit) {
        options.limit = limit;
      }
      if (skip) {
        options.skip = skip;
      }
      if (group) {
        options.group = group;
      }
      if (group_level) {
        options.group_level = group_level;
      }
      if (include_docs) {
        options.include_docs = include_docs;
      }
      return this.helpers.make_db().view("" + this.config.ddoc_name + "/" + _view, options);
    },
    read_model: function(model, opts) {
      if (!model.id) {
        throw new Error("The model has no id property, so it can't get fetched from the database");
      }
      return this.helpers.make_db().openDoc(model.id, {
        success: function(doc) {
          return opts.success(doc);
        },
        error: function() {
          return opts.error();
        }
      });
    },
    create: function(model, opts) {
      var coll, vals;
      vals = model.toJSON();
      coll = this.helpers.extract_collection_name(model);
      if (coll.length > 0) {
        vals.collection = coll;
      }
      return this.helpers.make_db().saveDoc(vals, {
        success: function(doc) {
          return opts.success({
            _id: doc.id,
            _rev: doc.rev
          });
        },
        error: function() {
          return opts.error();
        }
      });
    },
    update: function(model, opts) {
      return this.create(model, opts);
    },
    del: function(model, opts) {
      return this.helpers.make_db().removeDoc(model.toJSON(), {
        success: function() {
          return opts.success();
        },
        error: function(nr, req, e) {
          if (e === "deleted") {
            return opts.success();
          } else {
            return opts.error();
          }
        }
      });
    }
  };
  Backbone.sync = function(method, model, opts) {
    switch (method) {
      case "read":
        return con.read(model, opts);
      case "create":
        return con.create(model, opts);
      case "update":
        return con.update(model, opts);
      case "delete":
        return con.del(model, opts);
    }
  };
  Backbone.Collection = (function() {
    __extends(Collection, Backbone.Collection);
    function Collection() {
      this._db_on_change = __bind(this._db_on_change, this);
      this._db_prepared_for_changes = __bind(this._db_prepared_for_changes, this);
      Collection.__super__.constructor.apply(this, arguments);
    }
    Collection.prototype.initialize = function() {
      if (!this._db_changes_enabled && ((this.db && this.db.changes) || con.config.global_changes)) {
        return this.listen_to_changes();
      }
    };
    Collection.prototype.listen_to_changes = function() {
      if (!this._db_changes_enabled) {
        this._db_changes_enabled = true;
        if (!this._db_inst) {
          this._db_inst = con.helpers.make_db();
        }
        return this._db_inst.info({
          "success": this._db_prepared_for_changes
        });
      }
    };
    Collection.prototype.stop_changes = function() {
      this._db_changes_enabled = false;
      if (this._db_changes_handler != null) {
        this._db_changes_handler.stop();
        return this._db_changes_handler = null;
      }
    };
    Collection.prototype._db_prepared_for_changes = function(data) {
      var opts;
      this._db_update_seq = data.update_seq || 0;
      opts = {
        include_docs: true,
        collection: con.helpers.extract_collection_name(this),
        filter: "" + con.config.ddoc_name + "/by_collection"
      };
      _.extend(opts, this.db);
      return _.defer(__bind(function() {
        this._db_changes_handler = this._db_inst.changes(this._db_update_seq, opts);
        return this._db_changes_handler.onChange(this._db_on_change);
      }, this));
    };
    Collection.prototype._db_on_change = function(changes) {
      var obj, _doc, _i, _len, _ref, _results;
      _ref = changes.results;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _doc = _ref[_i];
        obj = this.get(_doc.id);
        _results.push(obj != null ? _doc.deleted ? this.remove(obj) : obj.get("_rev") !== _doc.doc._rev ? obj.set(_doc.doc) : void 0 : !_doc.deleted ? this.add(_doc.doc) : void 0);
      }
      return _results;
    };
    return Collection;
  })();
  Backbone.Model = (function() {
    __extends(Model, Backbone.Model);
    function Model() {
      Model.__super__.constructor.apply(this, arguments);
    }
    Model.prototype.idAttribute = "_id";
    return Model;
  })();
}).call(this);
