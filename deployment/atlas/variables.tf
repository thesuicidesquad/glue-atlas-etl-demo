variable "atlaspubkey" {
    type = string
    description = "Public API key for your Atlas Organization"
}

variable "atlasprikey" {
    type = string
    description = "Private API key for your Atlas Organization"
}

variable "orgid" {
    type = string
    description = "ID of your Atlas Organization"
}

variable "mongouname" {
    type = string
    description = "Desired username for your Atlas Database"
}

variable "mongopw" {
    type = string
    description = "Desired password for your Atlas Database"
}

variable "mongoallowip" {
    type = string
    description = "IP you wish to whitelist for your Atlas Cluster"
}

variable "awsacctid" {
    type = string
    description = "Your AWS Account ID"
}

variable "awsvpcid" {
    type = string
    description = "Your AWS VPC ID to initate peering with"
}