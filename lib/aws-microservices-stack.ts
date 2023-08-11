import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {CompanyDatabase} from "./database";
import {CompanyMicroservices} from "./microservices";
import {CompanyApiGateway} from "./apigateway";
import {CompanyEventBus} from "./eventbus";

export class AwsMicroservicesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new CompanyDatabase(this, 'Database');

    const microservices = new CompanyMicroservices(this, 'Microservices', {
      productTable: database.productTable,
      basketTable: database.basketTable,
      orderTable: database.orderTable
    });

    const apigateway = new CompanyApiGateway(this, 'ApiGateway', {
      productMicroservice: microservices.productMicroservice,
      basketMicroservice: microservices.basketMicroservice
    });

    const eventbus = new CompanyEventBus(this, 'EventBus', {
      publisherFunction: microservices.basketMicroservice,
      targetFunction: microservices.orderMicroservice
    });
  }
}
