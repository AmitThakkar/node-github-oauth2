/**
 * Created by amitthakkar on 13/07/16.
 */
'use strict';
// Dependencies
let nodeGithubOAuth2;

let initialize = (options) => {
    if (nodeGithubOAuth2) {
        return 'Already Initialized!';
    }
    nodeGithubOAuth2 = new NodeGithubOAuth2(options);
};

module.exports = {
    init: initialize,
    getRedirectURL: nodeGithubOAuth2.getRedirectURL,
    getToken: nodeGithubOAuth2.getToken,
    getUserDetails: nodeGithubOAuth2.getUserDetails,
    getEmailIds: nodeGithubOAuth2.getEmailIds,
    getOrganizations: nodeGithubOAuth2.getOrganizations,
    cloneProject: nodeGithubOAuth2.cloneProject,
    deleteGithubRepo: nodeGithubOAuth2.deleteGithubRepo,
    addCollaborator: nodeGithubOAuth2.addCollaborator,
    removeCollaborator: nodeGithubOAuth2.removeCollaborator,
    commitAndPush: nodeGithubOAuth2.commitAndPush,
    createRelease: nodeGithubOAuth2.createRelease
};