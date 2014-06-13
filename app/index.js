'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var _ = require('yeoman-generator/node_modules/lodash')


String.prototype.toCamel = function () {
    return this.replace(/^[A-Z]/, function ($1) {
        return $1.toLowerCase().replace('-', '');
    });
};
String.prototype.toHeaderFormat = function () {
    return this.replace(/([A-Z])/g, function ($1) {
        return " " + $1;
    }).charAt(0).toUpperCase().slice(1);
};
String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
String.prototype.toLkeyFormat = function (trimFirstChar) {
    return this.replace(/([A-Z])/g, function ($1) {
        return "_" + $1.toLowerCase();
    }).toUpperCase().substring(trimFirstChar ? 1 : 0);
}
function injectJSON(templateName, destFileName) {

    try {
        var file = _this.readFileAsString(destFileName);

        try {
            var jsonFile = JSON.parse(file);
        } catch (err) {
            console.log('error parsing JSON', err);
        }

        var body = _this.read(templateName, 'utf8');
        var templatedBody = _this.engine(body, _this);
        try {
            var jsonTemplate = JSON.parse(templatedBody);
        } catch (err) {
            console.log('error parsing template JSON', err);
            console.log(templatedBody);
        }
        jsonFile.VIEWS[_this.lkeyEntityName] = jsonTemplate[_this.lkeyEntityName];
        _this.writeFileFromString(JSON.stringify(jsonFile), destFileName);
    }
    catch (err) {
        console.log('error generating JSON: ', err);
    }
}

