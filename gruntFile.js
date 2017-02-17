/*global module:false*/
module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-eslint');

  // Project configuration.
  grunt.initConfig({
    eslint: {
        options: { configFile: '.eslintrc.json' },
        target: ['lib/**/*.js', 'test/**/*.js']
    },
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
