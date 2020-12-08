#!/bin/bash
brew tap mongodb/brew
brew install mongodb-database-tools
cd dataloading/dataset
unzip resto.zip
mongoimport --db glue-demo --authenticationDatabase admin -u <your_username> -p <your_password> "<your_connection_uri>" restaurants.json
cd ../..
