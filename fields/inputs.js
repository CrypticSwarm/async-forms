module.exports = function(validators, widgets, fields, ValidatorError) {
  widgets.text = inputType('text')
  widgets.password = inputType('password')
  widgets.checkbox = inputType('checkbox')
  widgets.hidden = inputType('hidden')
  widgets.textArea = textArea
}

function inputType(type) {
  return function inputTypeForm(name, val, buf, opts) {
    buf.push('<input type="' + type + '" name="' + name + '"')
    if (val != null) buf.push(' value="'+ val + '"');
    buf.push(' />');
  }
}

function textArea(rows, cols) {
  rows = rows || 10
  cols = cols || 30
  return function(name, val, buf, opts) {
    buf.push('<textarea name="' + name + '" rows="' + rows + '" cols="' + cols + '">')
    if (val != null) buf.push(' value="'+ val + '"');
    buf.push('</textarea>')
  }
}