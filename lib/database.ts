import {Construct} from "constructs";
import {AttributeType, BillingMode, ITable, Table} from "aws-cdk-lib/aws-dynamodb";
import {RemovalPolicy} from "aws-cdk-lib";

export class CompanyDatabase extends Construct {

  public readonly productTable: ITable;
  public readonly basketTable: ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.productTable = this.createProductTable();
    this.basketTable = this.createBasketTable();
  }

  private createProductTable(): ITable {
    // Product table
    // PK: id
    // name, description, imageFile, price, category
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

  private createBasketTable() {
    // Basket table
    // PK: username
    // items (set map)
    //   item1 -> {quantity, color, price, productId, productName}
    //   item2 -> {quantity, color, price, productId, productName}
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
}