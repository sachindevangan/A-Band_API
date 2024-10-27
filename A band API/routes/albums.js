// Import the express router as shown in the lecture code
// Note: please do not forget to export the router!

import { ObjectId } from "mongodb";
import { Router } from "express";
import {albumData} from "../data/index.js";
import {bands} from "../config/mongoCollections.js";
const router  = Router()

router
  .route('/:bandId')
  .get(async (req, res) => {
    const bandId = req.params.bandId;

  try {
    const albums = await albumData.getAll(bandId);

    if (albums.length === 0) {
      return res.status(404).json({ error: 'No albums found for the specified band ID' });
    }

    return res.status(200).json(albums);
  } catch (error) {
    if (error.message === 'Invalid bandId') {
      return res.status(400).json({ error: 'Invalid band ID' });
    }

    if (error.message.startsWith('Band with ID')) {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
})
.post(async (req, res) => {
  try {
    const { bandId } = req.params;
    const { title, releaseDate, tracks, rating } = req.body;

    if (!title || !releaseDate || !tracks) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (typeof title !== 'string' || title.trim().length === 0 || typeof releaseDate !== 'string' || releaseDate.trim().length === 0 || !Array.isArray(tracks) || tracks.length < 3) {
      return res.status(400).json({ error: 'Invalid input format' });
    }
    const isValidDate = (dateString) => {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date);
    }
    if (!isValidDate(releaseDate)) {
      return res.status(400).json({ error: 'Invalid release date format' });
    }
    const currentYear = new Date().getFullYear();
    const releaseYear = new Date(releaseDate).getFullYear();
    if (releaseYear < 1900 || releaseYear > currentYear + 1) {
      return res.status(400).json({ error: 'Invalid release year' });
    }
    if (typeof rating !== 'undefined' && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Invalid rating format' });
    }
    if (!tracks.every((track) => typeof track === 'string' && track.trim().length > 0)) {
      return res.status(400).json({ error: 'Invalid tracks format' });
    }

    const album = await albumData.create(bandId, title, releaseDate, tracks, rating);

    res.status(200).json(album);
  } catch (e) {
    if (e.message.startsWith('Invalid ObjectId') || e.message.startsWith('Band with ID')) {
      res.status(404).json({ error: e.message });
    } else {
      res.status(400).json({ error: e.message });
    }
  }
});

router
  .route('/album/:albumId')
  .get(async (req, res) => {
    const { albumId } = req.params;
  
    try {
      const album = await albumData.get(albumId);
      res.status(200).json(album);
    } catch (error) {
      if (error.message === 'Invalid albumId') {
        return res.status(400).json({ error: 'Invalid albumId' });
      }
  
      if (error.message === 'Album not found') {
        return res.status(404).json({ error: 'Album not found' });
      }
  
      return res.status(500).json({ error: error.message });
    }
  })
  .delete(async (req, res) => {
    const albumId = req.params.albumId;

    if (!ObjectId.isValid(albumId)) {
      return res.status(400).json({ error: 'Invalid albumId' });
    }
  
    try {
     const band = await albumData.remove(albumId);
      const db = await bands();
    
      const totalRatings = band.albums.reduce((sum, album) => sum + album.overallRating, 0);
      const averageRating = totalRatings / band.albums.length;
      await db.updateOne({ _id: band._id }, { $set: { overallRating: averageRating } });
  
      return res.status(200).json({ albumId, deleted: true });
    } catch (error) {
      
      if (error.message.includes('does not exist')) {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({ error: error.message });
    }
  });

  export default router;