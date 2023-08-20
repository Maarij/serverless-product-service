import {Construct} from 'constructs';
import {IFunction} from "aws-cdk-lib/aws-lambda";
import {EventBus, Rule} from "aws-cdk-lib/aws-events";
import {SqsQueue} from "aws-cdk-lib/aws-events-targets";
import {IQueue} from "aws-cdk-lib/aws-sqs";

interface CompanyEventBusProps {
  publisherFunction: IFunction,
  targetQueue: IQueue
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

    checkoutBasketRule.addTarget(new SqsQueue(props.targetQueue));

    bus.grantPutEventsTo(props.publisherFunction);
  }
}