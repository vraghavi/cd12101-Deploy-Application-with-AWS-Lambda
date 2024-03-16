import middy from "@middy/core";
import cors from '@middy/http-cors';
import httpErrorHandler from "@middy/http-error-handler";
import { generateUploadUrlForAttachment, todoExists } from "../../businessLogic/todos.mjs";
import { createLogger } from "../../utils/logger.mjs";
import { getUserId } from "../utils.mjs";

const logger = createLogger('generateUploadUrl');
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
    try {
      const userId = getUserId(event);
      const validTodoId = await todoExists(todoId, userId);

      logger.info('Found todo of Id: ' + validTodoId);

      if (!validTodoId) {
        logger.info('Invalid TODO ID: ' + validTodoId);
        return {
          statusCode: 404,
          body: JSON.stringify({
            error: 'Todo does not exist'
          })
        }
      }

      logger.info('Generating URL for uploading attachment for todo of id ' + validTodoId);

      const newAttachUrl = await generateUploadUrlForAttachment(validTodoId);

      logger.info("Generated upload Url: " + newAttachUrl);

      return {
        statusCode: 201,
        body: JSON.stringify({
          uploadUrl: newAttachUrl
        })
      }
    } catch (error) {
      logger.error('Error generating upload URL: ', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Error generating upload URL'
        })
      }
    }

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  });

