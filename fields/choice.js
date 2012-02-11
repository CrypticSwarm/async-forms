module.exports = function(validators, widgets, fields, ValidatorError) {

  validators.choice = function(choices, opts) {
    opts = opts || {};
    var msg = opts.msg || 'invalid choice'
    return function choiceValidator(field, val, callback) {
      if (choices[val] != null) return callback();
      callback(new ValidatorError(field, msg, val))
    }
  }

  widgets.choice = function(choices, defaultVal) {
    var keys = Object.keys(choices);
    return function renderChoiceWidget(name, val) {
      if (val == null) val = defaultVal;
      var buf = '<select name="' + name + '">'
      keys.forEach(function(choice){
        buf += '<option value="' + choice + '"'
        if(val == choice) buf += ' selected="selected"'
        buf += '>' + choices[choice] + '</option>'
      })
      buf += '</select>'
      return buf
    }
  }

  fields.choice = function(choices, defaultVal) {
    return { widget: widgets.choice(choices, defaultVal)
      , validator: validators.choice(choices)
      }
  }

}
