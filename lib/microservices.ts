import {Construct} from "constructs";
import {NodejsFunction, NodejsFunctionProps} from "aws-cdk-lib/aws-lambda-nodejs";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import {join} from "path";
import {ITable} from "aws-cdk-lib/aws-dynamodb";

interface CompanyMicroservicesProps {
  productTable: ITable;
  basketTable: ITable;
}

export class CompanyMicroservices extends Construct {

  public readonly productMicroservice: NodejsFunction;
  public readonly basketMicroservice: NodejsFunction;

  constructor(scope: Construct, id: string, props: CompanyMicroservicesProps) {
    super(scope, id);

    this.productMicroservice = this.createProductMicroservice(props.productTable);
    this.basketMicroservice = this.createBasketMicroservice(props.basketTable);
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
        DYNAMODB_TABLE_NAME: productTable.tableName
      },
      runtime: Runtime.NODEJS_18_X
    }

    const productMicroservice = new NodejsFunction(this, 'productLambdaFunction', {
      entry: join(__dirname, `/../src/product/index.js`),
      ...nodeJsFunctionProps,
    })

    productTable.grantReadWriteData(this.productMicroservice);

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
        DYNAMODB_TABLE_NAME: basketTable.tableName
      },
      runtime: Runtime.NODEJS_18_X
    }

    const basketMicroservice = new NodejsFunction(this, 'basketLambdaFunction', {
      entry: join(__dirname, `/../src/product/index.js`),
      ...nodeJsFunctionProps,
    })

    basketTable.grantReadWriteData(basketMicroservice);

    return basketMicroservice;
  }
}