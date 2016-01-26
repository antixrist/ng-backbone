/*
 @chalk
 @name ng-backbone
 @version 0.1.1
 @author [@adrianthemole](http://twitter.com/adrianthemole)
 @license MIT
 @dependencies
 - [AngualrJS](https://angularjs.org)
 - [UnderscoreJS](http://underscorejs.org) / [LoDash](http://lodash.com)
 - [BackboneJS](http://backbonejs.org)
 @description
 Backbone data model and collection for AngularJS

 [![Build Status](http://img.shields.io/travis/adrianlee44/ng-backbone.svg?style=flat)](https://travis-ci.org/adrianlee44/ng-backbone)
 */

(function(window, document, undefined) {
  'use strict';

  angular.module('ngBackbone', []).

  factory('Backbone', ['$http', function($http) {
    var methodMap, sync, ajax, isUndefined = _.isUndefined;

    methodMap = {
      create: 'POST',
      update: 'PUT',
      patch: 'PATCH',
      delete: 'DELETE',
      read: 'GET'
    };

    sync = function(method, model, options) {
      // Default options to empty object
      if (isUndefined(options)) {
        options = {};
      }

      var httpMethod = options.method || methodMap[method],
          params = {method: httpMethod};

      if (!options.url) {
        params.url = _.result(model, 'url');
      }

      if (isUndefined(options.data) && model && (httpMethod === 'POST' || httpMethod === 'PUT' || httpMethod === 'PATCH')) {
        params.data = JSON.stringify(options.attrs || model.toJSON(options));
      }

      // AngularJS $http doesn't convert data to querystring for GET method
      if (httpMethod === 'GET' && !isUndefined(options.data)) {
        params.params = options.data;
      }

      var xhr = ajax(_.extend(params, options)).
      success(function(data, status, headers, config) {
        options.xhr = {
          status: status,
          headers: headers,
          config: config
        };

        if (!isUndefined(options.success) && _.isFunction(options.success)) {
          options.success(data);
        }
      }).
      error(function(data, status, headers, config) {
        options.xhr = {
          status: status,
          headers: headers,
          config: config
        };

        if (!isUndefined(options.error) && _.isFunction(options.error)) {
          options.error(data);
        }
      });

      model.trigger('request', model, xhr, _.extend(params, options));

      return xhr;
    };

    ajax = function() {
      return $http.apply($http, arguments);
    };

    return _.extend(Backbone, {
      sync: sync,
      ajax: ajax
    });
  }]).

  factory('NgBackboneModel', ['$rootScope', 'Backbone', function($rootScope, Backbone) {
    var defineAttrProperty;

    defineAttrProperty = function (key) {
      var self = this;

      Object.defineProperty(this.$attr, key, {
        enumerable: true,
        configurable: true,
        get: function () {
          return self.$proxy[key];
        },
        set: function (val) {
          self.set(key, val);
        }
      });
    };

    return Backbone.Model.extend({
      constructor: function NgBackboneModel () {
        var self   = this,
            output = Backbone.Model.apply(this, arguments);

        this.$status = {
          deleting: false,
          loading:  false,
          saving:   false,
          syncing:  false
        };

        this.on('request', function (model, xhr, options) {
          this.$setStatus({
            deleting: (options.method === 'DELETE'),
            loading:  (options.method === 'GET'),
            saving:   (options.method === 'POST' || options.method === 'PUT'),
            syncing:  true
          });
        });

        this.on('sync error', this.$resetStatus);

        this.$attr  = {};
        this.$proxy = {};

        self.$setBinding(this.toJSON());

        this.on('change', function (model, options) {
          var attrs = self.changedAttributes();
          attrs && self.$setBinding(attrs, options);
        }, this);

        return output;
      },

      $resetStatus: function() {
        return this.$setStatus({
          deleting: false,
          loading:  false,
          saving:   false,
          syncing:  false
        });
      },

      $setBinding: function(key, val, options) {
        var self = this,
            attrs,
            unset,
            silent;

        if (_.isUndefined(key)) {
          return this;
        }

        if (_.isObject(key)) {
          attrs = key;
          options = val;
        } else {
          (attrs = {})[key] = val;
        }

        options = options || {};

        unset  = options.unset;
        silent = options.silent;

        _.each(attrs, function (val, key) {
          if (unset && !_.isUndefined(self.$proxy)) {
            delete self.$proxy[key];
          } else if (!unset) {
            if (_.isUndefined(self.$proxy[key])) {
              defineAttrProperty.call(self, key);
            }
          }
        });

        if (!silent) {
          self.$proxy = _.clone(self.attributes);
        }

        return this;
      },

      $setStatus: function(key, value, options) {
        var attr, attrs;

        if (_.isUndefined(key)) {
          return this;
        }

        if (_.isObject(key)) {
          attrs = key;
          options = value;
        } else {
          (attrs = {})[key] = value;
        }

        options = options || {};

        for (attr in this.$status) {
          if (attrs.hasOwnProperty(attr) && _.isBoolean(attrs[attr])) {
            this.$status[attr] = attrs[attr];
          }
        }
      },

      $removeBinding: function(attr, options) {
        return this.$setBinding(attr, void 0, _.extend({}, options, {unset: true}));
      }
    });
  }]).

  factory('NgBackboneCollection', ['Backbone', 'NgBackboneModel', function(Backbone, NgBackboneModel) {
    return Backbone.Collection.extend({
      model: NgBackboneModel,

      constructor: function NgBackboneCollection() {
        var self   = this,
            output = Backbone.Collection.apply(this, arguments);

        // Initialize status object
        this.$status = {
          deleting: false,
          loading:  false,
          saving:   false,
          syncing:  false
        };

        this.on('request', function(model, xhr, options) {
          this.$setStatus({
            deleting: (options.method === 'DELETE'),
            loading:  (options.method === 'GET'),
            saving:   (options.method === 'POST' || options.method === 'PUT'),
            syncing:  true
          });
        });

        this.on('sync error', this.$resetStatus);

        // For clearing status when destroy model on collection
        this.on('destroy', this.$resetStatus);

        Object.defineProperty(this, '$models', {
          enumerable: true,
          get: function() {
            return self.$proxy;
          }
        });

        self.$proxy = _.clone(self.models);

        this.on('change destroy remove add sort reset', function () {
          self.$proxy = _.clone(self.models);
        });

        return output;
      },

      $setStatus: function(key, value, options) {
        var attr, attrs, self = this;

        if (_.isUndefined(key)) {
          return this;
        }

        if (_.isObject(key)) {
          attrs = key;
          options = value;
        } else {
          (attrs = {})[key] = value;
        }

        options = options || {};

        for (attr in this.$status) {
          if (attrs.hasOwnProperty(attr) && _.isBoolean(attrs[attr])) {
            this.$status[attr] = attrs[attr];
          }
        }
      },

      $resetStatus: function() {
        return this.$setStatus({
          deleting: false,
          loading:  false,
          saving:   false,
          syncing:  false
        });
      }
    });
  }]);

})(window, document);
