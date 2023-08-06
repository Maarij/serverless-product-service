import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {LambdaRestApi} from "aws-cdk-lib/aws-apigateway";
import {CompanyDatabase} from "./database";
import {CompanyMicroservices} from "./microservices";

export class AwsMicroservicesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new CompanyDatabase(this, 'Database');

    const microservices = new CompanyMicroservices(this, 'Microservices', {
      productTable: database.productTable
    });

    const apigw = new LambdaRestApi(this, 'productApi', {
      restApiName: 'Product Service',
      handler: microservices.productMicroservices,
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
