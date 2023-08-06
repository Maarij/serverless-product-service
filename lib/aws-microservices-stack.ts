import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {CompanyDatabase} from "./database";
import {CompanyMicroservices} from "./microservices";
import {CompanyApiGateway} from "./apigateway";

export class AwsMicroservicesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new CompanyDatabase(this, 'Database');

    const microservices = new CompanyMicroservices(this, 'Microservices', {
      productTable: database.productTable,
      basketTable: database.basketTable
    });

    const apigateway = new CompanyApiGateway(this, 'ApiGateway', {
      productMicroservice: microservices.productMicroservice,
      basketMicroservice: microservices.basketMicroservice
    });
  }
}
