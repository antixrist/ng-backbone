module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower: grunt.file.readJSON('bower.json'),
    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      unit: {
        singleRun: false,
        autoWatch: true
      },
      ci: {
        singleRun: true
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        quotmark: 'single',
        undef: true,
        unused: true,
        strict: true,
        browser: true,
        eqnull: true,
        globals: {
          angular: true,
          Backbone: true,
          _: true
        }
      },
      ngBackbone: ['ng-backbone-proxy.js'],
      test: {
        options: {
          strict: false,
          globals: {
            afterEach: true,
            beforeEach: true,
            describe: true,
            expect: true,
            inject: true,
            it: true,
            jasmine: true,
            module: true
          }
        },
        src: ['test/*.spec.js']
      }
    },
    uglify: {
      ngBackbone: {
        options: {
          sourceMap: true,
          sourceMapName: 'ng-backbone-proxy.map'
        },
        files: {
          'ng-backbone-proxy.min.js': ['ng-backbone-proxy.js']
        }
      }
    }
  });

  grunt.registerTask('default', [
    //'karma:ci',
    'uglify'
  ]);
};
