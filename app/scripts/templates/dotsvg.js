(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['dotsvg'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n<glyph unicode=\""
    + escapeExpression(((stack1 = (depth0 && depth0.code)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" horiz-adv-x=\""
    + escapeExpression(((stack1 = (depth0 && depth0.advance)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" d=\""
    + escapeExpression(((stack1 = (depth0 && depth0.svg)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"/>\n";
  return buffer;
  }

  buffer += "<?xml version=\"1.0\" standalone=\"no\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n<svg xmlns=\"http://www.w3.org/2000/svg\">\n<metadata></metadata>\n<defs>\n<font id=\"prototypo-";
  if (helper = helpers.name) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.name); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" horiz-adv-x=\"1191\">\n<font-face units-per-em=\"1024\" ascent=\"800\" descent=\"-205\" />\n<missing-glyph horiz-adv-x=\"500\" />\n<glyph unicode=\"&#xd;\" horiz-adv-x=\"681\" />\n";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.glyphs), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</font>\n</defs>\n</svg>";
  return buffer;
  });
})();