var AngularFullstackCrudGenerator = yeoman.generators.Base.extend({
    init: function () {

//    this.on('end', function () {
//      if (!this.options['skip-install']) {
//        this.installDependencies();
//      }
//    });
    },

    askFor: function () {
        var done = this.async();

        // Have Yeoman greet the user.
        this.log(yosay('Welcome to the marvelous AngularFullstackCrud generator!'));

        var prompts = [
            {
                name: 'configFile',
                message: 'Configuration file',
                default: 'config.json'
            }
        ];

        this.prompt(prompts, function (props) {
            this.configFile = props.configFile;

            done();
        }.bind(this));
    },

    app: function () {
        this.mkdir('lib');
        this.mkdir('lib/models');

        var _this = this;
        this.config = JSON.parse(this.readFileAsString(path.join(__dirname, this.configFile)));
        this.appName = this.config.appName;

        _this.globalModel = _this.config.globalModel;
        if(_this.config.clean) {
            _this.cleanDestination('app/scripts/controllers/navbar.js', [['// MENU ITEM BEGIN', '// MENU ITEM END']]);
            _this.cleanDestination('lib/routes.js', [['// ROUTE INCLUDES BEGIN', '// ROUTE INCLUDES END'], ['// ROUTES BEGIN', '// ROUTES END']]);
            _this.cleanDestination('app/scripts/app.js', [['// PROTOTYPES BEGIN', '// PROTOTYPES END'], ['// MENU ITEM BEGIN', '// MENU ITEM END']]);
            _this.cleanDestination('app/views/index.html', [['<!-- CONTROLLERS BEGIN -->', '<!-- CONTROLLERS END -->']]);
        }

        this.config.entities.forEach(function (entity) {

            try {
                _this.model = entity.model;

                _this.modelToGenerate = _.merge(_this.globalModel, _this.model);

                _this.entityName = entity.name;
                _this.formalEntityName = entity.name.charAt(0).toUpperCase() + entity.name.slice(1);
                _this.sluggyEntityName = _.slugify(entity.name);
                _this.camelEntityName = _this.entityName.toCamel();
                _this.lcaseEntityName = _this.entityName.toLowerCase();
                _this.lkeyEntityName = _this.entityName.toLkeyFormat(true);
                _this.headerEntityName = _this.entityName.toHeaderFormat().substring(1);

                _this.template('_model.rm', 'lib/models/' + entity.name + '.js');
                _this.template('_controller.rm', 'lib/controllers/' + entity.name + 's.js');
                _this.template('_angular.controller.list.rm', 'app/scripts/controllers/' + entity.name + 'List.js');
                _this.template('_angular.view.list.html', 'app/views/partials/' + entity.name + 'List.html');
                _this.template('_angular.controller.edit.rm', 'app/scripts/controllers/' + entity.name + 'Edit.js');
                _this.template('_angular.view.edit.html', 'app/views/partials/' + entity.name + 'Edit.html');
                _this.injectTemplateInfo(['_navbar.rm'], 'app/scripts/controllers/navbar.js', ['// MENU ITEM BEGIN'], ['}];']);
                _this.injectTemplateInfo(['_routes.includes.rm', '_routes.rm'], 'lib/routes.js', ['// ROUTE INCLUDES BEGIN', '// ROUTES BEGIN'], ['middleware = require(\'./middleware\');', '.get(users.show);']);
                _this.injectTemplateInfo(['_app.rm'], 'app/scripts/app.js', ['// MENU ITEM BEGIN'], ['})']);
                _this.injectTemplateInfo(['_index.rm'], 'app/views/index.html', ['<!-- CONTROLLERS BEGIN -->'], ['<script src="scripts/controllers/settings.js"></script>']);

//            _this.template('_editView.html', './views/' + _this.camelEntityName + 'Edit.html');
//            injectTemplateInfo(['_catalog.define.js','_catalog.inject.js', '_catalog.use.js'], './scripts/catalog.js', ['// ECENTITY GENERATOR BEGIN DEFINE', '// ECENTITY GENERATOR BEGIN INJECT', '// ECENTITY GENERATOR BEGIN USE']);
//            injectJSON('_en.json', '../../il8n/Catalog/en.json');
            }
            catch (err) {
                console.log('error generating files: ', err);
            }

        });

        _this.injectTemplateInfo(['_app.prototypes.rm'], 'app/scripts/app.js', ['// PROTOTYPES BEGIN'], ['\'use strict\';']);


    },
    cleanDestination: function (destFileName, commentTags) {

        if (!commentTags) {
            return;
        }

        var file = this.readFileAsString(destFileName);

        /* make modifications to the file string here */
        var lines = file.split('\n');
        var output = '';
        var commentIndex = 0;
        var commentTag = commentTags[commentIndex];
        for (var i = 0, ln = lines.length; i < ln; i++) {
            if (lines[i].indexOf(commentTag[0]) >= 0) {
                output += lines[i] + '\n';

                while(lines[++i].indexOf(commentTag[1]) < 0 && i < 999999)
                {
                }

                commentIndex++;
                if (commentIndex < commentTags.length) {
                    commentTag = commentTags[commentIndex];
                }
            }
            output += lines[i] + '\n';
        }

        try {
            console.log('writing: ' + destFileName);
            this.writeFileFromString(output, destFileName);
            //this.write(destFileName, output);
        }
        catch (err) {
            console.log('error saving file: ', err);
        }
    },
    injectTemplateInfo: function (templateNames, destFileName, commentTags, codeBlocks) {

        var _this = this;
        if(!templateNames)
        {
            return;
        }

        if (!commentTags) {
            commentTags = ['// ECENTITY GENERATOR BEGIN'];
        }

        var file = this.readFileAsString(destFileName);

        var lines = file.split('\n');
        var output = '';
        var commentIndex = 0;
        var commentTag = commentTags[commentIndex];
        var codeBlock = codeBlocks && codeBlocks.length > 0 ? codeBlocks[0] : undefined;

        var commentTagExists = false, codeBlockExists = false;
        for (var i = 0, ln = lines.length; i < ln; i++) {
            if (lines[i].indexOf(commentTag) >= 0) {
                commentTagExists = true;
            } else if(codeBlock && lines[i].indexOf(codeBlock) >= 0) {
                codeBlockExists = true;
            }
        }

        _this.isClean = codeBlockExists && !commentTagExists;
        _this.beginComment = commentTag;
        _this.endComment = commentTag.replace('BEGIN', 'END');

        var templatedBody = [];
        var templateIndex = 0;
        for (var i = 0, ln = templateNames.length; i < ln; i++) {
            var body = this.read(templateNames[i] + (codeBlockExists && !commentTagExists ? '.fromcodeblocks' : ''), 'utf8');
            templatedBody[templateIndex++] = this.engine(body, this);
        }

        var processingDone = false;
        for (var i = 0, ln = lines.length; i < ln; i++) {
            if(commentTagExists) {
                if (!processingDone && lines[i].indexOf(commentTag) >= 0) {
                    output += lines[i] + '\n';
                    output += templatedBody[commentIndex];
                    i++;
                    commentIndex++;
                    if (commentIndex < commentTags.length) {
                        commentTag = commentTags[commentIndex];
                    } else {
                        processingDone = true;
                    }
                }
                output += lines[i] + '\n';
            }
            else if (codeBlockExists) {
                if (!processingDone && lines[i].indexOf(codeBlock) >= 0) {


                    output += lines[i] + '\n';
                    output += templatedBody[commentIndex];
                    i++;
                    commentIndex++;

                    if (commentIndex < codeBlocks.length) {
                        codeBlock = codeBlocks[commentIndex];
                        _this.beginComment = commentTags[commentIndex];
                        _this.endComment = commentTags[commentIndex].replace('BEGIN', 'END');

                        var body = this.read(templateNames[commentIndex] + '.fromcodeblocks', 'utf8');
                        templatedBody[commentIndex] = this.engine(body, this);

                    } else {
                        processingDone = true;
                    }
                }
                output += lines[i] + '\n';
            }
        }

        try {
            this.writeFileFromString(output, destFileName);
            //this.write(destFileName, output);
        }
        catch (err) {
            console.log('error saving file: ', err);
        }
    }
});

module.exports = AngularFullstackCrudGenerator;
