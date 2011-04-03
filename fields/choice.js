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
    return function renderChoiceWidget(name, val, buf, opts) {
      if (val == null) val = defaultVal;
      buf.push('<select name="' + name + '">');
      keys.forEach(function(choice){
        buf.push('<option value="' + choice + '"')
        if(val == choice) buf.push(' selected="selected"')
        buf.push('>' + choices[choice] + '</option>')
      })
      buf.push('</select>')
    }
  }

  fields.choice = function(choices, defaultVal) {
    return { widget: widgets.choice(choices, defaultVal)
      , validator: validators.choice(choices)
      }
  }

}
