module.exports = function(validators, widgets, fields, ValidatorError) {
  widgets.text = inputType('text')
  widgets.password = inputType('password')
  widgets.checkbox = inputType('checkbox')
  widgets.hidden = inputType('hidden')
  widgets.textArea = textArea
  widgets.hidden.noLabel = true
}

function inputType(type) {
  return function inputTypeForm(name, val) {
    var buf = '<input type="' + type + '" id="' + name + '" name="' + name + '"'
    if (val != null) buf += ' value="'+ val + '"'
    buf += ' />'
    return buf
  }
}

function textArea(rows, cols) {
  rows = rows || 10
  cols = cols || 30
  return function(name, val, buf, opts) {
    var buf = '<textarea name="' + name + '" rows="' + rows + '" cols="' + cols + '">'
    if (val != null) buf += ' value="'+ val + '"'
    buf += '</textarea>'
    return buf
  }
}
