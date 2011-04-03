module.exports = function(validators, widgets, fields, ValidatorError) {
  widgets.text = inputType('text')
  widgets.password = inputType('password')
  widgets.checkbox = inputType('checkbox')
}

function inputType(type) {
  return function inputTypeForm(name, val, buf, opts) {
    buf.push('<input type="' + type + '" name="' + name + '"')
    if (val != null) buf.push(' value="'+ val + '"');
    buf.push(' />');
  }
}
