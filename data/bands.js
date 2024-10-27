// This data file should export all functions using the ES6 standard as shown in the lecture code

import { ObjectId } from "mongodb";
import { bands } from "../config/mongoCollections.js"; 
import {compareAndUpdate} from "../helpers.js";

export const create = async (name, genre, website, recordCompany, groupMembers, yearBandWasFormed) => {

  if (!name) {
    throw new Error("The 'name' field is required and should be a non-empty string");
  }

  if (typeof name !== "string" || name.trim().length === 0) {
    throw new Error("The 'name' field should be a non-empty string");
  }

  if (!genre || !Array.isArray(genre) || genre.length === 0 || !genre.every(g => typeof g === "string" && g.trim().length > 0)) {
    throw new Error("The 'genre' field should be a non-empty array of strings");
  }

  if (!website || typeof website !== "string" || website.trim().length === 0 || !website.trim().startsWith("http://www.") || !website.trim().endsWith(".com") || website.trim().length <= 19) {
    throw new Error("The 'website' field should be a valid string starting with http://www. and ending in .com with at least 5 characters in-between");
  }
  
  if (!recordCompany || typeof recordCompany !== "string" || recordCompany.trim().length === 0) {
    throw new Error("The 'recordCompany' field should be a non-empty string");
  }

  if (!groupMembers || !Array.isArray(groupMembers) || groupMembers.length === 0 || !groupMembers.every(m => typeof m === "string" && m.trim().length > 0)) {
    throw new Error("The 'groupMembers' field should be a non-empty array of strings");
  }

  if (typeof yearBandWasFormed !== "number" || !Number.isInteger(yearBandWasFormed) || yearBandWasFormed < 1900 || yearBandWasFormed > new Date().getFullYear()) {
    throw new Error("The 'yearBandWasFormed' field should be a number between 1900 and the current year");
  }

  const bandCollection = await bands();

  const createBand = {
    name: name.trim(),
    genre: genre.map(g => g.trim()),
    website: website.trim(),
    recordCompany: recordCompany.trim(),
    groupMembers: groupMembers.map(m => m.trim()),
    yearBandWasFormed: yearBandWasFormed,
    albums:[],
    overallRating: 0
  };

  const insertResult = await bandCollection.insertOne(createBand);
  const insertedId = insertResult.insertedId.toString();

  const insertedBand = { _id: insertedId, ...createBand };
  delete insertedBand._id._id; 
  insertedBand._id = insertedId; 
  return insertedBand;
};


export const getAll = async () => {
  const allBands = await bands();

  const findAll = await allBands.find({}).toArray(); 

  return findAll.map((band) => ({

    _id: band._id.toString(),
    name: band.name,
    genre: band.genre,
    website: band.website,
    recordCompany: band.recordCompany,
    groupMembers: band.groupMembers,
    yearBandWasFormed: band.yearBandWasFormed,
  }));
  
};

export const get = async (id) => {

  if (!id || typeof id !== "string" || id.trim().length === 0) {
    throw new Error("Invalid id");
  }
   id = id.trim();

   if (!ObjectId.isValid(id)){
    throw new Error ('invalid object ID');
   } 

   const collection = await bands();
   const getID = await collection.findOne({_id: new ObjectId(id)});
   if(getID === null){
    return null;
   }

   getID._id = getID._id.toString();
   return getID;

}

export const remove = async (id) => {
  if (!id || typeof id !== "string" || id.trim().length === 0) {
    throw new Error("Invalid ID provided");
  }
  id = id.trim();

  if (!ObjectId.isValid(id)){
    throw new Error ('invalid object ID');
   } 

  const db = await bands();

  const band = await db.findOne({ _id: new ObjectId(id) });
  if (!band) {
    throw new Error("Band not found");
  }

  await db.deleteOne({ _id: new ObjectId(id) });

  const message = band.name + " has been successfully deleted!";
  return message;
};

export const update = async(id, name, genre, website, recordCompany, groupMembers, yearBandWasFormed) => {
  
  if (!id || typeof id !== "string" || id.trim().length === 0) {
    throw new Error("Invalid id");
  }
  id = id.trim();

  if (!ObjectId.isValid(id)){
    throw new Error ('invalid object ID');
   } 

  if (!name) {
    throw new Error("The 'name' field is required and should be a non-empty string");
  }

  if (typeof name !== "string" || name.trim().length === 0) {
    throw new Error("The 'name' field should be a non-empty string");
  }

  if (!genre || !Array.isArray(genre) || genre.length === 0 || !genre.every(g => typeof g === "string" && g.trim().length > 0)) {
    throw new Error("The 'genre' field should be a non-empty array of strings");
  }

  if (!website || typeof website !== "string" || website.trim().length === 0 || !website.trim().startsWith("http://www.") || !website.trim().endsWith(".com") || website.trim().length <= 19) {
    throw new Error("The 'website' field should be a valid string starting with http://www. and ending in .com with at least 5 characters in-between");
  }
  
  if (!recordCompany || typeof recordCompany !== "string" || recordCompany.trim().length === 0) {
    throw new Error("The 'recordCompany' field should be a non-empty string");
  }

  if (!groupMembers || !Array.isArray(groupMembers) || groupMembers.length === 0 || !groupMembers.every(m => typeof m === "string" && m.trim().length > 0)) {
    throw new Error("The 'groupMembers' field should be a non-empty array of strings");
  }

  if (typeof yearBandWasFormed !== "number" || !Number.isInteger(yearBandWasFormed) || yearBandWasFormed < 1900 || yearBandWasFormed > new Date().getFullYear()) {
    throw new Error("The 'yearBandWasFormed' field should be a number between 1900 and the current year");
  }

  const db = await bands();
  const filter = { _id: new ObjectId(id) };
  const update = {
    $set: {
      name,
      genre,
      website,
      recordCompany,
      groupMembers,
      yearBandWasFormed,
    },
  };
  const options = { returnOriginal: false };
  const result = await db.findOneAndUpdate(filter, update, options);

  const updatedDoc = await db.findOne({ _id: new ObjectId(id) });

  if (compareAndUpdate(updatedDoc, result.value)) {
    throw new Error('No changes made to the document');
  }

  console.log(updatedDoc)
  return {
    ...updatedDoc,
    _id: updatedDoc._id.toString(),
  };
};