/*global module:false*/
module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-simple-mocha');

  // Project configuration.
  grunt.initConfig({
    simplemocha: {
      all: ['test/ansi_to_html.js', ['test/cli.js']],
      options: {reporter: 'tap'}
    },
    watch: {
      files: ['src/**/*.js', 'test/**/*.js'],
      tasks: 'default'
    }
  });

  // Default task.
  grunt.registerTask('default', ['simplemocha']);
};
