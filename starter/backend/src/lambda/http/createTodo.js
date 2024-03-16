import { createLogger } from "../../utils/logger.mjs";
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { createTodo } from "../../businessLogic/todos.mjs";
import { getUserId } from "../utils.mjs";

const logger = createLogger('createTodo');
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
      const newTodo = JSON.parse(event.body);
      logger.info('New TODO create request: ', newTodo);
      const userId = getUserId(event);

      const result = await createTodo(newTodo, userId);

      logger.info('Create TODO result: ', result);

      // TODO: Implement creating a new TODO item
      return {
        statusCode: 201,
        body: JSON.stringify({
          item: result
        })
      }
    } catch (error) {
      logger.error('Error creating TODO: ', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Error creating TODO'
        })
      }
    }
  });

