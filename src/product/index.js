import {
  DeleteItemCommand,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient";
import { v4 as uuid } from 'uuid';

exports.handler = async function (event) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  switch (event.httpMethod) {
    case "GET":
      if (event.queryStringParameters != null) {
        await getProductsByCategory(event); // GET product/1234?category=Phone
      } else if (event.pathParameters != null) {
        await getProduct(event.pathParameters.id); // GET product/{id}
      } else {
        await getAllProducts(); // GET product
      }
      break;
    case "POST":
      await createProduct(event); // POST /product
      break;
    case "DELETE":
      await deleteProduct(event.pathParameters.id); // DELETE product/{id}
      break;
    case "PUT":
      await updateProduct(event); // PUT /product/{id}
      break;
    default:
      throw new Error(`Unsupported route: ${event.httpMethod}`);
  }

  return {
    statusCode: 200,
    headers: {"Content-Type": "text/plain"},
    body: `Hello from Product! You've hit ${event.path}\n`
  };
};

const getProduct = async (productId) => {
  console.log("getProduct")

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({id: productId})
    };

    const {Item} = await ddbClient.send(new GetItemCommand(params));

    console.log(Item)
    return (Item) ? unmarshall(Item) : {};
  } catch (e) {
    console.error(e)
    throw e;
  }
}

const getAllProducts = async () => {
  console.log("getAllProducts");

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME
    };

    const {Items} = await ddbClient.send(new ScanCommand(params));

    console.log(Items);
    return (Items) ? Items.map(item => unmarshall(item)) : {};
  } catch (e) {
    console.error(e);
    throw e;
  }
}

const createProduct = async (event) => {
  console.log(`createProduct event: ${event}`);

  try {
    const productRequest = JSON.parse(event.body);
    productRequest.id = uuid();

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(productRequest || {})
    };

    const createResult = await ddbClient.send(new PutItemCommand(params));

    console.log(createResult);
    return createResult
  } catch (e) {
    console.error(e);
    throw e;
  }
}

const deleteProduct = async (productId) => {
  console.log(`deleteProduct for productId ${productId}`);

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({id: productId})
    };

    const deleteResult = await ddbClient.send(new DeleteItemCommand(params));

    console.log(deleteResult);
    return deleteResult
  } catch (e) {
    console.error(e);
    throw e;
  }
}

const updateProduct = async (event) => {
  console.log(`updateProduct for event ${event}`);

  try {
    const requestBody = JSON.parse(event.body);
    const objKeys = Object.keys(requestBody);
    console.log(`updateProduct requestBody "${requestBody}", objKeys: "${objKeys}`);

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({id: event.pathParameters.id}),
      UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`)}`,
      ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
        ...acc,
        [`#key${index}`]: requestBody[key],
      }), {}),
      ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
        ...acc,
        [`:value${index}`]: requestBody[key],
      }), {}))
    };

    const updateResult = await ddbClient.send(new UpdateItemCommand(params))

    console.log(updateResult);
    return updateResult;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

const getProductsByCategory = async (event) => {
  console.log("getProductsByCat")

  try {
    const productId = event.pathParemeters.id;
    const category = event.queryStringParameters.category;

    const params = {
      KeyConditionExpression: "id = :productId",
      FilterExpression: "contains (category, :category)",
      ExpressionAttributeValues: {
        ":productId": {S: productId},
        ":category": {S: category}
      },
      TableName: process.env.DYNAMODB_TABLE_NAME
    };

    const {Items} = await ddbClient.send(new QueryCommand(params));

    console.log(Items);
    return Items.map((item) => unmarshall(item));
  } catch (e) {
    console.error(e);
    throw e;
  }
}