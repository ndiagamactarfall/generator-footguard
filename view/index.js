/*jshint latedef:false */
var path = require('path'),
  util = require('util'),
  grunt = require('grunt'),
  ScriptBase = require('../script-base.js'),
  generatorUtil = require('../util.js');

grunt.util._.mixin( require('underscore.inflections') );

module.exports = Generator;

function Generator() {
  ScriptBase.apply(this, arguments);
}

util.inherits(Generator, ScriptBase);

Generator.prototype.askFor = function askFor() {
	var cb = this.async(),
		self = this;

	// a bit verbose prompt configuration, maybe we can improve that
	// demonstration purpose. Also, probably better to have this in other generator, whose responsability is to ask
	// and fetch all realated bootstrap stuff, that we hook from this generator.
	var prompts = [{
		name: 'model',
		message: 'Would you like to create associate model (' + this.name + ')?',
		default: 'y/model/N'
	}, {	
		name: 'tpl',
		message: 'Would you like to create associate template (' + this.name + ')?',
		default: 'Y/template/n'
	}, {
		name: 'sass',
		message: 'Would you like to create associate sass file (' + this.name + ')?',
		default: 'Y/sass/n'
	}, {
		name: 'test',
		message: 'Would you like to create associate unit test ?',
		default: 'Y/n'
	}];
  
	this.prompt(prompts, function(props) {
		// manually deal with the response, get back and store the results.
		// We change a bit this way of doing to automatically do this in the self.prompt() method.
		self.model = false;
		if( props.model !== "y/model/N" ) {
			if( (/^y$/i).test(props.model) ) {
				self.model = self.name;
			} else if( !(/^n$/i).test(props.model) ) {
				self.model = props.model;
			}
		}
		
		self.tpl = self.name;
		if( props.tpl !== "Y/template/n" ) {
			if( (/^y$/i).test(props.tpl) ) {
				self.tpl = self.name;
			} else if( (/^n$/i).test(props.tpl) ) {
				self.tpl = false;
			} else {
				self.tpl = props.tpl;
			}
		}
		
		self.sass = self.name;
		if( props.sass !== "Y/template/n" ) {
			if( (/^y$/i).test(props.sass) ) {
				self.sass = self.name;
			} else if( (/^n$/i).test(props.sass) ) {
				self.sass = false;
			} else {
				self.sass = props.sass;
			}
		}
		
		self.test = (/y/i).test(props.test);
		
		// we're done, go through next step
		cb();
	});
};

Generator.prototype.createViewFiles = function createViewFiles() {
	//console.log('Model: ' + this.model);
	//console.log('Use unit test: ' + this.test);
	this.template('view.coffee', path.join('src/coffee/app/views', this.folder, this.name + '_view.coffee'));
	
	if( this.model ) {
		generatorUtil.createModel(this, this.model, this.folder, this.test);
	}
	
	if( this.sass ) {
		this.template('view.sass', path.join('src/sass', this.folder, '_' + this.sass + '.sass'));
		
		generatorUtil.rewriteFile({
			file: 'src/sass/main.sass',
			needle: "# <here> don't remove this comment",
			splicable: [
				'@import ' + path.join(this.folder, this.sass)
			]
		});
	}
	
	if( this.tpl ) {
		this.template('view.html', path.join('app/templates', this.folder, this.tpl + '.html'));
	}
	
	if( this.test ) {
		generatorUtil.createTest(this, 'unit', 'view_spec.coffee', path.join('views', this.folder, this.name + '_view'));
	}
};
