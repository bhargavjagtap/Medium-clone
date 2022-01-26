// client.js
import { createCurrentUserHook, createImageUrlBuilder, createClient } from 'next-sanity';

export const config = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production", // or the name you chose in step 1
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, // you can find this in sanity.json
  useCdn: process.env.NODE_ENV === "production", 
  apiVersion: "2021-03-25",
}

export const sanityClient = createClient(config);
export const urlFor = (source) => createImageUrlBuilder(config).image(source);//Setting up the helper function for generating Image URLs with only the asset reference in your data in your documents
export const useCurrentUser = createCurrentUserHook(config);//Helper func for current logged in user account