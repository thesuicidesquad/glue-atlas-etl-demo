#
# Example Terraform Config to create a
# MongoDB Atlas Project, Cluster,
# Database User and Project IP Whitelist Entry
#
# First step is to create a MongoDB Atlas account
# https://docs.atlas.mongodb.com/tutorial/create-atlas-account/
#
# Then create an organization and programmatic API key
# https://docs.atlas.mongodb.com/tutorial/manage-organizations
# https://docs.atlas.mongodb.com/tutorial/manage-programmatic-access
#
# Terraform MongoDB Atlas Provider Documentation
# https://www.terraform.io/docs/providers/mongodbatlas/index.html
# Terraform 0.12+, MongoDB Atlas Provider 0.4.2+

#
#  Local Variables
#  You may want to put these in a variables.tf file
#  Do not check a file containing these variables in a public repository

locals {
  # Replace ORG_ID, PUBLIC_KEY and PRIVATE_KEY with your Atlas variables
  mongodb_atlas_api_pub_key = var.atlaspubkey
  mongodb_atlas_api_pri_key = var.atlasprikey
  mongodb_atlas_org_id      = var.orgid

  # Replace USERNAME And PASSWORD with what you want for your database user
  # https://docs.atlas.mongodb.com/tutorial/create-mongodb-user-for-cluster/
  mongodb_atlas_database_username      = var.mongouname
  mongodb_atlas_database_user_password = var.mongopw

  # Replace IP_ADDRESS with the IP Address from where your application will connect
  # https://docs.atlas.mongodb.com/tutorial/whitelist-connection-ip-address/
  mongodb_atlas_whitelistip = var.mongoallowip

  # AWS Account ID and VPC ID
  aws_account_id = var.awsacctid
  aws_vpc_id     = var.awsvpcid
}

#
# Configure the MongoDB Atlas Provider
#
provider "mongodbatlas" {
  public_key  = local.mongodb_atlas_api_pub_key
  private_key = local.mongodb_atlas_api_pri_key
}

#
# Create a Project
#
resource "mongodbatlas_project" "glue_mongodb_demo_pj" {
  name   = "glue-mongodb-demo-pj"
  org_id = local.mongodb_atlas_org_id
}

# Create VPC Peering

# This specifies the peering request

# Atlas has a default CIDR block of 192.168.248.0/21, change if you require a different one
resource "mongodbatlas_network_peering" "awsvpcpeering" {
  accepter_region_name   = "us-west-2"
  project_id             = mongodbatlas_project.glue_mongodb_demo_pj.id
  container_id           = mongodbatlas_cluster.my_cluster.container_id
  provider_name          = "AWS"
  route_table_cidr_block = "10.0.0.0/16"
  vpc_id                 = local.aws_vpc_id
  aws_account_id         = local.aws_account_id
  atlas_cidr_block       = "172.16.0.0/12"
}

#
# Create an Atlas Cluster
#
resource "mongodbatlas_cluster" "my_cluster" {
  project_id = mongodbatlas_project.glue_mongodb_demo_pj.id
  name       = "glue-mongodb-demo-cluster"

  # Provider Settings "block"
  provider_name = "AWS"

  # AWS - US_EAST_1 US_WEST_2 EU_WEST_1 EU_CENTRAL_1 AP_SOUTH_1 AP_SOUTHEAST_1 AP_SOUTHEAST_2
  provider_region_name = "US_WEST_2"

  # Free tier is avoided, so we choose M20, feel free to pick any other instance inze
  provider_instance_size_name = "M20"

  # If select M2 must be 2, if M5 must be 5
  disk_size_gb = "20"

  # Will not change till new version of MongoDB but must be included
  mongo_db_major_version       = "3.6"
  auto_scaling_disk_gb_enabled = "false"
}

#
# Create an Atlas Admin Database User
#
resource "mongodbatlas_database_user" "demo_user" {
  username           = local.mongodb_atlas_database_username
  password           = local.mongodb_atlas_database_user_password
  project_id         = mongodbatlas_project.glue_mongodb_demo_pj.id
  auth_database_name = "admin"

  roles {
    role_name     = "atlasAdmin"
    database_name = "admin"
  }
}

#
# Create an IP Whitelist
#
# can also take a CIDR block or AWS Security Group -
# replace ip_address with either cidr_block = "CIDR_NOTATION"
# or aws_security_group = "SECURITY_GROUP_ID"
#
resource "mongodbatlas_project_ip_whitelist" "my_ipaddress" {
  project_id = mongodbatlas_project.glue_mongodb_demo_pj.id
  ip_address = local.mongodb_atlas_whitelistip
  comment    = "My IP Address"
}

resource "mongodbatlas_project_ip_whitelist" "vpc_cidr" {
  project_id = mongodbatlas_project.glue_mongodb_demo_pj.id
  cidr_block = "10.0.0.0/16"
  comment    = "VPC CIDR Block"
}


# Use terraform output to display connection strings.
output "connection_strings" {
  value = [mongodbatlas_cluster.my_cluster.connection_strings]
}
