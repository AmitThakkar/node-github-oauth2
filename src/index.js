/**
 * Created by amitthakkar on 13/07/16.
 */
// Dependencies
const SIMPLE_OAUTH2 = require('simple-oauth2');
const RANDOM_STRING = require("randomstring");

// Constants
const GITHUB_LOGIN_URL = 'https://github.com/login';
const OAUTH_ACCESS_TOKEN_PATH = '/oauth/access_token';
const OAUTHORIZATION_PATH = '/oauth/authorize';

class NodeGithubOAuth {
    constructor(options) {
        this.clientId = options.clientId;
        this.clientSecret = options.clientSecret;
        this.redirectURI = options.redirectURI;
        this.scope = options.scope;
        this.initialize();
    }

    initialize() {
        let randomString = RANDOM_STRING.generate({});
        this.oauth2 = SIMPLE_OAUTH2({
            clientID: this.clientId,
            clientSecret: this.clientSecret,
            site: GITHUB_LOGIN_URL,
            tokenPath: OAUTH_ACCESS_TOKEN_PATH,
            authorizationPath: OAUTHORIZATION_PATH
        });
        this.authorization_uri = oauth2.authCode.authorizeURL({
            redirect_uri: this.redirectURI,
            scope: this.scope,
            state: randomString
        });
    }
}

exports = module.exports = function (options) {
    return new NodeGithubOAuth(options);
};