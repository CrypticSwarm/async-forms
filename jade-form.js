var jade = require('jade'),
  Compiler = jade.Compiler,
  Parser = jade.Parser, //require('jade/parser'), 
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

  Visitor.prototype.visit = function(node){
    this.visit = Compiler.prototype.visit;
    var form = node.nodes[0].name;
    this.compiler.options.$$widgets = exports.widgets;
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

