/**
 * Created by amitthakkar on 13/07/16.
 */
'use strict';
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

let oauth2, clientId, clientSecret, redirectURI, scope, gitDirectory, github;

let isValidEmail = (email) => {
    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
};

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
    }

    getRedirectURL(state) {
        return oauth2.authCode.authorizeURL({
            redirect_uri: redirectURI,
            scope: scope,
            state: state
        });
    }

    getToken(request, response, next) {
        let code = request.query.code;
        let state = request.query.state;
        oauth2.authCode.getToken({
            code: code,
            redirect_uri: redirectURI
        }, (error, result) => {
            if (error) {
                next(error);
            } else {
                request.token = QUERY_STRING.parse(result).access_token;
                request.state = state;
                next();
            }
        });
    }

    authenicateGithubWithToken(token) {
        github.authenticate({
            type: "oauth",
            token: token
        });
    }

    getOrganizations(options, callback) {
        this.authenicateGithubWithToken(options.token);
        github.users.getOrgs({}, callback);
    }

    createRepoAndCloneProject(options, callback) {
        if (!options.token) {
            return callback('token is not present!');
        } else if (!options.org) {
            return callback('org is not present!');
        } else if (!options.name) {
            return callback('name is not present!');
        }
        this.authenicateGithubWithToken(options.token);
        github.repos.createForOrg({
            org: options.org,
            name: options.name,
            description: options.discription,
            private: options.private || false
        }, function (createRepoError) {
            if (createRepoError) {
                return callback(createRepoError);
            }
            let gitURL = 'https://' + options.token + '@github.com/' + options.org + '/' + options.name + '.git'
            const ls = SPAWN('git', ['clone', gitURL, gitDirectory + options.name]);
            let cloneResult = '', cloneError = '';
            ls.stdout.on('data', (data) => {
                cloneResult += data.toString();
            });
            ls.stderr.on('data', (err) => {
                cloneError += err.toString();
            });
            ls.on('close', (code) => {
                callback(null, cloneResult || cloneError, code);
            });
        })
    }

    deleteGithubRepo(options, callback) {
        if (!options.token) {
            return callback('token is not present!');
        } else if (!options.org) {
            return callback('org is not present!');
        } else if (!options.name) {
            return callback('name is not present!');
        }
        this.authenicateGithubWithToken(options.token);
        github.repos.delete({repo: options.name, user: options.org}, callback);
    }

    searchByEmail(options, callback) {
        if (!options.token) {
            return callback('token is not present!');
        } else if (!options.email) {
            return callback('email is not present!');
        }
        this.authenicateGithubWithToken(options.token);
        github.search.email({email: options.email}, callback);
    }

    addCollaborator(options, callback) {
        if (!options.token) {
            return callback('token is not present!');
        } else if (!options.collabuser) {
            return callback('collabuser is not present!');
        } else if (!options.user) {
            return callback('user is not present!');
        } else if (!options.repo) {
            return callback('repo is not present!');
        } else if (!options.permission) {
            return callback('permission is not present!');
        }
        if (isValidEmail(options.collabuser)) {
            this.searchByEmail({
                token: options.token,
                email: options.collabuser
            }, (error, result) => {
                this.authenicateGithubWithToken(options.token);
                github.repos.addCollaborator({
                    user: options.user,
                    repo: options.repo,
                    collabuser: result.user.login,
                    permission: options.permission
                }, callback);
            });
        } else {
            this.authenicateGithubWithToken(options.token);
            github.repos.addCollaborator({
                user: options.user,
                repo: options.repo,
                collabuser: options.collabuser,
                permission: options.permission
            }, callback);
        }
    }

    removeCollaborator(options, callback) {
        if (!options.token) {
            return callback('token is not present!');
        } else if (!options.collabuser) {
            return callback('collabuser is not present!');
        } else if (!options.user) {
            return callback('user is not present!');
        } else if (!options.repo) {
            return callback('repo is not present!');
        }
        if (isValidEmail(options.collabuser)) {
            this.searchByEmail({
                token: options.token,
                email: options.collabuser
            }, (error, result) => {
                this.authenicateGithubWithToken(options.token);
                github.repos.removeCollaborator({
                    user: options.user,
                    repo: options.repo,
                    collabuser: result.user.login
                }, callback);
            });
        } else {
            this.authenicateGithubWithToken(options.token);
            github.repos.removeCollaborator({
                user: options.user,
                repo: options.repo,
                collabuser: options.collabuser
            }, callback);
        }
    }

    commitAndPush(options, callback) {
        if (!options.name) {
            return callback('name is not present!');
        } else if (!options.username) {
            return callback('username is not present!');
        } else if (!options.email) {
            return callback('email is not present!');
        } else if (!options.commitMessage) {
            return callback('commitMessage is not present!');
        }
        const gitCommand = SPAWN(['source', '../scripts/commitAndPush.sh', gitDirectory + options.name, options.username, options.email, options.commitMessage].join(' '));
        gitCommand.stdout.on('data', (data) => {
            callback(null, data.toString());
        });
        gitCommand.stderr.on('data', (error) => {
            callback(error.toString());
        });
        gitCommand.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    }

    getUser(options, callback) {
        if (!options.token) {
            return callback('token is not present!');
        }
        this.authenicateGithubWithToken(options.token);
        github.users.get({}, callback);
    }
}

module.exports = function (options) {
    return new NodeGithubOAuth2(options);
};