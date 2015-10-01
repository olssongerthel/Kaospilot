module.exports = function(grunt) {

  grunt.registerTask('watch', [ 'watch' ]);

  grunt.initConfig({
    jsdoc2md: {
      docs: {
        options: {
          "heading-depth": 3
        },
        src: "app/kaospilot.js",
        dest: "app/api.md"
      }
    },
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

  grunt.loadNpmTasks("grunt-jsdoc-to-markdown");
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

};

