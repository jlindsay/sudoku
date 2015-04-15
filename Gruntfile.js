'use strict';

var path = require('path');

module.exports = function(grunt) {
  grunt.config.init({
    pkg: grunt.file.readJSON('package.json'),

        clean: {
            dist: [
                'dist/js',
                'dist/*.html' ], 
            archives : ['archives/*.zip']
        },

        connect: {
            server: {
                options: {
                    port: 3030,
                    base: './dist',
                    c:"-1"
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
                    src: ['demo.less'],
                    dest: './dist/css/',
                    ext: '.css',
                    nonull: true
                },
                {
                    expand: true,
                    cwd: 'src/less/',
                    src: ['sudoku.jquery.less'],
                    dest: './dist/css/',
                    ext: '.jquery.css',
                    nonull: true
                }]
            }
        },

        watch: {
            options: {
                livereload: true,
            },
            all: {
                files: ['src/js/**/*.js', 'src/index.html','src/**/*.html', 'src/less/**/*.less'],
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


        compress: {
            main: {
                options: {
                archive: 'archives/archive.zip'
            },
            files: [
                { src: ['dist/**'], dest: 'archives/'} ]
            }
        }

});

  
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compress');
    
    grunt.registerTask('dev', 'Build and render all LESS for development.', [
        'default',
        'connect:server',
        'watch:all'
    ]);

    grunt.registerTask('default', 'Build and render all LESS', [
        'clean:dist',
        'less:debug',
        'copy:dist',
    ]);

    grunt.registerTask('archive', 'Build and render all LESS', [
        'default',
        'clean:archives',
        'compress'
    ]);   
};
