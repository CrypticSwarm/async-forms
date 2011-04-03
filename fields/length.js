module.exports = function(validators, widgets, fields, ValidatorError) {
  
  validators.length = function length(len, options) {
    options = options || {};
    var shortMsg = options.shortMsg || "Too short. $2 needs to be at least characters $1 long."
      , longMsg = options.longMsg || "Too long.  $2 needs to be less then $1 characters long."
    return function lengthValidator(field, val, callback) {
      var msg = '';
      if (typeof len === 'number' && val.length > len) msg += longMsg.replace('$1', len).replace('$2', field.getDisplay())
      if (len.min != null && len.min > val.length) msg += shortMsg.replace('$1', len.min).replace('$2', field.getDisplay())
      if (len.max != null && len.max < val.length) msg += longMsg.replace('$1', len.max).replace('$2', field.getDisplay())
      if (!msg) return callback();
      var err = new ValidatorError(field, msg, val)
      callback(err);
    }
  }

}
