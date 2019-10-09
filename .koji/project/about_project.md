## About the project Directory

This directory holds all of the neccesary files for your web app to work in koji.
Without this directory, Koji won't know how to build or display your app.

### deploy.json

deploy.json describes to koji what sort of setup and commands should be executed in order
to put your app onto a production server. In this file you can set up compilation commands
as well as domain setup and deployment targets.

### develop.json

develop.json tells the koji editor what sort of develpment servers to create to let you
run and test your app in real time. Make sure the configuration here matches what your app
is running.

### metadata.json

metadata.json describes what this app should look like to other servers like facebook
and google. In this file you can set the title that will show up on the top of the page
as well as what will show up in a google search or a facebook share.
