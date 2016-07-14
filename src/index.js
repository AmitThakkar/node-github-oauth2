/**
 * Created by amitthakkar on 13/07/16.
 */
// Dependencies
const SIMPLE_OAUTH2 = require('simple-oauth2');
const RANDOM_STRING = require("randomstring");
const QUERY_STRING = require('querystring');
const GITHUB = require("github");
const SPAWN = require('child_process').spawn;
const BLUE_BIRD = require('bluebird');

// Constants
const PROTOCOL = 'https';
const HOST = 'api.github.com';
const GITHUB_LOGIN_URL = PROTOCOL + '://github.com/login';
const OAUTH_ACCESS_TOKEN_PATH = '/oauth/access_token';
const OAUTHORIZATION_PATH = '/oauth/authorize';

let oauth2, redirectURL, clientId, clientSecret, redirectURI, scope, gitDirectory, github;

class NodeGithubOAuth2 {
    constructor(options) {
        clientId = options.clientId;
        clientSecret = options.clientSecret;
        redirectURI = options.redirectURI;
        scope = options.scope;
        gitDirectory = options.gitDirectory;
        github = new GITHUB({
            protocol: PROTOCOL,
            host: HOST,
            pathPrefix: "",
            headers: {
                "user-agent": options.userAgent
            },
            Promise: BLUE_BIRD,
            followRedirects: false,
            timeout: 5000
        });
        this.initialize();
    }

    initialize() {
        let randomString = RANDOM_STRING.generate({});
        oauth2 = SIMPLE_OAUTH2({
            clientID: clientId,
            clientSecret: clientSecret,
            site: GITHUB_LOGIN_URL,
            tokenPath: OAUTH_ACCESS_TOKEN_PATH,
            authorizationPath: OAUTHORIZATION_PATH
        });
        redirectURL = oauth2.authCode.authorizeURL({
            redirect_uri: redirectURI,
            scope: scope,
            state: randomString
        });
    }

    authorized(request, response) {
        response.redirect(redirectURL);
    }

    getToken(request, response, next) {
        var code = request.query.code;
        oauth2.authCode.getToken({
            code: code,
            redirect_uri: redirectURI
        }, (error, result) => {
            if (error) {
                next(error);
            } else {
                request.token = QUERY_STRING.parse(result).access_token;
                next();
            }
        });
    }

    // TODO execute synchronize
    getOrganizations(options, callback) {
        github.authenticate({
            type: "oauth",
            token: options.token
        });
        github.users.getOrgs({}, callback);
    }

    createRepoAndCloneProject(options, callback) {
        github.authenticate({
            type: "oauth",
            token: options.token
        });
        github.repos.createForOrg({
            org: options.org,
            name: options.name,
            description: options.discription,
            private: options.private || false
        }, function (err, result) {
            let gitURL = 'https://' + options.token + '@github.com/' + options.org + '/' + options.name + '.git'
            const ls = SPAWN('git', ['clone', gitURL, gitDirectory + options.name]);

            ls.stdout.on('data', (data) => {
                callback(null, data);
            });

            ls.stderr.on('data', (data) => {
                callback(data);
            });

            ls.on('close', (code) => {
                dubug(`child process exited with code ${code}`);
            });
        })
    }
}

exports = module.exports = function (options) {
    return new NodeGithubOAuth2(options);
};