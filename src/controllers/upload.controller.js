import { uploadFile } from '../services/upload.service.js';
import { createStagedMediaRecord, deleteStagedMediaById } from '../services/stagedMedia.service.js';

export const stageUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No media file uploaded.' });
    }

    const uploaded = await uploadFile(req.file);
    const staged = await createStagedMediaRecord({
      url: uploaded.url,
      type: uploaded.type,
      originalName: uploaded.originalName || req.file.originalname,
      size: uploaded.size || req.file.size || 0,
      mimeType: uploaded.mimetype || req.file.mimetype,
    });

    res.status(201).json({
      id: staged.id,
      token: staged.token,
      url: staged.url,
      type: staged.type,
      status: staged.status,
      originalName: staged.originalName,
      size: staged.size,
      mimeType: staged.mimeType,
      expiresAt: staged.expiresAt,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStagedUpload = async (req, res, next) => {
  try {
    const removed = await deleteStagedMediaById(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Staged upload not found.' });
    }

    res.status(200).json({ message: 'Staged upload removed.' });
  } catch (error) {
    next(error);
  }
};
