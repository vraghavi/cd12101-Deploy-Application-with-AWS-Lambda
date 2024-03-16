import middy from "@middy/core";
import { createLogger } from "../../utils/logger.mjs";
import httpErrorHandler from "@middy/http-error-handler";
import cors from "@middy/http-cors";
import { updateTodo } from "../../businessLogic/todos.mjs";
import { getUserId } from "../utils.mjs";

const logger = createLogger('updateTodo');
export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    logger.info('Processing event: ', event);
    try {
      const todoId = event.pathParameters.todoId
      const updatedTodo = JSON.parse(event.body)
      const userId = getUserId(event);
      logger.info('Updating TODO with Id: ', todoId);
      const validTodoId = await todoExists(todoId, userId);
      if (!validTodoId) {
        logger.info('Invalid TODO ID: ' + validTodoId);
        return {
          statusCode: 404,
          body: JSON.stringify({
            error: 'Todo does not exist'
          })
        }
      }
      const result = await updateTodo(validTodoId, updatedTodo);
      // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
      return {
        statusCode: 200,
        body: JSON.stringify({
          item: result
        })
      }
    } catch (error) {
      logger.error('Error updating TODO: ', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Error updating TODO'
        })
      }
    }
  });
