var step = require('step')
, Field = exports.Field = { getDisplay: 
  function() {
    return (this.label || this.key)
      .replace(/[a-z][A-Z]|_[a-zA-Z]/g, function(m) { return m[0] === '_' ? ' ' + m[1].toUpperCase() : m[0] + ' ' + m[1] })
      .replace(/^[a-z]/, function(m) { return m.toUpperCase() })
  }
}

, Form = exports.Form = function Form(name, fields, opts) {
  this.name = name
  this.fields = fields
  Object.keys(fields).forEach(function(key){
    fields[key].key = key
    fields[key].name = name + '[' + key + ']'
    fields[key].__proto__ = Field
  })
  if (opts && opts.postValidator) this.postValidator = opts.postValidator
}

, ValidatorError = exports.ValidatorError = function ValidatorError(field, message, value) {
  this.name = 'ValidatorError';
  Error.call(this, message);
  Error.captureStackTrace(this, arguments.callee);
  this.message = message;
  this.field = field.key
  this.fieldVal = value 
}
ValidatorError.prototype.__proto__ = Error.prototype

Form.prototype.bindValues = function bindValues(values) {
  this.values = values;
}

Form.prototype.validate = function validate(callback) {
  var fields = this.fields
    , values = this.values
    , form = this
    , error = this.error = this.error || {};
  step
    ( function(){
        var calledValidator = false;
        Object.keys(fields).forEach(function(fieldName) {
          if (fields[fieldName].required !== false && values[fieldName] == null || values[fieldName] === '') {
            calledValidator = true;
            var err = new ValidatorError(fields[fieldName], 'required field', values[fieldName]);
            error[fieldName] = Array.isArray(error[fieldName]) ? error[fieldName].push(err) : [err]
            return this.parallel()(err);
          }
          
          if (fields[fieldName].validator) {
            if (Array.isArray(fields[fieldName].validator)) multiValidator(fields[fieldName].validator, fields[fieldName], values[fieldName], validatorCallbackGen(this.parallel()));
            else fields[fieldName].validator(fields[fieldName], values[fieldName], validatorCallbackGen(this.parallel()));
          }
        }, this);
        if (form.postValidator) {
          calledValidator = true;
          form.postValidator(validatorCallbackGen(this.parallel()));
        }
        if (!calledValidator) this();
      }
    , function (err) {
        this(err ? false : true);
      }
    , callback
    );
    
  function validatorCallbackGen(cb) {
    return function validatorCallback(err) {
      if (err) {
        var fieldName = err.field
        Array.isArray(error[fieldName]) ? error[fieldName].push(err) : error[fieldName] = [err]
      }
      cb(err);
    }
  }
}

function multiValidator(validatorList, field, val, callback) {
  var cur = 0
    , len = validatorList.length;
  function cb(err) {
    cur++;
    if (err) return callback(err);
    if (cur == len) return callback(); 
    validatorList[cur](field, val, cb);
  } 
  validatorList[cur](field, val, cb);
}

exports.validator = {}
exports.widgets = {}
exports.fields = {};

;['choice' 
, 'length'
, 'inputs'
, 'regex'
, 'country'
].forEach(function(name) {
  require('./fields/' + name)(exports.validator, exports.widgets, exports.fields, exports.ValidatorError)
})
