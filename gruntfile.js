module.exports = function(grunt) {

  grunt.registerTask('watch', [ 'watch' ]);

  grunt.initConfig({
    jshint: {
      all: {
        src: ['app/*.js', 'server.js']
      }
    },
    watch: {
      js: {
        files: ['app/*.js', 'server.js'],
        tasks: ['jshint'],
        options: {
          livereload: false,
        }
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

};
