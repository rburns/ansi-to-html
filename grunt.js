/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-growl');
  grunt.loadNpmTasks('grunt-coffee');
  grunt.loadNpmTasks('grunt-simple-mocha');

  // Project configuration.
  grunt.initConfig({
    mocha: {
      files: ['test/**/*.js']
    },
    coffee: {
      src: {
        src: 'src/**/*.coffee',
        dest: 'lib'
      },
      test: 'test/**/*.coffee'
    },
    watch: {
      files: ['src/**/*.coffee', 'test/**/*.coffee'],
      tasks: 'default'
    }
  });

  // Default task.
  grunt.registerTask('default', 'coffee mocha');

};
