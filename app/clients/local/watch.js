var Change = require('sync').change;
var Sync = require('sync');
var Blog = require('blog');
var fs = require('fs-extra');
var config = require('config');
var join = require('path').join;

function blog_dir (blog_id) {
  return join(config.blog_folder_dir, blog_id);
}

module.exports = function (blog_id, path) {

  fs.watch(path, {persistent: true, recursive: true}, function(e, filename){

    filename = '/' + filename;

    Blog.get({id: blog_id}, function(err, blog){

      if (err) throw err;

      Sync(blog_id, function(callback){

        // On OSX we don't know if the event was a rename, create or delete
        // So we have to check ourselves.
        fs.open(join(blog_dir(blog_id), filename), 'r', function(err){

          if (err && err.code === 'ENOENT') {
            return Change.drop(blog_id, filename, callback);
          }

          if (err) {
            throw err;
          }

          Change.set(blog, filename, callback);
        });

      }, function(){

        console.log('Sync complete!');
      });
    });
  });
};