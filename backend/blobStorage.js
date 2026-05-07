import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

if (!connectionString) {
  throw new Error("AZURE_STORAGE_CONNECTION_STRING is missing.");
}

if (!containerName) {
  throw new Error("AZURE_STORAGE_CONTAINER_NAME is missing.");
}

const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);

const containerClient = blobServiceClient.getContainerClient(containerName);

export async function uploadAudioToBlob(file) {
  const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const blobName = `${Date.now()}-${safeOriginalName}`;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: {
      blobContentType: file.mimetype,
    },
  });

  return {
    blobName,
    blobUrl: blockBlobClient.url,
  };
}

export async function streamAudioFromBlob(blobName, response) {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloadResponse = await blockBlobClient.download();

  response.setHeader(
    "Content-Type",
    downloadResponse.contentType || "audio/mpeg"
  );

  downloadResponse.readableStreamBody.pipe(response);
}

export async function deleteAudioFromBlob(blobName) {
  if (!blobName) return;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
}