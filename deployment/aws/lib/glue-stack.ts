import { App, Aws, CfnParameter, Fn, Stack, StackProps } from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as glue from "@aws-cdk/aws-glue";
import {} from "../bin/aws";

// export interface GlueDemoResourceStackProps extends StackProps {}

export class GlueDemoResourceStack extends Stack {
  constructor(scope: App, id: string) {
    super(scope, id);

    // The code that defines your stack goes here

    // Create IAM role for AWS Glue
    const glueRole = new iam.Role(this, "AWSGlueServiceRole", {
      assumedBy: new iam.ServicePrincipal("glue.amazonaws.com"),
      description:
        "Role for AWS Glue to call other AWS services on your behalf",
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSGlueServiceRole"
        ),
      ],
      roleName: "AWSGlueServiceRoleDefault-Demo",
    });

    // Create IAM role for notebook servers
    const notebookServerRole = new iam.Role(
      this,
      "AWSGlueServiceNotebookRoleDefault",
      {
        assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
        description: "Service role for Glue notebook servers",
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSGlueServiceNotebookRole"
          ),
          iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"),
        ],
        roleName: "AWSGlueServiceNotebookRoleDefault-Demo",
      }
    );

    // Create IAM policy for Sagemaker Notebooks
    const sagemakerNotebookPolicy = new iam.ManagedPolicy(
      this,
      "AWSGlueSageMakerNotebook",
      {
        document: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["s3:ListBucket"],
              effect: iam.Effect.ALLOW,
              resources: [
                "arn:aws:s3:::" + Fn.importValue("dstbucketname"),
              ],
            }),
            new iam.PolicyStatement({
              actions: ["s3:GetObject"],
              effect: iam.Effect.ALLOW,
              resources: [
                "arn:aws:s3:::" + Fn.importValue("dstbucketname") + "*",
              ],
            }),
            new iam.PolicyStatement({
              actions: [
                "logs:CreateLogStream",
                "logs:DescribeLogStreams",
                "logs:PutLogEvents",
                "logs:CreateLogGroup",
              ],
              effect: iam.Effect.ALLOW,
              resources: [
                "arn:aws:logs:" +
                  Aws.REGION +
                  ":" +
                  Aws.ACCOUNT_ID +
                  ":log-group:/aws/sagemaker/*",
                "arn:aws:logs:" +
                  Aws.REGION +
                  ":" +
                  Aws.ACCOUNT_ID +
                  ":log-group:/aws/sagemaker/*:log-stream:aws-glue-*",
              ],
            }),
            new iam.PolicyStatement({
              actions: [
                "glue:UpdateDevEndpoint",
                "glue:GetDevEndpoint",
                "glue:GetDevEndpoints",
              ],
              effect: iam.Effect.ALLOW,
              resources: [
                "arn:aws:glue:" +
                  Aws.REGION +
                  ":" +
                  Aws.ACCOUNT_ID +
                  ":devEndpoint/*",
              ],
            }),
            new iam.PolicyStatement({
              actions: ["sagemaker:ListTags"],
              effect: iam.Effect.ALLOW,
              resources: [
                "arn:aws:sagemaker:" +
                  Aws.REGION +
                  ":" +
                  Aws.ACCOUNT_ID +
                  ":notebook-instance/*",
              ],
            }),
          ],
        }),
      }
    );

    // Create IAM role for Sagemaker Notebooks
    const sagemakerNotebookRole = new iam.Role(
      this,
      "AWSGlueServiceSageMakerNotebookRole-DemoRole",
      {
        assumedBy: new iam.ServicePrincipal("sagemaker.amazonaws.com"),
        description: "Allow Sagemaker to call Glue and S3",
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "AmazonSageMakerFullAccess"
          ),
        ],
        roleName: "AWSGlueServiceSageMakerNotebookRole-Demo",
      }
    );

    // Attach the previously created policy to this role for SageMaker Notebook
    sagemakerNotebookRole.addManagedPolicy(sagemakerNotebookPolicy);

    // Create AWS Glue developer endpoint

    const devEndpoint = new glue.CfnDevEndpoint(this, "Demo-GlueDevEndpoint", {
      roleArn: glueRole.roleArn,
      glueVersion: "1.0",
      subnetId: Fn.importValue("privateSubnetId"),
      securityGroupIds: [Fn.importValue("gluesgid")],
    });
  }
}
