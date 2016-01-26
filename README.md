
ng-backbone
===
  Backbone data model and collection for AngularJS  

  [![Build Status](http://img.shields.io/travis/antixrist/ng-backbone-proxy.svg?style=flat)](https://travis-ci.org/antixrist/ng-backbone-proxy)  

Version: `0.1.3`  

### Dependencies
  - [AngualrJS](https://angularjs.org)  
  - [UnderscoreJS](http://underscorejs.org) / [LoDash](http://lodash.com)  
  - [BackboneJS](http://backbonejs.org)  


Backbone factory
---

  To make Backbone work properly with AngularJS, ng-backbone overrides Backbone's sync and ajax methods.  


NgBackboneModel
---

  Base NgBackbone model extends Backbone.model by adding additional properties and functions, including `$attributes` and `$status`. When overriding NgBackboneModel `set` method but you would like to keep `$attributes`, you'll have to explicitly call NgBackboneModel set:  
  ```javascript  
  var Sample = NgBackboneModel.extend({  
    set: function(key, val, options) {  
      NgBackboneModel.prototype.set.apply(this, arguments);  
    }  
  });  
  ```  

  In rare cases when you want to override the constructor which allows you to replace the actual constructor function for your model, you should invoke NgBackboneModel constructor in the end.  
  ```javascript  
  var Sample = NgBackboneModel.extend({  
    constructor: function() {  
      this.text = 'Sample!';  
      NgBackboneModel.apply(this, arguments);  
    }  
  });  
  ```  

  The `$attr` property allows application to use AngularJS two-way binding to manipulate Backbone objects using Backbone `get` and `set`.  
  HTML:  
  ```html  
  <input type="text" ng-model="person.$attr.name">  
  ```  

  Javascript:  
  ```javascript  
  $scope.person = new Person({  
    name: 'John'  
  });  
  ```  

  If you are passed `{silent: true}` to options for edit model or collection then Angular do not know about it.
  You must triggered `change` event on model or collection manually and also call `$scope.$digest()` or `$scope.$apply()` for recalculate $digest and rerender template:
  ```javascript
  $scope.person = new Person({  
      name: 'John'  
  });
  $scope.person.set({name: 'Mike'}, {silent: true});
  $scope.person.set({age: 100500}, {silent: true});
  //*/
    ...another changes...
  //*/
  $scope.person.trigger('change'); // report about the model have been changes
  $scope.$digest(); // rerender angular's template.
  ```
  
  Also for collections:
  ```javascript
  $scope.persons = new Persons({
    model: Person  
  });
  $scope.persons.add([{  
    name: 'John'  
  }, {  
    name: 'Mike'  
  }], {
    silent: true
  });
  //*/
    ...another changes...
  //*/
  $scope.person.trigger('change'); // report about the collection have been changes
  $scope.$digest(); // rerender angular's template.
  ```

  The `$status` property is the hash containing model sync state. Since `$status` updates using Backbone event, passing `{silent: true}` will prevent `$status` from updating. `$status` contains four properties, including:  
  - `deleting`: Set to true when invoking `destroy` method on model (HTTP `DELETE` request)  
  - `loading`:  Set to true when fetching model data from server (HTTP `GET` request)  
  - `saving`:   Set to true when creating or updating model (HTTP `POST` or `PUT` request)  
  - `syncing`:  Set to true whenever a model has started a request to the server  

  HTML:  
  ```html  
  <span ng-if="user.$status.loading">Loading</span>  
  <label>{{user.name}}</label>  
  ```  

  Javascript:  
  ```javascript  
  $scope.user = new User({id: '123'});  
  $scope.user.fetch();  
  ```  


$resetStatus
---

  Reset all properties on `$status` including `deleting`, `loading`, `saving`, and `syncing` back to false  


$setStatus
---

  Update model status on `$status`  


### Parameters
**attributes**  
Type: `Object`  
Set one or multiple statuses  

**options**  
Type: `Object`  
Options  



NgBackboneCollection
---

  Base NgBackbone collection extends Backbone.collection by adding additonal properties and functions, such as `$models` and `$status`.  

  Similar to NgBackboneModel, in rare cases where you may want to override the constructor, you should invoke NgBackboneCollection in the end.  
  ```javascript  
  var SampleCollection = NgBackboneCollection.extend({  
    constructor: function(models, options) {  
      this.allSamples = false;  

      NgBackboneCollection.apply(this, arguments);  
    }  
  });  
  ```  

  The `$models` property also creates a two-way binding.
  If collection's model instance of `NgBackboneModel` then all models in this collection also have `$attr` property for two-way binding.
  HTML:  
  ```html  
  <ul>
    <li ng-repeat="user in users.$models">{{user.$attr.username}}<li>  
  </ul>  
  ```  

  Javascript:  
  ```  
  $scope.users = new Users();  
  $scope.users.fetch();  
  ```  

  The `$status` property is the hash containing collection and its models sync state. Since `$status` updates using Backbone event, passing `{silent: true}` will prevent `$status` from updating. `$status` contains four properties, including:  
  - `deleting`: Set to true when one of its models is getting destroyed (HTTP `DELETE` request)  
  - `loading`:  Set to true when fetching collection data from server (HTTP `GET` request)  
  - `saving`:   Set to true when creating or updating one of its models (HTTP `POST` or `PUT` request)  
  - `syncing`:  Set to true whenever a collection has started a request to the server  

  HTML:  
  ```html  
  <ul>  
    <li ng-if="users.$status.loading">Loading...</li>  
    <li ng-repeat="user in users.$models">{{user.$attr.username}}<li>  
  </ul>  
  ```  

  Javascript:  
  ```  
  $scope.users = new Users();  
  $scope.users.fetch();  
  ```  



$setStatus
---

  Update collection status  


Type: `function`  

### Parameters
**attributes**  
Type: `Object`  
Set on or multiple statuses  

**options**  
Type: `Object`  
Options  



$resetStatus
---

  Reset all statuses including `deleting`, `loading`, `saving`, and `syncing` back to false  

Type: `function`  

## Author
[@adrianthemole](http://twitter.com/adrianthemole)

## License
Code licensed under [The MIT License](https://github.com/adrianlee44/ng-backbone/blob/master/LICENSE.md).
