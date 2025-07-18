import { Client, Databases, ID, Query } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;

const client = new Client().setEndpoint("https://cloud.appwrite.io/v1").setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client); // setup database instance

export const updateSearchCount = async (query: string, movie: Movie) => {
  //check if a record of that search has alredy been stored
  // if a document is found increment the searchCount field
  // if no document is found create a new document in appwrite database -> 1
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.equal("searchTerm", query)]);

    //console.log("result", result);

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, existingMovie.$id, {
        count: existingMovie.count + 1,
      });
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: query,
        movie_id: movie.id,
        title: movie.title,
        count: 1,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error("Error updating search count:", error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
  try {
    //we get only the top 5 movies that people have searched for, sorted by the count
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5), //get jus teh first five element
      Query.orderDesc("count"),
    ]); // order based on  count field.
    console.log("restlt get", result);

    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
