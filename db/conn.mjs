// this is mongodb connection setup
import { MongoClient } from "mongodb";

const connectionString = process.env.ATLAS_URI || "";

const client = new MongoClient(connectionString);

let conn;
try {
  conn = await client.connect();
  console.log('connected')
  
} catch(e) {
  
  console.error(e);
}

let db = conn.db("assingment_db");

export default db;