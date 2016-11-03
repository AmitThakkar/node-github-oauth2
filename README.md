# Node Github oauth2

This repository contains node module for authenticating with github and interacting with github.

Demo: 
-----

```JavaScipt
/**
 * Created by amitthakkar on 14/07/16.
 */
var express = require('express'),
    app = express();

const NodeGithubOAuth2 = require('node-github-oauth2');
NodeGithubOAuth2.initialize({
    clientId: 'ZZZZZZZZZZZZZZZZZZZZ',
    clientSecret: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    redirectURI: 'http://localhost:3000/callback',
    scope: 'repo,admin:org,delete_repo',
    userAgent: 'Github-Test-App',
    gitDirectory: '/Users/amitthakkar/My Stuff/Projects/OSP/'
});

// Initial page redirecting to Github
exports.authorized = (request, response) => {
    response.status(200).json({redirectURL: NodeGithubOAuth2.getRedirectURL(request.user._id.toString())});
};

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', NodeGithubOAuth2.getToken, function (request, response) {
    console.log(request.token)
    response.json(request.token);
}, function (error, request, res, next) {
    console.log('Access Token Error', error.message);
    res.json(error);
});


exports.authorizedCallback = [NodeGithubOAuth2.getToken, (request, response) => {
    let token = request.token;
    let _id = request.state;
    NodeGithubOAuth2.getUserDetails({
        token: token
    }, (error, user) => {
        if (!user.email) {
            NodeGithubOAuth2.getEmailIds({
                token: token
            }, (error, emailIds) => {
                let emailId = emailIds.filter((email) => {
                    return email.primary;
                })[0];
                // User Details
                console.log({
                    token: token,
                    username: user.login,
                    email: emailId.email
                });
            });
        } else {
            console.log({
                token: token,
                username: user.login,
                email: emailId.email
            });
        }
    });
}];

app.get('/', function (req, res) {
    res.send('Hello<br><a href="/auth">Log in with Github</a>');
});

app.get('/orgs', function (req, res) {
    NodeGithubOAuth2.getOrganization({
        token: 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY'
    }, function (error, result) {
        res.json(result);
    });
});

app.get('/createProject', function (req, res) {
    NodeGithubOAuth2.createRepoAndCloneProject({
        token: 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
        org: 'OrganizationName',
        name: 'ngt1',
        description: 'Node-Git-Test-2',
        private: true
    }, function (error, result) {
        res.json(result);
    });
});

app.get('/cloneProject', function (req, res) {
    NodeGithubOAuth2.cloneProject({
        token: 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
        org: 'OrganizationName',
        name: 'ngt1',
        description: 'Node-Git-Test-2',
        private: true
    }, function (error, result) {
        res.json(result);
    });
});

app.get('/deleteProject', function (req, res) {
    NodeGithubOAuth2.deleteGithubRepo({
        token: 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
        org: 'OrganizationName',
        name: 'ngt1'
    }, function (error, result) {
        res.json(result);
    });
});

app.get('/addCollaborators', function (req, res) {
    NodeGithubOAuth2.addCollaborators({
        token: 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
        user: 'OrganizationName',
        repo: 'ngt1',
        collabuser: 'NamitaMalik',
        permission: 'admin'
    }, function (error, result) {
        if (error) {
            res.json(result);
        } else {
            res.json(result);
        }
    });
});

app.get('/removeCollaborator', function (req, res) {
    NodeGithubOAuth2.removeCollaborator({
        token: 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
        user: 'OrganizationName',
        repo: 'ngt1',
        collabuser: 'NamitaMalik'
    }, function (error, result) {
        if (error) {
            res.json(result);
        } else {
            res.json(result);
        }
    });
});

app.get('/commitAndPush', function (req, res) => {
    NodeGithubOAuth2.commitAndPush({
        token: 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
        email: 'vigildbest@gmail.com',
        name: 'projectName',
        username: 'AmitThakkar',
        org: 'NA',
        commitMessage: 'Commit by Wize Server'
    }, (error, result) => {
        NodeGithubOAuth2.createRelease({
            token: options.github.token,
            user: options.org,
            repo: options.name,
            tag_name: options.tag
        }, function (error, result) {
            res.json(result);
        });
    });
});

exports.updateProject = (req, res) => {
    NodeGithubOAuth2.updateProject({
        token: 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
        name: 'projectName',
        username: 'AmitThakkar',
        org: 'NA'
    }, function (error, result) {
        res.json(result);
    });
};

app.listen(3000);

console.log('Express server started on port 3000');
```