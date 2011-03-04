var step = require('step')
, Form = exports.Form = function Form(fields) {
  this.fields = fields;
}
, ValidatorError = exports.ValidatorError = function ValidatorError(field, message) {
  this.name = 'ValidatorError';
  Error.call(this, message);
  Error.captureStackTrace(this, arguments.callee);
	this.message = message;
  this.field = field.name
  this.fieldVal = field.value;
}
ValidatorError.prototype.__proto__ = Error.prototype

Form.prototype.bindValues = function bindValues(values) {
  this.values = values;
}

Form.prototype.validate = function validate(callback) {
  var fields = this.fields
    , values = this.values
    , error = this.error = this.error || {};
  step
    ( function(){
        var calledValidator = false;
        Object.keys(fields).forEach(function(fieldName) {
          if (fields[fieldName].required !== false && fields[fieldName].validator) {
            calledValidator = true;
            if (values[fieldName] == null || values[fieldName] === '') {
              var err = new ValidatorError(fields[fieldName], 'required field');
              error[fieldName] = err;
              return this.parallel()(err);
            }
            fields[fieldName].value = values[fieldName];
            var cb = this.parallel();
            fields[fieldName].validator(fields[fieldName], values[fieldName], function(err) {
              if (err) {
                error[fieldName] = err;
              }
              cb(err);
            });
          }
        }, this);
        if (!calledValidator) this();
      }
    , function (err) {
        this(err ? false : true);
      }
    , callback
    );
    
}

exports.validator = {}
exports.validator.length = function length(len, options) {
  return function lengthValidator(field, val, callback) {
    var msg = '';
    if (typeof len === 'number' && val.length > len) msg += 'numerical.  Greater than upper bound.';
    if (len.min != null && len.min > val.length) msg += 'under min lower bound';
    if (len.max != null && len.max < val.length) msg += 'over max upper bound';
    if (!msg) return callback();
    var err = new ValidatorError(field, 'invalid length' + msg)
    callback(err);
  }
}

exports.validator.email = function email(options) {
  options = options || {};
  return function email(field, val, callback) {
    if(/^[a-zA-Z][\w\-]*\w(\+[\w\-]*\w)?@\w+\.\w{2,}/.test(val)) return callback();
    var err = new ValidatorError(field, 'invalid email');
		return callback(err);
  }
}
