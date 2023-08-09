import {Construct} from 'constructs';
import {IFunction} from "aws-cdk-lib/aws-lambda";
import {EventBus, Rule} from "aws-cdk-lib/aws-events";
import {LambdaFunction} from "aws-cdk-lib/aws-events-targets";

interface CompanyEventBusProps {
  publisherFunction: IFunction,
  targetFunction: IFunction
}

export class CompanyEventBus extends Construct {

  constructor(scope: Construct, id: string, props: CompanyEventBusProps) {
    super(scope, id);

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

    checkoutBasketRule.addTarget(new LambdaFunction(props.targetFunction));

    bus.grantPutEventsTo(props.publisherFunction);
  }
}