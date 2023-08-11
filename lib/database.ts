import {Construct} from "constructs";
import {AttributeType, BillingMode, ITable, Table} from "aws-cdk-lib/aws-dynamodb";
import {RemovalPolicy} from "aws-cdk-lib";

export class CompanyDatabase extends Construct {

  public readonly productTable: ITable;
  public readonly basketTable: ITable;
  public readonly orderTable: ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.productTable = this.createProductTable();
    this.basketTable = this.createBasketTable();
    this.orderTable = this.createOrderTable();
  }

  // Product table
  // PK: id
  // name, description, imageFile, price, category
  private createProductTable(): ITable {
    return new Table(this, 'product', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      tableName: 'product',
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST
    });
  }

  // Basket table
  // PK: username
  // items (set map)
  //   item1 -> {quantity, color, price, productId, productName}
  //   item2 -> {quantity, color, price, productId, productName}
  private createBasketTable(): ITable {
    return new Table(this, 'basket', {
      partitionKey: {
        name: 'username',
        type: AttributeType.STRING
      },
      tableName: 'basket',
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST
    });
  }

  // Order table
  // PK: username
  // SK: orderDate
  // totalPrice, firstName, lastName, email, address, paymentMethod, cardInfo
  private createOrderTable(): ITable {
    return new Table(this, 'order', {
      partitionKey: {
        name: 'username',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'orderDate',
        type: AttributeType.STRING
      },
      tableName: 'order',
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST
    });
  }
}