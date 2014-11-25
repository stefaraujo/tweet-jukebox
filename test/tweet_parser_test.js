var assert = require("assert");

var config = require('../config');
var tweetParser = require("../libs/tweet_parser");

describe('libs/tweet_parser', function(){

  describe('token verification', function(){

    it('should parse token verification requests', function() {
        tweet = {
            text: "@" + config.twitter.jukebox + " 1234",
            user: { screen_name: "lfcipriani"},
            id_str: "1234567"
        };

        var result = tweetParser.parse(tweet);

        assert.equal(result.type, "TOKEN");
        assert.equal(result.param, "1234");
    });

  });

  describe('URL parsing', function(){
    
    it('should parse links from youtube', function() {
        tweet = {
            text: "@" + config.twitter.jukebox + " play ",
            user: { screen_name: "lfcipriani"},
            id_str: "1234567",
            "entities": {
                "urls": [
                    {
                        "indices": [76,97],
                        "display_url": "dev.twitter.com/terms/display-…",
                        "expanded_url": "https://www.youtube.com/watch?v=wZZ7oFKsKzY",
                        "url": "https://t.co/Ed4omjYs"
                    }
                ]
            }
        };

        var result = tweetParser.parse(tweet);

        assert.equal(result.type, "LINK");
        assert.equal(result.param["youtube"], "wZZ7oFKsKzY");
    });

    it('should parse links from spotify', function() {
        tweet = {
            text: "@" + config.twitter.jukebox + " play ",
            user: { screen_name: "lfcipriani"},
            id_str: "1234567",
            "entities": {
                "urls": [
                    {
                        "indices": [76,97],
                        "display_url": "dev.twitter.com/terms/display-…",
                        "expanded_url": "http://open.spotify.com/track/4v0tapCyBcdyEbIpd1zZGU",
                        "url": "https://t.co/Ed4omjYs"
                    }
                ]
            }
        };

        var result = tweetParser.parse(tweet);

        assert.equal(result.type, "LINK");
        assert.equal(result.param["spotify"], "4v0tapCyBcdyEbIpd1zZGU");
    });

    it('should parse links from soundcloud', function() {
        tweet = {
            text: "@" + config.twitter.jukebox + " play madonna",
            user: { screen_name: "lfcipriani"},
            id_str: "1234567",
            "entities": {
                "urls": [
                    {
                        "indices": [76,97],
                        "display_url": "dev.twitter.com/terms/display-…",
                        "expanded_url": "https://soundcloud.com/lfcipriani/beastie-boys-i-dontt-know",
                        "url": "https://t.co/Ed4omjYs"
                    }
                ]
            }
        };

        var result = tweetParser.parse(tweet);

        assert.equal(result.type, "LINK");
        assert.equal(result.param["soundcloud"], "lfcipriani/beastie-boys-i-dontt-know");
    });

  });

  describe('Search', function(){

    it('replaceWithSpaces', function() {
        var result = tweetParser.replaceWithSpaces("@testando_123 play like a virgin by madonna",0,13);
        assert.equal(result, "              play like a virgin by madonna");
    
        var result = tweetParser.replaceWithSpaces("@testando_1234play5like a virgin by madonna",14,18);
        assert.equal(result, "@testando_1234    5like a virgin by madonna");

        var result = tweetParser.replaceWithSpaces("@testando_123 play like a virgin by madonna",36,43);
        assert.equal(result, "@testando_123 play like a virgin by        ");
    });

    it('should parse search requests for music', function() {
        tweet = {
            text: "@" + config.twitter.jukebox + " play like a virgin by madonna",
            user: { screen_name: "lfcipriani"},
            id_str: "1234567",
            entities: {
                "urls": [],
                "user_mentions": [
                {
                    "indices": [0,13],
                    "id_str": "76140129",
                    "id": 76140129,
                    "name": "Testando 1, 2, 3",
                    "screen_name": "testando_123"
                }
                ],
                "symbols": [],
                "hashtags": []
            }
        };
        var result = tweetParser.parse(tweet);

        assert.equal(result.type, "SEARCH");
        assert.notEqual(result.param["query"]["any"].indexOf("like a virgin"), -1);
        assert.notEqual(result.param["query"]["artist"].indexOf("madonna"), -1);

        tweet = {
            text: "@" + config.twitter.jukebox + " play like a virgin",
            user: { screen_name: "lfcipriani"},
            id_str: "1234567",
            entities: {
                "urls": [],
                "user_mentions": [
                {
                    "indices": [0,13],
                    "id_str": "76140129",
                    "id": 76140129,
                    "name": "Testando 1, 2, 3",
                    "screen_name": "testando_123"
                }
                ],
                "symbols": [],
                "hashtags": []
            }
        };
        var result = tweetParser.parse(tweet);

        assert.equal(result.type, "SEARCH");
        assert.notEqual(result.param["query"]["any"].indexOf("like a virgin"), -1);
        assert.equal(result.param["query"]["artist"], undefined);

        tweet = {
            text: "@" + config.twitter.jukebox + " play by madonna",
            user: { screen_name: "lfcipriani"},
            id_str: "1234567",
            entities: {
                "urls": [],
                "user_mentions": [
                {
                    "indices": [0,13],
                    "id_str": "76140129",
                    "id": 76140129,
                    "name": "Testando 1, 2, 3",
                    "screen_name": "testando_123"
                }
                ],
                "symbols": [],
                "hashtags": []
            }
        };
        var result = tweetParser.parse(tweet);

        assert.equal(result.type, "SEARCH");
        assert.equal(result.param["query"]["any"], undefined);
        assert.notEqual(result.param["query"]["artist"].indexOf("madonna"), -1);

        tweet = {
            text: "@" + config.twitter.jukebox + " play like a virgin by madonna",
            user: { screen_name: "lfcipriani"},
            id_str: "1234567",
            "entities": {
                "urls": [],
                "user_mentions": [
                {
                    "indices": [
                    0,
                    13
                    ],
                    "id_str": "76140129",
                    "id": 76140129,
                    "name": "Testando 1, 2, 3",
                    "screen_name": "testando_123"
                }
                ],
                "symbols": [],
                "hashtags": [
                {
                    "indices": [
                    44,
                    52
                    ],
                    "text": "youtube"
                }
                ]
            },
        };

        var result = tweetParser.parse(tweet);

        assert.equal(result.type, "SEARCH");
        assert.notEqual(result.param["uris"][0].indexOf("youtube"), -1);

        tweet = {
            text: "@" + config.twitter.jukebox + " play like a virgin by madonna",
            user: { screen_name: "lfcipriani"},
            id_str: "1234567",
            "entities": {
                "urls": [],
                "user_mentions": [
                {
                    "indices": [
                    0,
                    13
                    ],
                    "id_str": "76140129",
                    "id": 76140129,
                    "name": "Testando 1, 2, 3",
                    "screen_name": "testando_123"
                }
                ],
                "symbols": [],
                "hashtags": [
                {
                    "indices": [
                    44,
                    52
                    ],
                    "text": "youtube"
                },
                {
                    "indices": [
                    53,
                    64
                    ],
                    "text": "soundcloud"
                }
                ]
            },
        };
        var result = tweetParser.parse(tweet);

        assert.equal(result.type, "SEARCH");
        assert.notEqual(result.param["uris"][0].indexOf("youtube"), -1);
        assert.equal(result.param["uris"].length, 2);

        tweet = {
            text: "@" + config.twitter.jukebox + "",
            user: { screen_name: "lfcipriani"},
            id_str: "1234567",
            entities: {
                "urls": [],
                "user_mentions": [
                {
                    "indices": [0,13],
                    "id_str": "76140129",
                    "id": 76140129,
                    "name": "Testando 1, 2, 3",
                    "screen_name": "testando_123"
                }
                ],
                "symbols": [],
                "hashtags": []
            }
        };
        var result = tweetParser.parse(tweet);

        assert.equal(result, null);

    });

  });

});
