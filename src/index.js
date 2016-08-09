/**
 * Created by amitthakkar on 13/07/16.
 */
'use strict';
// Dependencies
let GitClient = require('./git-client');
let gitClient;

class NodeGithubOAuth2 {
    initialize(options) {
        if (gitClient) {
            return 'Already Initialized!';
        }
        gitClient = new GitClient(options);
    }

    getRedirectURL() {
        gitClient.getRedirectURL();
    }

    getToken() {
        gitClient.getToken();
    }

    getUserDetails() {
        gitClient.getUserDetails();
    }

    getEmailIds() {
        gitClient.getEmailIds();
    }

    getOrganizations() {
        gitClient.getOrganizations();
    }

    cloneProject() {
        gitClient.cloneProject();
    }

    deleteGithubRepo() {
        gitClient.deleteGithubRepo();
    }

    addCollaborator() {
        gitClient.addCollaborator()
    }

    removeCollaborator() {
        gitClient.removeCollaborator()
    }

    commitAndPush() {
        gitClient.commitAndPush()
    }

    createRelease() {
        gitClient.createRelease()
    }
}

module.exports = new NodeGithubOAuth2();