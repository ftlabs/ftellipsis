module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    buster: {
      test: {
        config: 'test/buster.js',
      },
    },

    readme: {
      build: {
        code: [
          { path: 'lib/index.js' }
        ],
        output: {
          'docs/readme.hogan': 'README.md'
        }
      }
    },
    uglify: {
      build: {
        src: 'lib/index.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-buster');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-readme');

  // Default task.
  grunt.registerTask('default', ['uglify', 'readme']);
};
