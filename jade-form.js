var jade = require('jade'),
  Compiler = jade.Compiler,
  Parser = require('jade/parser'),
  nodes = jade.nodes,
  fs = require('fs');


var exports = module.exports = function setupFormVisitor(templatePath) {
  var template = fs.readFileSync(templatePath, 'utf8');
  jade.filters.form = function(block, compiler){
    var visitor = new Visitor(block)
    visitor.compiler = compiler;
    return visitor.compile();
  };

  function Visitor(node) {
    this.node = node;
  }

  Visitor.prototype.__proto__ = Compiler.prototype;

    /*
    {
      , each = new nodes.Each(form + '.fields', '__val', '__k', new nodes.Block)
      , label = new nodes.Tag('label')
      , text = new nodes.Text('#{__k}')
      , div = new nodes.Tag('div')
      , input = new nodes.Tag('input')
      , cif = new nodes.Code('if ( __val.error )')
      , err = new nodes.Tag('div')
      , errTxt = new nodes.Text('#{__val.error.message}');

    label.setAttribute('for', '__k');
    input.setAttribute('name', '__k');
    input.setAttribute('type', '"text"');
    input.setAttribute('value', form + '.values && ' + form + '.values[__k] || ""');
    div.block.push(input);
    label.block.push(text);
    err.block.push(errTxt);
    cif.block = new nodes.Block(err);
    each.block.push(label);
    each.block.push(cif);
    each.block.push(div);
    }
    */
  Visitor.prototype.visit = function(node){
    this.visit = Compiler.prototype.visit;
    var form = node[0].name;
    this.compiler.options.locals.$$widgets = exports.widgets;
    var p = new Parser(template.replace(/%s/g, form), templatePath)
    p = p.parse();
    this.visitNode(p);
  };


  Visitor.prototype.visitTag = function(node) {
    if (node.name == 'field') {
      var attrs = {}
      node.attrs.forEach(function(item) {
        attrs[item.name] = item.val
      });
      var str = 'if ( ' + attrs.field + '.widget) {\n'
        + attrs.field + '.widget(' + attrs.field + '.name , (' + attrs.value + ' || null), buf)\n'
        + '}\n'
        + 'else {\n'
        + '$$widgets.text(' + attrs.field + '.name, (' + attrs.value + ' || null), buf)\n'
        + '}\n' 
      this.buf.push(str);
    }
    else Compiler.prototype.visitTag.call(this, node);
  }
}

