// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import sanityClient from '@sanity/client'

const config = {
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production", // or the name you chose in step 1
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, // you can find this in sanity.json
    useCdn: process.env.NODE_ENV === "production", 
    token: process.env.SANITY_API_TOKEN,
}

const client = sanityClient(config);

export default function createComment(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {_id, name, email, comment } = JSON.parse(req.body);
  try{
       client.create({
        _type:'comment',
        post: {
            _type:'reference',
            _ref:_id
        },
        name,
        email,
        comment
      });
  }catch(err) {
      return res.status(500).json({message: `Couldn't submit the message`,err});
  }
  console.log('Comment submitted');
  
  return res.status(200).json({message: "Comment submitted"});
}
