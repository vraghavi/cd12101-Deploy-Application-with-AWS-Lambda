import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('todosAccess');
export class TodoAccess {
  constructor(
    documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
    todosTable = process.env.TODOS_TABLE) {
    this.todosTable = todosTable
    this.dynamoDbClient = DynamoDBDocument.from(documentClient)
  }

  getTodos = async (userId) => {
    logger.info(`Getting todos for user ${userId}`)

    try {
      const result = await this.dynamoDbClient.query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })

      logger.info('Todos of ' + userId + ': ', result)

      return result.Items
    } catch (error) {
      logger.error('Error getting todos: ', error)
      throw new Error('Error getting todos')
    }
  }

  createTodo = async (todo) => {
    logger.info(`Creating a todo with id ${todo.todoId}`)

    try {
      const result = await this.dynamoDbClient.put({
        TableName: this.todosTable,
        Item: todo
      })

      console.log('Create todo result: ', result);

      return todo;
    }
    catch (error) {
      logger.error('Error creating todo: ', error)
      throw new Error('Error creating todo')
    }
  }

  todoExists = async (todoId, userId) => {
    logger.info(`Checking if todo id id '${todoId}' exists`);
    try {
      const result = await this.dynamoDbClient.get({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        }
      })

      logger.info('Get todo: ' + result.Item)
      return result.Item.todoId;
    }
    catch (error) {
      logger.error('Error getting todo: ', error)
      throw new Error('Error getting todo')
    }
  }

  deleteTodo = async (todoId, userId) => {
    logger.info(`Deleting Todo ${todoId}`)

    try {
      return await this.dynamoDbClient.delete({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        }
      })
    } catch (error) {
      logger.error('Error deleting todo: ', error)
      throw new Error('Error deleting todo')
    }

  }

  updateTodo = async (todoId, updatedTodo) => {
    logger.info(`Updating Todo ${todoId}`)

    try {
      const result = await this.dynamoDbClient.update({
        TableName: this.todosTable,
        Key: {
          todoId
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeValues: {
          ':name': updatedTodo.name,
          ':dueDate': updatedTodo.dueDate,
          ':done': updatedTodo.done
        },
        ExpressionAttributeNames: {
          '#name': 'name'
        }
      })
      return result
    } catch (error) {
      logger.error('Error updating todo: ', error)
      throw new Error('Error updating todo')
    }
  }
}
