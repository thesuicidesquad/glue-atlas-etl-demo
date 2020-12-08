#!/bin/bash
terraform init
terraform plan -var-file atlas.tfvars -out .tfstate
terraform apply ".tfstate"