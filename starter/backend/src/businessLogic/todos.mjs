import * as uuid from 'uuid'

import { TodoAccess } from '../dataLayer/todosAccess.mjs'
import { createLogger } from '../utils/logger.mjs';
import { deleteAttachment, generateUploadUrl } from '../fileStorage/attachmentUtils.mjs';

const todoAccess = new TodoAccess();
const logger = createLogger('todosBusinessLogic');
const bucketName = process.env.ATTACHMENTS_S3_BUCKET;

export async function getAllTodos() {
    return todoAccess.getAllTodos();
}

export const getTodos = async (userId) => {
    return await todoAccess.getTodos(userId);
}

export async function createTodo(newTodo, userId) {
    const itemId = uuid.v4()

    const createTodoRequest = {
        todoId: itemId,
        userId: userId,
        name: newTodo.name,
        dueDate: newTodo.dueDate,
        createdAt: new Date().toUTCString(),
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`,
        done: false
    }

    logger.info('Create TODO request: ', createTodoRequest);

    return await todoAccess.createTodo(createTodoRequest);
}

export async function todoExists(todoId, userId) {
    return await todoAccess.todoExists(todoId, userId);
}

export const deleteTodo = async (todoId, userId) => {
    try {
        const result = await todoAccess.deleteTodo(todoId, userId);
        await deleteAttachment(todoId);
        return result;
    } catch {
        throw new Error('Error deleting todo');
    }
}

export const updateTodo = async (todoId, updatedTodo) => {
    return await todoAccess.updateTodo(todoId, updatedTodo);
}

export const generateUploadUrlForAttachment = (todoId) => {
    return generateUploadUrl(todoId);
}
