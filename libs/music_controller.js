'use strict';

var config = require('../config');
var Mopidy = require('mopidy');
var Twitter = require('./twitter_post');
var Track = require('./track_urls');
var _ = require('underscore');
_.str = require('underscore.string');

var mopidy = new Mopidy({
    webSocketUrl: "ws://localhost:6680/mopidy/ws/",
    callingConvention: "by-position-or-by-name"
});

var mopidyOnline = false;
var currentTrackId = 0;
var lastTrackIdAdded = null;

mopidy.on("state:online", function () {
    mopidyOnline = true; 
    mopidy.playback.getCurrentTlTrack({}).then(function(data){
        console.log("Mopidy Online");
        if (data) {
            currentTrackId = data.tlid;
            console.log("Current track: " + JSON.stringify(data));
        }
    });
    mopidy.tracklist.getTlTracks({}).then(function(data){
        if (data.length > 0) {
            lastTrackIdAdded = data[data.length - 1].tlid
            console.log("Last added track: " + JSON.stringify(data[data.length - 1]));
        }
    });
});

mopidy.on("state:offline", function () {
    mopidyOnline = false; 
});

mopidy.on("event:trackPlaybackStarted", function (data) {
    currentTrackId = data.tl_track.tlid;
    console.log("NOW PLAYING: "+JSON.stringify(data));
    if (config.music.now_playing_tweets_enabled) {
        Twitter.update({ 
            "status": "#nowplaying " + data.tl_track.track.name.slice(0,102) + " " + Track.getUrl(data.tl_track.track)
        });
    }
});

mopidy.on("event:trackPlaybackEnded", function (data) {
    var lastTrack = data;
    if (data.tl_track.tlid == lastTrackIdAdded) {
        mopidy.tracklist.clear();
        console.log("cleaning playlist");
    }
});

module.exports = {
    isOnline: mopidyOnline,
    getCurrentTrackId: function(){
        return currentTrackId;
    },
    getMopidyObj: function(){
        return mopidy;
    },

    play: function() {
        mopidy.playback.play();
    },

    pause: function() {
        mopidy.playback.pause();
    },

    next: function() {
        mopidy.playback.next();
    },

    clear: function() {
        mopidy.tracklist.clear();
    },

    add: function(uri, callback) {
        var that = this;
        mopidy.tracklist.add({"tracks": null, "at_position": null, "uri": uri}).then(function(data){
            if (data.length > 0) {
                lastTrackIdAdded = data[0].tlid;
                console.log("Music added");
                that.getPlayerState(function(state){
                    if (state != "playing") {
                        that.play();
                    }
                });
                callback(data);
            } 
        });
    },

    getPlayerState: function(callback) {
        mopidy.playback.getState().then(function(data){
            console.log("Player state: "+ data);
            callback(data);
        });
    }
};

// ref.
// tracklist.next_track
// event:playbackStateChanged { old_state: 'stopped', new_state: 'playing' }
