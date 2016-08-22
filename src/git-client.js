/**
 * Created by amitthakkar on 09/08/16.
 */
'use strict';
const SIMPLE_OAUTH2 = require('simple-oauth2');
const RANDOM_STRING = require("randomstring");
const GITHUB = require("github");
const EXEC = require('child_process').exec;
const BLUE_BIRD = require('bluebird');

// Constants
const PROTOCOL = 'https';
const HOST = 'api.github.com';
const GITHUB_LOGIN_URL = PROTOCOL + '://github.com/login';
const OAUTH_ACCESS_TOKEN_PATH = '/oauth/access_token';
const OAUTHORIZATION_PATH = '/oauth/authorize';
const SPACE_REGEX = / /g;
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const SPACE_REPLACER = '\\ ';

let oauth2, clientId, clientSecret, redirectURI, scope, gitDirectory, github;

let isValidEmail = (email) => {
    return EMAIL_REGEX.test(email);
};

let replaceSpaceInPath = (path) => {
    return path.replace(SPACE_REGEX, SPACE_REPLACER);
};

class GitClient {
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

    authenicateGithubWithToken(token) {
        github.authenticate({
            type: "oauth",
            token: token
        });
    }

    getRedirectURL(state) {
        return oauth2.authCode.authorizeURL({
            redirect_uri: redirectURI,
            scope: scope,
            state: state
        });
    }

    getToken(code, callback) {
        oauth2.authCode.getToken({
            code: code,
            redirect_uri: redirectURI
        }, callback);
    }

    getUserDetails(options, callback) {
        this.authenicateGithubWithToken(options.token);
        github.users.get({}, callback);
    }

    getEmailIds(options, callback) {
        this.authenicateGithubWithToken(options.token);
        github.users.getEmails({}, callback);
    }

    getOrganizations(options, callback) {
        this.authenicateGithubWithToken(options.token);
        github.users.getOrgs({}, callback);
    }

    cloneProject(options, callback, protocol) {
        let _this = this;
        let urlProtocol;
        if (protocol) {
            urlProtocol = protocol;
        } else {
            urlProtocol = 'https';
        }
        let gitURL = urlProtocol + '://' + options.token + ':x-oauth-basic@github.com/' + options.org + '/' + options.name + '.git';
        EXEC([
            'git',
            'clone',
            gitURL,
            replaceSpaceInPath(gitDirectory + options.name)
        ].join(' '), function (error, stdout, stderr) {
            console.log('Clone Result:', stderr, stdout);
            if (error && !protocol) {
                _this.cloneProject(options, callback, 'http');
            } else {
                callback(error, stdout, stderr);
            }
        });
    }

    deleteGithubRepo(options, callback) {
        this.authenicateGithubWithToken(options.token);
        github.repos.delete({repo: options.name, user: options.org}, callback);
    }

    addCollaborator(options, callback) {
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
        let remoteURL = 'https://' + options.token + ':x-oauth-basic@github.com/' + options.org + '/' + options.name + '.git';
        EXEC([
            '/bin/sh',
            replaceSpaceInPath(__dirname + '/../scripts/commitAndPush.sh'),
            replaceSpaceInPath(gitDirectory + options.name),
            options.username,
            options.email,
            replaceSpaceInPath(options.commitMessage),
            remoteURL
        ].join(' '), function (error, stdout, stderr) {
            console.log('Commit And Push Result:', stderr, stdout);
            callback(error, stdout, stderr);
        });
    }

    createRelease(options, callback) {
        this.authenicateGithubWithToken(options.token);
        github.repos.createRelease({
            user: options.user,
            repo: options.repo,
            tag_name: options.tag_name
        }, callback);
    }

    updateProject(options, callback) {
        let remoteURL = 'https://' + options.token + ':x-oauth-basic@github.com/' + options.org + '/' + options.name + '.git';
        EXEC([
            '/bin/sh',
            replaceSpaceInPath(__dirname + '/../scripts/pull.sh'),
            replaceSpaceInPath(gitDirectory + options.name),
            options.username,
            remoteURL
        ].join(' '), function (error, stdout, stderr) {
            console.log('Pull Result:', stderr, stdout);
            callback(error, stdout, stderr);
        });
    }

    createRepo(options, callback) {
        this.authenicateGithubWithToken(options.token);
        github.repos.createForOrg({
            org: options.org,
            name: options.name,
            description: options.discription,
            private: options.private || false
        }, callback);
    }

    createRepoAndCloneProject(options, callback) {
        if (!options.token) {
            return callback('token is not present!');
        } else if (!options.org) {
            return callback('org is not present!');
        } else if (!options.name) {
            return callback('name is not present!');
        }
        this.createRepo(options, (createRepoError) => {
            if (createRepoError) {
                return callback(createRepoError);
            }
            this.cloneProject(options, callback);
        });
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
}

module.exports = GitClient;