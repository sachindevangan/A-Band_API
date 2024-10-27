// This data file should export all functions using the ES6 standard as shown in the lecture code

import { ObjectId } from "mongodb";
import { bands } from "../config/mongoCollections.js";

export const create = async (bandId, title, releaseDate, tracks, rating) => {
  if (!bandId || !title || !releaseDate || !tracks || !rating) {
    throw new Error('All fields must be provided');
  }
  if (typeof bandId !== 'string' || typeof title !== 'string' || typeof releaseDate !== 'string') {
    throw new Error('bandId, title, and releaseDate must be strings');
  }
  if (bandId.trim() === '' || title.trim() === '' || releaseDate.trim() === '') {
    throw new Error('bandId, title, and releaseDate cannot be empty');
  }
  if (!ObjectId.isValid(bandId)) {
    throw new Error('Invalid ObjectId for bandId');
  }

  const db = await bands();
  const band = await db.findOne({ _id: new ObjectId(bandId.trim()) });
  if (!band) {
    throw new Error(`Band with ID ${bandId.trim()} does not exist`);
  }

  const releaseDateObj = new Date(releaseDate.trim());
  const currentYear = new Date().getFullYear();
  if (isNaN(releaseDateObj.getTime()) || releaseDateObj.getFullYear() < 1900 || releaseDateObj.getFullYear() > currentYear + 1) {
    throw new Error('releaseDate must be a valid date between 1900 and the current year + 1');
  }

  const releaseDateStr = releaseDateObj.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  if (releaseDateStr !== releaseDate.trim()) {
    throw new Error('releaseDate must be in the format MM/DD/YYYY');
  }


  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    throw new Error('rating must be a number from 1 to 5');
  }

  const ratingString = rating.toString();
  const parts = ratingString.split('.');
  if (!/^[1-5]$/.test(parts[0])) {
    throw new Error('rating must be a whole number from 1 to 5, or a decimal with only one digit');
  }
  if (parts.length === 2 && !/^\d$/.test(parts[1])) {
    throw new Error('rating must have at most one decimal point and only one digit after the decimal');
  }
  const albumWithTitle = band.albums.find(album => album.title === title.trim());
  if (albumWithTitle) {
    throw new Error(`Album with title "${title.trim()}" already exists for band with ID ${bandId.trim()}`);
  }

  const trimmedTracks = tracks.map(track => track.trim());
  const album = { _id: new ObjectId(), title: title.trim(), releaseDate: releaseDateObj.toLocaleDateString(), tracks: trimmedTracks, rating };

  const updatedAlbums = [...band.albums, album];

  const updatedOverallRating = +(updatedAlbums.reduce((acc, album) => acc + album.rating, 0) / updatedAlbums.length).toFixed(1);

  const filter = { _id: new ObjectId(bandId.trim()) };
  const update = {
    $set: {
      albums: updatedAlbums,
      overallRating: updatedOverallRating,
    },
  };
  const options = { returnOriginal: false };
  const result = await db.updateOne(filter, update, options);

  if (result.modifiedCount === 0) {
    throw new Error(`Failed to update band with ID ${bandId.trim()}`);
  }

  const updatedBand = await db.findOne(filter);
  updatedBand.albums = updatedBand.albums.map(album => ({ ...album, _id: album._id.toString() }));
  return updatedBand;
};

export const getAll = async (bandId) => {
  if (!bandId) {
    throw new Error('bandId must be provided');
  }

  if (typeof bandId !== 'string' || bandId.trim().length === 0) {
    throw new Error('bandId must be a non-empty string');
  }

  let bandObjectId;
  try {
    bandObjectId = new ObjectId(bandId);
  } catch (error) {
    throw new Error('Invalid bandId');
  }

  const db = await bands();
  const band = await db.findOne({ _id: bandObjectId });

  if (!band) {
    throw new Error(`Band with ID ${bandId} does not exist`);
  }

  const albums = band.albums || [];

  const albumsWithIdAsString = albums.map((album) => {
    return { ...album, _id: album._id.toString() };
  });

  return albumsWithIdAsString;
};


export const get = async (albumId) => {

  if (!albumId || typeof albumId !== "string" || albumId.trim().length === 0) {
    throw new Error("Invalid albumId");
  }

  albumId = albumId.trim();

  if (!ObjectId.isValid(albumId)) {
    throw new Error("Invalid albumId");
  }

  const collection = await bands();
  const band = await collection.findOne({"albums._id": new ObjectId(albumId)});

  if (!band) {
    throw new Error("No album with that id");
  }

  const album = band.albums.find(a => a._id.toString() === albumId);

  if (!album) {
    throw new Error("No album with that id");
  }

  album._id = album._id.toString();

  return album;
}


export const remove = async (albumId) => {
  if (!albumId) {
    throw new Error('albumId is required');
  }

  if (typeof albumId !== 'string' || albumId.trim().length === 0) {
    throw new Error('albumId must be a non-empty string');
  }

  if (!ObjectId.isValid(albumId)) {
    throw new Error('albumId is not a valid ObjectId');
  }

  const db = await bands();
  const band = await db.findOne({ 'albums._id': new ObjectId(albumId) });
  if (!band) {
    throw new Error(`Album with ID ${albumId} does not exist`);
  }

  const updatedAlbums = band.albums.filter(album => album._id.toString() !== albumId);

  const updatedOverallRating = updatedAlbums.length
    ? +(updatedAlbums.reduce((acc, album) => acc + album.rating, 0) / updatedAlbums.length).toFixed(1)
    : 0;

  const result = await db.findOneAndUpdate(
    { _id: band._id },
    { $set: { albums: updatedAlbums, overallRating: updatedOverallRating } },
    { returnOriginal: false }
  );
  
  const updatedBand = result.value;
  return {
    _id: updatedBand._id.toString(),
    name: updatedBand.name,
    genre: updatedBand.genre,
    website: updatedBand.website,
    recordCompany: updatedBand.recordCompany,
    groupMembers: updatedBand.groupMembers,
    yearBandWasFormed: updatedBand.yearBandWasFormed,
    albums: updatedBand.albums
  };
};
