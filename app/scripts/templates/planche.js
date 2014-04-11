(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['planche'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n		<g transform=\"this.transform\">\n			";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.outlines), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n		</g>\n	";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n				<path transform=\""
    + escapeExpression(((stack1 = (depth0 && depth0.transform)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" d=\""
    + escapeExpression(((stack1 = (depth0 && depth0.svg)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" fill=\"#3B3B3B\" stroke=\"none\"></path>\n			";
  return buffer;
  }

  buffer += "<?xml version=\"1.0\" standalone=\"no\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n<svg xmlns=\"http://www.w3.org/2000/svg\">\n<metadata></metadata>\n<defs>\n</defs>\n<g transform=\"matrix(1 0 0 -1 0 0) scale(0.78)\">\n	";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.group), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</g>\n</svg>";
  return buffer;
  });
})();