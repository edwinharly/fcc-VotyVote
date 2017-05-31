'use strict';

var GitHubStrategy = require('passport-github').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var User = require('../models/users');
var configAuth = require('./auth');

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

	passport.use(new GitHubStrategy({
		clientID: configAuth.githubAuth.clientID,
		clientSecret: configAuth.githubAuth.clientSecret,
		callbackURL: configAuth.githubAuth.callbackURL
	},
	function (token, refreshToken, profile, done) {
		process.nextTick(function () {
			User.findOne({ 'github.id': profile.id }, function (err, user) {
				if (err) {
					return done(err);
				}

				if (user) {
					return done(null, user);
				} else {
					var newUser = new User();

					newUser.github.id = profile.id;
					newUser.github.username = profile.username;
					newUser.github.displayName = profile.displayName;
					newUser.github.publicRepos = profile._json.public_repos;
					newUser.nbrClicks.clicks = 0;

					newUser.save(function (err) {
						if (err) {
							throw err;
						}

						return done(null, newUser);
					});
				}
			});
		});
	}));
	
	passport.use(new TwitterStrategy({
	    consumerKey: configAuth.twitterAuth.clientID,
	    consumerSecret: configAuth.twitterAuth.clientSecret,
	    callbackURL: configAuth.twitterAuth.callbackURL
	},
	function(token, tokenSecret, profile, done) {
		
		process.nextTick(function () {
			// console.log(profile._json);
			// console.log(profile.name);
			// console.log(profile.displayName);
			User.findOne({ 'twitter.id': profile.id }, function (err, user) {
				if (err) {
					return done(err);
				}
	
				if (user) {
					return done(null, user);
				} else {
					var newUser = new User();
					// console.log(profile);
					newUser.twitter.id = profile._json.id;
					newUser.twitter.token = token;
					newUser.twitter.username = profile._json.screen_name;
					newUser.twitter.displayName = profile._json.name;
					// console.log(profile.name);
					// console.log(profile.displayName);
					// newUser.github.publicRepos = profile._json.public_repos;
					newUser.nbrClicks.clicks = 0;
	
					newUser.save(function (err) {
						if (err) {
							throw err;
						}
	
						return done(null, newUser);
					});
				}
				// return cb(err, user);
		    });	
		});
		
	    
		// User.findOne({ 'twitter.id': profile.id }, function (err, user) {
		// 	if (err) {
		// 		return done(err);
		// 	}

		// 	if (user) {
		// 		return done(null, user);
		// 	} else {
		// 		var newUser = new User();

		// 		newUser.github.id = profile.id;
		// 		newUser.github.username = profile.username;
		// 		newUser.github.displayName = profile.displayName;
		// 		newUser.github.publicRepos = profile._json.public_repos;
		// 		newUser.nbrClicks.clicks = 0;

		// 		newUser.save(function (err) {
		// 			if (err) {
		// 				throw err;
		// 			}

		// 			return done(null, newUser);
		// 		});
		// 	}
		// });
	}));
};
