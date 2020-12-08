import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as s3 from "@aws-cdk/aws-s3";

export class GlueDemoInfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // Create a VPC
    const vpc = new ec2.Vpc(this, "glue-atlas-demo-vpc-1", {
      cidr: "10.0.0.0/16",
      maxAzs: 1,
      subnetConfiguration: [
        {
          name: "public-subnet",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: "private-subnet",
          subnetType: ec2.SubnetType.PRIVATE,
          cidrMask: 24,
        },
      ],
      enableDnsHostnames: true,
      enableDnsSupport: true,
    });

    // Create S3 Endpoint in our VPC for Glue to access target S3 bucket
    // This endpoint is only accessible from the private subnets
    vpc.addGatewayEndpoint("glue-vpc-s3-ep", {
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [
        {
          subnetType: ec2.SubnetType.PRIVATE,
        },
        {
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // Create S3 bucket to store ETL output data
    const targetBucket = new s3.Bucket(this, "glue-demo-etl-tgt-bucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // Create security group for Glue to access Atlas
    const glueSG = new ec2.SecurityGroup(this, "glueSG", {
      vpc,
      securityGroupName: "glueSG",
    });

    // Add a self-referenced inbound rule within the security group
    glueSG.addIngressRule(glueSG, ec2.Port.allTcp());

    // Create security group for Sagemaker notebook instance we will use later
    const sagemakerSG = new ec2.SecurityGroup(this, "notebookSG", {
      vpc,
      securityGroupName: "notebookSG",
    });
    // Add an inbound rule allowing traffic from public subnet where we will deploy a SageMaker notebook instance
    sagemakerSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22));
    sagemakerSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));
    sagemakerSG.addIngressRule(sagemakerSG, ec2.Port.allTcp());

    // glueSG.addEgressRule(Peer.ipv4("172.16.100.0/24"), ec2.Port.tcpRange(27015, 27017));

    new cdk.CfnOutput(this, "vpc-id", {
      exportName: "vpcid",
      value: vpc.vpcId,
      description: "ID of the VPC",
    });

    new cdk.CfnOutput(this, "dst-bucket-name", {
      exportName: "dstbucketname",
      value: targetBucket.bucketName,
      description: "Bucket name of the ETL target bucket",
    });

    new cdk.CfnOutput(this, "private-subnet-id", {
      exportName: "privateSubnetId",
      value: vpc.privateSubnets[0].subnetId,
      description:
        "Pick a random private subnet to place our Glue Dev Endpoint",
    });

    new cdk.CfnOutput(this, "glue-sg-id", {
      exportName: "gluesgid",
      value: glueSG.securityGroupId,
      description: "Security Group ID for AWS Glue",
    });
  }
}
