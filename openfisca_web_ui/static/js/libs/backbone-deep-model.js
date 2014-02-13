/*jshint expr:true eqnull:true */
/**
 *
 * Backbone.DeepModel v0.10.4
 *
 * Copyright (c) 2013 Charles Davison, Pow Media Ltd
 *
 * https://github.com/powmedia/backbone-deep-model
 * Licensed under the MIT License
 */

(function(){var e,t,n,r,i,s,o=[].slice;n=function(e){var t,r;return!_.isObject(e)||_.isFunction(e)?e:e instanceof Backbone.Collection||e instanceof Backbone.Model?e:_.isDate(e)?new Date(e.getTime()):_.isRegExp(e)?new RegExp(e.source,e.toString().replace(/.*\//,"")):(r=_.isArray(e||_.isArguments(e)),t=function(e,t,i){return r?e.push(n(t)):e[i]=n(t),e},_.reduce(e,t,r?[]:{}))},s=function(e){return e==null?!1:(e.prototype==={}.prototype||e.prototype===Object.prototype)&&_.isObject(e)&&!_.isArray(e)&&!_.isFunction(e)&&!_.isDate(e)&&!_.isRegExp(e)&&!_.isArguments(e)},t=function(e){return _.filter(_.keys(e),function(t){return s(e[t])})},e=function(e){return _.filter(_.keys(e),function(t){return _.isArray(e[t])})},i=function(n,r,s){var o,u,a,f,l,c,h,p,d,v;s==null&&(s=20);if(s<=0)return console.warn("_.deepExtend(): Maximum depth of recursion hit."),_.extend(n,r);c=_.intersection(t(n),t(r)),u=function(e){return r[e]=i(n[e],r[e],s-1)};for(h=0,d=c.length;h<d;h++)l=c[h],u(l);f=_.intersection(e(n),e(r)),o=function(e){return r[e]=_.union(n[e],r[e])};for(p=0,v=f.length;p<v;p++)a=f[p],o(a);return _.extend(n,r)},r=function(){var e,t,r,s;r=2<=arguments.length?o.call(arguments,0,s=arguments.length-1):(s=0,[]),t=arguments[s++],_.isNumber(t)||(r.push(t),t=20);if(r.length<=1)return r[0];if(t<=0)return _.extend.apply(this,r);e=r.shift();while(r.length>0)e=i(e,n(r.shift()),t);return e},_.mixin({deepClone:n,isBasicObject:s,basicObjects:t,arrays:e,deepExtend:r})}).call(this),function(e){typeof define=="function"&&define.amd?define(["underscore","backbone"],e):e(_,Backbone)}(function(e,t){function n(t){var r={},i=o.keyPathSeparator;for(var s in t){var u=t[s];if(u&&u.constructor===Object&&!e.isEmpty(u)){var a=n(u);for(var f in a){var l=a[f];r[s+i+f]=l}}else r[s]=u}return r}function r(t,n,r){var i=o.keyPathSeparator,s=n.split(i),u=t;r||r===!1;for(var a=0,f=s.length;a<f;a++){if(r&&!e.has(u,s[a]))return!1;u=u[s[a]],u==null&&a<f-1&&(u={});if(typeof u=="undefined")return r?!0:u}return r?!0:u}function i(t,n,r,i){i=i||{};var s=o.keyPathSeparator,u=n.split(s),a=t;for(var f=0,l=u.length;f<l&&a!==undefined;f++){var c=u[f];if(f===l-1)i.unset?delete a[c]:a[c]=r;else{if(typeof a[c]=="undefined"||!e.isObject(a[c]))a[c]={};a=a[c]}}}function s(e,t){i(e,t,null,{unset:!0})}var o=t.Model.extend({constructor:function(t,n){var r,i=t||{};this.cid=e.uniqueId("c"),this.attributes={},n&&n.collection&&(this.collection=n.collection),n&&n.parse&&(i=this.parse(i,n)||{});if(r=e.result(this,"defaults"))i=e.deepExtend({},r,i);this.set(i,n),this.changed={},this.initialize.apply(this,arguments)},toJSON:function(t){return e.deepClone(this.attributes)},get:function(e){return r(this.attributes,e)},set:function(t,u,a){var f,l,c,h,p,d,v,m;if(t==null)return this;typeof t=="object"?(l=t,a=u||{}):(l={})[t]=u,a||(a={});if(!this._validate(l,a))return!1;c=a.unset,p=a.silent,h=[],d=this._changing,this._changing=!0,d||(this._previousAttributes=e.deepClone(this.attributes),this.changed={}),m=this.attributes,v=this._previousAttributes,this.idAttribute in l&&(this.id=l[this.idAttribute]),l=n(l);for(f in l)u=l[f],e.isEqual(r(m,f),u)||h.push(f),e.isEqual(r(v,f),u)?s(this.changed,f):i(this.changed,f,u),c?s(m,f):i(m,f,u);if(!p){h.length&&(this._pending=!0);var g=o.keyPathSeparator;for(var y=0,b=h.length;y<b;y++){var t=h[y];this.trigger("change:"+t,this,r(m,t),a);var w=t.split(g);for(var E=w.length-1;E>0;E--){var S=e.first(w,E).join(g),x=S+g+"*";this.trigger("change:"+x,this,r(m,S),a)}}}if(d)return this;if(!p)while(this._pending)this._pending=!1,this.trigger("change",this,a);return this._pending=!1,this._changing=!1,this},clear:function(t){var r={},i=n(this.attributes);for(var s in i)r[s]=void 0;return this.set(r,e.extend({},t,{unset:!0}))},hasChanged:function(t){return t==null?!e.isEmpty(this.changed):r(this.changed,t)!==undefined},changedAttributes:function(t){if(!t)return this.hasChanged()?n(this.changed):!1;var r=this._changing?this._previousAttributes:this.attributes;t=n(t),r=n(r);var i,s=!1;for(var o in t){if(e.isEqual(r[o],i=t[o]))continue;(s||(s={}))[o]=i}return s},previous:function(e){return e==null||!this._previousAttributes?null:r(this._previousAttributes,e)},previousAttributes:function(){return e.deepClone(this._previousAttributes)}});return o.keyPathSeparator=".",t.DeepModel=o,typeof module!="undefined"&&(module.exports=o),t})

/*jshint expr:true eqnull:true */
/**
 *
 * Backbone.DeepModel v0.10.4
 *
 * Copyright (c) 2013 Charles Davison, Pow Media Ltd
 *
 * https://github.com/powmedia/backbone-deep-model
 * Licensed under the MIT License
 */

/**
 * Underscore mixins for deep objects
 *
 * Based on https://gist.github.com/echong/3861963
 */
// (function() {
//   var arrays, basicObjects, deepClone, deepExtend, deepExtendCouple, isBasicObject,
//     __slice = [].slice;

//   deepClone = function(obj) {
//     var func, isArr;
//     if (!_.isObject(obj) || _.isFunction(obj)) {
//       return obj;
//     }
//     if (obj instanceof Backbone.Collection || obj instanceof Backbone.Model) {
//       return obj;
//     }
//     if (_.isDate(obj)) {
//       return new Date(obj.getTime());
//     }
//     if (_.isRegExp(obj)) {
//       return new RegExp(obj.source, obj.toString().replace(/.*\//, ""));
//     }
//     isArr = _.isArray(obj || _.isArguments(obj));
//     func = function(memo, value, key) {
//       if (isArr) {
//         memo.push(deepClone(value));
//       } else {
//         memo[key] = deepClone(value);
//       }
//       return memo;
//     };
//     return _.reduce(obj, func, isArr ? [] : {});
//   };

//   isBasicObject = function(object) {
//     if (object == null) return false;
//     return (object.prototype === {}.prototype || object.prototype === Object.prototype) && _.isObject(object) && !_.isArray(object) && !_.isFunction(object) && !_.isDate(object) && !_.isRegExp(object) && !_.isArguments(object);
//   };

//   basicObjects = function(object) {
//     return _.filter(_.keys(object), function(key) {
//       return isBasicObject(object[key]);
//     });
//   };

//   arrays = function(object) {
//     return _.filter(_.keys(object), function(key) {
//       return _.isArray(object[key]);
//     });
//   };

//   deepExtendCouple = function(destination, source, maxDepth) {
//     var combine, recurse, sharedArrayKey, sharedArrayKeys, sharedObjectKey, sharedObjectKeys, _i, _j, _len, _len1;
//     if (maxDepth == null) {
//       maxDepth = 20;
//     }
//     if (maxDepth <= 0) {
//       console.warn('_.deepExtend(): Maximum depth of recursion hit.');
//       return _.extend(destination, source);
//     }
//     sharedObjectKeys = _.intersection(basicObjects(destination), basicObjects(source));
//     recurse = function(key) {
//       return source[key] = deepExtendCouple(destination[key], source[key], maxDepth - 1);
//     };
//     for (_i = 0, _len = sharedObjectKeys.length; _i < _len; _i++) {
//       sharedObjectKey = sharedObjectKeys[_i];
//       recurse(sharedObjectKey);
//     }
//     sharedArrayKeys = _.intersection(arrays(destination), arrays(source));
//     combine = function(key) {
//       return source[key] = _.union(destination[key], source[key]);
//     };
//     for (_j = 0, _len1 = sharedArrayKeys.length; _j < _len1; _j++) {
//       sharedArrayKey = sharedArrayKeys[_j];
//       combine(sharedArrayKey);
//     }
//     return _.extend(destination, source);
//   };

//   deepExtend = function() {
//     var finalObj, maxDepth, objects, _i;
//     objects = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), maxDepth = arguments[_i++];
//     if (!_.isNumber(maxDepth)) {
//       objects.push(maxDepth);
//       maxDepth = 20;
//     }
//     if (objects.length <= 1) {
//       return objects[0];
//     }
//     if (maxDepth <= 0) {
//       return _.extend.apply(this, objects);
//     }
//     finalObj = objects.shift();
//     while (objects.length > 0) {
//       finalObj = deepExtendCouple(finalObj, deepClone(objects.shift()), maxDepth);
//     }
//     return finalObj;
//   };

//   _.mixin({
//     deepClone: deepClone,
//     isBasicObject: isBasicObject,
//     basicObjects: basicObjects,
//     arrays: arrays,
//     deepExtend: deepExtend
//   });

// }).call(this);

// /**
//  * Main source
//  */

// ;(function(factory) {
//     if (typeof define === 'function' && define.amd) {
//         // AMD
//         define(['underscore', 'backbone'], factory);
//     } else {
//         // globals
//         factory(_, Backbone);
//     }
// }(function(_, Backbone) {
    
//     /**
//      * Takes a nested object and returns a shallow object keyed with the path names
//      * e.g. { "level1.level2": "value" }
//      *
//      * @param  {Object}      Nested object e.g. { level1: { level2: 'value' } }
//      * @return {Object}      Shallow object with path names e.g. { 'level1.level2': 'value' }
//      */
//     function objToPaths(obj) {
//         var ret = {},
//             separator = DeepModel.keyPathSeparator;

//         for (var key in obj) {
//             var val = obj[key];

//             if (val && val.constructor === Object && !_.isEmpty(val)) {
//                 //Recursion for embedded objects
//                 var obj2 = objToPaths(val);

//                 for (var key2 in obj2) {
//                     var val2 = obj2[key2];

//                     ret[key + separator + key2] = val2;
//                 }
//             } else {
//                 ret[key] = val;
//             }
//         }

//         return ret;
//     }

//     /**
//      * @param {Object}  Object to fetch attribute from
//      * @param {String}  Object path e.g. 'user.name'
//      * @return {Mixed}
//      */
//     function getNested(obj, path, return_exists) {
//         var separator = DeepModel.keyPathSeparator;

//         var fields = path.split(separator);
//         var result = obj;
//         return_exists || (return_exists === false);
//         for (var i = 0, n = fields.length; i < n; i++) {
//             if (return_exists && !_.has(result, fields[i])) {
//                 return false;
//             }
//             result = result[fields[i]];

//             if (result == null && i < n - 1) {
//                 result = {};
//             }
            
//             if (typeof result === 'undefined') {
//                 if (return_exists)
//                 {
//                     return true;
//                 }
//                 return result;
//             }
//         }
//         if (return_exists)
//         {
//             return true;
//         }
//         return result;
//     }

//     /**
//      * @param {Object} obj                Object to fetch attribute from
//      * @param {String} path               Object path e.g. 'user.name'
//      * @param {Object} [options]          Options
//      * @param {Boolean} [options.unset]   Whether to delete the value
//      * @param {Mixed}                     Value to set
//      */
//     function setNested(obj, path, val, options) {
//         options = options || {};

//         var separator = DeepModel.keyPathSeparator;

//         var fields = path.split(separator);
//         var result = obj;
//         for (var i = 0, n = fields.length; i < n && result !== undefined ; i++) {
//             var field = fields[i];

//             //If the last in the path, set the value
//             if (i === n - 1) {
//                 options.unset ? delete result[field] : result[field] = val;
//             } else {
//                 //Create the child object if it doesn't exist, or isn't an object
//                 if (typeof result[field] === 'undefined' || ! _.isObject(result[field])) {
//                     result[field] = {};
//                 }

//                 //Move onto the next part of the path
//                 result = result[field];
//             }
//         }
//     }

//     function deleteNested(obj, path) {
//       setNested(obj, path, null, { unset: true });
//     }

//     var DeepModel = Backbone.Model.extend({

//         // Override constructor
//         // Support having nested defaults by using _.deepExtend instead of _.extend
//         constructor: function(attributes, options) {
//             var defaults;
//             var attrs = attributes || {};
//             this.cid = _.uniqueId('c');
//             this.attributes = {};
//             if (options && options.collection) this.collection = options.collection;
//             if (options && options.parse) attrs = this.parse(attrs, options) || {};
//             if (defaults = _.result(this, 'defaults')) {
//                 //<custom code>
//                 // Replaced the call to _.defaults with _.deepExtend.
//                 attrs = _.deepExtend({}, defaults, attrs);
//                 //</custom code>
//             }
//             this.set(attrs, options);
//             this.changed = {};
//             this.initialize.apply(this, arguments);
//         },

//         // Return a copy of the model's `attributes` object.
//         toJSON: function(options) {
//           return _.deepClone(this.attributes);
//         },

//         // Override get
//         // Supports nested attributes via the syntax 'obj.attr' e.g. 'author.user.name'
//         get: function(attr) {
//             return getNested(this.attributes, attr);
//         },

//         // Override set
//         // Supports nested attributes via the syntax 'obj.attr' e.g. 'author.user.name'
//         set: function(key, val, options) {
//             var attr, attrs, unset, changes, silent, changing, prev, current;
//             if (key == null) return this;
            
//             // Handle both `"key", value` and `{key: value}` -style arguments.
//             if (typeof key === 'object') {
//               attrs = key;
//               options = val || {};
//             } else {
//               (attrs = {})[key] = val;
//             }

//             options || (options = {});
            
//             // Run validation.
//             if (!this._validate(attrs, options)) return false;

//             // Extract attributes and options.
//             unset           = options.unset;
//             silent          = options.silent;
//             changes         = [];
//             changing        = this._changing;
//             this._changing  = true;

//             if (!changing) {
//               this._previousAttributes = _.deepClone(this.attributes); //<custom>: Replaced _.clone with _.deepClone
//               this.changed = {};
//             }
//             current = this.attributes, prev = this._previousAttributes;

//             // Check for changes of `id`.
//             if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

//             //<custom code>
//             attrs = objToPaths(attrs);
//             //</custom code>

//             // For each `set` attribute, update or delete the current value.
//             for (attr in attrs) {
//               val = attrs[attr];

//               //<custom code>: Using getNested, setNested and deleteNested
//               if (!_.isEqual(getNested(current, attr), val)) changes.push(attr);
//               if (!_.isEqual(getNested(prev, attr), val)) {
//                 setNested(this.changed, attr, val);
//               } else {
//                 deleteNested(this.changed, attr);
//               }
//               unset ? deleteNested(current, attr) : setNested(current, attr, val);
//               //</custom code>
//             }

//             // Trigger all relevant attribute changes.
//             if (!silent) {
//               if (changes.length) this._pending = true;

//               //<custom code>
//               var separator = DeepModel.keyPathSeparator;

//               for (var i = 0, l = changes.length; i < l; i++) {
//                 var key = changes[i];

//                 this.trigger('change:' + key, this, getNested(current, key), options);

//                 var fields = key.split(separator);

//                 //Trigger change events for parent keys with wildcard (*) notation
//                 for(var n = fields.length - 1; n > 0; n--) {
//                   var parentKey = _.first(fields, n).join(separator),
//                       wildcardKey = parentKey + separator + '*';

//                   this.trigger('change:' + wildcardKey, this, getNested(current, parentKey), options);
//                 }
//                 //</custom code>
//               }
//             }

//             if (changing) return this;
//             if (!silent) {
//               while (this._pending) {
//                 this._pending = false;
//                 this.trigger('change', this, options);
//               }
//             }
//             this._pending = false;
//             this._changing = false;
//             return this;
//         },

//         // Clear all attributes on the model, firing `"change"` unless you choose
//         // to silence it.
//         clear: function(options) {
//           var attrs = {};
//           var shallowAttributes = objToPaths(this.attributes);
//           for (var key in shallowAttributes) attrs[key] = void 0;
//           return this.set(attrs, _.extend({}, options, {unset: true}));
//         },

//         // Determine if the model has changed since the last `"change"` event.
//         // If you specify an attribute name, determine if that attribute has changed.
//         hasChanged: function(attr) {
//           if (attr == null) return !_.isEmpty(this.changed);
//           return getNested(this.changed, attr) !== undefined;
//         },

//         // Return an object containing all the attributes that have changed, or
//         // false if there are no changed attributes. Useful for determining what
//         // parts of a view need to be updated and/or what attributes need to be
//         // persisted to the server. Unset attributes will be set to undefined.
//         // You can also pass an attributes object to diff against the model,
//         // determining if there *would be* a change.
//         changedAttributes: function(diff) {
//           //<custom code>: objToPaths
//           if (!diff) return this.hasChanged() ? objToPaths(this.changed) : false;
//           //</custom code>

//           var old = this._changing ? this._previousAttributes : this.attributes;
          
//           //<custom code>
//           diff = objToPaths(diff);
//           old = objToPaths(old);
//           //</custom code>

//           var val, changed = false;
//           for (var attr in diff) {
//             if (_.isEqual(old[attr], (val = diff[attr]))) continue;
//             (changed || (changed = {}))[attr] = val;
//           }
//           return changed;
//         },

//         // Get the previous value of an attribute, recorded at the time the last
//         // `"change"` event was fired.
//         previous: function(attr) {
//           if (attr == null || !this._previousAttributes) return null;

//           //<custom code>
//           return getNested(this._previousAttributes, attr);
//           //</custom code>
//         },

//         // Get all of the attributes of the model at the time of the previous
//         // `"change"` event.
//         previousAttributes: function() {
//           //<custom code>
//           return _.deepClone(this._previousAttributes);
//           //</custom code>
//         }
//     });


//     //Config; override in your app to customise
//     DeepModel.keyPathSeparator = '.';


//     //Exports
//     Backbone.DeepModel = DeepModel;

//     //For use in NodeJS
//     if (typeof module != 'undefined') module.exports = DeepModel;
    
//     return Backbone;

// }));