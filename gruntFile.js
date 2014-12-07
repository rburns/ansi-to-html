/*global module:false*/
module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-simple-mocha');

	// Project configuration.
	grunt.initConfig({
		simplemocha: {
			all: ['test/ansi_to_html.js'],
			options: {reporter: 'tap'}
		},
		coffee: {
			src: {
				src: 'src/ansi_to_html.coffee',
				dest: 'lib/ansi_to_html.js'
			},
			test: {
				src: 'test/ansi_to_html.coffee',
				dest: 'test/ansi_to_html.js'
			}
		},
		watch: {
			files: ['src/**/*.coffee', 'test/**/*.coffee'],
			tasks: 'default'
		}
	});

	// Default task.
	grunt.registerTask('default', ['coffee', 'simplemocha']);
};
