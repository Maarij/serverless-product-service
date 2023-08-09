import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {CompanyDatabase} from "./database";
import {CompanyMicroservices} from "./microservices";
import {CompanyApiGateway} from "./apigateway";
import {EventBus, Rule} from "aws-cdk-lib/aws-events";
import {LambdaFunction} from "aws-cdk-lib/aws-events-targets";

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

    const bus = new EventBus(this, 'SwnEventBus', {
      eventBusName: 'CompanyEventBus'
    })

    const checkoutBasketRule = new Rule(this, 'CheckoutBasketRule', {
      eventBus: bus,
      enabled: true,
      description: 'When Basket microservice checkouts the basket',
      eventPattern: {
        source: ['com.company.basket.checkoutbasket'],
        detailType: ['CheckoutBasket']
      },
      ruleName: 'CheckoutBasketRule'
    })

    checkoutBasketRule.addTarget(new LambdaFunction(orderingMicroservice));
  }
}
