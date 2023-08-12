import {Construct} from "constructs";
import {LambdaRestApi} from "aws-cdk-lib/aws-apigateway";
import {IFunction} from "aws-cdk-lib/aws-lambda";

interface CompanyApiGatewayProps {
  productMicroservice: IFunction
  basketMicroservice: IFunction
  orderMicroservice: IFunction
}

export class CompanyApiGateway extends Construct {

  constructor(scope: Construct, id: string, props: CompanyApiGatewayProps) {
    super(scope, id);

    this.createProductApi(props.productMicroservice);
    this.createBasketApi(props.basketMicroservice);
    this.createOrderApi(props.orderMicroservice);
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

    const singleBasket = basket.addResource('{username}'); // /basket/{username}
    singleBasket.addMethod('GET'); // GET /basket/{id}
    singleBasket.addMethod('DELETE'); // DELETE /basket/{id}

    const basketCheckout = basket.addResource('checkout');
    basketCheckout.addMethod('POST'); // POST /basket/checkout
  }

  private createOrderApi(orderMicroservice: IFunction) {
    const apigw = new LambdaRestApi(this, 'orderApi', {
      restApiName: 'Order Service',
      handler: orderMicroservice,
      proxy: false
    });

    const order = apigw.root.addResource('order');
    order.addMethod('GET'); // GET /order

    const singleOrder = order.addResource('{username}');
    singleOrder.addMethod('GET'); // GET /order/{username}

    return singleOrder;
  }
}