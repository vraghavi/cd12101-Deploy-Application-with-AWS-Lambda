import middy from "@middy/core"
import cors from '@middy/http-cors';
import httpErrorHandler from "@middy/http-error-handler"
import { createLogger } from "../../utils/logger.mjs";
import { deleteTodo } from "../../businessLogic/todos.mjs";
import { getUserId } from "../utils.mjs";

const logger = createLogger('deleteTodo');
export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    logger.info('Processing event: ', event);
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);

    try {
      await deleteTodo(todoId, userId);
      logger.info('Deleted todo of Id: ', todoId);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Todo deleted'
        })
      }
    } catch (e) {
      logger.info('Failed to delete todo of Id: ', todoId);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Failed to delete todo'
        })
      }
    }
    // TODO: Remove a TODO item by id
  });

