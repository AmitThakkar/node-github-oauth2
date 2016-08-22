/**
 * Created by amitthakkar on 13/07/16.
 */
'use strict';
// Dependencies
const QUERY_STRING = require('querystring');
const GitClient = require('./git-client');

let gitClient;

class NodeGithubOAuth2 {
    initialize(options) {
        if (gitClient) {
            return 'Already Initialized!';
        }
        if (!options.clientId) {
            throw new Error('clientId is not present!');
        } else if (!options.clientSecret) {
            throw new Error('clientSecret is not present!');
        } else if (!options.redirectURI) {
            throw new Error('redirectURI is not present!');
        } else if (!options.scope) {
            throw new Error('scope is not present!');
        } else if (!options.gitDirectory) {
            throw new Error('gitDirectory is not present!');
        } else if (!options.userAgent) {
            throw new Error('userAgent is not present!');
        }
        gitClient = new GitClient(options);
    }

    getRedirectURL(state) {
        if (!state) {
            return 'state is not present!';
        }
        return gitClient.getRedirectURL(state);
    }

    getToken(request, response, next) {
        let code = request.query.code;
        let state = request.query.state;
        if (!code) {
            return next('code is not present!');
        } else if (!state) {
            return next('state is not present!');
        }
        gitClient.getToken(code, (error, result) => {
            if (error) {
                next(error);
            } else {
                request.token = QUERY_STRING.parse(result).access_token;
                request.state = state;
                next();
            }
        });
    }

    getUserDetails(options, callback) {
        if (!options.token) {
            return callback('token is not present!');
        }
        gitClient.getUserDetails(options, callback);
    }

    getEmailIds(options, callback) {
        if (!options.token) {
            return callback('token is not present!');
        }
        gitClient.getEmailIds(options, callback);
    }

    getOrganizations(options, callback) {
        if (!options.token) {
            return callback('token is not present!');
        }
        gitClient.getOrganizations(options, callback);
    }

    cloneProject(options, callback) {
        if (!options.token) {
            return callback('token is not present!');
        } else if (!options.org) {
            return callback('org is not present!');
        } else if (!options.name) {
            return callback('name is not present!');
        }
        gitClient.cloneProject(options, callback);
    }

    deleteGithubRepo(options, callback) {
        if (!options.token) {
            return callback('token is not present!');
        } else if (!options.org) {
            return callback('org is not present!');
        } else if (!options.name) {
            return callback('name is not present!');
        }
        gitClient.deleteGithubRepo(options, callback);
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
        switch (options.permission) {
            case 'admin':
                options.permission = 'admin';
                break;
            case 'write':
                options.permission = 'push';
                break;
            case 'read':
                options.permission = 'pull';
                break;
        }
        gitClient.addCollaborator(options, callback)
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
        gitClient.removeCollaborator(options, callback)
    }

    commitAndPush(options, callback) {
        if (!options.token) {
            return callback('token is not present!');
        } else if (!options.name) {
            return callback('name is not present!');
        } else if (!options.username) {
            return callback('username is not present!');
        } else if (!options.email) {
            return callback('email is not present!');
        } else if (!options.commitMessage) {
            return callback('commitMessage is not present!');
        } else if (!options.org) {
            return callback('org is not present!');
        }
        gitClient.commitAndPush(options, callback)
    }

    createRelease(options, callback) {
        if (!options.token) {
            return callback('token is not present!');
        } else if (!options.user) {
            return callback('user is not present!');
        } else if (!options.repo) {
            return callback('repo is not present!');
        } else if (!options.tag_name) {
            return callback('tag_name is not present!');
        }
        gitClient.createRelease(options, callback)
    }

    updateProject(options, callback) {
        if (!options.token) {
            return callback('token is not present!');
        } else if (!options.name) {
            return callback('name is not present!');
        } else if (!options.username) {
            return callback('username is not present!');
        } else if (!options.org) {
            return callback('org is not present!');
        }
        gitClient.updateProject(options, callback)
    }
}

module.exports = new NodeGithubOAuth2();