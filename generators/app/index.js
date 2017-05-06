const Generator = require('yeoman-generator');

const mkdirp = require('mkdirp');
const _ = require('lodash');
const commandExists = require('command-exists');

const ASSETS = {
  package: 'package.json',
  mkdirp: [
    'gulp-tasks',
    'gulp-tasks/main',
    'gulp-tasks/build',
    'setup',
    'res',
    'src',
    'online',
  ],
  copy: [{
    src: 'gulp-tasks/**/*',
    dest: 'gulp-tasks',
  }, {
    src: 'setup/**/*',
    dest: 'setup',
  }, {
    src: 'res/**/*',
    dest: 'res',
  }],
  copyTpl: [
    'CHANGELOG.md',
    'gulpfile.js',
  ],
};

function extendPackage(generator, template) {
  const packageFile = generator.destinationPath(ASSETS.package);
  const extPackageFile = generator.templatePath(ASSETS.package);
  const manifest = generator.fs.readJSON(packageFile, {});
  const extManifest = generator.fs.readJSON(extPackageFile, {});
  generator.fs.writeJSON(packageFile, _.merge(manifest, extManifest, {
    name: template.appname,
    description: template.appname,
    author: template.author,
  }));
}

function createFolders() {
  ASSETS.mkdirp.forEach((dir) => {
    mkdirp(dir);
  });
}

function copyAllFiles(generator) {
  ASSETS.copy.forEach((path) => {
    generator.fs.copy(
      generator.templatePath(path.src),
      generator.destinationPath(path.dest)
    );
  });
}

function copyAllTplFiles(generator, template) {
  ASSETS.copyTpl.forEach((path) => {
    generator.fs.copyTpl(
      generator.templatePath(path),
      generator.destinationPath(path),
      template
    );
  });
}

module.exports = class extends Generator {
  writing() {
    const template = {
      appname: _.kebabCase(this.appname),
      author: {
        name: this.user.git.name(),
        email: this.user.git.email(),
      },
    };
    extendPackage(this, template);
    createFolders();
    copyAllFiles(this);
    copyAllTplFiles(this, template);
  }

  install() {
    commandExists('yarn', (err, isExists) => {
      if (!err && isExists) {
        this.spawnCommand('yarn');
      } else {
        this.npmInstall();
      }
    });
  }
};
