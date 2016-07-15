/**
 * Created by amitthakkar on 14/07/16.
 */
var express = require('express'),
    app = express();

var NodeGithubOAuth2 = require('node-github-oauth2')({
    clientId: 'ZZZZZZZZZZZZZZZZZZZZ',
    clientSecret: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    redirectURI: 'http://localhost:3000/callback',
    scope: 'repo,admin:org,delete_repo',
    userAgent: 'Github-Test-App',
    gitDirectory: '/Users/amitthakkar/My Stuff/Projects/OSP/'
});

// Initial page redirecting to Github
app.get('/auth', NodeGithubOAuth2.authorized);

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', NodeGithubOAuth2.getToken, function (request, response) {
    console.log(request.token)
    response.json(request.token);
}, function (error, request, res, next) {
    console.log('Access Token Error', error.message);
    res.json(error);
});

app.get('/', function (req, res) {
    res.send('Hello<br><a href="/auth">Log in with Github</a>');
});

app.get('/orgs', function (req, res) {
    NodeGithubOAuth2.getOrganizations({
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
        if(error) {
            res.json(result);
        } else {
            res.json(result);
        }
    });
});

app.listen(3000);

console.log('Express server started on port 3000');