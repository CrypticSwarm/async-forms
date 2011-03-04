var jade = require('jade')
	, jadeForm = require('../../jade-form')
  , Form = jadeForm.Form
  , widget = jadeForm.widgets
  , validator = jadeForm.validator
	, widgets = jadeForm.widgets
  , f = function(){}
jadeForm('./formTemplate.jade')
  
f.prototype = new Form(
  { name: {validator: validator.length({ min: 4, max: 31 }), name: 'name'}
  , email: { validator: validator.email(), name: 'email' }
  , password: { validator: validator.length({min: 3, max: 12}), name: 'password', widget: widgets.password }
  , gender: { validator: validator.length(8), name: 'gender', widget: widgets.choice(['male', 'female']) }
  });

printForm('Cryptic Form Valid?', new f, { name: 'Cryptic', email: 'fakeemail@asdf.com', gender: 'male', password: 'aki3hai38dh' }, function(){
    printForm("Swarm Form Valid?", new f, { name: 'Swarm', email: 'fakeemail@asdf', gender: 'male', password: 'dh' })
})

function printForm(name, form, vals, callback) {
  form.bindValues(vals)
  form.validate(function(isvalid) { 
    console.log(name, isvalid) 
    jade.renderFile(__dirname + '/form.jade', { locals: { form: form } }, function(err, html) {
      if (err) throw err;
      console.log(html);
      console.log('\n\n');
      if (callback) callback();
    });
  });
}
