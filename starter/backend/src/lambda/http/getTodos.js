import { createLogger } from "../../utils/logger.mjs";
import middy from "@middy/core";
import cors from '@middy/http-cors';
import httpErrorHandler from "@middy/http-error-handler";
import { getTodos } from "../../businessLogic/todos.mjs";
import { getUserId } from "../utils.mjs";

const logger = createLogger('getTodos');
export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    try {
      logger.info('Processing event: ', event);
      const userId = getUserId(event);
      logger.info('Fetch all TODOs of', userId);

      const result = await getTodos(userId);

      logger.info(`TODOs of user ${userId}: `, result);
      return {
        statusCode: 201,
        body: JSON.stringify({
          items: result
        })
      }
    } catch (e) {
      logger.error('Error: ', e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e
        })
      }
    }

  })
