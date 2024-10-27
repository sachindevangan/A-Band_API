// Import the express router as shown in the lecture code
// Note: please do not forget to export the router!

import { ObjectId } from "mongodb";
import { Router } from "express";
import {bandData}  from "../data/index.js";
const router  = Router()


router
.route('/')
  .get(async (req, res) => {
    try {
      const bands = await bandData.getAll();

      const result = bands.map((band) => ({
        _id: band._id.toString(),
        name: band.name
      }));
      res.status(200).json(result);
    } catch (e) {
      res.status(500).json({ error: "Internal server error" });
    }
  })
  .post(async (req, res) => {
    try {
      const { name, genre, website, recordCompany, groupMembers, yearBandWasFormed } = req.body;
  
      if (!name || !genre || !website || !recordCompany || !groupMembers || !yearBandWasFormed) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name must be a non-empty string' });
      }
      if (typeof website !== 'string' || !/^http:\/\/www\.\w{5,}\.com$/.test(website.trim())) {
        return res.status(400).json({ error: 'Invalid website format' });
      }
      if (typeof recordCompany !== 'string' || recordCompany.trim().length === 0) {
        return res.status(400).json({ error: 'Record company must be a non-empty string' });
      }
      if (!Array.isArray(genre) || genre.length === 0 || !genre.every(g => typeof g === 'string' && g.trim().length > 0)) {
        return res.status(400).json({ error: 'Genre must be a non-empty array of non-empty strings' });
      }
      if (!Array.isArray(groupMembers) || groupMembers.length === 0 || !groupMembers.every(m => typeof m === 'string' && m.trim().length > 0)) {
        return res.status(400).json({ error: 'Group members must be a non-empty array of non-empty strings' });
      }
      if (typeof yearBandWasFormed !== 'number' || yearBandWasFormed < 1900 || yearBandWasFormed > new Date().getFullYear()) {
        return res.status(400).json({ error: 'Year formed must be a number between 1900 and the current year' });
      }
  
      const newBand = await bandData.create(name, genre, website, recordCompany, groupMembers, yearBandWasFormed);
  
      res.status(200).json(newBand);
    } catch (error) {
      if (error.message === 'Missing required fields' ||
          error.message === 'Name must be a non-empty string' ||
          error.message === 'Invalid website format' ||
          error.message === 'Record company must be a non-empty string' ||
          error.message === 'Genre must be a non-empty array of non-empty strings' ||
          error.message === 'Group members must be a non-empty array of non-empty strings' ||
          error.message === 'Year formed must be a number between 1900 and the current year') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });
  
  
  

router
  .route('/:id')
  .get(async (req, res) => {
    try {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        throw new Error('Invalid id');
      }
      const band = await bandData.get(id);
      if (!band) {
        throw new Error('No band with that id');
      }
      res.status(200).json({
        _id: band._id.toString(),
        name: band.name,
        genre: band.genre,
        website: band.website,
        recordCompany: band.recordCompany,
        groupMembers: band.groupMembers,
        yearBandWasFormed: band.yearBandWasFormed,
        albums: band.albums,
        overallRating: band.overallRating,
      });
    } catch (error) {
      if (error.message === 'Invalid id') {
        res.status(400).json({ error: 'Invalid id' });
      } else if (error.message === 'No band with that id') {
        res.status(404).json({ error: 'No band with that id' });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
.delete(async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid band ID' });
  }

  try {
    const message = await bandData.remove(id);
    return res.json({ bandId: id, deleted: true });
  } catch (error) {
    return res.status(404).json({ message: 'Band not found' });
  }
})

.put(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, genre, website, recordCompany, groupMembers, yearBandWasFormed } = req.body;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid ObjectId" });
      return;
    }

    const band = await bandData.get(id);
    if (!band) {
      res.status(404).json({ message: "Band not found" });
      return;
    }

    if (!name || !genre || !website || !recordCompany || !groupMembers || !yearBandWasFormed) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    if (typeof name !== "string" || name.trim().length === 0 ||
      typeof website !== "string" || !/^http:\/\/www\.\w{5,}\.com$/.test(website.trim()) ||
      typeof recordCompany !== "string" || recordCompany.trim().length === 0) {
      res.status(400).json({ message: "Invalid string format" });
      return;
    }

    if (!Array.isArray(genre) || genre.length === 0 || !genre.every(g => typeof g === "string" && g.trim().length > 0) ||
      !Array.isArray(groupMembers) || groupMembers.length === 0 || !groupMembers.every(m => typeof m === "string" && m.trim().length > 0)) {
      res.status(400).json({ message: "Invalid array format" });
      return;
    }

    if (typeof yearBandWasFormed !== "number" || yearBandWasFormed < 1900 || yearBandWasFormed > new Date().getFullYear()) {
      res.status(400).json({ message: "Invalid yearBandWasFormed value" });
      return;
    }

    const updatedBand = await bandData.update(id, name, genre, website, recordCompany, groupMembers, yearBandWasFormed);

    res.status(200).json(updatedBand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});




  export default router;
