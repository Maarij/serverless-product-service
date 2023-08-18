import { marshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";

exports.handler = async function (event) {
  console.log("request: ", JSON.stringify(event, undefined, 2));

  const eventType = event['detail-type'];
  if (eventType !== undefined) {
    await eventBridgeInvocation(event); // async
  } else {
    return await apiGatewayInvocation(event); // sync
  }
};

const eventBridgeInvocation = async (event) => {
  console.log(`eventBridgeInvocation function. event: "${event}"`);

  // create order item into db
  await createOrder(event.detail);
};

const apiGatewayInvocation = (event) => {

};

const createOrder = async (basketCheckoutEvent) => {
  try {
    console.log(`createOrder function. event: "${basketCheckoutEvent}"`);

    // set orderDate for SK of order dynamodb
    basketCheckoutEvent.orderDate = new Date().toISOString();
    console.log(basketCheckoutEvent);

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(basketCheckoutEvent || {})
    }

    const createResult = await ddbClient.send(new PutItemCommand(params));
    console.log(createResult);

    return createResult;
  } catch (e) {
    console.error(e);
    throw e;
  }
}