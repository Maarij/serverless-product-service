import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {NodejsFunction, NodejsFunctionProps} from "aws-cdk-lib/aws-lambda-nodejs";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import {join} from "path";
import {LambdaRestApi} from "aws-cdk-lib/aws-apigateway";
import {CompanyDatabase} from "./database";

export class AwsMicroservicesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new CompanyDatabase(this, 'Database');

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          'aws-sdk'
        ]
      },
      environment: {
        PRIMARY_KEY: 'id',
        DYNAMODB_TABLE_NAME: database.productTable.tableName
      },
      runtime: Runtime.NODEJS_18_X
    }

    const productLambda = new NodejsFunction(this, 'productLambdaFunction', {
      entry: join(__dirname, `/../src/product/index.js`),
      ...nodeJsFunctionProps,
    })

    database.productTable.grantReadWriteData(productLambda);

    const apigw = new LambdaRestApi(this, 'productApi', {
      restApiName: 'Product Service',
      handler: productLambda,
      proxy: false
    });

    const product = apigw.root.addResource('product');
    product.addMethod('GET');
    product.addMethod('POST')

    const singleProduct = product.addResource('{id}'); // /product/{id}
    singleProduct.addMethod('GET'); // GET /product/{id}
    singleProduct.addMethod('PUT'); // PUT /product/{id}
    singleProduct.addMethod('DELETE'); // DELETE /product/{id}
  }
}
