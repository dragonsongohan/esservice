let events = require('events');
let PostEvents = new events.EventEmitter();

PostEvents.on('NewPost', function(group, post) {
   console.log("New Post in group " + group.name + ":" + post.title);
});

module.exports = PostEvents;