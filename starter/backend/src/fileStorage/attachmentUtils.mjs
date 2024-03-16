import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createLogger } from "../utils/logger.mjs";

const attachmentBucketName = process.env.ATTACHMENTS_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)
const s3Client = new S3Client({})
const logger = createLogger('attachmentUtils');
export const generateUploadUrl = (todoId) => {
    logger.info(`Generating upload url for todo ${todoId}`)
    try {
        const uploadUrl = getSignedUrl(s3Client, new PutObjectCommand({
            Bucket: attachmentBucketName,
            Key: todoId
        }, {
            expiresIn: urlExpiration
        }));

        return uploadUrl
    }
    catch (err) {
        logger.error("Error", err);
        throw new Error("Error generating upload url");
    }
}

export const deleteAttachment = async (todoId) => {
    logger.info(`Deleting attachment for todo ${todoId}`)

    try {
        const data = await s3Client.send(new DeleteObjectCommand({
            Bucket: attachmentBucketName,
            Key: todoId
        }));
        logger.info("Success. Object deleted.", data);
    } catch (err) {
        logger.error("Error", err);
        throw new Error("Error deleting attachment");
    }
}