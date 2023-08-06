import {Construct} from "constructs";
import {NodejsFunction, NodejsFunctionProps} from "aws-cdk-lib/aws-lambda-nodejs";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import {join} from "path";
import {ITable} from "aws-cdk-lib/aws-dynamodb";

interface CompanyMicroservicesProps {
  productTable: ITable;
}

export class CompanyMicroservices extends Construct {

  public readonly productMicroservices: NodejsFunction;

  constructor(scope: Construct, id: string, props: CompanyMicroservicesProps) {
    super(scope, id);

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          'aws-sdk'
        ]
      },
      environment: {
        PRIMARY_KEY: 'id',
        DYNAMODB_TABLE_NAME: props.productTable.tableName
      },
      runtime: Runtime.NODEJS_18_X
    }

    this.productMicroservices = new NodejsFunction(this, 'productLambdaFunction', {
      entry: join(__dirname, `/../src/product/index.js`),
      ...nodeJsFunctionProps,
    })

    props.productTable.grantReadWriteData(this.productMicroservices);
  }
}