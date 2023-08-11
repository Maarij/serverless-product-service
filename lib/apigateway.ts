import {Construct} from "constructs";
import {LambdaRestApi} from "aws-cdk-lib/aws-apigateway";
import {IFunction} from "aws-cdk-lib/aws-lambda";

interface CompanyApiGatewayProps {
  productMicroservice: IFunction
  basketMicroservice: IFunction
}

export class CompanyApiGateway extends Construct {

  constructor(scope: Construct, id: string, props: CompanyApiGatewayProps) {
    super(scope, id);

    this.createProductApi(props.productMicroservice);
    this.createBasketApi(props.basketMicroservice);
  }

  private createProductApi(productMicroservice: IFunction) {
    const apigw = new LambdaRestApi(this, 'productApi', {
      restApiName: 'Product Service',
      handler: productMicroservice,
      proxy: false
    });

    const product = apigw.root.addResource('product');
    product.addMethod('GET');
    product.addMethod('POST')

    const singleProduct = product.addResource('{id}'); // /product/{id}
    singleProduct.addMethod('GET'); // GET /product/{id}
    singleProduct.addMethod('PUT'); // PUT /product/{id}
    singleProduct.addMethod('DELETE'); // DELETE /product/{id}

    return apigw;
  }

  private createBasketApi(basketMicroservice: IFunction) {
    const apigw = new LambdaRestApi(this, 'basketApi', {
      restApiName: 'Basket Service',
      handler: basketMicroservice,
      proxy: false
    });

    const basket = apigw.root.addResource('basket');
    basket.addMethod('GET');
    basket.addMethod('POST');

    const singleProduct = basket.addResource('{username}'); // /basket/{username}
    singleProduct.addMethod('GET'); // GET /basket/{id}
    singleProduct.addMethod('DELETE'); // DELETE /basket/{id}

    const basketCheckout = basket.addResource('checkout');
    basketCheckout.addMethod('POST'); // POST /basket/checkout
  }

}