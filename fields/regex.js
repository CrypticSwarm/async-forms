module.exports = function(validators, widgets, fields, ValidatorError) {

  validators.regex = function(regex, options) {
    options = options || {};
    var msg = options.msg || 'invalid'
    return function(field, val, callback) {
      if(regex.test(val)) return callback();
      var err = new ValidatorError(field, msg, val);
      return callback(err);
    }
  }


  validators.email = function email(options) {
    return validators.regex(/^[a-zA-Z][\w\-]*\w(\+[\w\-]*\w)?@\w+\.\w{2,}/, options)
  }

}
