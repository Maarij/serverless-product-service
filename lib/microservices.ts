import {Construct} from "constructs";
import {NodejsFunction, NodejsFunctionProps} from "aws-cdk-lib/aws-lambda-nodejs";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import {join} from "path";
import {ITable} from "aws-cdk-lib/aws-dynamodb";

interface CompanyMicroservicesProps {
  productTable: ITable;
  basketTable: ITable;
  orderTable: ITable;
}

export class CompanyMicroservices extends Construct {

  public readonly productMicroservice: NodejsFunction;
  public readonly basketMicroservice: NodejsFunction;
  public readonly orderMicroservice: NodejsFunction;

  constructor(scope: Construct, id: string, props: CompanyMicroservicesProps) {
    super(scope, id);

    this.productMicroservice = this.createProductMicroservice(props.productTable);
    this.basketMicroservice = this.createBasketMicroservice(props.basketTable);
    this.orderMicroservice = this.createOrderMicroservice(props.orderTable);
  }

  private createProductMicroservice(productTable: ITable): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          'aws-sdk'
        ]
      },
      environment: {
        PRIMARY_KEY: 'id',
        DYNAMODB_TABLE_NAME: productTable.tableName,
      },
      runtime: Runtime.NODEJS_18_X
    }

    const productMicroservice = new NodejsFunction(this, 'productLambdaFunction', {
      entry: join(__dirname, `/../src/product/index.js`),
      ...nodeJsFunctionProps,
    })

    productTable.grantReadWriteData(productMicroservice);

    return productMicroservice
  }

  private createBasketMicroservice(basketTable: ITable): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          'aws-sdk'
        ]
      },
      environment: {
        PRIMARY_KEY: 'username',
        DYNAMODB_TABLE_NAME: basketTable.tableName,
        EVENT_SOURCE: "com.company.basket.checkoutbasket",
        EVENT_DETAILTYPE: "CheckoutBasket",
        EVENT_BUSNAME: "CompanyEventBus"
      },
      runtime: Runtime.NODEJS_18_X
    }

    const basketMicroservice = new NodejsFunction(this, 'basketLambdaFunction', {
      entry: join(__dirname, `/../src/basket/index.js`),
      ...nodeJsFunctionProps,
    })

    basketTable.grantReadWriteData(basketMicroservice);

    return basketMicroservice;
  }

  private createOrderMicroservice(orderTable: ITable): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          'aws-sdk'
        ]
      },
      environment: {
        PRIMARY_KEY: 'username',
        SORT_KEY: 'orderDate',
        DYNAMODB_TABLE_NAME: orderTable.tableName
      },
      runtime: Runtime.NODEJS_18_X
    }

    const orderMicroservice = new NodejsFunction(this, 'orderLambdaFunction', {
      entry: join(__dirname, `/../src/order/index.js`),
      ...nodeJsFunctionProps,
    })

    orderTable.grantReadWriteData(orderMicroservice);

    return orderMicroservice;
  }
}