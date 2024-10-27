import *as funcband  from "../data/bands.js"
import {dbConnection, closeConnection} from '../config/mongoConnection.js'
import * as funcalbums from "../data/albums.js" 



const db = await dbConnection();
await db.dropDatabase();

  // try {
    // 1. Create a band of your choice.
   const band1 = await funcband.create(
      "    Blackpink     ",
      [    "Rock    ",      "kPop"],
      "    http://www.blackpink.com  ",
      "    YG Entertainment    ",
      ["      Jennie Kim   ", "     Lalisa Manobal  ", "    Jisoo kim   ", "  Rose  "],
      2016
    );

    // sub-documents for band1

    const band1sub = await funcalbums.create(
      band1._id,
      "    The Album ",
      "   09/12/1975  ",
      ["        Shine On You Crazy Diamond, Pts. 1-5   ", "    Welcome to the Machine   ","       Have a Cigar (Ft. Roy Harper)    ", "      Wish You Were Here   ","      Shine On You Crazy Diamond, Pts. 6-9    "],
      2
    );

    const band1sub3 = await funcalbums.create(
      band1._id,
      "DuDUDUdu",
      "09/12/2023",
      ["Pink venom", "shutdown", "Tally","Typa Girl"],
      5
    );
    

    // 2. Create another band of your choice.
    const band2 = await funcband.create(
      "Chase Atlantic",
      ["Alternative", "Indie"],
      "http://www.chaseatlantic.com",
      "Warner Bros",
      ["Mitchel Cave", "Clinton Cave", "Christian Anthony"],
      2011
    );

    // 3. Create the 3rd band of your choice.
    const band3 = await funcband.create(
      "Arctic Monkey",
      ["Rock", "Indie"],
      "http://www.arcticmonkey.com",
      "Warner Bros",
      ["Alex Turner", "Matt Helders", "Jamie Cook", "Nick O'Malley"],
      2002
    );

    
    await closeConnection();
    console.log("Done");
