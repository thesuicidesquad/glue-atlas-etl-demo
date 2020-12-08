#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { GlueDemoInfraStack } from '../lib/infra-stack';
import { GlueDemoResourceStack } from "../lib/glue-stack";

const app = new cdk.App();
const infraStack = new GlueDemoInfraStack(app, 'GlueDemoStack');
const glueStack = new GlueDemoResourceStack(app, "GlueDemoDevStack");
