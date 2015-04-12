'use strict';

var path = require('path');

module.exports = function(grunt) {
  grunt.config.init({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      dist: [
      'dist/js',
      'dist/*.html'
      ]
    },

    connect: {
      server: {
        options: {
          port: 3030,
          base: './dist'
        }
      }
    },

    less: {
      debug: {
        options: {
          paths: ['src/less'],
          'dumpLineNumbers': 'all'
        },
        files: [{
          expand: true,
          cwd: 'src/less/',
          src: ['main.less'],
          dest: './dist/css/',
          ext: '.css',
          nonull: true
        }]
      }
    },

    watch: {
      options: {
        livereload: true,
      },
      all: {
        files: ['src/js/**/*.js', 'src/**/*.html', 'src/less/**/*.less'],
        tasks: [
          'less:debug',
          'copy:dist'],
        options: {
          interrupt: true
        }
      }
    },


    copy: {
      dist: {
        files: [{
          expand: true,
          cwd: './src/',
          src: [
            'js/**/*.js', 
            '*.html', 
            'tmpl/**/*.html'
          ],
          dest: 'dist/'
        }]
      }
    },

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('jslint');
  grunt.loadNpmTasks('matchdep');

  grunt.registerTask('default', 'Build and render all LESS for development.', [
      'clean:dist',
      'less:debug',
      'copy:dist',
      'connect:server',
      'watch:all'
  ]);

  grunt.registerTask('build', 'Build and render all LESS', [
      'clean:dist',
      'less:debug',
      'copy:dist'
  ]);

};
